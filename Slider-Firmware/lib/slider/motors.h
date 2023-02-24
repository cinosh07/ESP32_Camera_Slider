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
    // // tmcDriverSlide.pdn_disable(true);     // Use PDN/UART pin for communication
    // tmcDriverSlide.I_scale_analog(false); // Use internal voltage reference
    // tmcDriverSlide.rms_current(990);      // Set driver current 500mA
    // tmcDriverSlide.toff(2);               // Enable driver in software
    //                                       // tmcDriverSlide.en_pwm_mode(1);      // Enable extremely quiet stepping
    // tmcDriverSlide.pwm_autoscale(1);
    // tmcDriverSlide.microsteps(32);
    // tmcDriverSlide.begin();

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
