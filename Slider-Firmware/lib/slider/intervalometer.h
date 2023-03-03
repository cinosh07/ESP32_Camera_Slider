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

struct Intervalometer_Cfg
{
    const float DEFAULT_RELEASE_TIME = 0.1;
    const float MIN_DARK_TIME = 0.5;
    const int MANUAL_MODE = 0;
    const int BULB_MODE = 1;
    const int SINGLE_SHOOTING_DELAY = 1000; // time in ms to wait before starting shooting
    const byte SHOOTING_STARTED = 1;
    const byte SHOOTING_STOPPED = 0;

    float releaseTime = DEFAULT_RELEASE_TIME;
    unsigned long previousMillis = 0;
    unsigned long runningTime = 0;
    float interval = 4.0;
    long shotsTotal = 0;
    int isRunning = 0;
    unsigned long bulbStopTime = 0;
    int shotsCount = 0; // Shots count since start of session
    int lastShotsCount = -1;
    unsigned long rampDuration = 10;    // ramping duration
    float rampTo = 0.0;                 // ramping interval
    unsigned long rampingStartTime = 0; // ramping start time
    unsigned long rampingEndTime = 0;   // ramping end time
    float intervalBeforeRamping = 0;    // interval before ramping
    int mode = MANUAL_MODE;             // MANUAL_MODE or BULB_MODE
    // Timer Interrupt
    byte cameraTriggerStop = SHOOTING_STOPPED;
    int exposureTriggerTime = 0; // Time to keep the camera trigger on in Timer Interrupt duration - 10 ms
    int COMMAND_STATUS = TimelapseCommand::IDLE;
    int STATUS = TimelapseStatus::IDLE;
};

Intervalometer_Cfg intervalometer;

long getMillis()
{
    if (systemClock.intervalometerRTCClock)
    {
        
        // Synch System Clock to the last passed millis to obtain 1/1000th seconds timing accuracy
        return ((systemClock.currentUnixTimestamp - systemClock.startUnixTimeStamp) * 1000) + (millis() - systemClock.lastMillis);
    }
    else
    {
        return millis();
    }
};

void stopShooting()
{
    intervalometer.isRunning = 0;
    intervalometer.shotsCount = 0;
    intervalometer.runningTime = 0;
    intervalometer.bulbStopTime = 0;
    intervalometer.STATUS = TimelapseStatus::IDLE;
}

void checkRampInterval()
{
    if ((getMillis() < intervalometer.rampingEndTime) && (getMillis() >= intervalometer.rampingStartTime))
    {
        intervalometer.interval = intervalometer.intervalBeforeRamping + ((float)(getMillis() - intervalometer.rampingStartTime) / (float)(intervalometer.rampingEndTime - intervalometer.rampingStartTime) * (intervalometer.rampTo - intervalometer.intervalBeforeRamping));

        if (intervalometer.releaseTime > intervalometer.interval - intervalometer.MIN_DARK_TIME)
        { // if ramping makes the interval too short for the exposure time in bulb mode, adjust the exposure time
            intervalometer.releaseTime = intervalometer.interval - intervalometer.MIN_DARK_TIME;
        }
    }
    else
    {
        intervalometer.rampingStartTime = 0;
        intervalometer.rampingEndTime = 0;
    }
}

void releaseCamera()
{
    // short trigger in MANUAL_MODE
    if (intervalometer.releaseTime < 1)
    {

        if (intervalometer.releaseTime < 0.2)
        {
            intervalometer.exposureTriggerTime = intervalometer.releaseTime * 150;
        }
        else
        {
            intervalometer.exposureTriggerTime = intervalometer.releaseTime * 100;
        }
        intervalometer.cameraTriggerStop = intervalometer.SHOOTING_STARTED;

        digitalWrite(2, HIGH);
    }
    else
    {
        // releaseTime > 1 sec
        // Serial.print("Realease Camera bulbStopTime: ");
        // Serial.println(bulbStopTime);
        // Serial.print("Millis(): ");
        // Serial.println(getMillis());
        // long trigger in Bulb-Mode for longer exposures
        if (intervalometer.bulbStopTime == 0)
        {
            intervalometer.bulbStopTime = getMillis();
            intervalometer.exposureTriggerTime = intervalometer.releaseTime * 100;
            intervalometer.cameraTriggerStop = intervalometer.SHOOTING_STARTED;
            digitalWrite(2, HIGH);
        }
    }
}

void run()
{
    if ((getMillis() - intervalometer.previousMillis) >= ((intervalometer.interval * 1000)))
    {
        if ((intervalometer.shotsTotal != 0) && (intervalometer.shotsCount >= intervalometer.shotsTotal))
        {
            // stop shooting
            intervalometer.isRunning = 0;
            stopShooting();
        }
        else
        {
            // Session in started
            intervalometer.runningTime += (getMillis() - intervalometer.previousMillis);
            intervalometer.previousMillis = getMillis();
            releaseCamera();
            // intervalometer.shotsCount++;
        }
    }
    checkRampInterval();
}

void checkEndBulbExposure()
{
    // Serial.print("Check if release is needed: ");
    // Serial.println(bulbStopTime + releaseTime * 1000);
    // Serial.print("bulbStopTime: ");
    // Serial.println(bulbStopTime);
    // Serial.print("releaseTime: ");
    // Serial.println(releaseTime);

    if ((intervalometer.bulbStopTime != 0) && (getMillis() >= (intervalometer.bulbStopTime + (intervalometer.releaseTime * 1000))))
    {
        intervalometer.bulbStopTime = 0;
    }
}
void intervalometerLoop()
{
    portENTER_CRITICAL_ISR(&systemClock.shootingTimerMux);
    if (intervalometer.cameraTriggerStop == intervalometer.SHOOTING_STARTED)
    {
        if (intervalometer.exposureTriggerTime == 0)
        {
            // Camera Trigger released
            intervalometer.cameraTriggerStop = intervalometer.SHOOTING_STOPPED;
            intervalometer.shotsCount++;
            digitalWrite(2, LOW);
        }
    }
    if (intervalometer.isRunning)
    {
        checkEndBulbExposure();
        run();
    }
    portEXIT_CRITICAL_ISR(&systemClock.shootingTimerMux);
}
void setStartTime()
{
  DateTime timestamp = Clock.read();
  time_t unixTimestamp = getUnixTimeStamp(timestamp);
  systemClock.startUnixTimeStamp = (long)unixTimestamp;
}
void startShooting(bool singleShot = false)
{
    if (singleShot)
    {
        delay(intervalometer.SINGLE_SHOOTING_DELAY);
    }
    setStartTime();
    intervalometer.previousMillis = getMillis();
    intervalometer.runningTime = 0;
    intervalometer.isRunning = 1;
    releaseCamera();
    // intervalometer.shotsCount++;
}
