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

void enableMotors()
{
  // digitalWrite(slider_Motor.enable_pin, LOW);
  // delay(100);
  // stepperSlide->setCurrentPosition(Step_position);
  // delay(10);
}
void disableMotors()
{
  // digitalWrite(slider_Motor.enable_pin, HIGH);
  // delay(50);
}

#include "./commands/JoystickCommand.h"

void markIn()
{
  in_position = (Step_position);
  stepperSlide->setCurrentPosition(round(in_position));
  delay(50);
  COMMAND_STATUS = CommandStatus::IDLE;
  Serial.print("Mark-In: ");
  Serial.println(in_position);
  // Serial.print("Step Position: "); // Ajust encoder to stepper values the number of steps eqiv 2.56
  // Serial.println(Step_position);
}
void markOut()
{
  out_position = (Step_position);
  stepperSlide->setCurrentPosition(round(out_position)); // Make sure the stepper knows where it is
  delay(50);
  COMMAND_STATUS = CommandStatus::IDLE;
  Serial.print("Mark-Out: ");
  Serial.println(out_position);
  // Serial.print("Step Position: "); // Ajust encoder to stepper values the number of steps eqiv 2.56
  // Serial.println(Step_position);
}
void gotoIn()
{

  enableMotors();
  delay(100);
  stepperSlide->setCurrentPosition(Step_position);
  delay(10);
  Serial.print("Goto In position: ");
  Serial.println(in_position);
  if (Step_position != (in_position))
  // if (stepperSlide->getCurrentPosition() != (in_position))
  { // Run to Out position
    stepperSlide->setSpeedInUs(FAST_SPEED);
    stepperSlide->setAcceleration(ACCELL);
    stepperSlide->moveTo(in_position);
    while (stepperSlide->isRunning())
    { // delay until move complete
      delay(10);
    }
  }
  COMMAND_STATUS = CommandStatus::IDLE;
  disableMotors();
}
void gotoOut()
{

  enableMotors();
  delay(100);
  stepperSlide->setCurrentPosition(Step_position);
  delay(10);
  Serial.print("Goto Out position: ");
  Serial.println(out_position);
  if (Step_position != (out_position))
  // if (stepperSlide->getCurrentPosition() != (out_position))

  { // Run to Out position
    stepperSlide->setSpeedInUs(FAST_SPEED);
    stepperSlide->setAcceleration(ACCELL);
    stepperSlide->moveTo(out_position);
    while (stepperSlide->isRunning())
    { // delay until move complete
      delay(10);
    }
  }
  COMMAND_STATUS = CommandStatus::IDLE;
  disableMotors();
}
void forceMotorsLimitTrigered()
{
  stepperSlide->forceStopAndNewPosition(5); // Stops dead
  delay(20);
  stepperSlide->setSpeedInUs(SAFE_SPEED);
  stepperSlide->move(MOVE_AFTER_HOME_DISTANCE);
  while (stepperSlide->isRunning())
  { // delay until move complete
    delay(10);
  }
  COMMAND_STATUS = CommandStatus::IDLE;
  disableMotors();
}
void homeStepper()
{
  COMMAND_STATUS = CommandStatus::HOMING;
  enableMotors();
  Serial.println("Homing Slider ...");
  stepperSlide->setSpeedInUs(SAFE_SPEED); // the parameter is us/step larger values are slower!!!
  stepperSlide->setAcceleration(ACCELL);
  stepperSlide->move(HOME_SAFE_DISTANCE);
  while (stepperSlide->isRunning())
  {
    delay(10); // wait until finish
  }

  while (digitalRead(slider_Motor.limit_switch) == HIGH)
  {                                         // Make the Stepper move CCW until the switch is activated
    stepperSlide->setSpeedInUs(HOME_SPEED); // the parameter is us/step larger values are slower!!!
    stepperSlide->setAcceleration(ACCELL);
    stepperSlide->moveTo(HOMING_DISTANCE); //"MoveTo" move to a position and stop,
  }
  if (digitalRead(slider_Motor.limit_switch) == LOW)
  {
    stepperSlide->forceStopAndNewPosition(5); // Stops dead
    delay(10);
    stepperSlide->move(MOVE_AFTER_HOME_DISTANCE);
    while (stepperSlide->isRunning())
    { // delay until move complete
      delay(10);
    }
    readEncoders();
    vTaskDelay(10);
    Step_position = 0;
    stepperSlide->setCurrentPosition(0); // Set this position as home 0
    delay(100);
    resetEncoder();
    delay(100);

    if (out_position < in_position)
    {
      out_position = out_position + SAFE_DISTANCE_RECOVERY; // In the event that the system is reovering from an error and the gantry for out is hard against the switch
    }
    // Serial.print("Step Position: "); // Ajust encoder to stepper values the number of steps eqiv 2.56
    // Serial.println(Step_position);
    disableMotors();
    COMMAND_STATUS = CommandStatus::IDLE;
  }
  return;
}
void gotoMiddle()
{
  enableMotors();

  stepperSlide->setSpeedInUs(FAST_SPEED);
  stepperSlide->moveTo(MIDDLE_POSITION);
  while (stepperSlide->isRunning())
  { // delay until move complete
    delay(10);
  }
  // Serial.print("Step Position: ");
  // Serial.println(Step_position);

  disableMotors();
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

  //  Arm the slider to start point ready for second play press
  enableMotors();
  delay(100);

  stepperSlide->setSpeedInHz(2000);
  stepperSlide->setAcceleration(ACCELL);

  if (SEQ == 0)
  {
    stepperSlide->moveTo(in_position);
    delay(10);
  }
  if (SEQ == 1)
  {
    stepperSlide->moveTo(k1_position);
    delay(10);
  }
  while (stepperSlide->isRunning())
  { // delay until move complete (block)
    if (digitalRead(slider_Motor.limit_switch) == LOW)
    {
      stepperSlide->forceStopAndNewPosition(5); // Stop if the home switch is triggered
    }
    delay(10);
  }
}