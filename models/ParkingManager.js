import { ParkingLot } from './ParkingLot.js';
import { Vehicle } from './Vehicle.js';
import { Motorcycle } from './Motorcycle.js';
import { Car } from './Car.js';
import { Bus } from './Bus.js';

class ParkingManager {
    constructor() {
        this.lot = null;
    }

    initFromData(mongoSpots, config = { levels: 3, rows: 2, spotsPerRow: 10 }) {
        const { levels, rows, spotsPerRow } = config;
        this.lot = new ParkingLot(levels, rows, spotsPerRow);

        for (const spot of mongoSpots) {
            const vehicleData = spot.vehicle;
            if (vehicleData) {
                let vehicle;
                if (vehicleData.size === 'motorcycle') {
                    vehicle = new Motorcycle(vehicleData.licensePlate);
                } else if (vehicleData.size === 'compact') {
                    vehicle = new Car(vehicleData.licensePlate);
                } else if (vehicleData.size === 'large') {
                    vehicle = new Bus(vehicleData.licensePlate);
                } else {
                    vehicle = new Vehicle(vehicleData.licensePlate, vehicleData.size);
                }

                vehicle._id = vehicleData._id;

                this.lot.setVehicleAt(spot.level, spot.row, spot.index, vehicle);
            }
        }
    }

    addVehicle(vehicle) {
        const spots = this.lot.parkVehicle(vehicle);
        return spots || null;
    }

    removeVehicle(licensePlate) {
        this.lot.unparkVehicle(licensePlate);
    }

    getSpots() {
        return this.lot.getAllSpots();
    }
}

export default new ParkingManager();
