# 1 "d:\\Timelapse_Slider\\ESP32_Camera_Slider\\Slider-Firmware\\Slider-Firmware.ino"
// Websocket Example
// https://techtutorialsx.com/2018/08/14/esp32-async-http-web-server-websockets-introduction/
// https://techtutorialsx.com/2017/11/05/esp32-arduino-websocket-server-receiving-and-parsing-json-content/
// https://techtutorialsx.com/2018/09/11/esp32-arduino-web-server-sending-data-to-javascript-client-via-websocket/
// esptool --chip esp32 -p COM4 erase_flash
// https://www.chartjs.org/docs/latest/samples/information.html
// https://getbootstrap.com/docs/5.1/utilities/colors/
// https://getbootstrap.com/docs/5.1/

# 11 "d:\\Timelapse_Slider\\ESP32_Camera_Slider\\Slider-Firmware\\Slider-Firmware.ino" 2
# 12 "d:\\Timelapse_Slider\\ESP32_Camera_Slider\\Slider-Firmware\\Slider-Firmware.ino" 2
# 13 "d:\\Timelapse_Slider\\ESP32_Camera_Slider\\Slider-Firmware\\Slider-Firmware.ino" 2
# 14 "d:\\Timelapse_Slider\\ESP32_Camera_Slider\\Slider-Firmware\\Slider-Firmware.ino" 2
# 15 "d:\\Timelapse_Slider\\ESP32_Camera_Slider\\Slider-Firmware\\Slider-Firmware.ino" 2
# 16 "d:\\Timelapse_Slider\\ESP32_Camera_Slider\\Slider-Firmware\\Slider-Firmware.ino" 2
# 17 "d:\\Timelapse_Slider\\ESP32_Camera_Slider\\Slider-Firmware\\Slider-Firmware.ino" 2
# 18 "d:\\Timelapse_Slider\\ESP32_Camera_Slider\\Slider-Firmware\\Slider-Firmware.ino" 2
# 19 "d:\\Timelapse_Slider\\ESP32_Camera_Slider\\Slider-Firmware\\Slider-Firmware.ino" 2
# 20 "d:\\Timelapse_Slider\\ESP32_Camera_Slider\\Slider-Firmware\\Slider-Firmware.ino" 2

// As in StepperDemo for Motor 1 on ESP32
#define dirPinStepper 27
#define enablePinStepper 13
#define stepPinStepper 26
IPAddress IP;
struct Config
{
  String ssidap;
  String passwordap;
  String ssid;
  String password;
  bool access_point;
};
Config config;
String message = "";
FastAccelStepperEngine engine = FastAccelStepperEngine();
FastAccelStepper *stepper = 
# 37 "d:\\Timelapse_Slider\\ESP32_Camera_Slider\\Slider-Firmware\\Slider-Firmware.ino" 3 4
                           __null
# 37 "d:\\Timelapse_Slider\\ESP32_Camera_Slider\\Slider-Firmware\\Slider-Firmware.ino"
                               ;

// Set web server port number to 80
AsyncWebServer server(80);
AsyncWebSocket ws("/ws");
AsyncWebSocketClient *globalClient = 
# 42 "d:\\Timelapse_Slider\\ESP32_Camera_Slider\\Slider-Firmware\\Slider-Firmware.ino" 3 4
                                    __null
# 42 "d:\\Timelapse_Slider\\ESP32_Camera_Slider\\Slider-Firmware\\Slider-Firmware.ino"
                                        ;

const char *PARAM_MESSAGE = "message";

const char *COMMAND_MOVE = "move";
const char *COMMAND_MOVE_DIR = "move_dir";

// AS5600 Encoder
String lastResponse;
String noMagnetStr = "Error: magnet not detected";
AS5600 as5600;
uint32_t clk = 0;

// RTC Clock
RTC_DS3231 rtc;
char daysOfTheWeek[7][12] = {"Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"};

String ipToString(const IPAddress &address)
{
  return String() + address[0] + "." + address[1] + "." + address[2] + "." + address[3];
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
    globalClient = 
# 77 "d:\\Timelapse_Slider\\ESP32_Camera_Slider\\Slider-Firmware\\Slider-Firmware.ino" 3 4
                  __null
# 77 "d:\\Timelapse_Slider\\ESP32_Camera_Slider\\Slider-Firmware\\Slider-Firmware.ino"
                      ;
  }
}
void notFound(AsyncWebServerRequest *request)
{
  request->send(404, "text/plain", "Not found");
}
bool getBoolValue(String value)
{
  if (value == "true" || value == "TRUE" || value == "1")
  {
    return true;
  }
  else
  {
    return false;
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
    File configFile = SPIFFS.open("/config.json", "r");

    if (!configFile)
    {
      Serial.println("There was an error opening the file");
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
        StaticJsonDocument<1024> doc;

        DeserializationError error = deserializeJson(doc, configFile);
        if (error)
        {
          Serial.println("Failed to parse config file");
          //          Serial.println(error.f_str());
        }
        else
        {
          String ssidap = doc["wifi"]["ssidap"];
          config.ssidap = ssidap;
          Serial.println((String)config.ssidap);
          //
          String passwordap = doc["wifi"]["passwordap"];
          Serial.println(passwordap);
          config.passwordap = passwordap;

          String ssid = doc["wifi"]["ssid"];
          config.ssid = ssid;
          Serial.println((String)config.ssid);

          String password = doc["wifi"]["password"];
          config.password = password;
          Serial.println((String)config.password);

          String access_point = doc["wifi"]["access_point"];
          config.access_point = doc["wifi"]["access_point"];
        }
        Serial.println("");
      }
    }

    configFile.close();
  }
}

