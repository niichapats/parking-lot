import { Vehicle } from './Vehicle.js';
import { VehicleSize } from './VehicleSize.js';

export class Bus extends Vehicle {
  constructor(licensePlate) {
    super(licensePlate, VehicleSize.LARGE);
  }
}