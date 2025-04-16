import { VehicleSize } from './VehicleSize.js';

export class ParkingSpot {
  constructor(type, level, row, index) {
    this.type = type; // VehicleSize
    this.level = level;
    this.row = row;
    this.index = index;
    this.vehicle = null;
  }

  canFit(vehicle) {
    if (vehicle.size === VehicleSize.MOTORCYCLE) return true;
    if (vehicle.size === VehicleSize.COMPACT) return this.type !== VehicleSize.MOTORCYCLE;
    if (vehicle.size === VehicleSize.LARGE) return this.type === VehicleSize.LARGE;
    return false;
  }

  park(vehicle) {
    if (this.canFit(vehicle) && !this.vehicle) {
      this.vehicle = vehicle;
      return true;
    }
    return false;
  }

  leave() {
    this.vehicle = null;
  }

  isAvailable() {
    return this.vehicle === null;
  }

  toString() {
    return `Spot(${this.level}-${this.row}-${this.index} | ${this.type} | ${this.vehicle ? this.vehicle.licensePlate : 'ว่าง'})`;
  }
}
