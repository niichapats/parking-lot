import { Level } from './Level.js';

export class ParkingLot {
  constructor(numLevels, rowsPerLevel, spotsPerRow) {
    this.levels = [];
    for (let i = 0; i < numLevels; i++) {
      this.levels.push(new Level(i, rowsPerLevel, spotsPerRow));
    }
  }

  // ✅ ความรับผิดชอบเรื่องการจอด
  parkVehicle(vehicle) {
    for (let level of this.levels) {
      const result = level.parkVehicle(vehicle);
      if (result) {
        return [result]; // ✅ wrap ให้เป็น array
      }
    }
    return null;
  }
  

  // ✅ ถอดรถ
  unparkVehicle(licensePlate) {
    for (let level of this.levels) {
      if (level.unparkVehicle(licensePlate)) {
        return true;
      }
    }
    return false;
  }

  // ✅ เพิ่ม method เพื่อให้ Manager ไม่ต้องแตะโครงสร้างภายใน
  setVehicleAt(level, row, index, vehicle) {
    this.levels[level].rows[row][index].vehicle = vehicle;
  }

  getAllSpots() {
    return this.levels.flatMap(level => level.rows.flatMap(row => row));
  }
}
