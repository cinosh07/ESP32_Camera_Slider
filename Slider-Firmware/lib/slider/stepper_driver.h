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
#include <TMCStepper.h>
#include <definitions.h>

// TMC2209Stepper driver = TMC2209Stepper(&SERIAL_PORT, R_SENSE, DRIVER_ADDRESS);
TMC2208Stepper tmcDriverSlide = TMC2208Stepper(&SERIAL_PORT, R_SENSE);

void initStepperDriver() {
    // tmcDriverSlide.pdn_disable(true);     // Use PDN/UART pin for communication
    tmcDriverSlide.I_scale_analog(false); // Use internal voltage reference
    tmcDriverSlide.rms_current(990);      // Set driver current 500mA
    tmcDriverSlide.toff(2);               // Enable driver in software
                                          // tmcDriverSlide.en_pwm_mode(1);      // Enable extremely quiet stepping
    tmcDriverSlide.pwm_autoscale(1);
    tmcDriverSlide.microsteps(MICROSTEP);
    tmcDriverSlide.begin();
}