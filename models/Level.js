import { ParkingSpot } from './ParkingSpot.js';
import { VehicleSize } from './VehicleSize.js';

export class Level {
  constructor(levelNumber, rows, spotsPerRow) {
    this.levelNumber = levelNumber;
    this.rows = [];

    for (let row = 0; row < rows; row++) {
      const rowSpots = [];
      for (let index = 0; index < spotsPerRow; index++) {
        let size = VehicleSize.COMPACT;
        if (index < 2) size = VehicleSize.MOTORCYCLE;
        else if (index >= spotsPerRow - 5) size = VehicleSize.LARGE;

        rowSpots.push(new ParkingSpot(size, levelNumber, row, index));
      }
      this.rows.push(rowSpots);
    }
  }

  parkVehicle(vehicle) {
    console.log("-- Park Vehicle | License Plate:", vehicle.licensePlate);

    for (const row of this.rows) {

      if (vehicle.size === VehicleSize.LARGE) {
        const group = this._find5ConsecutiveLargeSpots(row);
        if (group) {
          const sharedVehicle = {
            _id: vehicle._id,
            licensePlate: vehicle.licensePlate,
            size: vehicle.size
          };
          group.forEach(s => {
            s.vehicle = sharedVehicle;
          });
          return group;
        }
      } else {
        for (let spot of row) {
          if (spot.isAvailable() && this._canFit(vehicle.size, spot.type)) {
            spot.vehicle = vehicle;
            return [spot];
          }
        }
      }
    }

    console.log("No spot available");
    return null;
  }

  unparkVehicle(licensePlate) {
    let removed = false;
    for (const row of this.rows) {
      for (let spot of row) {
        if (spot.vehicle && spot.vehicle.licensePlate === licensePlate) {
          spot.leave();
          removed = true;
        }
      }
    }
    return removed;
  }

  _find5ConsecutiveLargeSpots(row) {
    for (let i = 0; i <= row.length - 5; i++) {
      const group = row.slice(i, i + 5);
      const allFree = group.every(s => s.isAvailable() && s.type === VehicleSize.LARGE);

      if (allFree) {
        return group;
      }
    }
    return null;
  }

  _canFit(vehicleSize, spotSize) {
    if (vehicleSize === VehicleSize.MOTORCYCLE) return true;
    if (vehicleSize === VehicleSize.COMPACT) return spotSize !== VehicleSize.MOTORCYCLE;
    if (vehicleSize === VehicleSize.LARGE) return spotSize === VehicleSize.LARGE;
    return false;
  }
}
