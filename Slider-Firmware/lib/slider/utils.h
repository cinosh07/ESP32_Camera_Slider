
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

int getSpeedInUS(double speed)
{
  return round(((1 - (speed / 100)) + 0.1) * SPEED_US * SPEED_MULTIPLICATOR);
}