'use strict';

var submitButton = document.getElementById('sendButton');
var mapName = document.getElementById('mapName');

submitButton.addEventListener('click', (ev)=>{
  socket.emit('map change', mapName.value);
});

reloadTemplatesButton.addEventListener('click', (ev)=>{
  socket.emit('reload templates');
});


































function mamjajazwyklejajanietosasmoczejajaaniejajkaocholeraskadtyjewytrzasnales() {
  socket.emit('im the gamemaster');
  return 'zabralem je ludziom';
}