
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


FastAccelStepperEngine engine = FastAccelStepperEngine();
FastAccelStepper *stepperSlide = NULL;
FastAccelStepper *stepperPan = NULL;
FastAccelStepper *stepperTilt = NULL;
FastAccelStepper *stepperFocus = NULL;

int commandStatus = 0;
int prevCommandStatus = -1;
Stepper_Motor slider_Motor;
Stepper_Motor pan_Motor;
Stepper_Motor tilt_Motor;
Stepper_Motor focus_motor;

IPAddress IP;

bool direction = false;
class CommandStatus
{
public:
  enum status
  {
    IDLE,
    HOMING,
    JOG,
    RUNNING,
    MARK_IN,
    MARK_OUT,
    GOTO_IN,
    GOTO_OUT,
    TIMELAPSE,
    VIDEO,
    FORCE_STOP

  };
};
class Axis
{
public:
  enum type
  {
    SLIDE,
    PAN,
    TILT,
    FOCUS
  };

private:
};
enum State
{
  IDLE,
  JOYSTICK_MOVE
};
struct Intervalometer_Cfg
{
    const float DEFAULT_RELEASE_TIME = 0.1;
    
    const int MANUAL_MODE = 0;
    const int BULB_MODE = 1;
    const int SINGLE_SHOOTING_DELAY = 1000; // time in ms to wait before starting shooting
    const byte SHOOTING_STARTED = 1;
    const byte SHOOTING_STOPPED = 0;

    float focusDelay = 0;
    int camSentinel = 0;
    float minDarkTime = 0.5;
    float releaseTime = DEFAULT_RELEASE_TIME;
    unsigned long previousMillis = 0;
    unsigned long runningTime = 0;
    float interval = 4.0;
    long shotsTotal = 0;
    int isRunning = 0;
    unsigned long bulbStopTime = 0;
    int shotsCount = 0; // Shots count since start of session
    int lastShotsCount = -1;
    unsigned long rampDuration = 10;    // ramping duration
    float rampTo = 0.0;                 // ramping interval
    unsigned long rampingStartTime = 0; // ramping start time
    unsigned long rampingEndTime = 0;   // ramping end time
    float intervalBeforeRamping = 0;    // interval before ramping
    int mode = MANUAL_MODE;             // MANUAL_MODE or BULB_MODE
    // Timer Interrupt
    byte cameraTriggerStop = SHOOTING_STOPPED;
    int exposureTriggerTime = 0; // Time to keep the camera trigger on in Timer Interrupt duration - 10 ms
};
