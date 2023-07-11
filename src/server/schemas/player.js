export const playerSchema = {
  id: {
    type: 'integer',
    default: 0,
    min: 0,
  },
  freq: {
    type: 'float',
    default: 100,
    min: 0,
    max: 1000,
  },
  filter: {
    type: 'float',
    default: 0,
    min: 0,
    max: 1,
  },
  volume: {
    type: 'float',
    default: 0,
    min: 0,
    max: 1,
  },
};
