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



void homeStepper() {
  stepperSlide->setSpeedInUs(1500);                         // the parameter is us/step larger values are slower!!!
  stepperSlide->setAcceleration(500);
  stepperSlide->move(600);
  while (stepperSlide->isRunning()) {                        //delay until move complete
    delay(10);
  }
  while (digitalRead(slider_Motor.limit_switch) == HIGH) {            // Make the Stepper move CCW until the switch is activated
    stepperSlide->setSpeedInUs(1500);                         // the parameter is us/step larger values are slower!!!
    stepperSlide->setAcceleration(500);
    stepperSlide->moveTo(-60000);                             //"MoveTo" move to a position and stop,
  }
  if (digitalRead(slider_Motor.limit_switch) == LOW) {
    stepperSlide->forceStopAndNewPosition(5);                  //Stops dead

    delay(20);
    stepperSlide->move(300);
    while (stepperSlide->isRunning()) {                        //delay until move complete
      delay(10);
    }
    stepperSlide->setCurrentPosition(0);                       //Set this position as home 0
    ResetEncoder = 1;
    readEncoders();
    vTaskDelay(10);
    stepperSlide->moveTo(in_position);
    while (stepperSlide->isRunning()) {                        //delay until move complete
      delay(10);
    }
    if (out_position < in_position) {
      out_position = out_position + 600;                   //In the event that the system is reovering from an error and the gantry for out is hard against the switch

    }
  }
  return;
}
void initMotors()
{

    // Prepare pins
    pinMode(slider_Motor.enable_pin, OUTPUT);
    pinMode(slider_Motor.step_pin, OUTPUT);
    pinMode(slider_Motor.dir_pin, OUTPUT);
    digitalWrite(slider_Motor.enable_pin, LOW); // Disable driver in hardware

    engine.init();

    stepperSlide = engine.stepperConnectToPin(slider_Motor.step_pin);

    initStepperDriver();

    if (stepperSlide)
    {
        stepperSlide->setDirectionPin(slider_Motor.dir_pin);
        stepperSlide->setEnablePin(slider_Motor.enable_pin);
        stepperSlide->setAutoEnable(true);

        //   // If auto enable/disable need delays, just add (one or both):
        //   // stepperSlide->setDelayToEnable(50);
        //   // stepperSlide->setDelayToDisable(1000);
    }
}

void moveSlider(int dir, int speed, int accel, int distance, int distanceTo)
{
    if (dir == 1)
    {
        stepperSlide->setSpeedInUs(speed); // the parameter is us/step !!!
        stepperSlide->setAcceleration(accel);
        stepperSlide->move(distance);
    }
    else
    {
        stepperSlide->setSpeedInUs(1000); // the parameter is us/step !!!
        stepperSlide->setAcceleration(100);
        stepperSlide->move(-15000);
    }
}
//*********************************************ARM The SLIDER READY TO START**************************************************
void Start_1() {


  //  Arm the slider to start point ready for second play press
  digitalWrite(slider_Motor.enable_pin, LOW);
  delay(100);

  stepperSlide->setSpeedInHz(2000);
  stepperSlide->setAcceleration(1000);

  if (SEQ == 0) {
    stepperSlide->moveTo(in_position);
    delay(10);

  }
  if (SEQ == 1) {
    stepperSlide->moveTo(k1_position);
    delay(10);

  }
  while (stepperSlide->isRunning() ) {                              //delay until move complete (block)
    if (digitalRead(slider_Motor.limit_switch) == LOW) {
      stepperSlide->forceStopAndNewPosition(5);                  //Stops dead error if the home switch is triggered unexpectadly
      ESP.restart();
    }
    delay(10);
  }

//   But_Com = 5;
//   if (PTZ_Cam == 0) {
// //     SendNextionValues();
// //   }
//   delay(100);
//   But_Com = 0;
}
//*********************************************************INpoint set*************************************
void INpointSet() {
  // Buttonset = 1;
  digitalWrite(slider_Motor.enable_pin, LOW);
  delay(10);
  switch (InP) {
    case 1:                                                       //First Press: Request a new OUTpoint
      if (stepperSlide->getCurrentPosition() != (in_position)) {     //Run to Out position
        stepperSlide->setSpeedInUs(400);
        stepperSlide->setAcceleration(1000);
        stepperSlide->moveTo(in_position);
        while (stepperSlide->isRunning()) {                          //delay until move complete
          if (digitalRead(slider_Motor.limit_switch) == LOW) {
            stepperSlide->forceStopAndNewPosition(5);                  //Stops dead error if the home switch is triggered unexpectadly
            ESP.restart();
          }
          delay(10);
        }
      }
    //   if (usejoy == false) {
    //     digitalWrite(StepD, HIGH);                                  //Power down the stepper for manual positioning
    //     delay(10);
    //   }
    //   if (usejoy) {
    //     PTZ_Control();
    //   }
      break;

    case 2:                                                      //Second inpoint press take the encoder values and set as inpoint
      in_position = (S_position);
      stepperSlide->setCurrentPosition(in_position);                 //Make sure the stepper knows where it is know
      InP = 0;
      // SendNextionValues();                                    //Update nextion with new inpoint values

    //   SysMemory.begin("In_positions", false);                    //save to memory
    //   SysMemory.putUInt("in_position", in_position);
    //   SysMemory.end();

      delay(10);
      Start_1();                                                 //Send the stepper back to In position
      break;
  }
  return;
}

//*********************************************************OUTpoint set*************************************
void OUTpointSet() {

  // Buttonset = 1;
  digitalWrite(slider_Motor.enable_pin, LOW);
  delay(10);
  switch (OutP) {
    case 1:                                                      //First Press: Request a new OUTpoint
      if (stepperSlide->getCurrentPosition() != (out_position)) {    //Run to Out position
        stepperSlide->setSpeedInUs(400);
        stepperSlide->setAcceleration(1000);
        stepperSlide->moveTo(out_position);
        while (stepperSlide->isRunning()) {                         //delay until move complete
          if (digitalRead(slider_Motor.limit_switch) == LOW) {
            stepperSlide->forceStopAndNewPosition(5);                  //Stops dead error if the home switch is triggered unexpectadly
            ESP.restart();
          }
          delay(10);
        }
      }
    //   if (usejoy == false) {
    //     digitalWrite(StepD, HIGH);                              //Power down the stepper for manual positioning
    //     delay(10);
    //   }
    //   if (usejoy) {
    //     // PTZ_Control();
    //   }
      break;

    case 2:                                                     //Second inpoint press take the encoder values and set as inpoint
      out_position = (S_position);
      stepperSlide->setCurrentPosition(out_position);               //Make sure the stepper knows where it is
      OutP = 0;
      delay(50);
      //      SendNextionValues();                              //Update nextion with new inpoint values
      // SysMemory.begin("Out_positions", false);                  //save to memory
      // SysMemory.putUInt("out_position", out_position);
      // SysMemory.end();

      Start_1();                                                //Send the stepper back to In position
      break;
  }
  return;
}


