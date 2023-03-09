function markIn() {
  var command = {
    COMMAND: "MARK_IN",
  };
  sendJSONCommand(command);
}
function markOut() {
  var command = {
    COMMAND: "MARK_OUT",
  };
  sendJSONCommand(command);
}
function gotoIn() {
  var command = {
    COMMAND: "GOTO_IN",
  };
  sendJSONCommand(command);
}
function gotoOut() {
  var command = {
    COMMAND: "GOTO_OUT",
  };
  sendJSONCommand(command);
}
function sendHomeSlider() {
  var command = {
    COMMAND: "HOME",
  };
  sendJSONCommand(command);
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

  var command = {
    COMMAND: "SET_CLOCK_TIME",
    DAY: fullDate[2],
    MONTH: fullDate[1],
    YEAR: fullDate[0],
    HOUR: now.getHours(),
    MINUTE: now.getMinutes(),
    SECOND: now.getSeconds(),
  };
  sendJSONCommand(command);

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
  var command = {
    COMMAND: "START_INTERVALOMETER",
    interval: $("#interval").val(),
    shotsTotal: $("#shotsTotal").val(),
    mode: 0, //$("#mode").val()
    shotsDuration: $("#shotsDuration").val(),
    minDarkTime: $("#minDarkTime").val(),
    rampDuration: $("#rampDuration").val(),
    rampTo: $("#rampTo").val(),
    rampingStartTime: $("#rampingStartTime").val(),
    rampingEndTime: $("#rampingEndTime").val(),
    intervalBeforeRamping: $("#intervalBeforeRamping").val(),
    camSentinel: $("#camSentinel").val(),
    focusDelay: $("#focusDelay").val(),
  };
  sendJSONCommand(command);

  $("#delayedStart").attr("disabled", true);
  $("#startIntervalometer").attr("disabled", true);
  $("#singleShot").attr("disabled", true);
  $("#addIntervalometerProfile").attr("disabled", true);
  $("#removeIntervalometerProfile").attr("disabled", true);
  $("#saveIntervProfile").attr("disabled", true);
  $("#setBulbMode").attr("disabled", true);
  $("#interval").attr("disabled", true);
  $("#shotsTotal").attr("disabled", true);
  $("#mode").attr("disabled", true);
  $("#shotsDuration").attr("disabled", true);
  $("#minDarkTime").attr("disabled", true);

  // TODO Check if ramping already activated if yes disable those inputs
  // $("#rampDuration").attr("disabled", true);
  // $("#rampTo").attr("disabled", true);
  // $("#rampingStartTime").attr("disabled", true);
  // $("#rampingEndTime").attr("disabled", true);
  // $("#intervalBeforeRamping").attr("disabled", true);

  $("#camSentinel").attr("disabled", true);
  $("#focusDelay").attr("disabled", true);
  $("#delayedStartDate").attr("disabled", true);
  $("#delayedStartTime").attr("disabled", true);

  $("#stopIntervalometer").attr("disabled", false);
  $("#pauseIntervalometer").attr("disabled", false);
  $("#activateRamping").attr("disabled", false);
}

function stopIntervalometer(withCommand) {
  if (withCommand) {
    var command = {
      COMMAND: "STOP_INTERVALOMETER",
    };
    sendJSONCommand(command);
  }

  $("#delayedStart").attr("disabled", false);
  $("#startIntervalometer").attr("disabled", false);
  $("#singleShot").attr("disabled", false);
  $("#addIntervalometerProfile").attr("disabled", false);
  $("#removeIntervalometerProfile").attr("disabled", false);
  $("#saveIntervProfile").attr("disabled", false);
  $("#setBulbMode").attr("disabled", false);
  $("#interval").attr("disabled", false);
  $("#shotsTotal").attr("disabled", false);
  $("#mode").attr("disabled", false);
  $("#shotsDuration").attr("disabled", false);
  $("#minDarkTime").attr("disabled", false);

  // TODO Check if ramping already activated if yes enable those inputs
  // $("#rampDuration").attr("disabled", false);
  // $("#rampTo").attr("disabled", false);
  // $("#rampingStartTime").attr("disabled", false);
  // $("#rampingEndTime").attr("disabled", false);
  // $("#intervalBeforeRamping").attr("disabled", false);

  $("#camSentinel").attr("disabled", false);
  $("#focusDelay").attr("disabled", false);
  $("#delayedStartDate").attr("disabled", false);
  $("#delayedStartTime").attr("disabled", false);

  $("#stopIntervalometer").attr("disabled", true);
  $("#pauseIntervalometer").attr("disabled", true);
  $("#activateRamping").attr("disabled", true);
}

