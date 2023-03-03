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

class CommandType
{
public:
    enum default_type
    {
        COMMAND_TYPE,
        COMMAND
    };
    enum type
    {
        JOYSTICK,
        CLOCK,
        HOME,
        GOTO_IN,
        GOTO_OUT,
        GOTO_KEYFRAME,
        MARK_IN,
        MARK_OUT,
        MARK_KEYFRAME,
        DEL_KEYFRAME,
        ADD_KEYFRAME,
        SET_SLAVE_MODE,
        SET_TIMELAPSE_MODE,
        SET_VIDEO_MODE,
        SET_SLIDE_KINEMATIC,
        SET_PAN_KINEMATIC,
        SET_TILT_KINEMATIC,
        SET_FOCUS_KINEMATIC,
        TIMELAPSE,

    };

private:
};

class TimelapseStatus {
    public: 
    enum type {
        IDLE,
        RUNNING
    };
};
class TimelapseCommand {
    public: 
    enum type {
        IDLE,
        START,
        STOP,
        PAUSE,
        TAKE_SINGLE_SHOT,
        SET_INTERVAL,
        SET_NUMBER_SHOTS,
        SET_SHOTS_DURATION,
        SET_DARK_TIME,
        SET_DELAY_TIME,
        SET_PRE_FOCUS_TIME,
        SET_CAM_WAKE_UP_INTERVAL,
        SET_START_INTERVAL,
        SET_START_TIME_ALARM,
        GET_START_TIME_ALARM,
        CLEAR_START_TIME_ALARM,
        SET_RAMP_DURATION,
        SET_RAMP_TO,
        SET_RAMP_SHOTS_TOTAL,
        SET_RAMP_ENABLED,
    };
};
class TimelapseCommandType
{
public:
    enum type
    {
        COMMAND_TYPE,
        COMMAND,
        VALUE,
        N_A4, // Not Availlable
        N_A3, // Not Availlable
        N_A2, // Not Availlable
        N_A1, // Not Availlable
        N_A // Not Availlable

    };

private:
};
//SET_START_TIME_ALARM Type
class TimelapseCommandStartTimeType
{
public:
    enum type
    {
        COMMAND_TYPE,
        COMMAND,
        YEAR,
        MONTH,
        DAY,
        HOUR,
        MINUTE,
        SECOND// Not Availlable

    };

private:
};
 class JoystickCommand
{
public:
    enum type
    {
        JOYSTICK_PAN_MOVE,
        JOYSTICK_TILT_MOVE,
        JOYSTICK_SLIDE_MOVE,
        JOYSTICK_FOCUS_MOVE
    };

private:
};

class JoystickCommandType
{
public:
    enum type
    {
        COMMAND_TYPE,
        COMMAND,
        SPEED,
        DIR,
        ACCEL,
        MULTIPLICATOR,
        SPEED_SCALING,
        N_A // Not Availlable

    };

private:
};

class ClockCommandType
{
public:
    enum type
    {
        COMMAND_TYPE,
        COMMAND,
        YEAR,
        MONTH,
        DAY,
        HOUR,
        MINUTE,
        SECOND
    };

private:
};
class ClockCommand
{
public:
    enum type
    {
        SET_CLOCK_TIME,
        GET_CLOCK_TIME
    };

private:
};

class Axis {
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