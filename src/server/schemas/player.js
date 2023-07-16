export const playerSchema = {
  id: {
    type: 'integer',
    default: 0,
    min: 0,
  },
  sawFreq: {
    type: 'float',
    default: 30,
    min: 0,
    max: 1000,
  },
  filterSlider: {
    type: 'float',
    default: 0,
    min: 0,
    max: 1,
  },
  filterFreq: {
    type: 'float',
    default: 10,
  },
  numHarm: {
    type: 'integer',
    default: 0,
  },
  volume: {
    type: 'float',
    default: 1,
    min: 0,
    max: 0.251189,
  },
  selectFreq: {
    type: 'any',
    default: ["30", "60", "120", "240", "90", "180", "360", "150", "300", "135", "270", "202.5", "405", "225", "450", "337.5"],
  },
};
