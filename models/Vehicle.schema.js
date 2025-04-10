import mongoose from 'mongoose';
import { VehicleSize } from './VehicleSize.js';

const VehicleSchema = new mongoose.Schema({
  licensePlate: {
    type: String,
    required: true,
    unique: true
  },
  size: {
    type: String,
    enum: Object.values(VehicleSize),
    required: true
  }
});

export default mongoose.models.Vehicle || mongoose.model('Vehicle', VehicleSchema);