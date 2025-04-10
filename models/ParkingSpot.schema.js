import mongoose from 'mongoose';
import { VehicleSize } from './VehicleSize.js';

const ParkingSpotSchema = new mongoose.Schema({
  level: Number,
  row: Number,
  index: Number,
  spotSize: {
    type: String,
    enum: Object.values(VehicleSize),
    required: true
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    default: null
  }
});

export default mongoose.models.ParkingSpot || mongoose.model('ParkingSpot', ParkingSpotSchema);