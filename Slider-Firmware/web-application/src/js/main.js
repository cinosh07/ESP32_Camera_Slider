// ******************************************************************
// ******************************************************************
// ******************************************************************


//             DO NOT EDIT - AUTOMATICALLY GENERATED



// ******************************************************************
// ******************************************************************
// ******************************************************************






















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

var DEBUG = false;
var sliderMode = false;
var timelapseMode = true;

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

var joystickSlideMoveArray = [];
var joystickSlideMoveCount = 0;
var joystickSlideMovePreviousDir = -2;
var joystickSlideMovePreviousAverage = 0.0;

var intervalometerProfiles = [];
var intervalometerProfileChanged = false;
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
  $.ajaxSetup({ cache: false });
  $("#intervalometer").load("interval.html", function () {
    $("#intervalometer").toggle(false);
    $("#startIntervalometer").on("click", function () {
      startIntervalometer();
    });
    $("#stopIntervalometer").on("click", function () {
      stopIntervalometer();
    });

    $("#pauseIntervalometer").on("click", function () {
      pauseIntervalometer();
    });
    $("#activateRamping").on("click", function () {
      activateRamping();
    });
    $("#singleShot").on("click", function () {
      singleShot();
    });
    $("#intervalometerSliderSettingsGroup").toggle(false);
    var now = new Date();
    var month = now.getMonth() + 1;
    var day = now.getDate();
    if (month < 10) month = "0" + month;
    if (day < 10) day = "0" + day;
    var today = now.getFullYear() + "-" + month + "-" + day;
    $("#delayedStartDate").val(today);
    if (sliderMode && timelapseMode) {
      $("#delayedStartGroup").appendTo($("#run"));
      $("#startGroup").appendTo($("#run"));
      $("#sliderRunGroup").toggle(false);
      $("#next-button").html("&raquo; Intervalometer");
    }
    if (!timelapseMode && sliderMode) {
      $("#sliderRunGroup").toggle(true);
      $("#startGroup").toggle(false);
      $("#delayedStartGroup").toggle(false);
      $("#rampingGroup").toggle(false);
      $("#intervalometerSettingsGroup").toggle(false);
      $("#intervalometerSliderSettingsGroup").toggle(true);
      $("#next-button").html("&raquo; Timing");
    }
    $("#intervalometerProfiles").on("change", function () {
      console.log(
        "Intervalometer Profile change: " +
          intervalometerProfiles[this.value].name
      );
      setLocalDefaultIntervalometerProfile(
        this.value,
        intervalometerProfiles[this.value],
        true
      );
    });
    $("#interval").on("change", function () {
      updateLocalIntervalometerProfileValue("interval", this.value);
    });

    $("#shotsTotal").on("change", function () {
      updateLocalIntervalometerProfileValue("shotsTotal", this.value);
    });

    $("#mode").on("change", function () {
      updateLocalIntervalometerProfileValue("mode", this.value);
    });
    $("#shotsDuration").on("change", function () {
      updateLocalIntervalometerProfileValue("shotsDuration", this.value);
    });
    $("#minDarkTime").on("change", function () {
      updateLocalIntervalometerProfileValue("minDarkTime", this.value);
    });
    $("#rampDuration").on("change", function () {
      updateLocalIntervalometerProfileValue("rampDuration", this.value);
    });
    $("#rampTo").on("change", function () {
      updateLocalIntervalometerProfileValue("rampTo", this.value);
    });
    $("#rampingStartTime").on("change", function () {
      updateLocalIntervalometerProfileValue("rampingStartTime", this.value);
    });
    $("#rampingEndTime").on("change", function () {
      updateLocalIntervalometerProfileValue("rampingEndTime", this.value);
    });
    $("#intervalBeforeRamping").on("change", function () {
      updateLocalIntervalometerProfileValue(
        "intervalBeforeRamping",
        this.value
      );
    });
    $("#camSentinel").on("change", function () {
      updateLocalIntervalometerProfileValue("camSentinel", this.value);
    });
    $("#focusDelay").on("change", function () {
      updateLocalIntervalometerProfileValue("focusDelay", this.value);
    });
    $("#saveIntervProfile").on("click", function () {
      if (+localStorage.getItem("defaultIntvProfileID") !== 0) {
        saveIntervalometerProfiles();
      }
    });
  });

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
  if (ctx) {
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
  }

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
      if (timelapseMode || !sliderMode) {
        $("#next-button").html("&raquo; Intervalometer");
      } else {
        $("#next-button").html("&raquo; Timing");
      }

      $("#title").html(
        '<a id="title" class="navbar-brand text-white-50 " href="#">' +
          +'<img class="header-icon" src="./images/icon-32.png" /> SLIDER CONTROLLER</a>'
      );
      break;
    case 2:
      $("#control-panel").toggle(false);
      $("#intervalometer").toggle(true);
      $("#run").toggle(false);
      $("#previous-button").html("Controls &laquo;");
      $("#next-button").html("&raquo; Run");
      if (timelapseMode || !sliderMode) {
        $("#title").html(
          '<a id="title" class="navbar-brand text-white-50 " href="#">' +
            '<img class="header-icon" src="./images/icon-32.png" /> INTERVALOMETER</a>'
        );
      } else {
        $("#title").html(
          '<a id="title" class="navbar-brand text-white-50 " href="#">' +
            '<img class="header-icon" src="./images/icon-32.png" /> TIMING</a>'
        );
      }
      break;
    case 3:
      $("#control-panel").toggle(false);
      $("#intervalometer").toggle(false);
      $("#run").toggle(true);
      if (timelapseMode || !sliderMode) {
        $("#previous-button").html("Intervalometer &laquo;");
      } else {
        $("#previous-button").html("Timing &laquo;");
      }

      $("#next-button").html("&raquo;");
      $("#title").html(
        '<a id="title" class="navbar-brand text-white-50 " href="#">' +
          '<img class="header-icon" src="./images/icon-32.png" /> RUN</a>'
      );
      break;
  }
}
/* ***************************************************************
            initialization before starting the script
  ****************************************************************
*/
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
//<!--
// **************************************************************
//                  Averaging joystick values
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
    if (stick) {
      stick.addEventListener("mousedown", handleDown);
      stick.addEventListener("touchstart", handleDown);
    }

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
    if (stick) {
      stick.addEventListener("mousedown", handleDown);
      stick.addEventListener("touchstart", handleDown);
    }
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

