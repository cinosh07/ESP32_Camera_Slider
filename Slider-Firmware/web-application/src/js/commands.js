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