function pauseIntervalometer() {
  // TODO
  // PAUSE_INTERVALOMETER
  // sendJSONCommand(command);
}
function activateRamping() {
  //TODO
}

function singleShot() {
  var command = {
    COMMAND: "TAKE_SINGLE_SHOT",
    interval: $("#interval").val(),
    shotsTotal: $("#shotsTotal").val(),
    mode: 0, //$("#mode").val()
    shotsDuration: $("#shotsDuration").val(),
    minDarkTime: $("#minDarkTime").val(),
    rampDuration: $("#rampDuration").val(),
    rampTo: $("#rampTo").val(),
    rampingStartTime: $("#rampingStartTime").val(),
    rampingEndTime: $("#rampingEndTime").val(),
    intervalBeforeRamping: $("#intervalBeforeRamping").val(),
    camSentinel: $("#camSentinel").val(),
    focusDelay: $("#focusDelay").val(),
  };
  sendJSONCommand(command);
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
      $("#interval").removeClass("red");
      intervalometerProfileChanged = true;
    } else {
      $("#interval").removeClass("yellow");
      $("#interval").removeClass("red");
    }

    if (
      intervalometerProfiles[id].shotsTotal !=
      +localStorage.getItem("shotsTotal")
    ) {
      $("#shotsTotal").addClass("yellow");
      $("#interval").removeClass("red");
      intervalometerProfileChanged = true;
    } else {
      $("#shotsTotal").removeClass("yellow");
      $("#interval").removeClass("red");
    }

    if (intervalometerProfiles[id].mode != +localStorage.getItem("mode")) {
      $("#mode").addClass("yellow");
      $("#interval").removeClass("red");
      intervalometerProfileChanged = true;
    } else {
      $("#mode").removeClass("yellow");
      $("#interval").removeClass("red");
    }

    if (
      intervalometerProfiles[id].shotsDuration !=
      +localStorage.getItem("shotsDuration")
    ) {
      $("#shotsDuration").addClass("yellow");
      $("#interval").removeClass("red");
      intervalometerProfileChanged = true;
    } else {
      $("#shotsDuration").removeClass("yellow");
      $("#interval").removeClass("red");
    }

    if (
      intervalometerProfiles[id].minDarkTime !=
      +localStorage.getItem("minDarkTime")
    ) {
      $("#minDarkTime").addClass("yellow");
      $("#interval").removeClass("red");
      intervalometerProfileChanged = true;
    } else {
      $("#minDarkTime").removeClass("yellow");
      $("#interval").removeClass("red");
    }

    if (
      intervalometerProfiles[id].rampDuration !=
      +localStorage.getItem("rampDuration")
    ) {
      $("#rampDuration").addClass("yellow");
      $("#interval").removeClass("red");
      intervalometerProfileChanged = true;
    } else {
      $("#rampDuration").removeClass("yellow");
      $("#interval").removeClass("red");
    }

    if (intervalometerProfiles[id].rampTo != +localStorage.getItem("rampTo")) {
      $("#rampTo").addClass("yellow");
      $("#interval").removeClass("red");
      intervalometerProfileChanged = true;
    } else {
      $("#rampTo").removeClass("yellow");
      $("#interval").removeClass("red");
    }

    if (
      intervalometerProfiles[id].rampingStartTime !=
      localStorage.getItem("rampingStartTime")
    ) {
      $("#rampingStartTime").addClass("yellow");
      $("#interval").removeClass("red");
      intervalometerProfileChanged = true;
    } else {
      $("#rampingStartTime").removeClass("yellow");
      $("#interval").removeClass("red");
    }

    if (
      intervalometerProfiles[id].rampingEndTime !=
      localStorage.getItem("rampingEndTime")
    ) {
      $("#rampingEndTime").addClass("yellow");
      $("#interval").removeClass("red");
      intervalometerProfileChanged = true;
    } else {
      $("#rampingEndTime").removeClass("yellow");
      $("#interval").removeClass("red");
    }

    if (
      intervalometerProfiles[id].intervalBeforeRamping !=
      +localStorage.getItem("intervalBeforeRamping")
    ) {
      $("#intervalBeforeRamping").addClass("yellow");
      $("#interval").removeClass("red");
      intervalometerProfileChanged = true;
    } else {
      $("#intervalBeforeRamping").removeClass("yellow");
      $("#interval").removeClass("red");
    }

    if (
      intervalometerProfiles[id].camSentinel !=
      +localStorage.getItem("camSentinel")
    ) {
      $("#camSentinel").addClass("yellow");
      $("#interval").removeClass("red");
      intervalometerProfileChanged = true;
    } else {
      $("#camSentinel").removeClass("yellow");
      $("#interval").removeClass("red");
    }

    if (
      intervalometerProfiles[id].focusDelay !=
      +localStorage.getItem("focusDelay")
    ) {
      $("#focusDelay").addClass("yellow");
      $("#interval").removeClass("red");
      intervalometerProfileChanged = true;
    } else {
      $("#focusDelay").removeClass("yellow");
      $("#interval").removeClass("red");
    }
  }

  // Check for mathematical error with intervalometer values

  // if Error
  // change the Intervalometer UI values accordingly (RED)

  let isIntervalConform =
    $("#interval").val() -
    $("#shotsDuration").val() -
    $("#minDarkTime").val() -
    $("#focusDelay").val();

  if (isIntervalConform < 0) {
    // Values are invalid
    // Do not send it to ESP32 - intervalometerProfileChanged = false;

    // Save button disabled
    $("#saveIntervProfile").attr("disabled", true);
    // .red {
    //   color: #ff2900 !important;
    // }

    intervalometerProfileChanged = false;
    $("#interval").addClass("red");
    $("#interval").removeClass("yellow");
    $("#shotsDuration").addClass("red");
    $("#shotsDuration").removeClass("yellow");
    $("#minDarkTime").addClass("red");
    $("#minDarkTime").removeClass("yellow");
    $("#focusDelay").addClass("red");
    $("#focusDelay").removeClass("yellow");

    $("#delayedStart").attr("disabled", true);
    $("#startIntervalometer").attr("disabled", true);
    $("#singleShot").attr("disabled", true);
    $("#addIntervalometerProfile").attr("disabled", true);

    // Display Toast telling what's wrong on the intervalometer's settings
    var alertIntervalometerError = document.getElementById(
      "alertIntervalometerError"
    );
    var toast = new bootstrap.Toast(alertIntervalometerError);
    toast.show();
  } else {
    $("#interval").removeClass("red");
    $("#shotsDuration").removeClass("red");
    $("#minDarkTime").removeClass("red");
    $("#focusDelay").removeClass("red");

    $("#delayedStart").attr("disabled", false);
    $("#startIntervalometer").attr("disabled", false);
    $("#singleShot").attr("disabled", false);
    $("#addIntervalometerProfile").attr("disabled", false);
  }

  if (intervalometerProfileChanged) {
    // Save button Enabled
    $("#saveIntervProfile").attr("disabled", false);
    sendIntervalometerDataToESP32(data);
    console.log("Intervalometer values changed");
  } else {
    $("#saveIntervProfile").attr("disabled", true);
  }
  updateIntervalometerDisplay();
}
function sendJSONCommand(command) {
  try {
    if (socket && socket.readyState !== 3) {
      socket.send(JSON.stringify(command));
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
function sendIntervalometerDataToESP32(data) {
  var command = {
    COMMAND: "INTERVALOMETER_SETTINGS",
    interval: data.interval,
    shotsTotal: data.shotsTotal,
    mode: data.mode,
    shotsDuration: data.shotsDuration,
    minDarkTime: data.minDarkTime,
    rampDuration: data.rampDuration,
    rampTo: data.rampTo,
    rampingStartTime: data.rampingStartTime,
    rampingEndTime: data.rampingEndTime,
    intervalBeforeRamping: data.intervalBeforeRamping,
    camSentinel: data.camSentinel,
    focusDelay: data.focusDelay,
  };
  sendJSONCommand(command);
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
//********************************************************************* */
//
//                    Intervalometer Display
//
function updateIntervalometerDisplay() {
  // TODO
  // CSS Class left -> .slider-display || .minDarkTime-display
  // CSS Class width -> .darkTime-display || .exposure-display || .focus-display {
  // $("#other-unit-display") toggle true or false depending on Slider Mode true or false
  // $("#interval-display") width = 100% of intervalometer display width
  // $("#slider-display-label") for slider duration

  $("#other-unit-display").toggle(sliderMode);
  var interval = parseFloat($("#interval").val());
  var shotsDuration = parseFloat($("#shotsDuration").val());
  var focusDelay = parseFloat($("#focusDelay").val());
  var darkTime = interval - shotsDuration - focusDelay;
  var minDarkTime = parseFloat($("#minDarkTime").val());

  var exposureWidth =
    ((shotsDuration + focusDelay) * $("#interval-display").width()) / interval;
  var darkWidth = $("#interval-display").width() - exposureWidth;
  var focusDelayWidth = 0;
  if (focusDelay > 0) {
    focusDelayWidth = (focusDelay * $("#interval-display").width()) / interval;
    if (focusDelayWidth < 1) {
      focusDelayWidth = 1;
    }
  }
  var minDarkTimeWidth = 0;
  if (minDarkTime > 0) {
    minDarkTimeWidth =
      (minDarkTime * $("#interval-display").width()) / interval;
    if (minDarkTimeWidth < 1) {
      minDarkTimeWidth = 1;
    }
  }

  var sliderTimeBuffer = 0;
  var sliderDampeningTime = 1;
  var sliderTime =
    darkTime - minDarkTime - sliderTimeBuffer - sliderDampeningTime;
  var sliderWidth =
    (sliderTime * (darkWidth - minDarkTimeWidth)) / interval + "px";
  var sliderPosition = "150px";

  console.log("darkTime: " + darkTime);
  console.log("minDarkTime: " + minDarkTime);
  console.log("sliderTime: " + sliderTime);

  console.log("darkWidth: " + darkWidth);
  console.log("exposureWidth: " + exposureWidth);
  console.log("minDarkTimeWidth: " + minDarkTimeWidth);
  console.log("focusDelayWidth: " + focusDelayWidth);
  console.log("sliderWidth: " + sliderWidth);

  // .sliderTimeBuffer-display {
  // .sliderDampeningTime-display {

  $("#minDarkTime-display").css({
    width: minDarkTimeWidth,
    "background-color": "rgba(128, 128, 128, 0.3)",
    "padding-top": "5px",
    "border-radius": "0px 5px 5px 0px",
    color: "gray",
  });
  $("#darkTime-display").css({
    width: darkWidth,
    "background-color": "#171d26",
    "padding-top": "5px",
    "border-radius": "5px",
    color: "white",
  });
  $("#exposure-display").css({
    width: exposureWidth,
    "background-color": "#00800088",
    "padding-top": "5px",
    "border-radius": "5px 0px 0px 5px",
    color: "#04f304",
  });
  $("#focus-display").css({
    width: focusDelayWidth,
    "background-color": "#ff000066",
    "padding-top": "5px",
    "border-radius": "5px 0px 0px 5px",
  });
  // .css({"width":sliderWidth not work with JQuery on absolute position element so I did it with document
  document.getElementById("slider-display").style.left = sliderPosition;
  document.getElementById("slider-display").style.width = sliderWidth;

  var exposureDisplay;
  if (exposureWidth < 50) {
    exposureDisplay = shotsDuration;
  } else {
    exposureDisplay = "Exp. " + shotsDuration + " sec.";
  }

  var darkDisplay;
  if (darkWidth < 55) {
    darkDisplay = Math.round((darkTime + Number.EPSILON) * 100) / 100;
  } else {
    darkDisplay =
      "Dark " + Math.round((darkTime + Number.EPSILON) * 100) / 100 + " sec.";
  }

  $("#interval-display").html("Interval " + interval + " sec.");
  $("#exposure-display").html(exposureDisplay);
  $("#darkTime-display").html(darkDisplay);
  if (minDarkTime > 0) {
    $("#minDarkTime-display").html(
      Math.round((minDarkTime + Number.EPSILON) * 100) / 100
    );
  } else {
    $("#minDarkTime-display").html("");
  }
  if (sliderTime > 0) {
    $("#slider-display").html(
      Math.round((sliderTime + Number.EPSILON) * 100) / 100 + " sec."
    );
  } else {
    $("#slider-display").html(
      Math.round((sliderTime + Number.EPSILON) * 100) / 100
    );
  }
  if (sliderTime < 0 || sliderTime === 0) {
    $("#slider-display").addClass("red");
    $("#slider-display-label").addClass("red");
  } else {
    $("#slider-display").removeClass("red");
    $("#slider-display-label").removeClass("red");
  }
}
