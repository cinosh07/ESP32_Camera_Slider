// Websocket Example
// https://techtutorialsx.com/2018/08/14/esp32-async-http-web-server-websockets-introduction/
// https://techtutorialsx.com/2017/11/05/esp32-arduino-websocket-server-receiving-and-parsing-json-content/
// https://techtutorialsx.com/2018/09/11/esp32-arduino-web-server-sending-data-to-javascript-client-via-websocket/
// esptool --chip esp32 -p COM4 erase_flash
// https://www.chartjs.org/docs/latest/samples/information.html
// https://getbootstrap.com/docs/5.1/utilities/colors/
// https://getbootstrap.com/docs/5.1/
// http://wiki.fluidnc.com/en/hardware/esp32_pin_reference

// https://randomnerdtutorials.com/esp32-pinout-reference-gpios/
// https://www.upesy.fr/blogs/tutorials/esp32-pinout-reference-gpio-pins-ultimate-guide
// https://forum.arduino.cc/t/solved-slave-address-tmc2209-uart/693615
// https://github.com/teemuatlut/TMCStepper/issues/192
// https://forum.arduino.cc/t/tmcstepper-arduino-tmc2209/956036/7
// https://github.com/teemuatlut/TMCStepper/blob/master/examples/TMC_AccelStepper/TMC_AccelStepper.ino
// https://forum.arduino.cc/t/using-a-tmc2209-silent-stepper-motor-driver-with-an-arduino/666992/10

// https://github.com/sleemanj/DS3231_Simple/blob/master/examples/z2_Alarms/Alarm/Alarm.ino

// https://m1cr0lab-esp32.github.io/remote-control-with-websocket/websocket-and-json/

// https://groups.google.com/g/accelstepper/c/t6ergGz30Lo?pli=1
// https://www.instructables.com/Playing-with-Accelstepper-Code-HodgePodging-for-a-/

#include <Arduino.h>
#include "esp_task_wdt.h"
#include <TMCStepper.h>
#include "FastAccelStepper.h"
#include <WiFi.h>
#include <AsyncTCP.h>
#include <ESPAsyncWebServer.h>
#include <Wire.h>
#include "AS5600.h"
#include <DS3231_Simple.h>
#include "SPIFFS.h"
#include "ArduinoJson.h"
#include <ESPmDNS.h>

#define SERIAL_PORT Serial2
#define R_SENSE 0.11f
#define DRIVER_ADDRESS 0b00
#define COMMAND_SIZE 8

IPAddress IP;
struct Config
{
  String ssidap;
  String passwordap;
  String ssid;
  String password;
  int tmc_uart_rx;
  int tmc_uart_tx;
  bool access_point;
  JsonVariant configJson;
  JsonVariant profileJson;
};
struct Stepper_Motor
{
  String include;
  int dir_pin;
  int step_pin;
  int enable_pin;
  bool encoder;
  int limit_switch;
  int step_per_mm;
  bool always_enabled;
  String tmc_driver_address; // "tmc_driver_address": "0b00"
};

Config config;
Stepper_Motor slider_Motor;
Stepper_Motor pan_Motor;
Stepper_Motor tilt_Motor;
Stepper_Motor focus_motor;

String message = "";
TaskHandle_t CPU0_Timing_Task;
FastAccelStepperEngine engine = FastAccelStepperEngine();
FastAccelStepper *stepperSlide = NULL;

// TMC2209Stepper driver = TMC2209Stepper(&SERIAL_PORT, R_SENSE, DRIVER_ADDRESS);
TMC2208Stepper tmcDriverSlide = TMC2208Stepper(&SERIAL_PORT, R_SENSE);

// Set web server port number to 80
AsyncWebServer server(80);
AsyncWebSocket ws("/ws");
AsyncWebSocketClient *globalClient = NULL;

const char *PARAM_MESSAGE = "message";
const char *COMMAND_MOVE = "move";
const char *COMMAND_MOVE_DIR = "move_dir";

// AS5600 Encoder
String lastResponse;
String noMagnetStr = "Error: magnet not detected";
AS5600 as5600;
uint32_t clk = 0;

// RTC Clock
// RTC_DS3231 rtc;
DS3231_Simple Clock;
char daysOfTheWeek[7][12] = {"Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"};

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

int previousSlideDir = -2;
double previousSlideSpeed = -2.00;
int SPEED_US = 100;
int SPEED_MULTIPLICATOR = 10;
int ACCELL = 10000;

