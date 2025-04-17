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
            const result = level.parkVehicle(vehicle);
        if (Array.isArray(result) && result.length > 0) {
            return result;
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

    setVehicleAt(level, row, index, vehicle) {
        this.levels[level].rows[row][index].vehicle = vehicle;
    }

    getAllSpots() {
        return this.levels.flatMap(level => level.rows.flatMap(row => row));
    }
}
