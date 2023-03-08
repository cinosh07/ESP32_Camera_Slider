/**********************************************************************
 *                  Author: Carl Tremblay
 *
 *                Cinosh Camera Slider Controller
 *                        version 0.1
 *
 *                  Copyright 2023 Carl Tremblay
 *
 *                            License
 *    Attribution-NonCommercial-NoDerivatives 4.0 International
 *                      (CC BY-NC-ND 4.0)
 *        https://creativecommons.org/licenses/by-nc-nd/4.0/
 *********************************************************************/
#include "./commands/JoystickCommand.h"
void processJSONCommand(StaticJsonDocument<1024> command)
{

  if (command["COMMAND"] == "INTERVALOMETER_SETTINGS")
  {
    Serial.println("Command to process INTERVALOMETER_SETTINGS");
    intervalometer.releaseTime = command["shotsDuration"];
    intervalometer.shotsTotal = command["shotsTotal"];
    intervalometer.minDarkTime = command["minDarkTime"];
    intervalometer.interval = command["interval"];
    intervalometer.focusDelay = command["focusDelay"];
    intervalometer.camSentinel = command["camSentinel"];
    intervalometer.rampDuration = command["rampDuration"];
    intervalometer.rampingEndTime = command["rampingEndTime"];
    intervalometer.rampingStartTime = command["rampingStartTime"];
    intervalometer.rampTo = command["rampTo"];
    intervalometer.intervalBeforeRamping = command["intervalBeforeRamping"];
    // intervalometer.mode = command["mode"];
  }
  if (command["COMMAND"] == "START_INTERVALOMETER")
  {
    intervalometer.releaseTime = command["shotsDuration"];
    intervalometer.shotsTotal = command["shotsTotal"];
    intervalometer.minDarkTime = command["minDarkTime"];
    intervalometer.interval = command["interval"];
    intervalometer.focusDelay = command["focusDelay"];
    intervalometer.camSentinel = command["camSentinel"];
    intervalometer.rampDuration = command["rampDuration"];
    intervalometer.rampingEndTime = command["rampingEndTime"];
    intervalometer.rampingStartTime = command["rampingStartTime"];
    intervalometer.rampTo = command["rampTo"];
    intervalometer.intervalBeforeRamping = command["intervalBeforeRamping"];
    // intervalometer.mode = command["mode"];
    startShooting();
    Serial.println("Command to process START_INTERVALOMETER");
  }
  if (command["COMMAND"] == "STOP_INTERVALOMETER")
  {
    stopShooting();
    Serial.println("Command to process STOP_INTERVALOMETER");
  }
  if (command["COMMAND"] == "MARK_IN")
  {
    commandStatus = CommandStatus::MARK_IN;
    Serial.println("Command to process MARK_IN");
  }
  if (command["COMMAND"] == "MARK_OUT")
  {
    commandStatus = CommandStatus::MARK_OUT;
    Serial.println("Command to process MARK_OUT");
  }
  if (command["COMMAND"] == "GOTO_IN")
  {
    commandStatus = CommandStatus::GOTO_IN;
    Serial.println("Command to process GOTO_IN");
  }
  if (command["COMMAND"] == "GOTO_OUT")
  {
    commandStatus = CommandStatus::GOTO_OUT;
    Serial.println("Command to process GOTO_OUT");
  }
  if (command["COMMAND"] == "SET_CLOCK_TIME")
  {
    setClockTime(command);
    Serial.println("Command to process SET_CLOCK_TIME");
  }
  if (command["COMMAND"] == "TAKE_SINGLE_SHOT")
  {
    intervalometer.releaseTime = command["shotsDuration"];
    intervalometer.shotsTotal = command["shotsTotal"];
    intervalometer.minDarkTime = command["minDarkTime"];
    intervalometer.interval = command["interval"];
    intervalometer.focusDelay = command["focusDelay"];
    intervalometer.camSentinel = command["camSentinel"];
    intervalometer.rampDuration = command["rampDuration"];
    intervalometer.rampingEndTime = command["rampingEndTime"];
    intervalometer.rampingStartTime = command["rampingStartTime"];
    intervalometer.rampTo = command["rampTo"];
    intervalometer.intervalBeforeRamping = command["intervalBeforeRamping"];
    // intervalometer.mode = command["mode"];
    startShooting(true);
    Serial.println("Command to process TAKE_SINGLE_SHOT");
  }
  if (command["COMMAND"] == "JOYSTICK_SLIDE_MOVE" | command["COMMAND"] == "JOYSTICK_TILT_MOVE" | command["COMMAND"] == "JOYSTICK_PAN_MOVE" | command["COMMAND"] == "JOYSTICK_FOCUS_MOVE")
  {
    processJoystickCommand(command);
    
  }
}