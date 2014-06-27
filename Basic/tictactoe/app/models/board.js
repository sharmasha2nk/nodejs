var GAME_STATUS_ENUM = require('./game_status_enum');

var occupiedCellCount = 0;
var board = [
  '', '', '',
  '', '', '',
  '', '', ''
];

var Board = function () {

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

var checkWin = function (lastMove) {
  occupiedCellCount++;
  var cell2D = transform1DTo2D(lastMove);

  if (checkHorizontally(cell2D.row, board[lastMove]) || checkVertically(cell2D.col, board[lastMove]) || checkDiagonally(cell2D.row, cell2D.col, board[lastMove])) {
    return GAME_STATUS_ENUM.WON;
  }

  if (occupiedCellCount === 9) {
    return GAME_STATUS_ENUM.TIE;
  }

  return GAME_STATUS_ENUM.IN_PROGRESS;
};


module.exports = {
  getBoard: function () {
    return board;
  },
  checkWin: checkWin
};
