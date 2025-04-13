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

        rowSpots.push({
          level: levelNumber,
          row,
          index,
          spotSize: size,
          vehicle: null
        });
      }
      this.rows.push(rowSpots);
    }
  }

  parkVehicle(vehicle) {
    console.log("🚗 เข้า parkVehicle | ป้ายทะเบียน:", vehicle.licensePlate, "| ขนาด:", vehicle.size);

    for (const row of this.rows) {
      console.log("ROW : ",row)
      if (vehicle.size === VehicleSize.LARGE) {
        console.log("----BUS PARKING----")
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
          console.log("FINISH PARKING BUS")
          return group;
        }
      } else {
        console.log("----NORAML PARKING----")
        for (let spot of row) {
          console.log("🛠 ตรวจจุด", spot.index, "| ขนาด:", spot.spotSize, "| มีรถไหม:", !!spot.vehicle, "รถ: ", spot.vehicle);

          if (spot.vehicle === null && this._canFit(vehicle.size, spot.spotSize)) {
            console.log("✅ จอดได้ที่จุด:", spot.index);
            console.log("")
            spot.vehicle = vehicle;
            return [spot];
          }
        }
      }
    }

    console.log("❌ ไม่มีที่จอดที่เหมาะสม");
    return null;
  }

  unparkVehicle(licensePlate) {
    let removed = false;
    for (const row of this.rows) {
      for (let spot of row) {
        if (spot.vehicle && spot.vehicle.licensePlate === licensePlate) {
          spot.vehicle = null;
          removed = true;
        }
      }
    }
    return removed;
  }

  _find5ConsecutiveLargeSpots(row) {
    for (let i = 0; i <= row.length - 5; i++) {
      const group = row.slice(i, i + 5);
  
      const allFree = group.every(s => s.vehicle === null && s.spotSize === VehicleSize.LARGE);
  
      if (allFree) {
        return group;
      }
    }
    return null;
  }  

  _canFit(vehicleSize, spotSize) {
    console.log("🔎 ตรวจขนาด:", vehicleSize, "กับ", spotSize);

    if (vehicleSize === VehicleSize.MOTORCYCLE) return true;
    if (vehicleSize === VehicleSize.COMPACT) return spotSize !== VehicleSize.MOTORCYCLE;
    if (vehicleSize === VehicleSize.LARGE) return spotSize === VehicleSize.LARGE;
    return false;
  }
}
