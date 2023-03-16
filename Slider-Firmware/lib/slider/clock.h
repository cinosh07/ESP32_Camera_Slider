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
#include <DS3231_Simple.h>
#include "TimeLib.h"

// RTC Clock
DS3231_Simple Clock;
TaskHandle_t CPU0_Timing_Task;

struct SystemClock
{
  long currentUnixTimestamp = 0;
  long startUnixTimeStamp;
  uint8_t alarmsFired;
  hw_timer_t *shootingTimer = NULL;
  portMUX_TYPE shootingTimerMux = portMUX_INITIALIZER_UNLOCKED;
  long lastMillis = 0;
  bool intervalometerRTCClock = true;
};

SystemClock systemClock;
time_t getUnixTimeStamp(DateTime timestamp, bool init = false)
{
  tmElements_t te; // Time elements structure
  te.Second = timestamp.Second;
  te.Hour = timestamp.Hour; // 11 pm
  te.Minute = timestamp.Minute;
  te.Day = timestamp.Day;
  te.Month = timestamp.Month;
  char yearBeginning = 20;
  char year = yearBeginning + (char)timestamp.Year;
  te.Year = (uint8_t)year;
  time_t unixTimestamp = makeTime(te);
  if (init)
  {
    systemClock.startUnixTimeStamp = (long)unixTimestamp * 1000;
    systemClock.currentUnixTimestamp = (long)unixTimestamp * 1000;
  }
  return unixTimestamp;
}
long getMillis()
{
  if (systemClock.intervalometerRTCClock)
  {
    // RTC System Clock2

    // to get exact latest millis() after the last second of RTC.
    // Synch System Clock to the last passed millis to obtain 1/1000th seconds timing accuracy +/- 10 ms
    return ((systemClock.currentUnixTimestamp - systemClock.startUnixTimeStamp) * 1000) + (millis() - systemClock.lastMillis);
  }
  else
  {
    // Internal System Clock
    return millis();
  }
};
#include "intervalometer.h"

void IRAM_ATTR onShootingTimer()
{
  portENTER_CRITICAL_ISR(&systemClock.shootingTimerMux);
  if (intervalometer.exposureTriggerTime > 0)
  {
    intervalometer.exposureTriggerTime--;
  }
  portEXIT_CRITICAL_ISR(&systemClock.shootingTimerMux);
}

DateTime initClock()
{
  Clock.begin();
  // disable any existing alarms
  Clock.disableAlarms();

  Clock.setAlarm(DS3231_Simple::ALARM_EVERY_SECOND);
  // Camera trigger pins
  pinMode(config.cam1Trigger, OUTPUT);
  digitalWrite(config.cam1Trigger, LOW);

  systemClock.shootingTimer = timerBegin(0, 80, true);
  timerAttachInterrupt(systemClock.shootingTimer, &onShootingTimer, true);
  timerAlarmWrite(systemClock.shootingTimer, 10000, true); // Example we assume that we want  an interrupt each second, and thus we pass the value of 1 000 000 microseconds, which is equal to 1 second
  timerAlarmEnable(systemClock.shootingTimer);

  DateTime timestamp = Clock.read();
  systemClock.startUnixTimeStamp = (long)getUnixTimeStamp(timestamp, true);
  systemClock.currentUnixTimestamp = systemClock.startUnixTimeStamp;
  millis();
  return timestamp;
}

void displayTimestampsMessage(DateTime timestamp)
{
  Serial.print("20");
  Serial.print(timestamp.Year);
  Serial.print("-");
  Serial.print(timestamp.Month);
  Serial.print("-");
  Serial.print(timestamp.Day);
  Serial.print(" ");
  Serial.print(timestamp.Hour);
  Serial.print("h ");
  Serial.print(timestamp.Minute);
  Serial.print("min ");
  Serial.print(timestamp.Second);
  Serial.println("sec ");
  Serial.print("Unix Timestamp: ");
  Serial.println(getUnixTimeStamp(timestamp));
}

void core0_timing_task(void *pvParameters)
{
  for (;;)
  {
    
      readEncoders();
      vTaskDelay(10);
      checkLimitSwitch();
    

    // BatCheck();
  }
}

void initTimingCoreTask()
{
  xTaskCreatePinnedToCore(core0_timing_task, "Core_0", 10000, NULL, 2, &CPU0_Timing_Task, 0);
}
void getClockTime()
{

  // https://gist.github.com/ClemRz/1e6c3acaef3c3b8a41dd3b5aeefb0b11

  // bool myCallback(int value)
  // {
  //   // here your custom logic
  //   return status;
  // }

  // void myFunction(bool (*callback)(int))
  // {
  //   // here your custom logic
  //   bool status = callback(3);
  // }

  // void loop(void)
  // {
  //   myFunction(&myCallback);
  // }
}
void setClockTime(StaticJsonDocument<1024> command)
{
  DateTime timestamp;
  timestamp.Day = (uint8_t)command["DAY"];
  timestamp.Month = (uint8_t)command["MONTH"];
  timestamp.Year = (uint8_t)command["YEAR"];
  timestamp.Hour = (uint8_t)command["HOUR"];
  timestamp.Minute = (uint8_t)command["MINUTE"];
  timestamp.Second = (uint8_t)command["SECOND"];

  Clock.write(timestamp);
  Serial.print("RTC Clock has been set to: ");
  Clock.printTo(Serial);
  Serial.println();
  Serial.print("Unix Timestamp: ");
  Serial.println(getUnixTimeStamp(timestamp));
}
