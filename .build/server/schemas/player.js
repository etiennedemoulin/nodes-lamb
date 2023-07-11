export const playerSchema = {
  id: {
    type: 'integer',
    default: 0,
    min: 0
  },
  sawFreq: {
    type: 'float',
    default: 100,
    min: 0,
    max: 1000
  },
  filterSlider: {
    type: 'float',
    default: 0,
    min: 0,
    max: 1
  },
  filterFreq: {
    type: 'float',
    default: 0
  },
  numHarm: {
    type: 'integer',
    default: 0
  },
  volume: {
    type: 'float',
    default: 0,
    min: 0,
    max: 1
  },
  selectFreq: {
    type: 'any',
    default: ["30", "60", "120", "240", "90", "180", "360", "150", "300", "135", "270", "202.5", "405", "225", "450", "337.5"]
  }
};
//# sourceMappingURL=./player.js.map