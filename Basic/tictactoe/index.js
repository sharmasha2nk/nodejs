var express = require("express");
var app = express();
var port = 3700;

app.set('views', __dirname + '/app/views');
app.set('view engine', "jade");
app.engine('jade', require('jade').__express);
app.get("/", function (req, res) {
  res.render("board");
});

app.use(express.static(__dirname + '/public'));

var io = require('socket.io').listen(app.listen(port));
var board = [
  '', '', '',
  '', '', '',
  '', '', ''
];

var occupiedCellCount = 0;

var lastPlayer;
var player1;
var player2;

var renderBoard = function (socket) {
  socket.emit('render-board', board);
};

var transform1DTo2D = function (cell) {
  return {
    row: Math.floor(cell / 3),
    col: cell % 3
  };
};

var transform2DTo1D = function (cell2D) {
  return cell2D.row * 3 + cell2D.col;
};

var checkHorizontally = function (row, playerSymbol) {
  for (var c = 0; c < 3; c++) {
    var cell = transform2DTo1D({
      row: row,
      col: c
    });
    if (board[cell] === '') return false;
    else if (board[cell] != playerSymbol) return false;
  }

  return true;
};

var checkVertically = function (col, playerSymbol) {
  for (var r = 0; r < 3; ++r) {
    var cell = transform2DTo1D({
      row: r,
      col: col
    });

    if (board[cell] === '') return false;
    else if (board[cell] != playerSymbol) return false;
  }

  return true;
};

var checkDiagonallyL2R = function (row, col, playerSymbol) {
  var cell = transform2DTo1D({
    row: row,
    col: col
  });

  if (cell % 2 !== 0) return false;

  for (var r = 0; r < 3; ++r) {
    var cell = transform2DTo1D({
      row: r,
      col: r
    });

    if (board[cell] === '') return false;
    else if (board[cell] != playerSymbol) return false;
  }

  return true;
};

var checkDiagonallyR2L = function (row, col, playerSymbol) {
  var cell = transform2DTo1D({
    row: row,
    col: col
  });

  if (cell % 2 !== 0) return false;

  for (var r = 0; r < 3; ++r) {
    var cell = transform2DTo1D({
      row: r,
      col: 2 - r
    });

    if (board[cell] === '') return false;
    else if (board[cell] != playerSymbol) return false;
  }

  return true;
};

var checkDiagonally = function (row, col, playerSymbol) {
  return checkDiagonallyL2R(row, col, playerSymbol) || checkDiagonallyR2L(row, col, playerSymbol);
};

var GAME_STATUS_ENUM = Object.freeze({
  WON: 0,
  IN_PROGRESS: 1,
  TIE: 2
});

var checkWin = function (lastMove) {
  var cell2D = transform1DTo2D(lastMove);

  if (checkHorizontally(cell2D.row, board[lastMove]) || checkVertically(cell2D.col, board[lastMove]) || checkDiagonally(cell2D.row, cell2D.col, board[lastMove])) {
    return GAME_STATUS_ENUM.WON;
  }

  if (occupiedCellCount === 9) {
    return GAME_STATUS_ENUM.TIE;
  }

  return GAME_STATUS_ENUM.IN_PROGRESS;
};

io.sockets.on('connection', function (socket) {
  if (!player1) {
    player1 = socket;
    socket.emit('player-id', {
      playerId: player1.id
    });
    renderBoard(player1);
    socket.emit('message', 'Your turn!!');
    console.log('Player 1 joined ' + player1.id);
  } else if (!player2) {
    player2 = socket;
    socket.emit('player-id', {
      playerId: player2.id
    });
    renderBoard(player2);
    console.log('Player 2 joined ' + player2.id);
  } else {
    console.warn('The game only supports maximum two players!');
    return;
  }

  socket.on('disconnect', function () {
    if (socket.id == player1.id) {
      player1 = undefined;
      console.log('Player 1 disconnected!');
      lastPlayer = undefined;
    } else if (socket.id == player2.id) {
      player2 = undefined;
      console.log('Player 2 disconnected!');
      lastPlayer = undefined;
    }
  });

  socket.on('click', function (data) {
    // No one makes a move yet and Player 1 is the one making first move.
    if (!lastPlayer && socket == player2) {
      socket.emit('message', 'Other player\'s turn!!');
      return;
    }

    if (lastPlayer == data.player) {
      console.warn('Not your turn yet!');
      socket.emit('message', 'Other player\'s turn!!');
      return;
    } else {
      if (data.player == player1.id) {
        data.symbol = 'X';
        console.log('Player 1 made a move at cell ' + data.cell);
        if (player2) {
          player2.emit('message', 'Your turn!!');
        }
      } else if (data.player == player2.id) {
        data.symbol = 'O';
        console.log('Player 2 made a move at cell ' + data.cell);
        player2.emit('message', '');
        if (player1) {
          player1.emit('message', 'Your turn!!');
        }
      } else {
        console.warn('Who the hell are you?');
        return;
      }

      socket.emit('message', '');

      occupiedCellCount++;
      board[data.cell] = data.symbol;
      lastPlayer = data.player;

      io.sockets.emit('move', data);

      if (checkWin(data.cell) === GAME_STATUS_ENUM.WON) {
        socket.emit('won', 'You won!!! :D');

        if (socket === player1) {
          console.log('Player 1 won!');
          player2.emit('lost', 'You lost!!! >:)');
        } else if (socket === player2) {
          console.log('Player 2 won!');
          player1.emit('lost', 'You lost!!! >:)');
        }
      } else if (checkWin(data.cell) === GAME_STATUS_ENUM.TIE) {
        io.sockets.emit('tie', 'Tie!!');
      }
    }
  });
});

console.log("Listening on port " + port);
