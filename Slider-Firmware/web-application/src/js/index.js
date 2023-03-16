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

// let SLIDER_MODE = true;
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
      stopIntervalometer(true);
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
    // var now = new Date();
    // var month = now.getMonth() + 1;
    // var day = now.getDate();
    // if (month < 10) month = "0" + month;
    // if (day < 10) day = "0" + day;
    // var today = now.getFullYear() + "-" + month + "-" + day;
    // $("#delayedStartDate").val(today);
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
    if (sliderMode) {
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
if (window.innerWidth > 400) {
  // var mvp = document.getElementById("appViewport");
  // mvp.setAttribute("content", "width=400");
  // $("#body").width(400);
  // $("#sticky-footer").width(400);
  // $("#navBar").addClass("navbarForceMobile");


}
$( window ).on("resize", function() {
  if (window.innerWidth > 400) {
    // var mvp = document.getElementById("appViewport");
    // mvp.setAttribute("content", "width=400");
    // $("#body").width(400);
    // $("#sticky-footer").width(400);
    // $("#navBar").addClass("navbarForceMobile");
  
  } else {

    // var mvp = document.getElementById("appViewport");
    // mvp.setAttribute("content", "width="+(window.innerWidth - 10)+"");
    // $("#body").width(window.innerWidth - 10);
    // $("#sticky-footer").width(window.innerWidth- 10);
    // $("#navBar").removeClass("navbarForceMobile");

  }
});