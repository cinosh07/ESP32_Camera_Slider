/* ***************************************************************
                          Variables
  ****************************************************************
*/
let socket;
let currentPage = 1;
/* ***************************************************************
                        Initialization
  ****************************************************************
*/
$(document).ready(function () {
  $("#intervalometer").load("interval.html");
  $("#intervalometer").toggle(false);
  $("#run").toggle(false);
  $("#about-mockup").load("about.html");
  $("#settings-mockup").load("settings.html");
  startWebsocket();
});
$(window).on("beforeunload", function () {
  socket.close();
});
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
function previousPage() {
  // navigation system
  if (currentPage !== 1) {
    currentPage = currentPage - 1;
    switchPage();
  }
}
function nextPage() {
  // navigation system
  if (currentPage !== 3) {
    currentPage = currentPage + 1;
    switchPage();
  }
}
function switchPage() {
  switch (currentPage) {
    case 1:
      $("#control-panel").toggle(true);
      $("#intervalometer").toggle(false);
      $("#run").toggle(false);
      $("#previous-button").html("&laquo;");
      $("#next-button").html("&raquo; Intervalometer");
      break;
    case 2:
      $("#control-panel").toggle(false);
      $("#intervalometer").toggle(true);
      $("#run").toggle(false);
      $("#previous-button").html("Controls &laquo;");
      $("#next-button").html("&raquo; Run");
      break;
    case 3:
      $("#control-panel").toggle(false);
      $("#intervalometer").toggle(false);
      $("#run").toggle(true);
      $("#previous-button").html("Intervalometer &laquo;");
      $("#next-button").html("&raquo;");
      break;
  }
}
// $("#intervalometer").toggle(false);
$("#run").toggle(false);
