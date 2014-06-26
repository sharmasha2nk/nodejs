$(document).ready(function () {

  var socket = io.connect('http://localhost:3700');
  var playerId;

  var bindClickEventToAllCells = function (board) {
    jQuery.each($("td"), function (i, td) {
      if (board[i] == '') {
        $(td).unbind('click');
        $(td).click(function () {
          socket.emit('click', {
            player: playerId,
            cell: this.id
          });
        });
      }
    });
  }

  socket.on('move', function (data) {
    $('#' + data.cell + ' div').html(data.symbol);
    $('#' + data.cell).unbind("click");
  });

  socket.on('player-id', function (data) {
    playerId = data.playerId;
  });

  socket.on('won', function (data) {
    $("#message-box").html(data);
    $("td").unbind('click');
  });

  socket.on('lost', function (data) {
    $("#message-box").html(data);
    $("td").unbind('click');
  });

  socket.on('tie', function (data) {
    $("#message-box").html(data);
    $("td").unbind('click');
  });

  socket.on('message', function (data) {
    $("#message-box").html(data);
  });

  socket.on('render-board', function (board) {
    jQuery.each(board, function (i, val) {
      $('#' + i + ' div').html(val);
    });
    bindClickEventToAllCells(board);
  });

});