String ipToString(const IPAddress &address)
{
  return String() + address[0] + "." + address[1] + "." + address[2] + "." + address[3];
};

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
      Serial.println("Webscoket Command Received: stopMove()");
      stepperSlide->setSpeedInUs(0);
      stepperSlide->applySpeedAcceleration();
      stepperSlide->stopMove();
      previousSlideSpeed = -2.00;
      previousSlideDir = -2;
    }

    if (command[DIR] == 0 && speed > 0)
    {

      Serial.println("Webscoket Command Received: runForward() Speed: " + (String)getSpeedInUS(speed));
      stepperSlide->setSpeedInUs(getSpeedInUS(speed)); // the parameter is us/step !!!
      stepperSlide->setAcceleration(ACCELL);
      stepperSlide->runForward();
      previousSlideDir = command[DIR];
    }
    else if (command[DIR] == -1 && speed > 0)
    {
      Serial.println("Webscoket Command Received: runBackward() Speed: " + (String)getSpeedInUS(speed));
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
      // Serial.print("String Data : ");
      // Serial.println(data_str);
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
          // Serial.print("Array Index : ");
          // Serial.print(index);
          // Serial.print(" ---- Array Value : ");
          // Serial.println(value.toInt());
          commandArray[index] = value.toInt();
          index++;
          delay(20); // TODO Check if necessary
        }

        // Serial.print("Array Data 0: ");
        // Serial.println(&stringData[0]);
        // Serial.print("Array Data 1: ");
        // Serial.println(&stringData[1]);
        // Serial.print("Array Data 2: ");
        // Serial.println(&stringData[2]);
        // Serial.print("Array Data 3: ");
        // Serial.println(&stringData[3]);
        // Serial.print("Array Data 4: ");
        // Serial.println(&stringData[4]);
        // Serial.print("Array Data 5: ");
        // Serial.println(&stringData[5]);

        if (commandArray[COMMAND] < 15)
        {

          // Serial.println("Begin of data ###############################");
          int commandToSent[COMMAND_SIZE];
          commandToSent[COMMAND] = commandArray[COMMAND];
          commandToSent[SPEED] = commandArray[SPEED];
          commandToSent[DIR] = commandArray[DIR];
          commandToSent[ACCEL] = commandArray[ACCEL];
          commandToSent[MULTIPLICATOR] = commandArray[MULTIPLICATOR];
          commandToSent[SPEED_SCALING] = commandArray[SPEED_SCALING];
          // for (int i = 0; i < 6; i++)
          // {
          //   Serial.println(commandArray[i]);
          // }
          processCommand(commandArray);
          // Serial.print("Command to process: ");
          // Serial.println(data_str);
          // Serial.println("End of data ###############################");
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

    Serial.println("Websocket client connection received");
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
void notFound(AsyncWebServerRequest *request)
{
  request->send(404, "text/plain", "Not found");
}
void openProfile()
{

  String filename = config.configJson["profile"];
  String file = "/profiles/" + filename + ".json";
  Serial.print("Profile file to load: ");
  Serial.println(file);

  if (!SPIFFS.begin())
  {
    Serial.println("Failed to mount SPIFFS");
  }
  else
  {
    File profileFile = SPIFFS.open(file, FILE_READ);

    if (!profileFile)
    {
      Serial.println("There was an error opening the profile file");
      return;
    }

    else
    {
      Serial.println("Profile File opened!");
      size_t size = profileFile.size();
      if (size > 1024)
      {
        Serial.print("Profile file size is too large: ");
        Serial.println(size);
      }
      else
      {

        DynamicJsonDocument doc(1024);
        DeserializationError error = deserializeJson(doc, profileFile);
        JsonVariant profileJson = doc.as<JsonVariant>();
        config.profileJson = profileJson;
        if (error)
        {
          Serial.println("Failed to parse profile file");
        }
        else
        {
          String brand = doc["brand"];
          String description = doc["description"];
          Serial.println("Slider Model: " + brand + " " + description);

          //   "slider": {
          //     "include": true,
          //     "dir_pin": 27,
          //     "step_pin": 14,
          //     "enable_pin": 12,
          //     "encoder": false,
          //     "limit_switch": 13,
          //     "step_per_mm": 0,
          //     "always_enabled": true,
          //     "tmc_driver_address": "0b00"
          // },
          bool include = doc["motors"]["slider"]["include"];
          if (include)
          {
            slider_Motor.dir_pin = doc["motors"]["slider"]["dir_pin"];
            slider_Motor.step_pin = doc["motors"]["slider"]["step_pin"];
            slider_Motor.enable_pin = doc["motors"]["slider"]["enable_pin"];
            slider_Motor.encoder = doc["motors"]["slider"]["encoder"];
            slider_Motor.limit_switch = doc["motors"]["slider"]["limit_switch"];
            slider_Motor.step_per_mm = doc["motors"]["slider"]["step_per_mm"];
            slider_Motor.always_enabled = doc["motors"]["slider"]["always_enabled"];
            String tmc_driver_address = doc["motors"]["slider"]["tmc_driver_address"];
            slider_Motor.tmc_driver_address = tmc_driver_address;
          }
        }
        Serial.println("");
      }
    }

    profileFile.close();
  }
}
void readConfigFile()
{
  if (!SPIFFS.begin())
  {
    Serial.println("Failed to mount SPIFFS");
  }
  else
  {
    File configFile = SPIFFS.open("/config.json", FILE_READ);

    if (!configFile)
    {
      Serial.println("There was an error opening the config file");
      return;
    }

    else
    {
      Serial.println("Config File opened!");
      size_t size = configFile.size();
      if (size > 1024)
      {
        Serial.print("Config file size is too large: ");
        Serial.println(size);
      }
      else
      {
        DynamicJsonDocument doc(1024);
        DeserializationError error = deserializeJson(doc, configFile);
        JsonVariant configJson = doc.as<JsonVariant>();
        config.configJson = configJson;
        if (error)
        {
          Serial.println("Failed to parse config file");
        }
        else
        {
          String ssidap = doc["wifi"]["ssidap"];
          config.ssidap = ssidap;
          Serial.println();

          String passwordap = doc["wifi"]["passwordap"];
          config.passwordap = passwordap;
          String ssid = doc["wifi"]["ssid"];
          config.ssid = ssid;

          String password = doc["wifi"]["password"];
          config.password = password;
          // Serial.println((String)config.password);
          String access_point = doc["wifi"]["access_point"];
          config.access_point = doc["wifi"]["access_point"];
          Serial.println("**********************************");
          if (config.access_point == true)
          {
            
            Serial.println("WIFI HOTSPOT MODE");
            Serial.println("SSID: " + (String)config.ssidap);
            Serial.println("SSID password: " + passwordap);
          }
          else
          {
            Serial.println("WIFI NETWORK CONNECTION MODE");
            Serial.println("Connected Router SSID: " + (String)config.ssid);
          }
          Serial.println("**********************************");
          int tmc_uart_rx = doc["tmc_uart_rx"];
          config.tmc_uart_rx = tmc_uart_rx;
          int tmc_uart_tx = doc["tmc_uart_tx"];
          config.tmc_uart_tx = tmc_uart_tx;
        }
        Serial.println("");
      }
    }

    configFile.close();
    openProfile();
  }
}

String processor(const String &var)
{
  if (var == "STATE")
  {
    return "0";
  }
  if (var == "IP")
  {
    return ipToString(IP);
  }
  return String();
}

void moveSlider(int dir, int speed, int accel, int distance, int distanceTo)
{
  if (dir == 1)
  {
    stepperSlide->setSpeedInUs(speed); // the parameter is us/step !!!
    stepperSlide->setAcceleration(accel);
    stepperSlide->move(distance);
  }
  else
  {
    stepperSlide->setSpeedInUs(1000); // the parameter is us/step !!!
    stepperSlide->setAcceleration(100);
    stepperSlide->move(-15000);
  }
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
void core0_timing_task(void *pvParameters)
{
  for (;;)
  {
    readEncoders();
    vTaskDelay(10);
    // BatCheck();
  }
}
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
  Clock.begin();

  // We will set 2 alarms, the first alarm will fire at the 30th second of every minute
  //  and the second alarm will fire every minute (at the 0th second)

  // First we will disable any existing alarms
  Clock.disableAlarms();
  Serial.println("");
  Serial.println("**********************************");
  Serial.println("**********************************");
  Serial.println("");
  Serial.println(" Cinosh Camera Slider Controller  ");
  Serial.println("           version 0.1            ");
  Serial.println("");
  Serial.println("   Copyright 2023 Carl Tremblay   ");
  Serial.println("");
  Serial.println("**********************************");
  Serial.println("**********************************");
  Serial.println("");
  Serial.print("Slider Init ...");
  readConfigFile();
  delay(2000);
  // Prepare pins
  pinMode(slider_Motor.enable_pin, OUTPUT);
  pinMode(slider_Motor.step_pin, OUTPUT);
  pinMode(slider_Motor.dir_pin, OUTPUT);
  digitalWrite(slider_Motor.enable_pin, LOW); // Disable driver in hardware

  engine.init();

  stepperSlide = engine.stepperConnectToPin(slider_Motor.step_pin);

  // tmcDriverSlide.pdn_disable(true);     // Use PDN/UART pin for communication
  tmcDriverSlide.I_scale_analog(false); // Use internal voltage reference
  tmcDriverSlide.rms_current(990);      // Set driver current 500mA
  tmcDriverSlide.toff(2);               // Enable driver in software
                                        // tmcDriverSlide.en_pwm_mode(1);      // Enable extremely quiet stepping
  tmcDriverSlide.pwm_autoscale(1);
  tmcDriverSlide.microsteps(32);
  tmcDriverSlide.begin();

  // ACCESS_POINT
  String hostname = "slider";
  WiFi.setHostname(hostname.c_str());
  if (config.access_point == true)
  {
    Serial.println("Setting Slider AP (Access Point) : ");
    Serial.println(config.access_point);
    WiFi.softAP((char *)config.ssidap.c_str(), (char *)config.passwordap.c_str());
    IP = WiFi.softAPIP();
    Serial.print("AP IP address: ");
    Serial.println(IP);
  }
  else
  {
    Serial.println("**********************************");
    Serial.println("Setting Camera Slider Wifi Connection...");
    WiFi.begin((char *)config.ssid.c_str(), (char *)config.password.c_str());
    if (WiFi.waitForConnectResult() != WL_CONNECTED)
    {
      Serial.printf("WiFi Failed!\n");
      return;
    }
    IP = WiFi.localIP();
    Serial.print("Local IP address: ");
    Serial.println(IP);
  }
  if (!MDNS.begin("slider"))
  {
    Serial.println("Error starting mDNS");
    return;
  }
  Serial.println("**********************************");
  // Encoder
  as5600.begin(4);                        //  set direction pin.
  as5600.setDirection(AS5600_CLOCK_WISE); // default, just be explicit.
  int b = as5600.isConnected();
  Serial.println("");
  Serial.print("AS5600 Encoder Connected: ");
  Serial.println(b);
  Serial.println("");
  // Get an initialized timestamp
  DateTime MyTimestamp = Clock.read();

  // We want the alarm at this second
  MyTimestamp.Second = 30;
  Serial.print("Real TIme CLock initialized: ");
  Serial.print(MyTimestamp.Year);
  Serial.print("-");
  Serial.print(MyTimestamp.Month);
  Serial.print("-");
  Serial.print(MyTimestamp.Day);
  Serial.print(" ");
  Serial.print(MyTimestamp.Hour);
  Serial.print("h ");
  Serial.print(MyTimestamp.Minute);
  Serial.print("min ");
  Serial.print(MyTimestamp.Second);
  Serial.println("sec ");

  // SPIFFS initialisation
  if (!SPIFFS.begin(true))
  {
    Serial.println("An Error has occurred while mounting SPIFFS");
    return;
  } else {
    Serial.println("");
    Serial.println("Slider controller ready!");
  }
  // HTML Files
  server.on("/", HTTP_GET, [](AsyncWebServerRequest *request)
            { request->send(SPIFFS, "/www/index.html", String(), false, processor); });
  // TODO Swtich to this index page if firmware is in intervalometer mode -> "interval-mode" : true in config.json,
  //  server.on("/", HTTP_GET, [](AsyncWebServerRequest *request)
  //            { request->send(SPIFFS, "/www/index-interv.html", String(), false, processor); });
  server.on("/interval.html", HTTP_GET, [](AsyncWebServerRequest *request)
            { request->send(SPIFFS, "/www/interval.html", String(), false, processor); });
  server.on("/about.html", HTTP_GET, [](AsyncWebServerRequest *request)
            { request->send(SPIFFS, "/www/about.html", String(), false, processor); });
  server.on("/settings.html", HTTP_GET, [](AsyncWebServerRequest *request)
            { request->send(SPIFFS, "/www/settings.html", String(), false, processor); });
  // CSS Files
  server.on("/css/style.css", HTTP_GET, [](AsyncWebServerRequest *request)
            { request->send(SPIFFS, "/www/css/style.css", "text/css"); });
  server.on("/css/bootstrap.min.css", HTTP_GET, [](AsyncWebServerRequest *request)
            { request->send(SPIFFS, "/www/css/bootstrap.min.css", "text/css"); });
  // Javascript Files
  server.on("/js/jquery.min.js", HTTP_GET, [](AsyncWebServerRequest *request)
            { request->send(SPIFFS, "/www/js/jquery.min.js", "text/javascript"); });
  server.on("/js/main.js", HTTP_GET, [](AsyncWebServerRequest *request)
            { request->send(SPIFFS, "/www/js/main.js", "text/javascript"); });
  server.on("/js/chart.js", HTTP_GET, [](AsyncWebServerRequest *request)
            { request->send(SPIFFS, "/www/js/chart.js", "text/javascript"); });
  server.on("/js/helpers.js", HTTP_GET, [](AsyncWebServerRequest *request)
            { request->send(SPIFFS, "/www/js/helpers.js", "text/javascript"); });
  server.on("/js/bootstrap.min.js", HTTP_GET, [](AsyncWebServerRequest *request)
            { request->send(SPIFFS, "/www/js/bootstrap.min.js", "text/javascript"); });
  server.on("/js/interval.js", HTTP_GET, [](AsyncWebServerRequest *request)
            { request->send(SPIFFS, "/www/js/interval.js", "text/javascript"); });
  // Image Files
  server.on("/favicon.ico", HTTP_GET, [](AsyncWebServerRequest *request)
            { request->send(SPIFFS, "/www/favicon.ico", "image/x-icon"); });
  server.on("/images/joystick-red.png", HTTP_GET, [](AsyncWebServerRequest *request)
            { request->send(SPIFFS, "/www/images/joystick-red.png", "image/png"); });
  server.on("/images/joystick-blue.png", HTTP_GET, [](AsyncWebServerRequest *request)
            { request->send(SPIFFS, "/www/images/joystick-blue.png", "image/png"); });
  server.on("/images/joystick-base.png", HTTP_GET, [](AsyncWebServerRequest *request)
            { request->send(SPIFFS, "/www/images/joystick-base.png", "image/png"); });
  server.on("/images/icon-64.png", HTTP_GET, [](AsyncWebServerRequest *request)
            { request->send(SPIFFS, "/www/images/icon-64.png", "image/png"); });
  server.on("/images/icon-32.png", HTTP_GET, [](AsyncWebServerRequest *request)
            { request->send(SPIFFS, "/www/images/icon-32.png", "image/png"); });
  server.on("/images/splash.jpg", HTTP_GET, [](AsyncWebServerRequest *request)
            { request->send(SPIFFS, "/www/images/splash.jpg", "image/jpeg"); });

  server.onNotFound(notFound);
  ws.onEvent(onWsEvent);
  server.addHandler(&ws);
  server.begin();

  if (stepperSlide)
  {
    stepperSlide->setDirectionPin(slider_Motor.dir_pin);
    stepperSlide->setEnablePin(slider_Motor.enable_pin);
    stepperSlide->setAutoEnable(true);

    //   // If auto enable/disable need delays, just add (one or both):
    //   // stepperSlide->setDelayToEnable(50);
    //   // stepperSlide->setDelayToDisable(1000);
  }
  xTaskCreatePinnedToCore(core0_timing_task, "Core_0", 10000, NULL, 2, &CPU0_Timing_Task, 0);
  delay(100);
  disableCore0WDT();
}

//***********************************************************
//
//                         Loop
//
//***********************************************************
void loop1()
{
}
bool direction = false;
void loop()
{

  //    clk += 100000;
  //  if (clk > 800000) clk = 100000;
  //  Wire.setClock(clk);
  //
  //  Serial.print(clk);
  //  Serial.print("\t");
  //  Serial.print(as5600.readAngle());
  //  Serial.print("\t");
  //  Serial.println(as5600.rawAngle() * AS5600_RAW_TO_DEGREES);
  //
  //  delay(1000);

  // if(globalClient != NULL && globalClient->status() == WS_CONNECTED){
  //     String randomNumber = String(random(0,20));
  //     globalClient->text(randomNumber);
  //  }
  // delay(4000);

  // delay(10);
}
