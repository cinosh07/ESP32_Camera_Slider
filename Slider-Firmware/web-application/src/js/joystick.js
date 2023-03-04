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