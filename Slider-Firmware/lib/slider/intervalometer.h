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

Intervalometer_Cfg intervalometer;

void stopShooting()
{
    intervalometer.isRunning = 0;
    intervalometer.shotsCount = 0;
    intervalometer.runningTime = 0;
    intervalometer.bulbStopTime = 0;
    // intervalometer.STATUS = TimelapseStatus::IDLE;
}

void checkRampInterval()
{
    if ((getMillis() < intervalometer.rampingEndTime) && (getMillis() >= intervalometer.rampingStartTime))
    {
        intervalometer.interval = intervalometer.intervalBeforeRamping + ((float)(getMillis() - intervalometer.rampingStartTime) / (float)(intervalometer.rampingEndTime - intervalometer.rampingStartTime) * (intervalometer.rampTo - intervalometer.intervalBeforeRamping));

        if (intervalometer.releaseTime > intervalometer.interval - intervalometer.minDarkTime)
        { 
            // if ramping makes the interval too short for the exposure time in bulb mode, adjust the exposure time
            intervalometer.releaseTime = intervalometer.interval - intervalometer.minDarkTime;
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

        digitalWrite(config.cam1Trigger, HIGH);
    }
    else
    {
        if (intervalometer.bulbStopTime == 0)
        {
            intervalometer.bulbStopTime = getMillis();
            intervalometer.exposureTriggerTime = intervalometer.releaseTime * 100;
            intervalometer.cameraTriggerStop = intervalometer.SHOOTING_STARTED;
            digitalWrite(config.cam1Trigger, HIGH);
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
        }
    }
    checkRampInterval();
}

void checkEndBulbExposure()
{

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
            digitalWrite(config.cam1Trigger, LOW);
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
    Serial.print("interval: ");
    Serial.println(intervalometer.interval);

    Serial.print("shotsTotal: ");
    Serial.println(intervalometer.shotsTotal);
    Serial.print("releaseTime: ");
    Serial.println(intervalometer.releaseTime);

    setStartTime();
    intervalometer.previousMillis = getMillis();
    intervalometer.runningTime = 0;
    intervalometer.isRunning = 1;
    releaseCamera();
}
