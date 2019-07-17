var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.get('/planning-poker-theme/css/styles.css', function(req, res){
  res.sendFile(__dirname + '/planning-poker-theme/css/styles.css');
});

var conections = 0;

var data = {
  topic : null,
  votes: [],
  history: [],
};

io.on('connection', function(socket) {

  console.log ('something: ' + socket.id);

  // Init:
  conections++;
  socket.nickname = "Anonymous";

  // Send (current) data:
  socket.emit('topic update', data.topic);
  socket.emit('vote update', data.votes);

  socket.on('connect', function() {
    console.log('connected');

  });

  function taskUserHistory() {
    var curent_connections = conections;
    var current_votes = 0;
    var current_topic = data.topic != null ? data.topic : 'Not defined Taks/UserStory';
    var message = '';
    var current_history = {
      'topic': current_topic,
      'users': [],
    };
    Object.keys(io.sockets.sockets).forEach(function(id) {
      current_history.users.push({
        'nickname': io.sockets.connected[id].nickname,
        'vote': io.sockets.connected[id].vote,
      });
      if (io.sockets.connected[id].vote != null) {
        current_votes++;
      }
    });
    // Consider task resolved when all connected people has voted.
    console.log('CURRENT CONNECTIONS ' + curent_connections);
    console.log('CURRENT VOTES ' + current_votes);
    if (curent_connections == current_votes) {
      // @TODO Save all users votes.
      data.history.push(current_history);
      io.emit('history', data.history);
    }
    else {
      io.emit('history not yet', data.history);
    }
    //io.emit('message', '<strong>**TASK HISTORY LOG**</strong></br></br>');
    data.history.forEach(function(history) {
      // io.emit('message', '<strong>' + history.topic + '</strong>');
      io.emit('message', '**<strong>' + history.topic + '</strong>**');
      history.users.forEach(function(user) {
        //io.emit('message', '"' + history.topic + '"<strong>: ' + user.nickname + '</strong> - ' + user.vote + '');
        io.emit('message', '<strong>' + user.nickname + '</strong> voted ' + user.vote);
      });
      io.emit('message', '**<strong>' + history.topic + '</strong>**');
    });
    //io.emit('message', '<strong>****TASK HISTORY LOG****</strong>');
  }

  socket.on('disconnect', function() {
    conections--;
    messageUserSend('has disconnected.');
    votesRecalculate();
  });

  socket.on('set nickname', function(nickname) {
    // Save a variable 'nickname'
    if (nickname !== null && nickname.length) {
      socket.nickname = nickname;
    }

    messageUserSend('is now connected.');
  });

  socket.on('topic update', function(topic) {
    data.topic = topic;
    console.log('topic update!' + data.topic);
    io.emit('topic update', data.topic);
  });

  socket.on('vote update', function(vote) {
    console.log('vote update!' + vote);
    socket.vote = vote;
    votesRecalculate();

    messageUserSend('has voted.');
  });

  socket.on('vote reset', function(vote) {
    console.log('vote update!' + vote);
    socket.vote = null;
    votesReset();

    messageUserSend('has voted.');
  });

  function votesReset() {
    Object.keys(io.sockets.sockets).forEach(function(id) {
      io.sockets.connected[id].vote = null;
    });
    io.emit('vote update', []);
  }

  function messageUserSend(message) {
    var msg = currentDateFormatted() + ' / ' + ' <b>' + socket.nickname + '</b> ' + message;
    io.emit('message', msg);
  }

  function votesRecalculate() {
    data.votes = [];
    Object.keys(io.sockets.sockets).forEach(function(id) {
        // io.to(socketId).emit();
        var vdata = {};
        vdata.nickname = typeof(io.sockets.connected[id].nickname) ? io.sockets.connected[id].nickname : null;
        vdata.vote = typeof(io.sockets.connected[id].vote) != 'undefined' ? io.sockets.connected[id].vote : null;
        if (vdata.vote) {
          data.votes.push(vdata);
        }
    });

    io.emit('vote update', data.votes);
    taskUserHistory();
  }

  function currentDateFormatted() {
    var d = new Date();
    var h = addZero(d.getHours());
    var m = addZero(d.getMinutes());
    var s = addZero(d.getSeconds());
    return h + ":" + m + ":" + s;
  }

  function addZero(i) {
    if (i < 10) {
        i = "0" + i;
    }
    return i;
  }

});

http.listen(port, function(){
  console.log('listening on *:' + port);
});
