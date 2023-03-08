/* ***************************************************************
                       Joysticks Controls
  ****************************************************************
*/
function joystickPanMove(data) {
    // console.log("############### joystickPan value: " + data);
    let dir = 0;
    if (data < 0) {
      dir = -1;
      data = Math.abs(data);
    }
    let command = {
      COMMAND: "JOYSTICK_PAN_MOVE",
      speed: data,
      dir: dir,
    };
    // sendJSONCommand(command);
  }
  function joystickTiltMove(data) {
    // console.log("############### joysticTilt value: " + data);
    let dir = 0;
    if (data < 0) {
      dir = -1;
      data = Math.abs(data);
    }
    let command = {
      COMMAND: "JOYSTICK_TILT_MOVE",
      speed: data,
      dir: dir,
    };
    // sendJSONCommand(command);
  }
  
  function joystickSlideMove(data) {
    
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
        let command = {
          COMMAND: "JOYSTICK_SLIDE_MOVE",
          speed:  Math.round(Avg.average(joystickSlideMoveArray)),
          dir: dir,
        };
        sendJSONCommand(command);
      }
      joystickSlideMoveArray = [];
      joystickSlideMoveCount = 0;
    } else {
      joystickSlideMoveArray.push(Math.round(data * 100));
      joystickSlideMoveCount = joystickSlideMoveCount + 1;
    }
    if (dir !== joystickSlideMovePreviousDir) {
      console.log(
        "############### CHANGE DIR joystickSlide value: " +
          Math.round(data * 100)
      );
      let command = {
        COMMAND: "JOYSTICK_SLIDE_MOVE",
        speed:  Math.round(data * 100),
        dir: dir,
      };
      sendJSONCommand(command);
      joystickSlideMovePreviousDir = dir;
    }
    if (data === 0) {
      console.log(
        "############### STOP joystickSlide value: " + Math.round(data * 100)
      );
      let command = {
        COMMAND: "JOYSTICK_SLIDE_MOVE",
        speed:  Math.round(data * 100),
        dir: dir,
      };
      sendJSONCommand(command);
  
      joystickSlideMovePreviousDir = -2;
    }
    console.log("Joystick Slide Move Dir: " + dir);
  }
  
  function joystickFocusMove(data) {
    // console.log("############### joystickFocus value: " + data);
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
    // sendJSONCommand(command);
  }