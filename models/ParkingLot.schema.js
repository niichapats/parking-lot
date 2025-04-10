import mongoose from 'mongoose';

const ParkingLotSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  levels: {
    type: Number,
    required: true
  },
  spots: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ParkingSpot'
  }]
});

export default mongoose.models.ParkingLot || mongoose.model('ParkingLot', ParkingLotSchema);
