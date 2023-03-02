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
// https://circuitdigest.com/microcontroller-projects/esp32-timers-and-timer-interrupts

#include <Arduino.h>
#include <DS3231_Simple.h>
#include "TimeLib.h"

// RTC Clock
DS3231_Simple Clock;
TaskHandle_t CPU0_Timing_Task;

time_t currentUnixTimestamp; // a time stamp
time_t startUnixTimeStamp;

volatile int interruptCounter;

hw_timer_t *shootingTimer = NULL;
hw_timer_t *secondsTimer = NULL;
portMUX_TYPE shootingTimerMux = portMUX_INITIALIZER_UNLOCKED;
portMUX_TYPE secondsTimerMux = portMUX_INITIALIZER_UNLOCKED;

#include "intervalometer.h"

void IRAM_ATTR onShootingTimer()
{
  portENTER_CRITICAL_ISR(&shootingTimerMux);
  if (exposureTime > 0)
  {
    exposureTime--;
  }
  portEXIT_CRITICAL_ISR(&shootingTimerMux);
}
void IRAM_ATTR onSecondsTimer()
{
  portENTER_CRITICAL_ISR(&secondsTimerMux);
  interruptCounter++;
  portEXIT_CRITICAL_ISR(&secondsTimerMux);
}

time_t getUnixTimeStamp(DateTime timestamp)
{
  tmElements_t te; // Time elements structure
  te.Second = timestamp.Second;
  te.Hour = timestamp.Hour; // 11 pm
  te.Minute = timestamp.Minute;
  te.Day = timestamp.Day;
  te.Month = timestamp.Month;
  char yearBeginning = 20;
  char year = yearBeginning + (char)timestamp.Year;
  te.Year = (uint8_t)year; // Y2K, in seconds = 946684800UL
  currentUnixTimestamp = makeTime(te);
  return currentUnixTimestamp;
}

DateTime initClock()
{
  Clock.begin();
  // disable any existing alarms
  Clock.disableAlarms();

  //Camera trigger pins
  pinMode(2, OUTPUT);
  digitalWrite(2, LOW);

  shootingTimer = timerBegin(0, 80, true);
  timerAttachInterrupt(shootingTimer, &onShootingTimer, true);
  timerAlarmWrite(shootingTimer, 10000, true); // Example we assume that we want  an interrupt each second, and thus we pass the value of 1 000 000 microseconds, which is equal to 1 second
  timerAlarmEnable(shootingTimer);

  secondsTimer = timerBegin(1, 80, true);
  timerAttachInterrupt(secondsTimer, &onSecondsTimer, true);
  timerAlarmWrite(secondsTimer, 1000000, true); // Example we assume that we want  an interrupt each second, and thus we pass the value of 1 000 000 microseconds, which is equal to 1 second
  timerAlarmEnable(secondsTimer);

  DateTime timestamp = Clock.read();
  currentUnixTimestamp = getUnixTimeStamp(timestamp);
  startUnixTimeStamp = currentUnixTimestamp;
  return timestamp;
}
long getLastMillis()
{
  // TODO get the millis() elapse since the last timestamp second + buffer time to calibrate
  return 0;
}
long getMillis()
{
  return currentUnixTimestamp + getLastMillis() - startUnixTimeStamp;
};
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
