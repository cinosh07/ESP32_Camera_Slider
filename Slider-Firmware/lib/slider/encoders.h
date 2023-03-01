
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

long Step_position = 0; // Number of stepper steps at 16 microsteps/step interpolated by the driver to 256 microsteps/step (confusing!)

long Encoder_Trim = 0; // A Trim value for the encoder effectively setting its 0 position to match Step 0 position
long Encoder_Current = 0;
int Encoder_Turn = 0;
int Encoder_outputTurn = 0;
long Encoder_outputHold = 32728;
long loopcount = 0;
long Step_lastPosition = 0;
float factor;

long Rail_Length = 500; // Edit this to use any rail length you require in mm
long Max_Steps = 0;     // Variable used to set the max number of steps for the given leangth of rail
long set_speed = 0;

long in_position = 0;                // variable to hold IN position for slider
long out_position = MIDDLE_POSITION; // variable to hold OUT position for slider

long step_speed = 0; // default travel speed between IN and OUT points
int Crono_time = 10;
int crono_hours = 0;
int crono_minutes = 0;
int crono_seconds = 0;

int lastP1;
int lastP2;
int lastP3;
int lastP4;
int lastP5;
int lastP6;

int lastInP;
int lastOutP;

int InP = 0;
int OutP = 0;

int s1_speed; // Actual interpolated speeds
int s2_speed;
int s3_speed;
int s4_speed;
int s5_speed;
int s6_speed;
int k1_position;
int k2_position;
int k3_position;
int k4_position;
int k5_position;
int k6_position;
int SEQmin = 4000; // Min slowest speed for sequencer larger number slower speed
int SEQmoves = 2;
int SEQ = 0;

int initEncoder()
{
  sliderEncoder.begin(4);                        //  set direction pin.
  sliderEncoder.setDirection(AS5600_CLOCK_WISE); // default, just be explicit.
  int b = sliderEncoder.isConnected();
  return b;
}
void checkLimitSwitch()
{
  if (digitalRead(slider_Motor.limit_switch) == LOW & COMMAND_STATUS != CommandStatus::HOMING)
  {
    // Change Status to Force Stop Motor
    COMMAND_STATUS = CommandStatus::FORCE_STOP;
  }
}
void resetEncoder()
{
  sliderEncoder.resetCumulativePosition();
  delay(10);
  Step_position = 0;
  Serial.println("Encoder resetted to zero.");
}
void readEncoders()
{
  Step_position = sliderEncoder.getCumulativePosition() * (((double)stepPerRevolution * MICROSTEP) * 100 / 4096 / 100);
}
