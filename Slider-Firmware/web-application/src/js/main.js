/**********************************************************************
 *               Author: Carl Tremblay
 *
 *                Cinosh Camera Slider Controller
 *                        version 0.1
 *
 *                  Copyright 2023 Carl Tremblay
 *
 *                            License
 *     Attribution-NonCommercial-NoDerivatives 4.0 International
 *                      (CC BY-NC-ND 4.0)
 *        https://creativecommons.org/licenses/by-nc-nd/4.0/
 *
 *********************************************************************/

// To debug web application without uploading to ESP32 SPIFFS we need to put the app in debug mode.
// and having http-server node js application.
//
// to install http-server using npm
// npm install --global http-server
//
// To launch the server type this line in the console with path to the www folder
//
// To test the compiled version
// > http-server D:/Timelapse_Slider/ESP32_Camera_Slider/Slider-Firmware/data/www
//
// To test the original files
// > http-server D:/Timelapse_Slider/ESP32_Camera_Slider/Slider-Firmware/web-application/src
//
// navigate to http://127.0.0.1:8080/ for testing the web app.
// ESP32 is needed to be open and same network connected
//
// For this to work set DEBUG=true

var DEBUG = true;

// The nav bar background color will now appear RED to clearly show that we are now in debug mode.

// In normal operation mode (DEBUG=false) websocket ip address is provided by the ESP32 that serve those files by inserting it.
// For debbugging externally to the ESP32 served files, we need to tell the app what is this address manually.

// Set ESP32 ip address or mDNS address.
// Please note that mDNS address resolution don't work on some of Android devices. Use IP address instead.

var DEBUG_ESP32_WEBSOCKET_ADDRESS = "slider.local";

/* ***************************************************************
                          Variables
  ****************************************************************
*/
let retryConnectWebsocketTimeout = null;

let SLIDER_MODE = true;
let socket;
let currentPage = 1;
const COMMAND_TYPE = {
  JOYSTICK: 0,
  CLOCK: 1,
  HOME: 2,
  GOTO_IN: 3,
  GOTO_OUT: 4,
  GOTO_KEYFRAME: 5,
  MARK_IN: 6,
  MARK_OUT: 7,
  MARK_KEYFRAME: 8,
  DEL_KEYFRAME: 9,
  ADD_KEYFRAME: 10,
  SET_SLAVE_MODE: 11,
  SET_TIMELAPSE_MODE: 12,
  SET_SLIDE_KINEMATIC: 13,
  SET_PAN_KINEMATIC: 14,
  SET_TILT_KINEMATIC: 15,
  SET_FOCUS_KINEMATIC: 16,
};
const JOYSTICK_COMMAND = {
  JOYSTICK_PAN_MOVE: 0,
  JOYSTICK_TILT_MOVE: 1,
  JOYSTICK_SLIDE_MOVE: 2,
  JOYSTICK_FOCUS_MOVE: 3,
};
const COMMAND_TYPE_JOYSTICK = {
  COMMAND_TYPE: 0,
  COMMAND: 1,
  SPEED: 2,
  DIR: 3,
  ACCEL: 4,
  MULTIPLICATOR: 5,
  SPEED_SCALING: 6,
  NOT_USE_ENTRY_7: 7,
};
const COMMAND_TYPE_CLOCK = {
  COMMAND_TYPE: 0,
  COMMAND: 1,
  YEAR: 2,
  MONTH: 3,
  DAY: 4,
  HOUR: 5,
  MINUTE: 6,
  SECOND: 7,
};
const CLOCK_COMMAND = {
  SET_CLOCK_TIME: 0,
  GET_CLOCK_TIME: 1,
};
var joystickSlideMoveArray = [];
var joystickSlideMoveCount = 0;
var joystickSlideMovePreviousDir = -2;
var joystickSlideMovePreviousAverage = 0.0;
/* ***************************************************************
               Lock mobile Screen from Sleeping
  ****************************************************************
*/
const canWakeLock = () => "wakeLock" in navigator;
let wakelock;

