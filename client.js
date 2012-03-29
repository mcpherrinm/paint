;(function (window, undefined) {
var document = window.document;

var insanity = false;

function makecolour(n) {
  return "hsl(" +n+ ",60%, 40%)";
}
function randcolour() { 
  return makecolour(Math.round(Math.random() * 360))
}
var colour_stash;
function colour(n) {
  colour_stash = n;
}
colour(randcolour());
function getMouse(c, event) {
  var x = $(c).offset().left;
  var y = $(c).offset().top;
  var clickx = Math.floor(event.pageX - x);
  var clicky = Math.floor(event.pageY - y);
  return {x: clickx, y: clicky};
}
function start() {
  var socket = io.connect('http://taurine.csclub.uwaterloo.ca:3000');
  socket.on('counts', function(data) { console.log(data) });
  socket.on('start', function(img) {
    var canvas = document.getElementById('share');
    var ctx = canvas.getContext('2d');
    for(var i =0; i< img.length;i++) {
      draw(img[i], ctx);
    }
    go(socket, canvas, ctx);
  });
}

var globallast; // lol, imitating a former bug
var rainbow;

function draw(data, ctx) {
    var last = data.start;
    var mpos = data.end;
    ctx.strokeStyle = data.colour;
    if(last) {
      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(mpos.x, mpos.y);
      ctx.stroke();
    }
    globallast = mpos;
  }

function go(socket, canvas, ctx) {
  ctx.lineJoin='round';
  var last;
  var drawing = false;
  var handler = function(e) {
    if( drawing ){
    var mpos = getMouse(canvas, e);
    if(last) {
      if(e.ctrlKey) { // Rainbow mode!
        if(rainbow == null) {
          // should get colour close to current.
          rainbow = 30;
        }
        rainbow = 1+rainbow % 360
        colour_stash = makecolour(rainbow);
      } else {
        rainbow = null;
      }
      socket.emit('draw',
        {start: e.shiftKey ? globallast : last, // Insanity?
         end: mpos,
         colour: colour_stash});
    }
    last = mpos;
   } else {
     last = null;
   }
  }
  canvas.addEventListener('mousemove', handler);
  canvas.addEventListener('mousedown', function() { drawing=true; });
  canvas.addEventListener('mouseup', function() { drawing=false; });
  canvas.addEventListener('mouseleave', function() { last=null; });


  socket.on('draw', function (d) {draw(d, ctx)});
}

window.start = start
window.colour = colour
})(this);
