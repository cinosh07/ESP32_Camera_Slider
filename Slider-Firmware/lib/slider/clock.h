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

// RTC Clock
DS3231_Simple Clock;
TaskHandle_t CPU0_Timing_Task;

char daysOfTheWeek[7][12] = {"Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"};

DateTime initClock() {
  Clock.begin();

  // disable any existing alarms
  Clock.disableAlarms();
    DateTime timestamp = Clock.read();
    return timestamp = Clock.read();
}
void displayTimestampsMessage(DateTime timestamp) {
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
}

void core0_timing_task(void *pvParameters)
{
  for (;;)
  {
    readEncoders();
    vTaskDelay(10);
    // BatCheck();
  }
}

void initTimingCoreTask() {
   xTaskCreatePinnedToCore(core0_timing_task, "Core_0", 10000, NULL, 2, &CPU0_Timing_Task, 0);
}