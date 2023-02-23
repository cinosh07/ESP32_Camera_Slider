/* ***************************************************************
                          Variables
  ****************************************************************
*/
var DEBUG = false;
let socket;
let currentPage = 1;

const JOYSTICK_COMMAND = {
  JOYSTICK_PAN_MOVE: 0,
  JOYSTICK_TILT_MOVE: 1,
  JOYSTICK_SLIDE_MOVE: 2,
  JOYSTICK_FOCUS_MOVE: 3,
};
const COMMAND = {
  COMMAND: 0,
  SPEED: 1,
  DIR: 2,
  ACCEL: 3,
  MULTIPLICATOR: 4,
  SPEED_SCALING: 5,
};

var joystickSlideMoveArray = [];
var joystickSlideMoveCount = 0;
var joystickSlideMovePreviousDir = -2;
var joystickSlideMovePreviousAverage = 0.0;

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
    var alertConnected = document.getElementById("alertConnected");
    var toast = new bootstrap.Toast(alertConnected);
    toast.show();
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
    var alertConnected = document.getElementById("alertConnectionClose");
    var toast = new bootstrap.Toast(alertConnected);
    toast.show();
  };

  socket.onerror = function (error) {
    //TODO ALERT ERROR
    $("#status").removeClass("text-success");
    $("#status").removeClass("text-muted");
    $("#status").addClass("text-danger");
    $("#status").text("Error");
    var alertConnected = document.getElementById("alertConnectionError");
    var toast = new bootstrap.Toast(alertConnected);
    toast.show();
  };
}
function sendCommand(command) {
  // socket.send(JSON.stringify(command));
  command = "0::" + command;
  try {
    if (socket && socket.readyState !== 3) {
      socket.send(command);
    console.log("Command Sended : ", command);
    } else {
      var alertConnected = document.getElementById("alertConnectionError");
    var toast = new bootstrap.Toast(alertConnected);
    toast.show();
    }
    
  } catch (e) {

    var alertConnected = document.getElementById("alertConnectionError");
    var toast = new bootstrap.Toast(alertConnected);
    toast.show();

  }
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
  // sendCommand(command);
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
  // sendCommand(command);
}

function joystickSlideMove(data) {
  let speed = data;
  let dir = 0;

  if (data < 0) {
    dir = -1;
    data = Math.abs(data);
  }
  if (joystickSlideMoveCount === 10) {
    var average = Avg.average(joystickSlideMoveArray);
    if (Math.round(average) !== joystickSlideMovePreviousAverage) {
      console.log(
        "############### MAX COUNT joystickSlide value: " + Math.round(average)
      );
      console.log("############### average value: " + Math.round(average));
      console.log(
        "############### joystickSlideMovePreviousAverage value: " +
          joystickSlideMovePreviousAverage
      );
      joystickSlideMovePreviousAverage = Math.round(average);
      // const COMMAND = {
      //   COMMAND: 0,
      //   SPEED: 1,
      //   DIR: 2,
      //   ACCEL: 3,
      //   MULTIPLICATOR: 4,
      //   SPEED_SCALING: 5
      // };
      var command;
      command =
        JOYSTICK_COMMAND.JOYSTICK_SLIDE_MOVE +
        "::" +
        Math.round(Avg.average(joystickSlideMoveArray)) +
        "::" +
        dir +
        "::" +
        0 +
        "::" +
        0 +
        "::" +
        0;

      // let command = {
      //   command: "JOYSTICK_SLIDE_MOVE",
      //   speed: Avg.average(joystickSlideMoveArray),
      //   dir: dir,
      // };

      sendCommand(command);
    }
    // joystickSlideMovePreviousAverage = 0;
    joystickSlideMoveArray = [];
    joystickSlideMoveCount = 0;
  } else {
    // sleep(10).then(() => {
    joystickSlideMoveArray.push(Math.round(data * 100));
    joystickSlideMoveCount = joystickSlideMoveCount + 1;
    // });
  }
  if (dir !== joystickSlideMovePreviousDir) {
    console.log(
      "############### CHANGE DIR joystickSlide value: " +
        Math.round(data * 100)
    );
    // let command = {
    //   command: "JOYSTICK_SLIDE_MOVE",
    //   speed: data,
    //   dir: dir,
    // };
    // var command = [];
    // command[COMMAND.COMMAND] = JOYSTICK_COMMAND.JOYSTICK_SLIDE_MOVE;
    // command[COMMAND.SPEED] = Math.round(data * 100);
    // command[COMMAND.DIR] = dir;
    // command[COMMAND.ACCEL] = 0;
    // command[COMMAND.MULTIPLICATOR] = 0;
    // command[COMMAND.SPEED_SCALING] = 0;

    var command;
    command =
      JOYSTICK_COMMAND.JOYSTICK_SLIDE_MOVE +
      "::" +
      Math.round(data * 100) +
      "::" +
      dir +
      "::" +
      0 +
      "::" +
      0 +
      "::" +
      0;

    sendCommand(command);
    joystickSlideMovePreviousDir = dir;
  }
  if (data === 0) {
    console.log(
      "############### STOP joystickSlide value: " + Math.round(data * 100)
    );
    // let command = {
    //   command: "JOYSTICK_SLIDE_MOVE",
    //   speed: data,
    //   dir: dir,
    // };

    var command;
    command =
      JOYSTICK_COMMAND.JOYSTICK_SLIDE_MOVE +
      "::" +
      Math.round(data * 100) +
      "::" +
      dir +
      "::" +
      0 +
      "::" +
      0 +
      "::" +
      0;

    sendCommand(command);

    joystickSlideMovePreviousDir = -2;
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
  // sendCommand(command);
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

/* ***************************************************************
                          Utils
  ****************************************************************
*/

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/* ***************************************************************
                          Classes
  ****************************************************************
*/
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
