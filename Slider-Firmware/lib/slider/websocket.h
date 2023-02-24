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
#include "motors.h"


int previousSlideDir = -2;
double previousSlideSpeed = -2.00;
int ACCELL = 10000;
enum Joystick_Command
{
  JOYSTICK_PAN_MOVE,
  JOYSTICK_TILT_MOVE,
  JOYSTICK_SLIDE_MOVE,
  JOYSTICK_FOCUS_MOVE
};
enum Command
{
  COMMAND,
  SPEED,
  DIR,
  ACCEL,
  MULTIPLICATOR,
  SPEED_SCALING

};

int SPEED_US = 100;
int SPEED_MULTIPLICATOR = 10;
AsyncWebSocket ws("/ws");
AsyncWebSocketClient *globalClient = NULL;

int getSpeedInUS(double speed)
{
  return round(((1 - (speed / 100)) + 0.1) * SPEED_US * SPEED_MULTIPLICATOR);
}
void processCommand(int command[COMMAND_SIZE])
{
  double speed = command[SPEED];
  switch (command[COMMAND])
  {
  case JOYSTICK_PAN_MOVE:

    break;
  case JOYSTICK_TILT_MOVE:

    break;
  case JOYSTICK_SLIDE_MOVE:

    if (speed == 0)
    {
      Serial.println("Webscoket Command : stopMove()");
      stepperSlide->setSpeedInUs(0);
      stepperSlide->applySpeedAcceleration();
      stepperSlide->stopMove();
      previousSlideSpeed = -2.00;
      previousSlideDir = -2;
    }

    if (command[DIR] == 0 && speed > 0)
    {

      Serial.println("Webscoket Command : runForward() Speed: " + (String)getSpeedInUS(speed));
      stepperSlide->setSpeedInUs(getSpeedInUS(speed)); // the parameter is us/step !!!
      stepperSlide->setAcceleration(ACCELL);
      stepperSlide->runForward();
      previousSlideDir = command[DIR];
    }
    else if (command[DIR] == -1 && speed > 0)
    {
      Serial.println("Webscoket Command : runBackward() Speed: " + (String)getSpeedInUS(speed));
      stepperSlide->setSpeedInUs(getSpeedInUS(speed)); // the parameter is us/step !!!
      stepperSlide->setAcceleration(ACCELL);
      stepperSlide->runBackward();
      previousSlideDir = command[DIR];
    }

    break;
  case JOYSTICK_FOCUS_MOVE:

    break;
  }
}

void handleWebSocketMessage(void *arg, uint8_t *data, size_t len)
{
  AwsFrameInfo *info = (AwsFrameInfo *)arg;
  if (info->final && info->index == 0 && info->len == len)
  {
    switch (info->opcode)
    {

      break;
    case WS_TEXT:

      String data_str;
      int commandArray[COMMAND_SIZE];
      data[len] = 0;
      for (size_t i = 0; i < len; i++)
      {
        data_str = String((char *)data);
      }
#ifdef DEBUG_COMMAND
      Serial.print("String Data : ");
      Serial.println(data_str);
#endif

      char stringData[32];
      data_str.trim();
      strcpy(stringData, data_str.c_str());

      if ((strcmp((char *)data_str.c_str(), "CONNECTED") < -1 & strcmp((char *)data, "DISCONNECTED") < -1) | (strcmp((char *)data, "CONNECTED") == 1 & strcmp((char *)data, "DISCONNECTED") == 1))
      {
        const char *delimiter = "::";
        char *ptr = NULL;
        int index = 0;
        ptr = strtok(stringData, delimiter);
        while (ptr != NULL)
        {

          ptr = strtok(NULL, delimiter);
          String value = ptr;
#ifdef DEBUG_COMMAND
          Serial.print("Array Index : ");
          Serial.print(index);
          Serial.print(" ---- Array Value : ");
          Serial.println(value.toInt());
#endif
          commandArray[index] = value.toInt();
          index++;
          delay(20); // TODO Check if necessary
        }
#ifdef DEBUG_COMMAND
        Serial.print("Array Data 0: ");
        Serial.println(&stringData[0]);
        Serial.print("Array Data 1: ");
        Serial.println(&stringData[1]);
        Serial.print("Array Data 2: ");
        Serial.println(&stringData[2]);
        Serial.print("Array Data 3: ");
        Serial.println(&stringData[3]);
        Serial.print("Array Data 4: ");
        Serial.println(&stringData[4]);
        Serial.print("Array Data 5: ");
        Serial.println(&stringData[5]);
#endif
        if (commandArray[COMMAND] < 15)
        {
#ifdef DEBUG_COMMAND
          Serial.println("Begin of data ###############################");
#endif
          int commandToSent[COMMAND_SIZE];
          commandToSent[COMMAND] = commandArray[COMMAND];
          commandToSent[SPEED] = commandArray[SPEED];
          commandToSent[DIR] = commandArray[DIR];
          commandToSent[ACCEL] = commandArray[ACCEL];
          commandToSent[MULTIPLICATOR] = commandArray[MULTIPLICATOR];
          commandToSent[SPEED_SCALING] = commandArray[SPEED_SCALING];
#ifdef DEBUG_COMMAND
          for (int i = 0; i < 6; i++)
          {
            Serial.println(commandArray[i]);
          }
#endif
          processCommand(commandArray);
#ifdef DEBUG_COMMAND
          Serial.print("Command to process: ");
          Serial.println(data_str);
          Serial.println("End of data ###############################");
#endif
        }
      }
      break;
    }
  }
}
void onWsEvent(AsyncWebSocket *server, AsyncWebSocketClient *client, AwsEventType type, void *arg, uint8_t *data, size_t len)
{

  if (type == WS_EVT_CONNECT)
  {
    sendWebsocketReadyMessage();
    client->text("Timelapse Slider connection success");
    globalClient = client;
  }
  else if (type == WS_EVT_DISCONNECT)
  {
    Serial.println("Client disconnected");
    globalClient = NULL;
  }
  else if (type == WS_EVT_DATA)
  {
    handleWebSocketMessage(arg, data, len);
  }
  else if (type == WS_EVT_ERROR)
  {
    Serial.println("Websocket Error !!!!!!!!!!!!!!!!!!!!!!!!!");
  }
}
void initWebsocket() {
    ws.onEvent(onWsEvent);
}