const int ledPin = 2;
// Stores LED state
String ledState;
// Replaces placeholder with LED state value
String processor(const String &var)
{
  Serial.println(var);
  if (var == "STATE")
  {
    if (digitalRead(ledPin))
    {
      ledState = "RUNNING";
    }
    else
    {
      ledState = "IDLE";
    }
    Serial.print(ledState);
    return ledState;
  }
  if (var == "IP")
  {
    return ipToString(IP);
  }
  return String();
}

void moveSlider(int dir)
{
  if (dir == 1)
  {
    stepper->setSpeedInUs(1000); // the parameter is us/step !!!
    stepper->setAcceleration(100);
    stepper->move(2000);
  }
  else
  {
    stepper->setSpeedInUs(1000); // the parameter is us/step !!!
    stepper->setAcceleration(100);
    stepper->move(-2000);
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
  Wire.begin();

  Serial.print("Slider Init ...");
  readConfigFile();
  delay(2000);
  engine.init();

  stepper = engine.stepperConnectToPin(26);

  // Connect to Wi-Fi network with SSID and password

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

  // Encoder
  as5600.begin(4); //  set direction pin.
  as5600.setDirection(AS5600_CLOCK_WISE); // default, just be explicit.
  int b = as5600.isConnected();
  Serial.print("AS5600 Connected: ");
  Serial.println(b);

  // RTC Clock
  if (!rtc.begin())
  {
    Serial.println("Couldn't find RTC");
    while (1)
      ;
  }
  Serial.println("Real TIme CLock initialized");

  // SPIFFS initialisation
  //  Initialize SPIFFS
  if (!SPIFFS.begin(true))
  {
    Serial.println("An Error has occurred while mounting SPIFFS");
    return;
  }

  server.on("/", HTTP_GET, [](AsyncWebServerRequest *request)
            { request->send(SPIFFS, "/www/index.html", String(), false, processor); });
  // Route to load style.css file
  server.on("/css/style.css", HTTP_GET, [](AsyncWebServerRequest *request)
            { request->send(SPIFFS, "/www/css/style.css", "text/css"); });
  server.on("/css/bootstrap.min.css", HTTP_GET, [](AsyncWebServerRequest *request)
            { request->send(SPIFFS, "/www/css/bootstrap.min.css", "text/css"); });
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

  server.on("/images/icon-120.png", HTTP_GET, [](AsyncWebServerRequest *request)
            { request->send(SPIFFS, "/www/images/icon120.png", "image/png"); });

  server.on("/images/icon-240.png", HTTP_GET, [](AsyncWebServerRequest *request)
            { request->send(SPIFFS, "/www/images/icon-240.png", "image/png"); });

  server.on("/images/splash.jpg", HTTP_GET, [](AsyncWebServerRequest *request)
            { request->send(SPIFFS, "/www/images/splash.jpg", "image/jpeg"); });

  // Route to set GPIO to HIGH
  server.on("/on", HTTP_GET, [](AsyncWebServerRequest *request)
            {
    //    digitalWrite(ledPin, HIGH);
    moveSlider(1);
    request->send(SPIFFS, "/www/index.html", String(), false, processor); });

  // Route to set GPIO to LOW
  server.on("/off", HTTP_GET, [](AsyncWebServerRequest *request)
            {
    //    digitalWrite(ledPin, LOW);
    moveSlider(-1);
    request->send(SPIFFS, "/www/index.html", String(), false, processor); });
  // Send a GET request to <IP>/get?message=<message>
  server.on("/get", HTTP_GET, [](AsyncWebServerRequest *request)
            {
    //String message;
    if (request->hasParam(PARAM_MESSAGE)) {
      message = request->getParam(PARAM_MESSAGE)->value();
    } else if (request->hasParam(COMMAND_MOVE)) {
      message = request->getParam(COMMAND_MOVE)->value();
    } else {
      message = "No message sent";
    }
    Serial.print("Command received: ");
    Serial.println(message);
    request->send(200, "text/plain", "Hello, GET: " + message); });

  // Send a POST request to <IP>/post with a form field message set to <message>
  server.on("/post", HTTP_POST, [](AsyncWebServerRequest *request)
            {
    //String message;
    if (request->hasParam(PARAM_MESSAGE, true)) {
      message = request->getParam(PARAM_MESSAGE, true)->value();
    } else {
      message = "No message sent";
    }
    request->send(200, "text/plain", "Hello, POST: " + message); });

  server.onNotFound(notFound);
  ws.onEvent(onWsEvent);
  server.addHandler(&ws);
  server.begin();

  if (stepper)
  {
    stepper->setDirectionPin(27);
    stepper->setEnablePin(13);
    stepper->setAutoEnable(true);

    //   // If auto enable/disable need delays, just add (one or both):
    //   // stepper->setDelayToEnable(50);
    //   // stepper->setDelayToDisable(1000);
  }
}

//***********************************************************
//
//                         Loop
//
//***********************************************************
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

  delay(10);
}
