import { Vehicle } from './Vehicle.js';
import { VehicleSize } from './VehicleSize.js';

export class Motorcycle extends Vehicle {
  constructor(licensePlate) {
    super(licensePlate, VehicleSize.MOTORCYCLE);
  }
}