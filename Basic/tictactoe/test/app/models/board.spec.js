var Board = requireFromRoot('app/models/board');
var GAME_STATUS_ENUM = requireFromRoot('app/models/game_status_enum');

describe('Board', function () {
  var board;
  beforeEach(function () {
    board = new Board();
  });

  it('transform1DTo2D', function () {
    var cell = Board.transform1DTo2D(0);
    expect(cell.row).to.equal(0);
    expect(cell.col).to.equal(0);

    cell = Board.transform1DTo2D(2);
    expect(cell.row).to.equal(0);
    expect(cell.col).to.equal(2);

    cell = Board.transform1DTo2D(3);
    expect(cell.row).to.equal(1);
    expect(cell.col).to.equal(0);

    cell = Board.transform1DTo2D(8);
    expect(cell.row).to.equal(2);
    expect(cell.col).to.equal(2);

    expect(Board.transform1DTo2D.bind(Board, -1)).to.
    throw (Error, /Invalid 1D cell/);

    expect(Board.transform1DTo2D.bind(Board, 9)).to.
    throw (Error, /Invalid 1D cell/);
  });

  it('isBoardFull returns false when the board is empty', function () {
    expect(board.isBoardFull()).to.be.false;
  });

  it('isBoardFull returns true when the board is full', function () {
    for (var i = 0; i <= 8; i++) {
      board.makeMove(i, "X");
    }
    expect(board.isBoardFull()).to.be.true;
  });

  it('checkWin returns win when the first diagonal is complete', function () {
    board.makeMove(0, 'X');
    board.makeMove(4, 'X');
    board.makeMove(8, 'X');

    expect(board.checkWin(8)).to.equal(GAME_STATUS_ENUM.WON);
  });

  it('checkWin returns win when the second diagonal is complete', function () {
    board.makeMove(2, 'X');
    board.makeMove(4, 'X');
    board.makeMove(6, 'X');

    expect(board.checkWin(4)).to.equal(GAME_STATUS_ENUM.WON);
  });

  it('checkWin returns win when the first horizontal is complete', function () {
    board.makeMove(0, 'X');
    board.makeMove(1, 'X');
    board.makeMove(2, 'X');

    expect(board.checkWin(0)).to.equal(GAME_STATUS_ENUM.WON);
  });
});
