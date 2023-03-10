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

// *********************************************************************
// References
// *********************************************************************

// https://techtutorialsx.com/2018/08/14/esp32-async-http-web-server-websockets-introduction/
// https://techtutorialsx.com/2017/11/05/esp32-arduino-websocket-server-receiving-and-parsing-json-content/
// https://techtutorialsx.com/2018/09/11/esp32-arduino-web-server-sending-data-to-javascript-client-via-websocket/
// https://www.chartjs.org/docs/latest/samples/information.html
// https://getbootstrap.com/docs/5.1/
// http://wiki.fluidnc.com/en/hardware/esp32_pin_reference  //TODO Essayer de faire une config qui fonctionne avec ce board
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
// https://randomnerdtutorials.com/esp8266-nodemcu-websocket-server-arduino/
// https://forum.arduino.cc/t/problems-processing-a-character-string/694619
// https://davidwalsh.name/wake-lock-shim#:~:text=To%20start%20the%20no%20sleep,mouse%20or%20touch%20handler)%20document.
// https://github.com/richtr/NoSleep.js
// https://forum.arduino.cc/t/can-a-sketch-modify-a-defined-symbol-in-a-library/90432
// https://github.com/jantimon/html-webpack-plugin
// https://github.com/Jaid/inject-body-webpack-plugin
// https://whatwebcando.today/articles/handling-service-worker-updates/
// https://web.dev/learn/pwa/service-workers/#registration_and_scope
// https://forum.arduino.cc/t/multi-arduino-serial-communication-with-max232/211474
// https://github.com/sleemanj/DS3231_Simple/blob/master/examples/z1_TimeAndDate/SetDateTime/SetDateTime.ino
// https://github.com/sleemanj/DS3231_Simple/blob/master/examples/z2_Alarms/Alarm/Alarm.ino
// https://forum.arduino.cc/t/using-millis-for-timing-a-beginners-guide/483573
// https://www.arduino.cc/reference/en/language/functions/time/millis/
// https://github.com/smford/esp32-asyncwebserver-fileupload-example/blob/master/example-01/example-01.ino
// https://circuitdigest.com/microcontroller-projects/esp32-timers-and-timer-interrupts
// https://www.unixtimestamp.com/
// https://github.com/smford/esp32-asyncwebserver-fileupload-example
// https://arduinojson.org/v6/how-to/append-to-a-file/
// https://github.com/me-no-dev/ESPAsyncWebServer/issues/195
// https://www.jqueryscript.net/form/Form-JSON-Schema.html


// Libraries
#include <Arduino.h>
#include "esp_task_wdt.h"
#include "FastAccelStepper.h"
#include <Wire.h>
#include <AsyncTCP.h>
#include <ESPAsyncWebServer.h>
#include "ArduinoJson.h"
#include "SPIFFS.h"

// Firmware code
#include "definitions.h"
#include "variables.h"
#include "utils.h"
#include "serial_messages.h"
#include <encoders.h>
#include "clock.h"
#include "web_server.h"
#include "networking.h"
