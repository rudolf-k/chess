require('./public/sketch.js');

const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000

var server = express()
  .use(express.static(path.join(__dirname, 'public')))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))


var io = require('socket.io')(server);

var rooms = {};

io.sockets.on('connection', function(socket) {
  console.log('New connection');

  socket.on('moveHappened', function(data) {
      console.log(data);
      if(data.id in rooms){
          rooms[data.id].board = data.board;
          rooms[data.id].currentPlayer = (rooms[data.id].currentPlayer == 'w') ? 'd' : 'w';
          for(let s of rooms[data.id].clients){
              s.emit('boardReceived', {board: data.board, clientID: socket.id, player: rooms[data.id].currentPlayer});
          }
      }
  })

  socket.on('readyToPlay', function(roomID) {
      if(roomID in rooms){
          if(rooms[roomID].clients.length < 2){
              rooms[roomID].clients.push(socket);
              console.log(rooms[roomID]);
              socket.emit('connectedToRoom');
          }
          else {
              socket.emit('roomFull');
          }
      }
      else {
          var id = makeid();
          var room = {
              id: id,
              clients: [socket],
              board: null,
              currentPlayer: 'w'
          };
          rooms[id] = room;
          console.log(room);
          socket.emit('newRoomCreated', room.id);
      }
  })
});

function makeid() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 8; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}
