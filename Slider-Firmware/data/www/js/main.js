/* ***************************************************************
                          Variables
  ****************************************************************
*/
var DEBUG = true;
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
  if (DEBUG) {
    socket = new WebSocket("ws://slider.local/ws");
  } else {
    socket = new WebSocket("ws://" + $("#ip").val() + "/ws");
  }


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
function sendCommand(command) {
  socket.send(JSON.stringify(command));
}
/* ***************************************************************
                       Joysticks Controls
  ****************************************************************
*/
function joystickPanMove(data) {
  // console.log("############### joystickPan value: " + data);
  let speed = data;
  let dir = 0;
  if (data < 0) {
    dir = -1;
    data = Math.abs(data);
  }
  let command = {
    command: "JOYSTICK_PAN_MOVE",
    speed: data,
    dir: dir,
  };
  sendCommand(command);
}
function joystickTiltMove(data) {
  // console.log("############### joysticTilt value: " + data);
  let speed = data;
  let dir = 0;
  if (data < 0) {
    dir = -1;
    data = Math.abs(data);
  }
  let command = {
    command: "JOYSTICK_TILT_MOVE",
    speed: data,
    dir: dir,
  };
  sendCommand(command);
}
var joystickSlideMoveArray = [];
var joystickSlideMoveCount = 0;
var joystickSlideMovePreviousDir = -2;
var joystickSlideMovePreviousAverage = 0;
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
function joystickSlideMove(data) {
  
  let speed = data;
  let dir = 0;

  if (data < 0) {
    dir = -1;
    data = Math.abs(data);
  }
  if (joystickSlideMoveCount === 20) {
    console.log("############### MAX COUNT joystickSlide value: " + data);
    var average = Avg.average(joystickSlideMoveArray);
    if (average !== joystickSlideMovePreviousAverage ) {
      joystickSlideMovePreviousAverage = average;
      let command = {
        command: "JOYSTICK_SLIDE_MOVE",
        speed: Avg.average(joystickSlideMoveArray),
        dir: dir,
      };
      sendCommand(command);
    }
    joystickSlideMovePreviousAverage = 0;
    joystickSlideMoveArray = [];
    joystickSlideMoveCount = 0;
  } else {

    
    sleep(10).then(() => { 
      
      joystickSlideMoveArray.push(data);
      joystickSlideMoveCount = joystickSlideMoveCount + 1;
    });
  }
  if (dir !== joystickSlideMovePreviousDir) {
    console.log("############### CHANGE DIR joystickSlide value: " + data);
    let command = {
      command: "JOYSTICK_SLIDE_MOVE",
      speed: data,
      dir: dir,
    };
    sendCommand(command);
    joystickSlideMovePreviousDir = dir;
  }
  if (data === 0) {
    console.log("############### STOP joystickSlide value: " + data);
    let command = {
      command: "JOYSTICK_SLIDE_MOVE",
      speed: data,
      dir: dir,
    };
    sendCommand(command);
    joystickSlideMovePreviousDir = -2;
  }
}
class Avg {
  constructor() {}

  static average(array) {
    var total = 0.0;
    var count = 0.0;

    jQuery.each(array, function (index, value) {
      total += value;
      count++;
    });

    return total / count;
  }
}
function joystickFocusMove(data) {
  // console.log("############### joystickFocus value: " + data);
  let speed = data;
  let dir = 0;
  if (data < 0) {
    dir = -1;
    data = Math.abs(data);
  }
  let command = {
    command: "JOYSTICK_FOCUS_MOVE",
    speed: data,
    dir: dir,
  };
  sendCommand(command);
}
/* ***************************************************************
                          Navigation
  ****************************************************************
*/

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
/* ***************************************************************
            initialization before starting the script
  ****************************************************************
*/
// $("#intervalometer").toggle(false);
$("#run").toggle(false);