Date.prototype.toDateInputValue = function () {
  var local = new Date(this);
  local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
  return local.toJSON().slice(0, 10);
};
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
const TIMELAPSE_COMMAND = {
  IDLE: 0,
  START: 1,
  STOP: 2,
  PAUSE: 3,
  TAKE_SINGLE_SHOT: 4,
  SET_START_TIME_ALARM: 5,
  GET_START_TIME_ALARM: 6,
  CLEAR_START_TIME_ALARM: 7,
  START_INTERVALOMETER: 8,
  STOP_INTERVALOMETER: 9,
  PAUSE_INTERVALOMETER: 10,
  START_INTERVALOMETER_RAMPING: 11,
  STOP_INTERVALOMETER_RAMPING: 12,
  UPDATE_INTERVALOMETER_RAMPING: 13,
};
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
      // console.log("Command Sended : ", command);
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
// interval: 4.0,
//     shotsTotal: 0,
//     mode: 0,
//     shotsDuration: 0.1,
//     minDarkTime: 0.5,
//     rampDuration: 10,
//     rampTo: 0,
//     rampingStartTime: 0,
//     rampingEndTime: 0,
//     intervalBeforeRamping: 0,
//     camSentinel: 0,
//     focusDelay: 0,
function startIntervalometer() {
  var command;
  command =
    COMMAND_TYPE.TIMELAPSE +
    "::" +
    TIMELAPSE_COMMAND.START_INTERVALOMETER +
    "::" +
    $("#shotsDuration").val() +
    "::" +
    $("#shotsTotal").val() +
    "::" +
    $("#interval").val() +
    "::" +
    $("#minDarkTime").val() +
    "::" +
    0 + // TODO Add mode MANUAL or BULB
    "::" +
    $("#camSentinel").val() +
    "::" +
    $("#focusDelay").val();
  sendCommand(command);
}
function stopIntervalometer() {
  var command;
  command =
    COMMAND_TYPE.TIMELAPSE +
    "::" +
    TIMELAPSE_COMMAND.STOP_INTERVALOMETER +
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
function pauseIntervalometer() {
  var command;
  command =
    COMMAND_TYPE.TIMELAPSE +
    "::" +
    TIMELAPSE_COMMAND.PAUSE_INTERVALOMETER +
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
function activateRamping() {
  //TODO
}

function singleShot() {
  var command;
  command =
    COMMAND_TYPE.TIMELAPSE +
    "::" +
    TIMELAPSE_COMMAND.TAKE_SINGLE_SHOT +
    "::" +
    $("#shotsDuration").val() +
    "::" +
    1 + // Take only one shot
    "::" +
    $("#interval").val() +
    "::" +
    $("#minDarkTime").val() +
    "::" +
    0 + // TODO Add mode MANUAL or BULB
    "::" +
    0;
  sendCommand(command);
}

//***************************************************************************** */
//                        Profile Commands
//***************************************************************************** */

function getIntervalometerProfiles(isInit) {
  let url = "intervalometer";
  if (DEBUG) {
    url = "interval-for-internal-debug-only.json";
  }

  $.getJSON(url, function (data) {
    console.log("Intervalometer Profiles received: ");
    console.log(data);
    intervalometerProfiles = data.profiles;
    $("#intervalometerProfiles").empty();
    if (
      getLocalDefaultIntervalometerProfileName() === undefined ||
      getLocalDefaultIntervalometerProfileName() === null
    ) {
      setLocalDefaultIntervalometerProfile(0, data.profiles[0], false);
    }
    for (var x = 0; x < data.profiles.length; x++) {
      var selected = undefined;
      if (
        getLocalDefaultIntervalometerProfileName() === data.profiles[x].name
      ) {
        selected = true;
        setLocalDefaultIntervalometerProfile(x, data.profiles[x], false);
      }

      var option = $(document.createElement("option"));
      option.val(x);
      if (selected) {
        option.attr("selected", true);
      }
      option.html(data.profiles[x].name);

      $("#intervalometerProfiles").append(option);
    }
    if (isInit) {
      $("#control-panel").toggle(true);
      $("#intervalometer").toggle(false);
    }
  });
}

function getLocalDefaultIntervalometerProfileName() {
  return localStorage.getItem("defaultIntvProfile");
}
function setLocalDefaultIntervalometerProfile(id, profile, forceChange) {
  localStorage.setItem("defaultIntvProfile", profile.name);
  localStorage.setItem("defaultIntvProfileID", id);
  setIntervalometerProfileData(id, profile, forceChange);
}
function setIntervalometerProfileData(id, profile, forceChange) {
  var data = {
    name: "",
    interval: 4.0,
    shotsTotal: 0,
    mode: 0,
    shotsDuration: 0.1,
    minDarkTime: 0.5,
    rampDuration: 10,
    rampTo: 0,
    rampingStartTime: 0,
    rampingEndTime: 0,
    intervalBeforeRamping: 0,
    camSentinel: 0,
    focusDelay: 0,
  };
  if (
    localStorage.getItem("intvProfilesConfigured") === null ||
    localStorage.getItem("intvProfilesConfigured") === undefined ||
    forceChange
  ) {
    // Fill UI data with profile values and save to local storage if it's the first time
    localStorage.setItem("interval", profile.interval);
    data.interval = profile.interval;
    localStorage.setItem("shotsTotal", profile.shotsTotal);
    data.shotsTotal = profile.shotsTotal;
    localStorage.setItem("mode", profile.mode);
    data.mode = profile.mode;
    localStorage.setItem("shotsDuration", profile.shotsDuration);
    data.shotsDuration = profile.shotsDuration;
    localStorage.setItem("minDarkTime", profile.minDarkTime);
    data.minDarkTime = profile.minDarkTime;
    localStorage.setItem("rampDuration", profile.rampDuration);
    data.rampDuration = profile.rampDuration;
    localStorage.setItem("rampTo", profile.rampTo);
    data.rampTo = profile.rampTo;
    localStorage.setItem("rampingStartTime", profile.rampingStartTime);
    data.rampingStartTime = profile.rampingStartTime;
    localStorage.setItem("rampingEndTime", profile.rampingEndTime);
    data.rampingEndTime = profile.rampingEndTime;
    localStorage.setItem(
      "intervalBeforeRamping",
      profile.intervalBeforeRamping
    );
    data.intervalBeforeRamping = profile.intervalBeforeRamping;
    localStorage.setItem("camSentinel", profile.camSentinel);
    data.camSentinel = profile.camSentinel;
    localStorage.setItem("focusDelay", profile.focusDelay);
    data.focusDelay = profile.focusDelay;
  } else {
    // Fill UI data with local storage values

    data.interval = +localStorage.getItem("interval");
    data.shotsTotal = +localStorage.getItem("shotsTotal");
    data.mode = +localStorage.getItem("mode");
    data.shotsDuration = +localStorage.getItem("shotsDuration");
    data.minDarkTime = +localStorage.getItem("minDarkTime");
    data.rampDuration = +localStorage.getItem("rampDuration");
    data.rampTo = +localStorage.getItem("rampTo");
    data.rampingStartTime = localStorage.getItem("rampingStartTime");
    data.rampingEndTime = localStorage.getItem("rampingEndTime");
    data.intervalBeforeRamping = +localStorage.getItem("intervalBeforeRamping");
    data.camSentinel = +localStorage.getItem("camSentinel");
    data.focusDelay = +localStorage.getItem("focusDelay");
  }
  // Fill Intervalometer UI with data
  $("#interval").val(+data.interval);
  $("#shotsTotal").val(+data.shotsTotal);
  $("#mode").val(+data.mode);
  $("#shotsDuration").val(+data.shotsDuration);
  $("#minDarkTime").val(+data.minDarkTime);
  $("#rampDuration").val(+data.rampDuration);
  $("#rampTo").val(+data.rampTo);
  $("#rampingStartTime").val(data.rampingStartTime);
  $("#rampingEndTime").val(data.rampingEndTime);
  $("#intervalBeforeRamping").val(+data.intervalBeforeRamping);
  $("#camSentinel").val(data.camSentinel);
  $("#focusDelay").val(+data.focusDelay);

  localStorage.setItem("intvProfilesConfigured", "true");
  checkIntervalometerMisMatchAndError(id, data);
}

function checkIntervalometerMisMatchAndError(id, data) {
  // This function is also trigered by on change values events

  // check Intervalometer values MisMatch And Error and
  // change the Intervalometer UI accordingly

  // Compare mismatch between intervalometerProfiles[id] & data

  // if Mismatch
  // change the Intervalometer UI values accordingly (YELLOW)
  // Save needed to keep local changes
  // Save button enabled

  intervalometerProfileChanged = false;
  if (id !== 0) {
    if (
      intervalometerProfiles[id].interval != +localStorage.getItem("interval")
    ) {
      $("#interval").addClass("yellow");
      intervalometerProfileChanged = true;
    } else {
      $("#interval").removeClass("yellow");
    }

    if (
      intervalometerProfiles[id].shotsTotal !=
      +localStorage.getItem("shotsTotal")
    ) {
      $("#shotsTotal").addClass("yellow");
      intervalometerProfileChanged = true;
    } else {
      $("#shotsTotal").removeClass("yellow");
    }

    if (intervalometerProfiles[id].mode != +localStorage.getItem("mode")) {
      $("#mode").addClass("yellow");
      intervalometerProfileChanged = true;
    } else {
      $("#mode").removeClass("yellow");
    }

    if (
      intervalometerProfiles[id].shotsDuration !=
      +localStorage.getItem("shotsDuration")
    ) {
      $("#shotsDuration").addClass("yellow");
      intervalometerProfileChanged = true;
    } else {
      $("#shotsDuration").removeClass("yellow");
    }

    if (
      intervalometerProfiles[id].minDarkTime !=
      +localStorage.getItem("minDarkTime")
    ) {
      $("#minDarkTime").addClass("yellow");
      intervalometerProfileChanged = true;
    } else {
      $("#minDarkTime").removeClass("yellow");
    }

    if (
      intervalometerProfiles[id].rampDuration !=
      +localStorage.getItem("rampDuration")
    ) {
      $("#rampDuration").addClass("yellow");
      intervalometerProfileChanged = true;
    } else {
      $("#rampDuration").removeClass("yellow");
    }

    if (intervalometerProfiles[id].rampTo != +localStorage.getItem("rampTo")) {
      $("#rampTo").addClass("yellow");
      intervalometerProfileChanged = true;
    } else {
      $("#rampTo").removeClass("yellow");
    }

    if (
      intervalometerProfiles[id].rampingStartTime !=
      localStorage.getItem("rampingStartTime")
    ) {
      $("#rampingStartTime").addClass("yellow");
      intervalometerProfileChanged = true;
    } else {
      $("#rampingStartTime").removeClass("yellow");
    }

    if (
      intervalometerProfiles[id].rampingEndTime !=
      localStorage.getItem("rampingEndTime")
    ) {
      $("#rampingEndTime").addClass("yellow");
      intervalometerProfileChanged = true;
    } else {
      $("#rampingEndTime").removeClass("yellow");
    }

    if (
      intervalometerProfiles[id].intervalBeforeRamping !=
      +localStorage.getItem("intervalBeforeRamping")
    ) {
      $("#intervalBeforeRamping").addClass("yellow");
      intervalometerProfileChanged = true;
    } else {
      $("#intervalBeforeRamping").removeClass("yellow");
    }

    if (
      intervalometerProfiles[id].camSentinel !=
      +localStorage.getItem("camSentinel")
    ) {
      $("#camSentinel").addClass("yellow");
      intervalometerProfileChanged = true;
    } else {
      $("#camSentinel").removeClass("yellow");
    }

    if (
      intervalometerProfiles[id].focusDelay !=
      +localStorage.getItem("focusDelay")
    ) {
      $("#focusDelay").addClass("yellow");
      intervalometerProfileChanged = true;
    } else {
      $("#focusDelay").removeClass("yellow");
    }
  }

  // TODO Check for mathematical error with intervalometer values

  // if Error
  // change the Intervalometer UI values accordingly (RED)
  // Values are invalid
  // Save button disabled

  // .red {
  //   color: #ff2900 !important;
  // }

  // if no mismatch
  // Save button disabled

  console.log("Intervalometer values changed");
}

function resetLocalIntervalometerProfileValue(type) {
  localStorage.setItem(
    type,
    intervalometerProfiles[+localStorage.getItem("defaultIntvProfileID")][type]
  );
  if (
    type === "name" ||
    type === "rampingStartTime" ||
    type === "rampingEndTime"
  ) {
    $("#" + type + "").val(
      intervalometerProfiles[+localStorage.getItem("defaultIntvProfileID")][
        type
      ]
    );
  } else {
    $("#" + type + "").val(
      +intervalometerProfiles[+localStorage.getItem("defaultIntvProfileID")][
        type
      ]
    );
  }
  checkIntervalometerMisMatchAndError(
    +localStorage.getItem("defaultIntvProfileID"),
    intervalometerProfiles[+localStorage.getItem("defaultIntvProfileID")]
  );
}

function updateLocalIntervalometerProfileValue(type, value) {
  localStorage.setItem(type, value);
  checkIntervalometerMisMatchAndError(
    +localStorage.getItem("defaultIntvProfileID"),
    intervalometerProfiles[+localStorage.getItem("defaultIntvProfileID")]
  );
  console.log(type + " value updated: ", value);
}

async function saveIntervalometerProfiles() {
  intervalometerProfiles[
    +localStorage.getItem("defaultIntvProfileID")
  ].interval = +localStorage.getItem("interval");
  intervalometerProfiles[
    +localStorage.getItem("defaultIntvProfileID")
  ].shotsTotal = +localStorage.getItem("shotsTotal");
  intervalometerProfiles[+localStorage.getItem("defaultIntvProfileID")].mode =
    +localStorage.getItem("mode");
  intervalometerProfiles[
    +localStorage.getItem("defaultIntvProfileID")
  ].shotsDuration = +localStorage.getItem("shotsDuration");
  intervalometerProfiles[
    +localStorage.getItem("defaultIntvProfileID")
  ].minDarkTime = +localStorage.getItem("minDarkTime");
  intervalometerProfiles[
    +localStorage.getItem("defaultIntvProfileID")
  ].rampDuration = +localStorage.getItem("rampDuration");
  intervalometerProfiles[+localStorage.getItem("defaultIntvProfileID")].rampTo =
    +localStorage.getItem("rampTo");
  intervalometerProfiles[
    +localStorage.getItem("defaultIntvProfileID")
  ].rampingStartTime = localStorage.getItem("rampingStartTime");
  intervalometerProfiles[
    +localStorage.getItem("defaultIntvProfileID")
  ].rampingEndTime = localStorage.getItem("rampingEndTime");
  intervalometerProfiles[
    +localStorage.getItem("defaultIntvProfileID")
  ].intervalBeforeRamping = +localStorage.getItem("intervalBeforeRamping");
  intervalometerProfiles[
    +localStorage.getItem("defaultIntvProfileID")
  ].camSentinel = +localStorage.getItem("camSentinel");
  intervalometerProfiles[
    +localStorage.getItem("defaultIntvProfileID")
  ].focusDelay = +localStorage.getItem("focusDelay");

  let profiles = {
    profiles: intervalometerProfiles,
  };

  $.ajax({
    type: "POST",
    dataType: "json",
    async: false,
    url: "uploadIntervProfiles",
    data: JSON.stringify(profiles),
    success: function (event) {
      console.log(event);
      checkIntervalometerMisMatchAndError(
        +localStorage.getItem("defaultIntvProfileID"),
        intervalometerProfiles[+localStorage.getItem("defaultIntvProfileID")]
      );
    },
    error: function (event) {
      console.log(event);
      alert("Error Updating Profile!");
    },
  });
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
  }/* ***************************************************************
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
      if (alertConnected) {
      var toast = new bootstrap.Toast(alertConnected);   
        toast.show();
      }
      sendTimeStamp();
      $("#control-panel").toggle(false);
      $("#intervalometer").toggle(true);
      getIntervalometerProfiles(true);
    };
    var previousStatus = -1;
    socket.onmessage = function (event) {
      // TODO
      try {
        var object = JSON.parse(event.data);
        if (object.SHOTS !== undefined) {
          var callback = {
            SHOTS: object.SHOTS,
          };
          console.log(callback);
        }
        if (object.COMMAND_STATUS !== undefined && previousStatus !== object.COMMAND_STATUS) {
            previousStatus = object.COMMAND_STATUS;
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
    //   retryConnectWebsocketTimeout = null;
    //   retryConnectWebsocketTimeout = setTimeout(tryReconnect, 10000);
    //   socket.close();
    //   socket = null;
    };
  }