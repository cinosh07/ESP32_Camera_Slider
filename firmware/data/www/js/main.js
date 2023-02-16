let socket;

$(document).ready(function () {
  startWebsocket();
});
function startWebsocket() {
  socket = new WebSocket("ws://" + $("#ip").val() + "/ws");

  socket.onopen = function (e) {
    // alert("[open] Connection established");
    // alert("Sending to server");
    socket.send("My name is John");
    $('#status').removeClass('text-danger');
    $('#status').removeClass('text-muted');
    $('#status').addClass('text-success');
    $('#status').text('Connected')
  };

  socket.onmessage = function (event) {
    // alert(`[message] Data received from server: ${event.data}`);
  };

  socket.onclose = function (event) {
    if (event.wasClean) {
      // alert(
      //   `[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`
      // );
    } else {
      // e.g. server process killed or network down
      // event.code is usually 1006 in this case
      // alert("[close] Connection died");
    }
    $('#status').removeClass('text-success');
    $('#status').removeClass('text-muted');
    $('#status').addClass('text-danger');
    $('#status').text('Error')
  };

  socket.onerror = function (error) {
    // alert(`[error]`);
    $('#status').removeClass('text-success');
    $('#status').removeClass('text-muted');
    $('#status').addClass('text-danger');
    $('#status').text('Error')
  };
}
