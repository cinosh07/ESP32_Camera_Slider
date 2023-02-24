
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
AS5600 as5600;
uint32_t clk = 0;

int initEncoder()
{
    as5600.begin(4);                        //  set direction pin.
    as5600.setDirection(AS5600_CLOCK_WISE); // default, just be explicit.
    int b = as5600.isConnected();
    return b;
}
void readEncoders()
{

    // if (ResetEncoder == 1) {
    //   encoder.setZero();
    //   lastOutput = 0;
    //   S_position = 0;
    //   E_position = 0;
    //   revolutions = 0;
    //   ResetEncoder = 0;
    // }
    // output = encoder.getPosition();           // get the raw value of the encoder

    // if ((lastOutput - output) > 2047 )        // check if a full rotation has been made
    //   revolutions++;
    // if ((lastOutput - output) < -2047 )
    //   revolutions--;

    // E_position = revolutions * 4096 + output;   // calculate the position the the encoder is at based off of the number of revolutions

    // lastOutput = output;                      // save the last raw value for the next loop
    // E_outputPos = E_position;

    // S_position = ((E_position / 2.56));               //Ajust encoder to stepper values the number of steps eqiv
    // Serial.println(S_position);
}

