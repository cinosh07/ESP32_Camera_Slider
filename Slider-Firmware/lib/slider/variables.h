
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

struct Stepper_Motor
{
  String include;
  int dir_pin;
  int step_pin;
  int enable_pin;
  bool encoder;
  int limit_switch;
  int step_per_mm;
  bool always_enabled;
  String tmc_driver_address; // "tmc_driver_address": "0b00"
};

// int COMMAND_STATUS = 0;
// int PREVIOUS_COMMAND_STATUS = -1;
int commandStatus = 0;
int prevCommandStatus = -1;
Stepper_Motor slider_Motor;
Stepper_Motor pan_Motor;
Stepper_Motor tilt_Motor;
Stepper_Motor focus_motor;

IPAddress IP;

bool direction = false;




