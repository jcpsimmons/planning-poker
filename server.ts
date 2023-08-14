import * as path from 'https://deno.land/std@0.188.0/path/mod.ts';
import { Server } from 'https://deno.land/x/socket_io@0.1.1/mod.ts';
import express from 'npm:express@4.18.2';

import { serve } from 'https://deno.land/std@0.150.0/http/server.ts';

const port = Deno.env.get('PORT') || 3000;

const io = new Server();
const __dirname = path.dirname(path.fromFileUrl(import.meta.url));

const app = express();

app.get('/', (_req, res) => {
  res.sendFile(__dirname + '/index.html');
});

let conections = 0;

const data = {
  topic: null,
  votes: [],
  history: [],
};

const estimationsHistoryManage = async () => {
  let vote_match = true;
  let vote = null;
  let has_valid_vote = false;
  // Use joker if no topic has been defined.
  const current_topic =
    data.topic != null ? data.topic : 'Not defined Taks/UserStory';

  // Iterates through all connections and consider new record after all
  // estimations match.
  // Also show disclaimer when at least one estimation is different to others.
  const activeSockets = await io.fetchSockets();
  activeSockets.forEach((id) => {
    console.log('id', id);
    //   if (
    //     vote == null &&
    //     activeSockets[id].vote != null &&
    //     activeSockets[id].vote != 'undefined'
    //   ) {
    //     vote = activeSockets[id].vote;
    //     has_valid_vote = true;
    //   }
    //   if (
    //     activeSockets[id].vote != 'undefined' &&
    //     activeSockets[id].vote != vote
    //   ) {
    //     vote_match = false;
    //     return;
    //   }
  });
  // if (!vote_match && has_valid_vote) {
  //   io.emit('show disclaimer');
  // } else if (vote != null) {
  //   data.history.push('[' + vote + '] ' + current_topic);
  //   io.emit('hide disclaimer');
  // }
  // io.emit('history refresh', data.history);
};

io.on('connection', (socket) => {
  console.log('connected');

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

  socket.on('disconnect', () => {
    conections--;
    messageUserSend('has disconnected.');
    votesRecalculate();
  });

  socket.on('set nickname', (nickname) => {
    // Save a variable 'nickname'
    if (nickname !== null && nickname.length) {
      socket.nickname = nickname;
    }

    messageUserSend('is now connected.');
  });

  socket.on('hide disclaimer', () => {
    io.emit('hide disclaimer', data.topic);
  });

  socket.on('topic update', (topic) => {
    data.topic = topic;
    console.log('topic update!' + data.topic);
    io.emit('topic update', data.topic);
  });

  socket.on('vote update', (vote) => {
    console.log('vote update!' + vote);
    socket.vote = vote;
    votesRecalculate();

    messageUserSend('has voted.');
  });

  /**
   * Execute estimations history manage.
   */
  socket.on('history', () => {
    estimationsHistoryManage();
  });

  socket.on('vote reset', (vote) => {
    console.log('vote update!' + vote);
    socket.vote = null;
    votesReset();

    messageUserSend('has voted.');
  });

  const votesReset = () => {
    // Object.keys(io.sockets.sockets).forEach((id) => {
    //   io.sockets.connected[id].vote = null;
    // });
    // io.emit('vote update', []);
  };

  const messageUserSend = (message) => {
    const msg =
      currentDateFormatted() +
      ' / ' +
      ' <b>' +
      socket.nickname +
      '</b> ' +
      message;
    io.emit('message', msg);
  };

  const votesRecalculate = () => {
    data.votes = [];
    Object.keys(io.sockets.sockets).forEach(function (id) {
      // io.to(socketId).emit();
      const vdata = {};
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
  };

  const currentDateFormatted = () => {
    const d = new Date();
    const h = addZero(d.getHours());
    const m = addZero(d.getMinutes());
    const s = addZero(d.getSeconds());
    return h + ':' + m + ':' + s;
  };

  function addZero(i) {
    if (i < 10) {
      i = '0' + i;
    }
    return i;
  }
});

// app.listen(+port + 1, function () {
//   console.log('listening on *:' + (+port + 1));
// });

await serve(io.handler(), {
  port: 3000,
});
