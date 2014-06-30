var GAME_STATUS_ENUM = require('./game_status_enum');

var Game = function () {
  var Board = require('./board');
  this.board = new Board();

  var lastPlayer = 1;
  this.player1;
  this.player2;

  this.isPlayer1Turn = function () {
    return lastPlayer === 1;
  };

  this.isPlayer2Turn = function () {
    return !this.isPlayer1Turn();
  };

  this.nextTurn = function () {
    lastPlayer = (lastPlayer + 1) % 2;
  };
}

Game.prototype.connect = function (socket) {
  if (!this.player1) {
    this.player1 = socket;

    socket.emit('player-id', {
      playerId: this.player1.id
    });

    this.board.renderBoard(this.player1);

    if (this.isPlayer1Turn())
      socket.emit('message', 'Your turn!!');

    console.log('Player 1 joined ' + this.player1.id);
  } else if (!this.player2) {
    this.player2 = socket;

    socket.emit('player-id', {
      playerId: this.player2.id
    });

    this.board.renderBoard(this.player2);

    if (this.isPlayer2Turn())
      socket.emit('message', 'Your turn!!');

    console.log('Player 2 joined ' + this.player2.id);
  } else {
    console.warn('The game only supports maximum two players!');
    return;
  }
}

Game.prototype.disconnect = function (socket) {
  if (socket.id === this.player1.id) {
    this.player1 = undefined;
    console.log('Player 1 disconnected!');
  } else if (socket.id === this.player2.id) {
    this.player2 = undefined;
    console.log('Player 2 disconnected!');
  }
}

Game.prototype.click = function (socket, data) {
  // No one makes a move yet and Player 1 is the one making first move.
  if (this.isPlayer2Turn() && socket === this.player1) {
    socket.emit('message', 'Other player\'s turn!!');
    return;
  }

  if (this.isPlayer1Turn() && socket === this.player2) {
    socket.emit('message', 'Other player\'s turn!!');
    return;
  }

  if (data.player === this.player1.id) {
    data.symbol = 'X';
    console.log('Player 1 made a move at cell ' + data.cell);
    if (this.player2) {
      this.player2.emit('message', 'Your turn!!');
    }

  } else if (data.player == this.player2.id) {
    data.symbol = 'O';
    console.log('Player 2 made a move at cell ' + data.cell);
    this.player2.emit('message', '');
    if (this.player1) {
      this.player1.emit('message', 'Your turn!!');
    }

  } else {
    console.warn('Who the hell are you?');
    return;
  }

  socket.emit('message', '');
  this.nextTurn();

  this.board.makeMove(data.cell, data.symbol);

  if (this.player1 && this.isPlayer1Turn)
    this.player1.emit('move', data);
  if (this.player2 && this.isPlayer2Turn)
    this.player2.emit('move', data);

  var gameStatus = this.board.checkWin(data.cell);
  if (gameStatus === GAME_STATUS_ENUM.WON) {
    socket.emit('won', 'You won!!! :D');

    if (socket === this.player1) {
      console.log('Player 1 won!');
      this.player2.emit('lost', 'You lost!!! >:)');
    } else if (socket === this.player2) {
      console.log('Player 2 won!');
      this.player1.emit('lost', 'You lost!!! >:)');
    }
  } else if (gameStatus === GAME_STATUS_ENUM.TIE) {
    if (this.player1)
      this.player1.emit('tie', 'Tie!!');
    if (this.player2)
      this.player2.emit('tie', 'Tie!!');
  }

}

module.exports = Game;
