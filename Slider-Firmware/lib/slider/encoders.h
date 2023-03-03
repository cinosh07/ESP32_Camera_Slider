
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
#include "AS5600.h"

// AS5600 Encoder
String lastResponse;
String noMagnetStr = "Error: magnet not detected";
AS5600 sliderEncoder;
uint32_t clk = 0;

long current_position[4] = {0,0,0,0}; // Axis array {slide,pan,tilt,focus}

long in_position[4] = {0,0,0,0};              
long out_position[4] = {58740,0,0,0}; 

int key1_position[4] = {0,0,0,0};
int key2_position[4] = {0,0,0,0};
int key3_position[4] = {0,0,0,0};
int key4_position[4] = {0,0,0,0};
int key5_position[4] = {0,0,0,0};


int initEncoder()
{
  sliderEncoder.begin(4);                        
  sliderEncoder.setDirection(AS5600_CLOCK_WISE); 
  int b = sliderEncoder.isConnected();
  return b;
}
void checkLimitSwitch()
{
  if (digitalRead(slider_Motor.limit_switch) == LOW & commandStatus != CommandStatus::HOMING)
  {
    // Change Status to Force Stop Motor
    commandStatus = CommandStatus::FORCE_STOP;
  }
}
void resetSliderEncoder()
{
  sliderEncoder.resetCumulativePosition();
  delay(10);
  current_position[Axis::SLIDE] = 0;
  Serial.println("Encoder resetted to zero.");
}
void readEncoders()
{
  current_position[Axis::SLIDE] = sliderEncoder.getCumulativePosition() * (((double)stepPerRevolution * MICROSTEP) * 100 / 4096 / 100);
}
