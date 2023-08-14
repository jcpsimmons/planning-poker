var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;
import { serve } from 'https://deno.land/std@0.150.0/http/server.ts';

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.get('/planning-poker-theme/css/styles.css', function (req, res) {
  res.sendFile(__dirname + '/planning-poker-theme/css/styles.css');
});

var conections = 0;

var data = {
  topic: null,
  votes: [],
  history: [],
};

io.on('connection', function (socket) {
  console.log('something: ' + socket.id);

  // Init:
  conections++;
  socket.nickname = 'Anonymous';
  // Execute estimations history on init.
  estimationsHistoryManage();

  // Send (current) data:
  socket.emit('topic update', data.topic);
  socket.emit('vote update', data.votes);

  socket.on('connect', function () {
    console.log('connected');
  });

  /**
   * Estimations record history manage.
   */
  function estimationsHistoryManage() {
    var vote_match = true;
    var vote = null;
    var has_valid_vote = false;
    // Use joker if no topic has been defined.
    var current_topic =
      data.topic != null ? data.topic : 'Not defined Taks/UserStory';

    // Iterates through all connections and consider new record after all
    // estimations match.
    // Also show disclaimer when at least one estimation is different to others.
    Object.keys(io.sockets.sockets).forEach(function (id) {
      if (
        vote == null &&
        io.sockets.connected[id].vote != null &&
        io.sockets.connected[id].vote != 'undefined'
      ) {
        vote = io.sockets.connected[id].vote;
        has_valid_vote = true;
      }
      if (
        io.sockets.connected[id].vote != 'undefined' &&
        io.sockets.connected[id].vote != vote
      ) {
        vote_match = false;
        return;
      }
    });
    if (!vote_match && has_valid_vote) {
      io.emit('show disclaimer');
    } else if (vote != null) {
      data.history.push('[' + vote + '] ' + current_topic);
      io.emit('hide disclaimer');
    }
    io.emit('history refresh', data.history);
  }

  socket.on('disconnect', function () {
    conections--;
    messageUserSend('has disconnected.');
    votesRecalculate();
  });

  socket.on('set nickname', function (nickname) {
    // Save a variable 'nickname'
    if (nickname !== null && nickname.length) {
      socket.nickname = nickname;
    }

    messageUserSend('is now connected.');
  });

  socket.on('hide disclaimer', function () {
    io.emit('hide disclaimer', data.topic);
  });

  socket.on('topic update', function (topic) {
    data.topic = topic;
    console.log('topic update!' + data.topic);
    io.emit('topic update', data.topic);
  });

  socket.on('vote update', function (vote) {
    console.log('vote update!' + vote);
    socket.vote = vote;
    votesRecalculate();

    messageUserSend('has voted.');
  });

  /**
   * Execute estimations history manage.
   */
  socket.on('history', function () {
    estimationsHistoryManage();
  });

  socket.on('vote reset', function (vote) {
    console.log('vote update!' + vote);
    socket.vote = null;
    votesReset();

    messageUserSend('has voted.');
  });

  function votesReset() {
    Object.keys(io.sockets.sockets).forEach(function (id) {
      io.sockets.connected[id].vote = null;
    });
    io.emit('vote update', []);
  }

  function messageUserSend(message) {
    var msg =
      currentDateFormatted() +
      ' / ' +
      ' <b>' +
      socket.nickname +
      '</b> ' +
      message;
    io.emit('message', msg);
  }

  function votesRecalculate() {
    data.votes = [];
    Object.keys(io.sockets.sockets).forEach(function (id) {
      // io.to(socketId).emit();
      var vdata = {};
      vdata.nickname = typeof io.sockets.connected[id].nickname
        ? io.sockets.connected[id].nickname
        : null;
      vdata.vote =
        typeof io.sockets.connected[id].vote != 'undefined'
          ? io.sockets.connected[id].vote
          : null;
      if (vdata.vote) {
        data.votes.push(vdata);
      }
    });

    io.emit('vote update', data.votes);
  }

  function currentDateFormatted() {
    var d = new Date();
    var h = addZero(d.getHours());
    var m = addZero(d.getMinutes());
    var s = addZero(d.getSeconds());
    return h + ':' + m + ':' + s;
  }

  function addZero(i) {
    if (i < 10) {
      i = '0' + i;
    }
    return i;
  }
});

// http.listen(port, function () {
//   console.log('listening on *:' + port);
// });
await serve(io.handler(), {
  port: 3000,
});
