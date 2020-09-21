'use strict';

$('#loadMap').on('click', (ev)=>{
  socket.emit('map change', $('#mapsSelect').val());
});

reloadTemplatesButton.addEventListener('click', (ev)=>{
  socket.emit('reload templates');
});

function admin(pass, order) {
  socket.emit('admin', pass, order);
}

































function mamjajazwyklejajanietosasmoczejajaaniejajkaocholeraskadtyjewytrzasnales() {
  socket.emit('im the gamemaster');
  return 'zabralem je ludziom';
}