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
      // Serial.print("Step Position: "); // Ajust encoder to stepper values the number of steps eqiv 2.56
      // Serial.println(Step_position);

      disableMotors();
    }

    if (command[JoystickCommandType::DIR] == 0 && speed > 0)
    {

      Serial.println("Webscoket Command : runForward() Speed: " + (String)getSpeedInUS(speed));
      enableMotors();
      stepperSlide->setCurrentPosition(Step_position);
      delay(10);
      stepperSlide->setSpeedInUs(getSpeedInUS(speed)); // the parameter is us/step !!!
      stepperSlide->setAcceleration(ACCELL);
      stepperSlide->runForward();
      previousSlideDir = command[JoystickCommandType::DIR];
    }
    else if (command[JoystickCommandType::DIR] == -1 && speed > 0)
    {
      enableMotors();
      stepperSlide->setCurrentPosition(Step_position);
      delay(10);
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
