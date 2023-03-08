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
#include <Arduino.h>

void processJoystickCommand(StaticJsonDocument<1024> command)
{
  double speed = (double)command["speed"];
  if (command["COMMAND"] == "JOYSTICK_PAN_MOVE")
  {
    Serial.println("Command to process JOYSTICK_PAN_MOVE");
  }
  if (command["COMMAND"] == "JOYSTICK_TILT_MOVE")
  {
    Serial.println("Command to process JOYSTICK_TILT_MOVE");
  }
  if (command["COMMAND"] == "JOYSTICK_SLIDE_MOVE")
  {
    Serial.println("Command to process JOYSTICK_SLIDE_MOVE");

    Serial.print("Speed: ");
    Serial.println(speed);
    Serial.print("Dir: ");
    Serial.println((int) command["dir"]);
    if (speed == 0)
    {
      commandStatus = CommandStatus::IDLE;
      Serial.println("Webscoket Command : stopMove()");
      stepperSlide->setSpeedInUs(0);
      stepperSlide->applySpeedAcceleration();
      stepperSlide->stopMove();
      previousSlideSpeed = -2.00;
      previousSlideDir = -2;
    }

    if ((int) command["dir"] == 0 && speed > 0)
    {
      commandStatus = CommandStatus::JOG;
      Serial.println("Webscoket Command : runForward() Speed: " + (String)getSpeedInUS(speed));
      prepareMotors();
      stepperSlide->setSpeedInUs(getSpeedInUS(speed)); // the parameter is us/step !!!
      stepperSlide->setAcceleration(ACCELL);
      stepperSlide->runForward();
      previousSlideDir = command["dir"];
    }
    else if ((int) command["dir"] == -1 && speed > 0)
    {
      commandStatus = CommandStatus::JOG;
      prepareMotors();
      Serial.println("Webscoket Command : runBackward() Speed: " + (String)getSpeedInUS(speed));
      stepperSlide->setSpeedInUs(getSpeedInUS(speed)); // the parameter is us/step !!!
      stepperSlide->setAcceleration(ACCELL);
      stepperSlide->runBackward();
      previousSlideDir = command["dir"];
    }
  }
  if (command["COMMAND"] == "JOYSTICK_FOCUS_MOVE")
  {
    Serial.println("Command to process JOYSTICK_FOCUS_MOVE");
  }
}
