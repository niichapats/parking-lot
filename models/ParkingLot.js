import { Level } from './Level.js';

export class ParkingLot {
  constructor(numLevels, numRowsPerLevel, spotsPerRow) {
    this.levels = [];
    for (let i = 0; i < numLevels; i++) {
      this.levels.push(new Level(i, numRowsPerLevel, spotsPerRow));
    }
  }

  parkVehicle(vehicle) {
    for (const level of this.levels) {
      if (level.parkVehicle(vehicle)) {
        return true;
      }
    }
    return false; // no spot
  }

  unparkVehicle(licensePlate) {
    for (const level of this.levels) {
      level.unparkVehicle(licensePlate);
    }
  }
}
