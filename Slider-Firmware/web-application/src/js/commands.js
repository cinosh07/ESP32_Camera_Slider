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
    0;
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
  intervalometerProfileChanged = false;
  if (id !== 0) {
    if (intervalometerProfiles[id].interval != +localStorage.getItem("interval")) {
      $("#interval").addClass("yellow");
      intervalometerProfileChanged = true;
    } else {
      $("#interval").removeClass("yellow");
    }

    if (intervalometerProfiles[id].shotsTotal != +localStorage.getItem("shotsTotal")) {
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

    if (intervalometerProfiles[id].shotsDuration != +localStorage.getItem("shotsDuration")) {
      $("#shotsDuration").addClass("yellow");
      intervalometerProfileChanged = true;
    } else {
      $("#shotsDuration").removeClass("yellow");
    }

    if (intervalometerProfiles[id].minDarkTime != +localStorage.getItem("minDarkTime")) {
      $("#minDarkTime").addClass("yellow");
      intervalometerProfileChanged = true;
    } else {
      $("#minDarkTime").removeClass("yellow");
    }

    if (intervalometerProfiles[id].rampDuration != +localStorage.getItem("rampDuration")) {
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

    if (intervalometerProfiles[id].rampingStartTime != localStorage.getItem("rampingStartTime")) {
      $("#rampingStartTime").addClass("yellow");
      intervalometerProfileChanged = true;
    } else {
      $("#rampingStartTime").removeClass("yellow");
    }

    if (intervalometerProfiles[id].rampingEndTime != localStorage.getItem("rampingEndTime")) {
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

    if (intervalometerProfiles[id].camSentinel != +localStorage.getItem("camSentinel")) {
      $("#camSentinel").addClass("yellow");
      intervalometerProfileChanged = true;
    } else {
      $("#camSentinel").removeClass("yellow");
    }

    if (intervalometerProfiles[id].focusDelay != +localStorage.getItem("focusDelay")) {
      $("#focusDelay").addClass("yellow");
      intervalometerProfileChanged = true;
    } else {
      $("#focusDelay").removeClass("yellow");
    }
  }

  // if Mismatch
  // change the Intervalometer UI values accordingly (YELLOW)
  // Save needed to keep local changes
  // Save button enabled

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
