import dbConnect from '@/lib/mongodb';
import ParkingSpot from '@/models/ParkingSpot.schema';
import { VehicleSize } from '@/models/VehicleSize';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  await dbConnect();

  const levels = 3;
  const rowsPerLevel = 1;
  const spotsPerRow = 10;

  const spots = [];

  for (let level = 1; level <= levels; level++) {
    for (let row = 0; row < rowsPerLevel; row++) {
      for (let index = 0; index < spotsPerRow; index++) {
        let size = VehicleSize.COMPACT;
        if (index < 2) size = VehicleSize.MOTORCYCLE;
        else if (index >= spotsPerRow - 5) size = VehicleSize.LARGE;

        spots.push({
          level,
          row,
          index,
          spotSize: size,
          vehicle: null
        });
      }
    }
  }

  await ParkingSpot.deleteMany({});
  await ParkingSpot.insertMany(spots);

  return res.status(200).json({ message: 'Setup complete', count: spots.length });
}
