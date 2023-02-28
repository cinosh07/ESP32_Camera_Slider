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
        SET_SLIDE_KINEMATIC,
        SET_PAN_KINEMATIC,
        SET_TILT_KINEMATIC,
        SET_FOCUS_KINEMATIC
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
        N_A  // Not Availlable

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