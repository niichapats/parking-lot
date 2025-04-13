import { ParkingLot } from './ParkingLot.js';
import { Vehicle } from './Vehicle.js';
import { Motorcycle } from './Motorcycle.js';
import { Car } from './Car.js';
import { Bus } from './Bus.js';

class ParkingManager {
  constructor() {
    this.lot = null;
  }

  initFromData(mongoSpots, config = { levels: 3, rows: 1, spotsPerRow: 10 }) {
    const { levels, rows, spotsPerRow } = config;
    this.lot = new ParkingLot(levels, rows, spotsPerRow);

    for (const spot of mongoSpots) {
      const vehicleData = spot.vehicle;
      if (vehicleData) {
        let vehicle;
        if (vehicleData.size === 'motorcycle') vehicle = new Motorcycle(vehicleData.licensePlate);
        else if (vehicleData.size === 'car') vehicle = new Car(vehicleData.licensePlate);
        else if (vehicleData.size === 'bus') vehicle = new Bus(vehicleData.licensePlate);
        else vehicle = new Vehicle(vehicleData.licensePlate, vehicleData.size);

        vehicle._id = vehicleData._id; // ให้ _id เพื่อ map กลับ Mongo ได้
        this.lot.parkVehicle(vehicle);
      }
    }
  }

  addVehicle(licensePlate, type) {
    let vehicle;
    if (type === 'motorcycle') vehicle = new Motorcycle(licensePlate);
    else if (type === 'car') vehicle = new Car(licensePlate);
    else if (type === 'bus') vehicle = new Bus(licensePlate);
    else return null;
  
    const spot = this.lot.parkVehicle(vehicle);
  
    if (spot && spot.vehicle) {
      // หา level, row, index ที่แท้จริงจาก lot
      for (let l = 0; l < this.lot.levels.length; l++) {
        const level = this.lot.levels[l];
        for (let r = 0; r < level.rows.length; r++) {
          const row = level.rows[r];
          for (let i = 0; i < row.length; i++) {
            const s = row[i];
            if (s === spot) {
              console.log("✅ Found spot at:", l, r, i);
              return { level: l, row: r, index: i };
            }
          }
        }
      }
    }
  
    return null;
  }
  
  removeVehicle(licensePlate) {
    this.lot.unparkVehicle(licensePlate);
  }

  getSpots() {
    return this.lot.levels.flatMap(level =>
      level.rows.flatMap(row => row)
    );
  }
}

export default new ParkingManager();