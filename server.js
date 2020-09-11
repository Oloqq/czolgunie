'use strict';

// Dependencies
var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');
var app = express();
var server = http.Server(app);
var io = socketIO(server);
var Game = require('./game').Game;

app.set('port', 5000);
app.use('/client', express.static(__dirname + '/client'));
var game = new Game();


//Routing
app.get('/', function(request, response) {
  response.sendFile(path.join(__dirname, '/client/index.html'));
});

//Express error handling middleware
app.use((request,response)=>{
  response.type('text/plain');
  response.status(505);
  response.send('Error page');
});


// Starts the server.
server.listen(5000, function() {
  console.log('Starting server on port 5000');
});


//var sockets = [];
var sockets = {};
var connectionsNum = 0;
var gamemaster = undefined;

io.on('connection', function(socket) {
  console.log('new connection');

  var id;
  var isGamemaster = false;
  do {
    id = randomText(5);
  } while(id in sockets);
  sockets[id] = socket;
  game.newClient(id);

  connectionsNum++;
  console.log("client connected: " + id + '  |  ' + connectionsNum+" total");
  for (let s in sockets) {
    if (s == id) continue;
    sockets[s].emit('someone connected', game.getStaticTanksData());
  }

  if (connectionsNum == 1) {
    gamemaster = id;
    console.log('new gamemaster: ' + id);
    isGamemaster = true;
  }
  socket.emit('init', id, isGamemaster, game.getInitData());
  
  socket.on('keyboard state', (keys)=>{
    game.keyboards[id].previous = game.keyboards[id].now;
    game.keyboards[id].now = keys;
  });

  // gamemaster functions
  socket.on('im the gamemaster', ()=>{
    sockets[gamemaster].emit('init', gamemaster, false);
    gamemaster = id;
    sockets[id].emit('init', id, true);
    console.log('new gamemaster: ' + id);
  });

  socket.on('reload templates', ()=>{
    console.log('reloading templates');
    game.reloadTemplates();
  });

  //TODO map change

  // disconnect
  socket.on('disconnect', ()=>{   
    delete sockets[id]
    game.removeClient(id);
    connectionsNum--;
    if (id == gamemaster) {
      console.log('client (gamemaster) disconnected: ' + id);
      for (let a in sockets) {
        gamemaster = a;
        sockets[gamemaster].emit('init', gamemaster, true);
        console.log('new gamemaster: ' + id);
        break;
      }
    } else {
      console.log('client diconnected: ' + id); 
    }

    for (let s in sockets) {
      sockets[s].emit('someone disconnected', id);
    }
  });
});

setInterval(()=>{
  game.update(1/60);
  let gameData = game.getUpdateData();
  for (let id in sockets) {
      sockets[id].emit('update', gameData);
  }
}, 16);


function randomText(length) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < length; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}