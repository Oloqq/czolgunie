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
const port = 5000;
const adminPass = 'masnoni';

app.set('port', port);
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
server.listen(port, function() {
  console.log('Starting server on port ' + port);
});

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

  connectionsNum++;
  console.log("client connected: " + id + '  |  ' + connectionsNum + " total");

  if (connectionsNum == 1) {
    gamemaster = id;
    console.log('new gamemaster: ' + id);
    isGamemaster = true;
  }
  socket.emit('init connection', id, isGamemaster, game.classList, game.mapList);
  
  // Keyboard update
  socket.on('keyboard state', (keys)=>{
    game.keyboards[id].previous = game.keyboards[id].now;
    game.keyboards[id].now = keys;
  });

  // Joining the game
  socket.on('join game', (data) => {
    game.removeClient(id);
    game.newClient(id, data);
    socket.emit('init game', game.getInitData());

    // Update static data for others
    let staticData = game.getStaticTanksData();
    // console.log(staticData);
    for (let s in sockets) {
      if (s == id) continue;
      sockets[s].emit('someone joined', staticData);
    }
  });

  // Test functions
  socket.on('kill me', () => {
    game.tanks[id].hurt(game.tanks[id].maxHp);
  });

  // Gamemaster functions
  socket.on('reload templates', ()=>{
    console.log('reloading templates');
    game.reloadTemplates();
  });

  socket.on('admin', (pass, order, ...args) => {
    if (pass != adminPass) return;
    switch(order) {
      case 'imthemaster':
        sockets[gamemaster].emit('init connection', gamemaster, false);
        gamemaster = id;
        sockets[id].emit('init connection', id, true);
        console.log('new gamemaster: ' + id);
    }
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