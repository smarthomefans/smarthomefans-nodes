const plug = {
  2: {
    1: "on", // bool
    3: "state", //1: Idle 2: Busy
  },
};

const sensor = {
  2: {
    1: "temperature",
    2: "relative-humidity",
    7: "pm2.5-density",
    8: "atmospheric-pressure",
  },
  3: {
    1: "battery-level",
    3: "voltage",
  },
};

const colorLight = {
  2: {
    1: "on",
    3: "brightness",
    4: "color",
  },
  3: {
    1: "battery-level",
    3: "voltage",
  },
};

const switchType = {
  2: {
    1: "on",
  },
};

const fv = {
  2: {
    1: "fault",
    2: "motor-control",
    4: "state",
    6: "current-position",
    7: "target-position",
    8: "motor-reverse",
  },
};

const conditioner = {
  2: {
    1: "on",
    2: "mode",
    3: "fault",
    4: "target-temperature",
    5: "state",
    6: "target-humidity",
    7: "eco",
    9: "heater",
    10: "dryer",
    11: "sleep-mode",
  },
  3: {
    1: "fanOn",
    2: "fan-level",
    3: "horizontal-swing",
    4: "vertical-swing",
  },
  4: {
    1: "relative-humidity",
    4: "pm2.5-density",
    6: "atmospheric-pressure",
    7: "temperature",
  },
  6: {
    1: "lightOn",
  },
};

const fan = {
  2: {
    1: "on",
    2: "fan-level",
    3: "horizontal-swing",
    4: "vertical-swing",
    8: "status",
    9: "fan-level",
  },
  3: {
    1: "physical-controls-locked",
  },
  4: {
    1: "battery-level",
    3: "voltage",
  },
};

const temperatureLight = {
  2: {
    1: "on",
    3: "brightness",
    4: "color-temperature",
  },
  3: {
    1: "battery-level",
    3: "voltage",
  },
};

module.exports = {plug, sensor, colorLight, switchType, fan, fv, conditioner, temperatureLight};
