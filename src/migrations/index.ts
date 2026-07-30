import * as migration_20260730_220544_initial from './20260730_220544_initial';

export const migrations = [
  {
    up: migration_20260730_220544_initial.up,
    down: migration_20260730_220544_initial.down,
    name: '20260730_220544_initial'
  },
];
