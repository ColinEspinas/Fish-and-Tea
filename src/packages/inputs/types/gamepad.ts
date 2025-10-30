export const StandardGamepadMapping = {
  buttons: {
    BUTTON_BOTTOM: 0,
    BUTTON_RIGHT: 1,
    BUTTON_LEFT: 2,
    BUTTON_TOP: 3,
    BUMPER_LEFT: 4,
    BUMPER_RIGHT: 5,
    TRIGGER_LEFT: 6,
    TRIGGER_RIGHT: 7,
    BUTTON_CONTROL_LEFT: 8,
    BUTTON_CONTROL_RIGHT: 9,
    BUTTON_JOYSTICK_LEFT: 10,
    BUTTON_JOYSTICK_RIGHT: 11,
    D_PAD_UP: 12,
    D_PAD_BOTTOM: 13,
    D_PAD_LEFT: 14,
    D_PAD_RIGHT: 15,
    BUTTON_CONTROL_MIDDLE: 16,
  },

  // negative left and up, positive right and down
  axis: {
    JOYSTICK_LEFT_HORIZONTAL: 0,
    JOYSTICK_LEFT_VERTICAL: 1,
    JOYSTICK_RIGHT_HORIZONTAL: 2,
    JOYSTICK_RIGHT_VERTICAL: 3,
  },
} as const

export type GamepadAxisKeys = keyof typeof StandardGamepadMapping.axis
export type GamepadButtonKeys = keyof typeof StandardGamepadMapping.buttons
