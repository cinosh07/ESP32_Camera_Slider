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


//Delay Time ??????
//Start Interval ??????
//Pre Focus Time
//Cam wake up interval


// Commands
// file:///D:/Timelapse_Slider/LRTimelpase%20Pro%20Timer%20free%201.10%20Manual_en.pdf


const float RELEASE_TIME_DEFAULT = 0.1; // default shutter release time for camera
const float MIN_DARK_TIME = 0.5;

const int decoupleTime = 1000; // time in milliseconds to wait before doing a single bulb exposure

float releaseTime = RELEASE_TIME_DEFAULT; // Shutter release time for camera
unsigned long previousMillis = 0;         // Timestamp of last shutter release
unsigned long runningTime = 0;

float interval = 4.0; // the current interval
long maxNoOfShots = 0;
int isRunning = 0; // flag indicates intervalometer is running
unsigned long bulbReleasedAt = 0;

int imageCount = 0; // Image count since start of intervalometer
int lastimageCount = -1;

unsigned long rampDuration = 10;    // ramping duration
float rampTo = 0.0;                 // ramping interval
unsigned long rampingStartTime = 0; // ramping start time
unsigned long rampingEndTime = 0;   // ramping end time
float intervalBeforeRamping = 0;    // interval before ramping

const int MODE_M = 0;
const int MODE_BULB = 1;
// the currently selected settings option
int mode = MODE_M; // mode: M or Bulb

// HV Timer Interrupt Definitions
const byte shooting = 1;
const byte notshooting = 0;
byte cam_Release = notshooting;

int exposureTime = 0; // Time for exposure in Timer Interrupt (10 msec)

void stopShooting()
{

    isRunning = 0;
    imageCount = 0;
    runningTime = 0;
    bulbReleasedAt = 0;
}
/**
   If ramping was enabled do the ramping
*/
void possiblyRampInterval()
{

    if ((millis() < rampingEndTime) && (millis() >= rampingStartTime))
    {
        interval = intervalBeforeRamping + ((float)(millis() - rampingStartTime) / (float)(rampingEndTime - rampingStartTime) * (rampTo - intervalBeforeRamping));

        if (releaseTime > interval - MIN_DARK_TIME)
        { // if ramping makes the interval too short for the exposure time in bulb mode, adjust the exposure time
            releaseTime = interval - MIN_DARK_TIME;
        }
    }
    else
    {
        rampingStartTime = 0;
        rampingEndTime = 0;
    }
}

/**
   Actually release the camera
*/
void releaseCamera()
{

    // short trigger in M-Mode
    if (releaseTime < 1)
    {

        // HV changes für Interrupt Cam release and Display indicator handling
        if (releaseTime < 0.2)
        {
            exposureTime = releaseTime * 150; // for better viewability
        }
        else
        {
            exposureTime = releaseTime * 100;
        }
        cam_Release = shooting;

        digitalWrite(2, HIGH);
    }
    else
    { // releaseTime > 1 sec
        // Serial.print("Realease Camera bulbReleasedAt: ");
        // Serial.println(bulbReleasedAt);
        // Serial.print("Millis(): ");
        // Serial.println(millis());
        // long trigger in Bulb-Mode for longer exposures
        if (bulbReleasedAt == 0)
        {
            bulbReleasedAt = millis();
            // HV changes für Interrupt Cam release and Display indicator handling

            exposureTime = releaseTime * 100;
            cam_Release = shooting;
            digitalWrite(2, HIGH);
        }
    }
}

/**
   Running, releasing Camera
*/
void running()
{

    // do this every interval only
    if ((millis() - previousMillis) >= ((interval * 1000)))
    {

        if ((maxNoOfShots != 0) && (imageCount >= maxNoOfShots))
        { // sequence is finished
            // stop shooting
            isRunning = 0;
            // invoke manually
            stopShooting();
        }
        else
        { // is running
            runningTime += (millis() - previousMillis);
            previousMillis = millis();
            releaseCamera();
            imageCount++;
        }
    }

    // do this always (multiple times per interval)
    possiblyRampInterval();
}
/**
  Will be called by the loop and check if a bulb exposure has to end. If so, it will stop the exposure.
*/
void possiblyEndLongExposure()
{
    // Serial.print("Check if release is needed: ");
    // Serial.println(bulbReleasedAt + releaseTime * 1000);
    // Serial.print("bulbReleasedAt: ");
    // Serial.println(bulbReleasedAt);
    // Serial.print("releaseTime: ");
    // Serial.println(releaseTime);
    // if ((bulbReleasedAt != 0) && (millis() >= (bulbReleasedAt + releaseTime * 1000)))
    if ((bulbReleasedAt != 0) && (millis() >= (bulbReleasedAt + (releaseTime * 1000))))
    {
        bulbReleasedAt = 0;
        // digitalWrite(12, LOW);
    }
}
void intervalometerLoop()
{
    portENTER_CRITICAL_ISR(&shootingTimerMux);
    // HV Interrupt Cam release and Display indicator handling
    if (cam_Release == shooting)
    {

        if (exposureTime == 0) // End of exposure
        {
            cam_Release = notshooting;
            digitalWrite(2, LOW);
        }
    }
    if (isRunning)
    { // release camera, do ramping if running
        possiblyEndLongExposure();
        running();
    }
    portEXIT_CRITICAL_ISR(&shootingTimerMux);
}

void firstShutter()
{

    delay(decoupleTime);
    // lcd.display();

    previousMillis = millis();
    runningTime = 0;
    isRunning = 1;

    // do the first release instantly, the subsequent ones will happen in the loop
    releaseCamera();
    imageCount++;
}

