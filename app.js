var io = require('socket.io').listen(3000);

var thedrawing = [];

function countusers(socket) {
  l = io.sockets.clients().length
  socket.broadcast.emit('counts', l);
}

io.sockets.on('connection', function(socket) {
  socket.emit('start', thedrawing); // todo: load persisted
  countusers(socket);

  socket.on('clear', function(data) {
    thedrawing = [];
  });

  socket.on('draw', function(data) {
      thedrawing.push(data);
      socket.broadcast.emit('draw', data);
      socket.emit('draw', data);
  });
  socket.on('disconnect', function(){ countusers(socket) });
})
