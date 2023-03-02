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
#include <encoders.h>
#include <stepper_driver.h>


FastAccelStepperEngine engine = FastAccelStepperEngine();
FastAccelStepper *stepperSlide = NULL;
FastAccelStepper *stepperPan = NULL;
FastAccelStepper *stepperTilt = NULL;
FastAccelStepper *stepperFocus = NULL;

void prepareMotors()
{
  if(stepperSlide) {
    stepperSlide->setCurrentPosition(current_position[Axis::SLIDE]);
  }
  if(stepperPan) {
    stepperPan->setCurrentPosition(current_position[Axis::PAN]);
  }
  if(stepperTilt) {
    stepperTilt->setCurrentPosition(current_position[Axis::TILT]);
  }
  if(stepperFocus) {
    stepperFocus->setCurrentPosition(current_position[Axis::FOCUS]);
  }
  delay(10);
}

#include "./commands/JoystickCommand.h"

void markIn()
{
  in_position[Axis::SLIDE] = current_position[Axis::SLIDE];
  in_position[Axis::PAN] = current_position[Axis::PAN];
  in_position[Axis::TILT] = current_position[Axis::TILT];
  in_position[Axis::FOCUS] = current_position[Axis::FOCUS];

  stepperSlide->setCurrentPosition(round(in_position[Axis::SLIDE]));
  delay(50);
  COMMAND_STATUS = CommandStatus::IDLE;
  Serial.print("Mark-In: ");
  Serial.println(in_position[Axis::SLIDE]);
  // Serial.print("Step Position: "); // Ajust encoder to stepper values the number of steps eqiv 2.56
  // Serial.println(Step_position);
}
void markOut()
{
  out_position[Axis::SLIDE] = current_position[Axis::SLIDE];
  out_position[Axis::PAN] = current_position[Axis::PAN];
  out_position[Axis::TILT] = current_position[Axis::TILT];
  out_position[Axis::FOCUS] = current_position[Axis::FOCUS];

  stepperSlide->setCurrentPosition(round(out_position[Axis::SLIDE])); // Make sure the stepper knows where it is
  delay(50);
  COMMAND_STATUS = CommandStatus::IDLE;
  Serial.print("Mark-Out: ");
  Serial.println(out_position[Axis::SLIDE]);
  // Serial.print("Step Position: "); // Ajust encoder to stepper values the number of steps eqiv 2.56
  // Serial.println(Step_position);
}
void gotoIn()
{

  prepareMotors();
  Serial.print("Goto In position: ");
  Serial.println(in_position[Axis::SLIDE]);
  if (current_position[Axis::SLIDE] != (in_position[Axis::SLIDE]))
  // if (stepperSlide->getCurrentPosition() != (in_position))
  { 
    stepperSlide->setSpeedInUs(FAST_SPEED);
    stepperSlide->setAcceleration(ACCELL);
    stepperSlide->moveTo(in_position[Axis::SLIDE]);
    while (stepperSlide->isRunning())
    {
      delay(10);  // wait until finish
    }
  }
  COMMAND_STATUS = CommandStatus::IDLE;
  // disableMotors();
}
void gotoOut()
{

  prepareMotors();
  Serial.print("Goto Out position: ");
  Serial.println(out_position[Axis::SLIDE]);
  if (current_position[Axis::SLIDE] != (out_position[Axis::SLIDE]))
  // if (stepperSlide->getCurrentPosition() != (out_position))

  {
    stepperSlide->setSpeedInUs(FAST_SPEED);
    stepperSlide->setAcceleration(ACCELL);
    stepperSlide->moveTo(out_position[Axis::SLIDE]);
    while (stepperSlide->isRunning())
    { 
      delay(10);  // wait until finish
    }
  }
  COMMAND_STATUS = CommandStatus::IDLE;
  // disableMotors();
}
void forceMotorsLimitTrigered()
{
  stepperSlide->forceStopAndNewPosition(5); // Stops dead
  delay(20);
  stepperSlide->setSpeedInUs(SAFE_SPEED);
  stepperSlide->move(MOVE_AFTER_HOME_DISTANCE);
  while (stepperSlide->isRunning())
  { 
    delay(10);  // wait until finish
  }
  COMMAND_STATUS = CommandStatus::IDLE;
  // disableMotors();
}
void homeStepper()
{
  COMMAND_STATUS = CommandStatus::HOMING;
  prepareMotors();
  Serial.println("Homing Slider ...");
  stepperSlide->setSpeedInUs(SAFE_SPEED); // the parameter is us/step larger values are slower!!!
  stepperSlide->setAcceleration(ACCELL);
  stepperSlide->move(HOME_SAFE_DISTANCE);
  while (stepperSlide->isRunning())
  {
    delay(10); // wait until finish
  }

  while (digitalRead(slider_Motor.limit_switch) == HIGH)
  {                                         
    stepperSlide->setSpeedInUs(HOME_SPEED); // the parameter is us/step larger values are slower!!!
    stepperSlide->setAcceleration(ACCELL);
    stepperSlide->moveTo(HOMING_DISTANCE); 
  }
  if (digitalRead(slider_Motor.limit_switch) == LOW)
  {
    stepperSlide->forceStopAndNewPosition(5); 
    delay(10);
    stepperSlide->move(MOVE_AFTER_HOME_DISTANCE);
    while (stepperSlide->isRunning())
    { 
      delay(10);  // wait until finish
    }
    readEncoders();
    vTaskDelay(10);
    current_position[Axis::SLIDE] = 0;
    stepperSlide->setCurrentPosition(0); // homing values
    delay(100);
    resetSliderEncoder();
    delay(100);

    if (out_position[Axis::SLIDE] < in_position[Axis::SLIDE])
    {
      out_position[Axis::SLIDE] = out_position[Axis::SLIDE] + SAFE_DISTANCE_RECOVERY; // protection
    }
    // Serial.print("Step Position: "); // Ajust encoder to stepper values the number of steps eqiv 2.56
    // Serial.println(Step_position);
    // disableMotors();
    COMMAND_STATUS = CommandStatus::IDLE;
  }
  return;
}
void gotoMiddle()
{
  prepareMotors();

  stepperSlide->setSpeedInUs(FAST_SPEED);
  stepperSlide->moveTo(MIDDLE_POSITION);
  while (stepperSlide->isRunning())
  { 
    delay(10);  // wait until finish
  }
  // Serial.print("Step Position: ");
  // Serial.println(Step_position);

  // disableMotors();
}
void motorsBegin()
{
  homeStepper();
  Serial.println("Homing finished.");
  gotoMiddle();
}
void initMotors()
{

  // Prepare pins
  pinMode(slider_Motor.limit_switch, INPUT_PULLUP);
  pinMode(slider_Motor.enable_pin, OUTPUT);
  pinMode(slider_Motor.step_pin, OUTPUT);
  pinMode(slider_Motor.dir_pin, OUTPUT);

  // TODO Check config if auto enabled
  // digitalWrite(slider_Motor.enable_pin, HIGH); // Disable driver in hardware
  digitalWrite(slider_Motor.enable_pin, LOW);

  engine.init();

  stepperSlide = engine.stepperConnectToPin(slider_Motor.step_pin);

  initStepperDriver();

  if (stepperSlide)
  {
    stepperSlide->setDirectionPin(slider_Motor.dir_pin);
    stepperSlide->setEnablePin(slider_Motor.enable_pin);

    // TODO Check config if auto enabled
    stepperSlide->setAutoEnable(false);
    stepperSlide->enableOutputs();
    delay(100);

    //   // If auto enable/disable need delays, just add (one or both):
    //   // stepperSlide->setDelayToEnable(50);
    //   // stepperSlide->setDelayToDisable(1000);
  }
}

//*********************************************ARM The SLIDER READY TO START**************************************************
void Start_1()
{

  prepareMotors();

  stepperSlide->setSpeedInHz(2000);
  stepperSlide->setAcceleration(ACCELL);

  // if (SEQ == 0)
  // {
  //   stepperSlide->moveTo(in_position);
  //   delay(10);
  // }
  // if (SEQ == 1)
  // {
  //   stepperSlide->moveTo(k1_position);
  //   delay(10);
  // }
  while (stepperSlide->isRunning())
  { 
    if (digitalRead(slider_Motor.limit_switch) == LOW)
    {
      stepperSlide->forceStopAndNewPosition(5); // Force stop if limit switch is triggered
    }
    delay(10);
  }
}