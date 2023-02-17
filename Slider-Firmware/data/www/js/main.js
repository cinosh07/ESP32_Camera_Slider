/* ***************************************************************
                          Variables
  ****************************************************************
*/
let socket;
/* ***************************************************************
                        Initialization
  ****************************************************************
*/
$(document).ready(function () {
  startWebsocket();
});
$(window).on("beforeunload", function () {
  socket.close();
});
$(window).on("unload", function () {});
/* ***************************************************************
                          Websocket
  ****************************************************************
*/
function startWebsocket() {
  socket = new WebSocket("ws://" + $("#ip").val() + "/ws");

  socket.onopen = function (e) {
    socket.send("CONNECTED");
    $("#status").removeClass("text-danger");
    $("#status").removeClass("text-muted");
    $("#status").addClass("text-success");
    $("#status").text("Connected");
  };

  socket.onmessage = function (event) {
    // TODO
  };

  socket.onclose = function (event) {
    if (event.wasClean) {
      //  Connection closed cleanly
    } else {
      // e.g. server process killed or network down
    }
    $("#status").removeClass("text-success");
    $("#status").removeClass("text-muted");
    $("#status").addClass("text-danger");
    $("#status").text("Error");
  };

  socket.onerror = function (error) {
    //TODO ALERT ERROR
    $("#status").removeClass("text-success");
    $("#status").removeClass("text-muted");
    $("#status").addClass("text-danger");
    $("#status").text("Error");
  };
}
