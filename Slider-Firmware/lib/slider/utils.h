
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

int SPEED_US = 100;
int SPEED_MULTIPLICATOR = 10;
int previousSlideDir = -2;
double previousSlideSpeed = -2.00;
int ACCELL = 10000;
int HOME_SPEED = 300;
int SAFE_SPEED = 1000;
int HOME_SAFE_DISTANCE = 600;
int MOVE_AFTER_HOME_DISTANCE = 50;
long HOMING_DISTANCE = -60000;
int SAFE_DISTANCE_RECOVERY = 600;
int MIDDLE_POSITION = 29450;
int FAST_SPEED = 100;
int stepPerRevolution = 200;
int MICROSTEP = 32;


int getSpeedInUS(double speed)
{
  return round(((1 - (speed / 100)) + 0.1) * SPEED_US * SPEED_MULTIPLICATOR);
}