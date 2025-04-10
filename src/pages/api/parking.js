import dbConnect from '@/lib/mongodb';
import Vehicle from '@/models/Vehicle.schema';
import ParkingSpot from '@/models/ParkingSpot.schema';

export default async function handler(req, res) {
  await dbConnect();
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const spots = await ParkingSpot.find({}).populate('vehicle');
        return res.status(200).json({ success: true, spots });
      } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
      }

    case 'POST':
      try {
        const { licensePlate, size } = req.body;
        let vehicle = await Vehicle.findOne({ licensePlate });

        if (!vehicle) {
          vehicle = await Vehicle.create({ licensePlate, size });
        }

        const spot = await ParkingSpot.findOne({
          vehicle: null,
          spotSize: { $in: [size] }
        });

        if (!spot) {
          return res.status(404).json({ success: false, message: "No available spot" });
        }

        spot.vehicle = vehicle._id;
        await spot.save();

        return res.status(201).json({ success: true, data: spot });
      } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
      }

    case 'DELETE':
      try {
        const { licensePlate } = req.body;
        const vehicle = await Vehicle.findOne({ licensePlate });
        if (!vehicle) {
          return res.status(404).json({ success: false, message: "Vehicle not found" });
        }

        const spot = await ParkingSpot.findOne({ vehicle: vehicle._id });
        if (!spot) {
          return res.status(404).json({ success: false, message: "Spot not found" });
        }

        spot.vehicle = null;
        await spot.save();
        return res.status(200).json({ success: true, message: "Vehicle unparked" });
      } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
      }

    default:
      res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}