function tryReconnect() {
  retryConnectWebsocketTimeout = null;
  socket = null;
  startWebsocket();
}

async function lockWakeState() {
  if (!canWakeLock()) return;
  try {
    wakelock = await navigator.wakeLock.request();
    wakelock.addEventListener("release", () => {
      console.log("Screen Wake State Locked:", !wakelock.released);
    });
    console.log("Screen Wake State Locked:", !wakelock.released);
  } catch (e) {
    console.error("Failed to lock wake state with reason:", e.message);
  }
}
function releaseWakeState() {
  if (wakelock) wakelock.release();
  wakelock = null;
}
/* ***************************************************************
                        Initialization
  ****************************************************************
*/
$(async function () {
  $("#intervalometer").load("interval.html");
  $("#intervalometer").toggle(false);
  $("#run").toggle(false);
  $("#about-mockup").load("about.html");
  $("#settings-mockup").load("settings.html");
  if (DEBUG) {
    $("#navBar").removeClass("bg-darker");
    $("#navBar").addClass("bg-danger");
  }
  if ("serviceWorker" in navigator && !DEBUG) {
    if (SLIDER_MODE) {
      try {
        navigator.serviceWorker.register("/serviceworker.js");
      } catch (e) {}
    } else {
      try {
        navigator.serviceWorker.register("/serviceworker-i.js");
      } catch (e) {}
    }
  }
  await lockWakeState();

  const ctx = document.getElementById("myChart");
  new Chart(ctx, {
    type: "line",
    data: {
      labels: ["Start", "Ease-in", "", "", "", "Ease-out", "Stop"],
      datasets: [
        {
          label: "Speed",
          data: [0, 10, null, null, null, 10, 0],
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
      spanGaps: true,
      tension: 0.5,
    },
  });
  $("#previousPage").on("click", function () {
    previousPage();
  });
  $("#nextPage").on("click", function () {
    nextPage();
  });
  $("#home").on("click", function () {
    sendHomeSlider();
  });

  $("#mark-in").on("click", function () {
    markIn();
  });
  $("#goto-in").on("click", function () {
    gotoIn();
  });
  $("#mark-out").on("click", function () {
    markOut();
  });
  $("#goto-out").on("click", function () {
    gotoOut();
  });

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
    socket = new WebSocket("ws://" + DEBUG_ESP32_WEBSOCKET_ADDRESS + "/ws");
  } else {
    socket = new WebSocket("ws://" + window.location.hostname + "/ws");
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
    sendTimeStamp();
  };

  socket.onmessage = function (event) {
    // TODO
    try {
      var object = JSON.parse(event.data);
      if (object.SHOTS) {
        var callback = {
          SHOTS: object.SHOTS,
        };
        console.log(callback);
      }
      if (object.COMMAND_STATUS) {
        var callback = {
          COMMAND_STATUS: object.COMMAND_STATUS,
        };
        console.log(callback);
      }

    } catch (e) {
      // Callback not to be proccessed here. Do nothing
    }
  };

  socket.onclose = function (event) {
    if (event.wasClean) {
      //  Connection closed cleanly
    } else {
      // e.g. server process killed or network down
      retryConnectWebsocketTimeout = null;
      retryConnectWebsocketTimeout = setTimeout(tryReconnect, 10000);
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
    //ALERT ERROR
    $("#status").removeClass("text-success");
    $("#status").removeClass("text-muted");
    $("#status").addClass("text-danger");
    $("#status").text("Error");
    var alertConnected = document.getElementById("alertConnectionError");
    var toast = new bootstrap.Toast(alertConnected);
    toast.show();
    retryConnectWebsocketTimeout = null;
    retryConnectWebsocketTimeout = setTimeout(tryReconnect, 10000);
    socket.close();
    socket = null;
  };
}
function markIn() {
  var command;
  command =
    COMMAND_TYPE.MARK_IN +
    "::" +
    0 +
    "::" +
    0 +
    "::" +
    0 +
    "::" +
    0 +
    "::" +
    0 +
    "::" +
    0 +
    "::" +
    0;
  sendCommand(command);
}
function markOut() {
  var command;
  command =
    COMMAND_TYPE.MARK_OUT +
    "::" +
    0 +
    "::" +
    0 +
    "::" +
    0 +
    "::" +
    0 +
    "::" +
    0 +
    "::" +
    0 +
    "::" +
    0;
  sendCommand(command);
}
function gotoIn() {
  var command;
  command =
    COMMAND_TYPE.GOTO_IN +
    "::" +
    0 +
    "::" +
    0 +
    "::" +
    0 +
    "::" +
    0 +
    "::" +
    0 +
    "::" +
    0 +
    "::" +
    0;
  sendCommand(command);
}
function gotoOut() {
  var command;
  command =
    COMMAND_TYPE.GOTO_OUT +
    "::" +
    0 +
    "::" +
    0 +
    "::" +
    0 +
    "::" +
    0 +
    "::" +
    0 +
    "::" +
    0 +
    "::" +
    0;
  sendCommand(command);
}
function sendHomeSlider() {
  var command;
  command =
    COMMAND_TYPE.HOME +
    "::" +
    0 +
    "::" +
    0 +
    "::" +
    0 +
    "::" +
    0 +
    "::" +
    0 +
    "::" +
    0 +
    "::" +
    0;
  sendCommand(command);
}
function sendTimeStamp() {
  var now = new Date();
  var timestampToSend =
    "00-" +
    now.toISOString().substring(0, 10).slice(2) +
    "-" +
    now.getHours() +
    "-" +
    now.getMinutes() +
    "-" +
    now.getSeconds();
  var fullDate = now.toISOString().substring(0, 10).slice(2).split("-");

  var command;
  command =
    COMMAND_TYPE.CLOCK +
    "::" +
    CLOCK_COMMAND.SET_CLOCK_TIME +
    "::" +
    fullDate[0] + // Year
    "::" +
    fullDate[1] + // Month
    "::" +
    fullDate[2] + // Day
    "::" +
    now.getHours() +
    "::" +
    now.getMinutes() +
    "::" +
    now.getSeconds();
  sendCommand(command);
  console.log("Set ESP32 RTC time : " + timestampToSend);
}

function sendCommand(command) {
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
      // const COMMAND_TYPE_JOYSTICK = {
      //   COMMAND_TYPE: 0,
      //   COMMAND: 1,
      //   SPEED: 2,
      //   DIR: 3,
      //   ACCEL: 4,
      //   MULTIPLICATOR: 5,
      //   SPEED_SCALING: 6,
      // };
      var command;
      command =
        COMMAND_TYPE.JOYSTICK +
        "::" +
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
        0 +
        "::0";

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
      COMMAND_TYPE.JOYSTICK +
      "::" +
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
      COMMAND_TYPE.JOYSTICK +
      "::" +
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
//<!--
// **************************************************************
//                    Pan Tilt Joystick -->
class JoystickPanTiltController {
  // stickID: ID of HTML element (representing joystick) that will be dragged
  // maxDistance: maximum amount joystick can move in any direction
  // deadzone: joystick must move at least this amount from origin to register value change
  constructor(stickID, maxDistance, deadzone) {
    this.id = stickID;
    let stick = document.getElementById(stickID);

    // location from which drag begins, used to calculate offsets
    this.dragStart = null;

    // track touch identifier in case multiple joysticks present
    this.touchId = null;

    this.active = false;
    this.value = {
      x: 0,
      y: 0,
    };

    let self = this;

    function handleDown(event) {
      self.active = true;

      // all drag movements are instantaneous
      stick.style.transition = "0s";

      // touch event fired before mouse event; prevent redundant mouse event from firing
      event.preventDefault();

      if (event.changedTouches)
        self.dragStart = {
          x: event.changedTouches[0].clientX,
          y: event.changedTouches[0].clientY,
        };
      else
        self.dragStart = {
          x: event.clientX,
          y: event.clientY,
        };

      // if this is a touch event, keep track of which one
      if (event.changedTouches)
        self.touchId = event.changedTouches[0].identifier;
    }

    function handleMove(event) {
      if (!self.active) return;

      // if this is a touch event, make sure it is the right one
      // also handle multiple simultaneous touchmove events
      let touchmoveId = null;
      if (event.changedTouches) {
        for (let i = 0; i < event.changedTouches.length; i++) {
          if (self.touchId == event.changedTouches[i].identifier) {
            touchmoveId = i;
            event.clientX = event.changedTouches[i].clientX;
            event.clientY = event.changedTouches[i].clientY;
          }
        }

        if (touchmoveId == null) return;
      }

      const xDiff = event.clientX - self.dragStart.x;
      const yDiff = event.clientY - self.dragStart.y;
      const angle = Math.atan2(yDiff, xDiff);
      const distance = Math.min(maxDistance, Math.hypot(xDiff, yDiff));
      const xPosition = distance * Math.cos(angle);
      const yPosition = distance * Math.sin(angle);

      // move stick image to new position
      stick.style.transform = `translate3d(${xPosition}px, ${yPosition}px, 0px)`;

      // deadzone adjustment
      const distance2 =
        distance < deadzone
          ? 0
          : (maxDistance / (maxDistance - deadzone)) * (distance - deadzone);
      const xPosition2 = distance2 * Math.cos(angle);
      const yPosition2 = distance2 * Math.sin(angle);
      const xPercent = parseFloat((xPosition2 / maxDistance).toFixed(4));
      const yPercent = parseFloat((yPosition2 / maxDistance).toFixed(4));

      self.value = {
        x: xPercent,
        y: yPercent,
      };
    }
    function getId() {
      return self.id;
    }
    function handleUp(event) {
      if (!self.active) return;

      // if this is a touch event, make sure it is the right one
      if (
        event.changedTouches &&
        self.touchId != event.changedTouches[0].identifier
      )
        return;

      // transition the joystick position back to center
      stick.style.transition = ".2s";
      stick.style.transform = `translate3d(0px, 0px, 0px)`;

      // reset everything
      self.value = {
        x: 0,
        y: 0,
      };
      self.touchId = null;
      self.active = false;

      joystickPanMove(0.0);
      joystickTiltMove(0.0);
    }

    stick.addEventListener("mousedown", handleDown);
    stick.addEventListener("touchstart", handleDown);
    document.addEventListener("mousemove", handleMove, {
      passive: false,
    });
    document.addEventListener("touchmove", handleMove, {
      passive: false,
    });
    document.addEventListener("mouseup", handleUp);
    document.addEventListener("touchend", handleUp);
  }
}
//<!--
// **************************************************************
//                    Slide Focus Joystick -->
class JoystickSlideFocusController {
  // stickID: ID of HTML element (representing joystick) that will be dragged
  // maxDistance: maximum amount joystick can move in any direction
  // deadzone: joystick must move at least this amount from origin to register value change
  constructor(stickID, maxDistance, deadzone) {
    this.id = stickID;
    let stick = document.getElementById(stickID);

    // location from which drag begins, used to calculate offsets
    this.dragStart = null;

    // track touch identifier in case multiple joysticks present
    this.touchId = null;

    this.active = false;
    this.value = {
      x: 0,
      y: 0,
    };

    let self = this;

    function handleDown(event) {
      self.active = true;

      // all drag movements are instantaneous
      stick.style.transition = "0s";

      // touch event fired before mouse event; prevent redundant mouse event from firing
      event.preventDefault();

      if (event.changedTouches)
        self.dragStart = {
          x: event.changedTouches[0].clientX,
          y: event.changedTouches[0].clientY,
        };
      else
        self.dragStart = {
          x: event.clientX,
          y: event.clientY,
        };

      // if this is a touch event, keep track of which one
      if (event.changedTouches)
        self.touchId = event.changedTouches[0].identifier;
    }

    function handleMove(event) {
      if (!self.active) return;

      // if this is a touch event, make sure it is the right one
      // also handle multiple simultaneous touchmove events
      let touchmoveId = null;
      if (event.changedTouches) {
        for (let i = 0; i < event.changedTouches.length; i++) {
          if (self.touchId == event.changedTouches[i].identifier) {
            touchmoveId = i;
            event.clientX = event.changedTouches[i].clientX;
            event.clientY = event.changedTouches[i].clientY;
          }
        }

        if (touchmoveId == null) return;
      }

      const xDiff = event.clientX - self.dragStart.x;
      const yDiff = event.clientY - self.dragStart.y;
      const angle = Math.atan2(yDiff, xDiff);
      const distance = Math.min(maxDistance, Math.hypot(xDiff, yDiff));
      const xPosition = distance * Math.cos(angle);
      const yPosition = distance * Math.sin(angle);

      // move stick image to new position
      stick.style.transform = `translate3d(${xPosition}px, ${yPosition}px, 0px)`;

      // deadzone adjustment
      const distance2 =
        distance < deadzone
          ? 0
          : (maxDistance / (maxDistance - deadzone)) * (distance - deadzone);
      const xPosition2 = distance2 * Math.cos(angle);
      const yPosition2 = distance2 * Math.sin(angle);
      const xPercent = parseFloat((xPosition2 / maxDistance).toFixed(4));
      const yPercent = parseFloat((yPosition2 / maxDistance).toFixed(4));

      self.value = {
        x: xPercent,
        y: yPercent,
      };
    }
    function getId() {
      return self.id;
    }
    function handleUp(event) {
      if (!self.active) return;

      // if this is a touch event, make sure it is the right one
      if (
        event.changedTouches &&
        self.touchId != event.changedTouches[0].identifier
      )
        return;

      // transition the joystick position back to center
      stick.style.transition = ".2s";
      stick.style.transform = `translate3d(0px, 0px, 0px)`;

      // reset everything
      self.value = {
        x: 0,
        y: 0,
      };
      self.touchId = null;
      self.active = false;

      joystickSlideMove(0.0);
      joystickFocusMove(0.0);
    }

    stick.addEventListener("mousedown", handleDown);
    stick.addEventListener("touchstart", handleDown);
    document.addEventListener("mousemove", handleMove, {
      passive: false,
    });
    document.addEventListener("touchmove", handleMove, {
      passive: false,
    });
    document.addEventListener("mouseup", handleUp);
    document.addEventListener("touchend", handleUp);
  }
}

let joystickPanTilt = new JoystickPanTiltController("stick1", 64, 8);
let joystickSlideFocus = new JoystickSlideFocusController("stick2", 64, 8);
var joystickPanTiltPrevVal = { x: 0, y: 0 };
var joystickSlideFocusPrevVal = { x: 0, y: 0 };

function updatePanTilt() {
  if (joystickPanTilt.value.x !== joystickPanTiltPrevVal.x) {
    joystickPanMove(joystickPanTilt.value.x);
    joystickPanTiltPrevVal.x = joystickPanTilt.value.x;
  }
  if (joystickPanTilt.value.y !== joystickPanTiltPrevVal.y) {
    joystickTiltMove(joystickPanTilt.value.y);
    joystickPanTiltPrevVal.y = joystickPanTilt.value.y;
  }
}
function updateSlideFocus() {
  if (joystickSlideFocus.value.x !== joystickSlideFocusPrevVal.x) {
    joystickSlideMove(joystickSlideFocus.value.x);
    joystickPanTiltPrevVal.x = joystickSlideFocus.value.x;
  }
  if (joystickSlideFocus.value.y !== joystickSlideFocusPrevVal.y) {
    joystickFocusMove(joystickSlideFocus.value.y);
    joystickPanTiltPrevVal.y = joystickSlideFocus.value.y;
  }
}

function loop() {
  requestAnimationFrame(loop);
  updatePanTilt();
  updateSlideFocus();
}

loop();
