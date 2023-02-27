
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

// Variable de motion et encodeur DBSlider

long revolutions = 0;                         // number of revolutions the encoder has made
double E_position = 0;                        // the calculated value the encoder is at
double output;                                // raw value from AS5600
long lastOutput;                              // last output from AS5600
long E_outputPos = 0;                         // Ajustment value
long E_lastOutput;                            // last output from AS5600
long S_position = 0;                          // Number of stepper steps at 16 microsteps/step interpolated by the driver to 256 microsteps/step (confusing!)
long E_Trim = 0;                              // A Trim value for the encoder effectively setting its 0 position to match Step 0 position
long E_Current = 0;
int E_Turn = 0;
int E_outputTurn = 0;
long E_outputHold = 32728;
long loopcount = 0;
long  S_lastPosition = 0;
float factor;

long Rail_Length = 500;                     //Edit this to use any rail length you require in mm
long Max_Steps = 0;                         //Variable used to set the max number of steps for the given leangth of rail
long set_speed = 0;
long in_position = 0;                       // variable to hold IN position for slider
long out_position = 0;                      // variable to hold OUT position for slider

long step_speed = 0;                        // default travel speed between IN and OUT points
int Crono_time = 10;
int crono_hours = 0;
int crono_minutes = 0;
int crono_seconds = 0;

int ResetEncoder = 0;

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

int s1_speed;                                      //Actual interpolated speeds
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
int SEQmin = 4000;                                        //Min slowest speed for sequencer larger number slower speed
int SEQmoves = 2;
int Last_key;
int SEQ = 0;

int initEncoder()
{
    // sliderEncoder.begin(4);                        //  set direction pin.
    // sliderEncoder.setDirection(AS5600_CLOCK_WISE); // default, just be explicit.
    // int b = sliderEncoder.isConnected();
    return 1;
}
void readEncoders()
{

    if (ResetEncoder == 1) {
      sliderEncoder.setZero();
      lastOutput = 0;
      S_position = 0;
      E_position = 0;
      revolutions = 0;
      ResetEncoder = 0;
    }
    output = sliderEncoder.getPosition();           // get the raw value of the encoder

    if ((lastOutput - output) > 2047 )        // check if a full rotation has been made
      revolutions++;
    if ((lastOutput - output) < -2047 )
      revolutions--;

    E_position = revolutions * 4096 + output;   // calculate the position the the encoder is at based off of the number of revolutions

    lastOutput = output;                      // save the last raw value for the next loop
    E_outputPos = E_position;

    S_position = ((E_position / 2.56));               //Ajust encoder to stepper values the number of steps eqiv
    Serial.println(S_position);
}

