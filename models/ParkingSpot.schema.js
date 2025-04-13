import mongoose from 'mongoose';

const ParkingSpotSchema = new mongoose.Schema({
  level: Number,
  row: Number,
  index: Number,
  spotSize: String,
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    default: null
  }
});

export default mongoose.models.ParkingSpot || mongoose.model('ParkingSpot', ParkingSpotSchema);
