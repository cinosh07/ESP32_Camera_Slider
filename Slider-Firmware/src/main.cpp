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

// To erase chip when corruption happen
// esptool --chip esp32 -p COM4 erase_flash

#include "includes.h"

//***********************************************************
//
//                         Setup
//
//***********************************************************
void setup()
{

  Serial.begin(115200);
  Serial2.begin(115200, SERIAL_8N1, 16, 17);

  Wire.begin();

  displayInitMessage();
  readConfigFile();
  delay(2000);

  // Networking
  initNetwork();

  // Encoder
  int result = initEncoder();
  displayEncoderReadyMessage(result);
  // Get an initialized timestamp
  DateTime MyTimestamp = initClock();

  // We want the alarm at this second
  MyTimestamp.Second = 30;
  Serial.print("Real TIme CLock initialized: ");
  displayTimestampsMessage(MyTimestamp);

  // SPIFFS initialisation
  bool spiffsReady = initSPIFFS();
  if (!spiffsReady)
  {
    Serial.println("An Error has occurred while mounting SPIFFS");
    return;
  }
  else
  {
    initServer();
    initWebsocket();
    initMotors();
    initTimingCoreTask();
    delay(100);
    disableCore0WDT();
    motorsBegin();
    sendControllerReadyMessage();

    intervalometer.releaseTime = 5;
    intervalometer.shotsTotal = 10;
    // intervalometer.mode = BULB_MODE;
    startShooting();
  }
}

//***********************************************************
//
//                         Loop
//
//***********************************************************

void loop()
{
  // if(globalClient != NULL && globalClient->status() == WS_CONNECTED){
  //     String randomNumber = String(random(0,20));
  //     globalClient->text(randomNumber);
  //  }
  // delay(4000);

  systemClock.alarmsFired = Clock.checkAlarms();

  if (systemClock.alarmsFired & 1)
  {
    DateTime timestamp = Clock.read();
    time_t unixTimestamp = getUnixTimeStamp(timestamp);
    systemClock.currentUnixTimestamp = (long)unixTimestamp;
    systemClock.lastMillis = millis();
  }

  if (systemClock.alarmsFired & 2)
  {
    // TODO Start the shooting session at Alarm 2 fired
  }

  switch (commandStatus)
  {
  case CommandStatus::FORCE_STOP:
    forceMotorsLimitTrigered();
    break;
  case CommandStatus::MARK_IN:
    markIn();
    break;
  case CommandStatus::MARK_OUT:
    markOut();
    break;
  case CommandStatus::GOTO_IN:
    commandStatus = CommandStatus::RUNNING;

    if (commandStatus != prevCommandStatus)
    {
      if (globalClient != NULL && globalClient->status() == WS_CONNECTED)
      {

        globalClient->text("{\"COMMAND_STATUS\":" + (String)commandStatus + "}");
        prevCommandStatus = commandStatus;
      }
    }
    gotoIn();
    break;
  case CommandStatus::GOTO_OUT:
    commandStatus = CommandStatus::RUNNING;

    if (commandStatus != prevCommandStatus)
    {
      if (globalClient != NULL && globalClient->status() == WS_CONNECTED)
      {

        globalClient->text("{\"COMMAND_STATUS\":" + (String)commandStatus + "}");
        prevCommandStatus = commandStatus;
      }
    }
    gotoOut();
    break;
  case CommandStatus::TIMELAPSE:

    switch (intervalometer.COMMAND_STATUS)
    {
    case TimelapseCommand::START:
      intervalometer.COMMAND_STATUS = TimelapseCommand::IDLE;
      intervalometer.STATUS = TimelapseStatus::RUNNING;

      startShooting();
      break;
    case TimelapseCommand::TAKE_SINGLE_SHOT:
      startShooting(true);
      break;
    case TimelapseCommand::STOP:
      intervalometer.STATUS = TimelapseStatus::IDLE;
      stopShooting();
      break;
    }

    break;
  default:
    commandStatus = CommandStatus::IDLE;
    if (commandStatus != prevCommandStatus)
    {
      if (globalClient != NULL && globalClient->status() == WS_CONNECTED)
      {
        prevCommandStatus = commandStatus;
        globalClient->text("{\"COMMAND_STATUS\":" + (String)commandStatus + "}");
      }
    }
  }
  intervalometerLoop();
  if (intervalometer.shotsCount != 0 & intervalometer.lastShotsCount != intervalometer.shotsCount)
  {
    intervalometer.lastShotsCount = intervalometer.shotsCount;
    if (globalClient != NULL && globalClient->status() == WS_CONNECTED)
    {
      globalClient->text("{\"SHOTS\":" + (String)intervalometer.shotsCount + "}");
    }
  }
  // if (commandStatus != prevCommandStatus)
  // {

  //   if (globalClient != NULL && globalClient->status() == WS_CONNECTED)
  //   {

  //     globalClient->text("{\"COMMAND_STATUS\":" + (String)commandStatus + "}");
  //     prevCommandStatus = COMMAND_STATUS;
  //   }
  // }

  delay(10);
}
