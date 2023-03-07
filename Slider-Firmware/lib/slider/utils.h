
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

int SPEED_US = 100;
int SPEED_MULTIPLICATOR = 10;
int previousSlideDir = -2;
double previousSlideSpeed = -2.00;
int ACCELL = 10000;
int HOME_SPEED = 300;
int SAFE_SPEED = 1000;
int HOME_SAFE_DISTANCE = 600;
int MOVE_AFTER_HOME_DISTANCE = 50;
long HOMING_DISTANCE = -60000;
int SAFE_DISTANCE_RECOVERY = 600;
int MIDDLE_POSITION = 29450;
int FAST_SPEED = 100;
int stepPerRevolution = 200;
int MICROSTEP = 32;


int getSpeedInUS(double speed)
{
  return round(((1 - (speed / 100)) + 0.1) * SPEED_US * SPEED_MULTIPLICATOR);
}

// ----------- HELPER METHODS -------------------------------------

/**
   Fill in leading zero to numbers in order to always have 2 digits
*/
String fillZero( int input ) {

  String sInput = String( input );
  if ( sInput.length() < 2 ) {
    sInput = "0";
    sInput.concat( String( input ));
  }
  return sInput;
}

String printFloat(float f, int total, int dec) {

  static char dtostrfbuffer[8];
  String s = dtostrf(f, total, dec, dtostrfbuffer);
  return s;
}

String printInt( int i, int total) {
  float f = i;
  static char dtostrfbuffer[8];
  String s = dtostrf(f, total, 0, dtostrfbuffer);
  return s;
}

void rebootESP(String message) {
  Serial.print("Rebooting Controller: "); 
  Serial.println(message);
  ESP.restart();
}
// Make size of files human readable
// source: https://github.com/CelliesProjects/minimalUploadAuthESP32
String humanReadableSize(const size_t bytes) {
  if (bytes < 1024) return String(bytes) + " B";
  else if (bytes < (1024 * 1024)) return String(bytes / 1024.0) + " KB";
  else if (bytes < (1024 * 1024 * 1024)) return String(bytes / 1024.0 / 1024.0) + " MB";
  else return String(bytes / 1024.0 / 1024.0 / 1024.0) + " GB";
}