import { Level } from './Level.js';

export class ParkingLot {
  constructor(numLevels, rowsPerLevel, spotsPerRow) {
    this.levels = [];
    for (let i = 0; i < numLevels; i++) {
      this.levels.push(new Level(i, rowsPerLevel, spotsPerRow));
    }
  }

  parkVehicle(vehicle) {
    for (let level of this.levels) {
      const spot = level.parkVehicle(vehicle);
      if (spot) {
        return spot; // ✅ คืน spot กลับ
      }
    }
    return null;
  }
  

  unparkVehicle(licensePlate) {
    for (let level of this.levels) {
      if (level.unparkVehicle(licensePlate)) {
        return true;
      }
    }
    return false;
  }
}
