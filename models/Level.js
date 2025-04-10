import { ParkingSpot } from './ParkingSpot.js';
import { VehicleSize } from './VehicleSize.js';

export class Level {
  constructor(levelNumber, numRows, spotsPerRow) {
    this.levelNumber = levelNumber;
    this.rows = [];

    for (let r = 0; r < numRows; r++) {
      const row = [];
      for (let i = 0; i < spotsPerRow; i++) {
        let type = VehicleSize.COMPACT;
        if (i < 2) type = VehicleSize.MOTORCYCLE;
        else if (i >= spotsPerRow - 5) type = VehicleSize.LARGE;
        row.push(new ParkingSpot(type, levelNumber, r, i));
      }
      this.rows.push(row);
    }
  }

  parkVehicle(vehicle) {
    if (vehicle.size === 'large') {
      return this._parkBus(vehicle);
    }

    for (const row of this.rows) {
      for (const spot of row) {
        if (spot.park(vehicle)) return true;
      }
    }

    return false; // no spot
  }

  _parkBus(bus) {
    for (const row of this.rows) {
      for (let i = 0; i <= row.length - 5; i++) {
        const segment = row.slice(i, i + 5);
        const canPark = segment.every(
          (spot) => spot.type === 'large' && spot.isAvailable()
        );

        if (canPark) {
          segment.forEach((spot) => spot.park(bus));
          return true;
        }
      }
    }
    return false;
  }

  unparkVehicle(licensePlate) {
    for (const row of this.rows) {
      for (const spot of row) {
        if (spot.vehicle?.licensePlate === licensePlate) {
          spot.leave();
        }
      }
    }
  }
}
