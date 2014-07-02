var GAME_STATUS_ENUM = require('./game_status_enum');

var Board = function () {
  var occupiedCellCount = 0;
  var board = [
    '', '', '',
    '', '', '',
    '', '', ''
  ];

  this.isBoardFull = function () {
    return occupiedCellCount === 9;
  };

  this.makeMove = function (cell, symbol) {
    board[cell] = symbol;
    occupiedCellCount++;
  };


  this.getBoard = function () {
    return board;
  };
}

var transform1DTo2D = function (cell) {
  if(cell < 0 || cell >= 9)
    throw new Error('Invalid 1D cell!');

  return {
    row: Math.floor(cell / 3),
    col: cell % 3
  };
};

Board.transform1DTo2D = transform1DTo2D;

var transform2DTo1D = function (cell2D) {
  return cell2D.row * 3 + cell2D.col;
};

var checkHorizontally = function (board, row, playerSymbol) {
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

var checkVertically = function (board, col, playerSymbol) {
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

var checkDiagonallyL2R = function (board, row, col, playerSymbol) {
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

var checkDiagonallyR2L = function (board, row, col, playerSymbol) {
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

var checkDiagonally = function (board, row, col, playerSymbol) {
  return checkDiagonallyL2R(board, row, col, playerSymbol) || checkDiagonallyR2L(board, row, col, playerSymbol);
};

Board.prototype.checkWin = function (lastMove) {
  var cell2D = transform1DTo2D(lastMove);
  var board = this.getBoard();

  if (checkHorizontally(board, cell2D.row, board[lastMove]) ||
    checkVertically(board, cell2D.col, board[lastMove]) ||
    checkDiagonally(board, cell2D.row, cell2D.col, board[lastMove])) {
    return GAME_STATUS_ENUM.WON;
  }

  if (this.isBoardFull()) {
    return GAME_STATUS_ENUM.TIE;
  }

  return GAME_STATUS_ENUM.IN_PROGRESS;
};

//Render Board
Board.prototype.renderBoard = function (socket) {
  socket.emit('render-board', this.getBoard());
};

module.exports = Board;
