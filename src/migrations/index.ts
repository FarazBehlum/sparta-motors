import * as migration_20260730_220544_initial from './20260730_220544_initial';
import * as migration_20260805_234713_category_rename from './20260805_234713_category_rename';
import * as migration_20260821_024912_add_tank_garbage_specialty from './20260821_024912_add_tank_garbage_specialty';

export const migrations = [
  {
    up: migration_20260730_220544_initial.up,
    down: migration_20260730_220544_initial.down,
    name: '20260730_220544_initial',
  },
  {
    up: migration_20260805_234713_category_rename.up,
    down: migration_20260805_234713_category_rename.down,
    name: '20260805_234713_category_rename',
  },
  {
    up: migration_20260821_024912_add_tank_garbage_specialty.up,
    down: migration_20260821_024912_add_tank_garbage_specialty.down,
    name: '20260821_024912_add_tank_garbage_specialty'
  },
];
