import { Vehicle } from './Vehicle.js';
import { VehicleSize } from './VehicleSize.js';

export class Car extends Vehicle {
  constructor(licensePlate) {
    super(licensePlate, VehicleSize.COMPACT);
  }
}