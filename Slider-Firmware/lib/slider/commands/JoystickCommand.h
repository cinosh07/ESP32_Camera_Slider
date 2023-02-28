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

void processJoystickCommand(int command[COMMAND_SIZE])
{
  double speed = command[JoystickCommandType::SPEED];
  switch (command[JoystickCommandType::COMMAND])
  {
  case JoystickCommand::JOYSTICK_PAN_MOVE:

    break;
  case JoystickCommand::JOYSTICK_TILT_MOVE:

    break;
  case JoystickCommand::JOYSTICK_SLIDE_MOVE:

    if (speed == 0)
    {
      Serial.println("Webscoket Command : stopMove()");
      stepperSlide->setSpeedInUs(0);
      stepperSlide->applySpeedAcceleration();
      stepperSlide->stopMove();
      previousSlideSpeed = -2.00;
      previousSlideDir = -2;
      while (stepperSlide->isRunning())
      { 
        delay(10); // wait until finish
      }
      digitalWrite(slider_Motor.enable_pin, HIGH);
    }

    if (command[JoystickCommandType::DIR] == 0 && speed > 0)
    {

      Serial.println("Webscoket Command : runForward() Speed: " + (String)getSpeedInUS(speed));
      digitalWrite(slider_Motor.enable_pin, LOW);
      stepperSlide->setSpeedInUs(getSpeedInUS(speed)); // the parameter is us/step !!!
      stepperSlide->setAcceleration(ACCELL);
      stepperSlide->runForward();
      previousSlideDir = command[JoystickCommandType::DIR];
    }
    else if (command[JoystickCommandType::DIR] == -1 && speed > 0)
    {
      digitalWrite(slider_Motor.enable_pin, LOW);
      Serial.println("Webscoket Command : runBackward() Speed: " + (String)getSpeedInUS(speed));
      stepperSlide->setSpeedInUs(getSpeedInUS(speed)); // the parameter is us/step !!!
      stepperSlide->setAcceleration(ACCELL);
      stepperSlide->runBackward();
      previousSlideDir = command[JoystickCommandType::DIR];
    }

    break;
  case JoystickCommand::JOYSTICK_FOCUS_MOVE:

    break;
  }
}
