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
// https://github.com/sleemanj/DS3231_Simple/blob/master/examples/z2_Alarms/Alarm/Alarm.ino
// https://forum.arduino.cc/t/using-millis-for-timing-a-beginners-guide/483573
// https://www.arduino.cc/reference/en/language/functions/time/millis/

// to get exact latest millis() after the last second of RTC.
// https://circuitdigest.com/microcontroller-projects/esp32-timers-and-timer-interrupts

// https://www.unixtimestamp.com/

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
  pinMode(2, OUTPUT);
  digitalWrite(2, LOW);

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
}
void setClockTime(int _timestamp[COMMAND_SIZE])
{
  DateTime timestamp;
  timestamp.Day = _timestamp[ClockCommandType::DAY];
  timestamp.Month = _timestamp[ClockCommandType::MONTH];
  timestamp.Year = _timestamp[ClockCommandType::YEAR];
  timestamp.Hour = _timestamp[ClockCommandType::HOUR];
  timestamp.Minute = _timestamp[ClockCommandType::MINUTE];
  timestamp.Second = _timestamp[ClockCommandType::SECOND];

  Clock.write(timestamp);
  Serial.print("RTC Clock has been set to: ");
  Clock.printTo(Serial);
  Serial.println();
  Serial.print("Unix Timestamp: ");
  Serial.println(getUnixTimeStamp(timestamp));
}
