var io = require('socket.io').listen(3000);
var fs = require('fs');

var thedrawing = JSON.parse(fs.readFileSync('persist.json', 'ascii'));
console.log("Drawing length " + thedrawing.length);

function countusers(socket) {
  l = io.sockets.clients().length
  socket.broadcast.emit('counts', l);
}

function persist(data) {
  thedrawing.push(data);
  fs.writeFile('persist.json', JSON.stringify(thedrawing));
};

io.sockets.on('connection', function(socket) {
  socket.emit('start', thedrawing);
  countusers(socket);

  socket.on('clear', function(data) {
    thedrawing = [];
  });

  socket.on('draw', function(data) {
      persist(data);
      socket.broadcast.emit('draw', data);
      socket.emit('draw', data);
  });
  socket.on('disconnect', function(){ countusers(socket) });
})
