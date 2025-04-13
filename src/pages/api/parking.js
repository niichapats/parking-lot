import dbConnect from '@/lib/mongodb';
import Vehicle from '@/models/Vehicle.schema';
import ParkingSpot from '@/models/ParkingSpot.schema';
import ParkingManager from '@/models/ParkingManager';

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

        let mappedSize = size;
        if (size === 'car') mappedSize = 'compact';
        if (size === 'bus') mappedSize = 'large';


        let vehicle = await Vehicle.findOne({ licensePlate });

        if (!vehicle) {
          vehicle = await Vehicle.create({ licensePlate,  size: mappedSize });
        }

        const dbSpots = await ParkingSpot.find({}).populate('vehicle');
        ParkingManager.initFromData(dbSpots);

        const parkedSpot = ParkingManager.addVehicle(licensePlate, size);

        console.log("🧩 parkedSpot =", parkedSpot);
        console.log("📍 level =", parkedSpot?.level);
        console.log("📍 row =", parkedSpot?.row);
        console.log("📍 index =", parkedSpot?.index);

        if (!parkedSpot) {
          return res.status(404).json({ success: false, message: "No available spot" });
        }

        console.log("🎯 PARK VEHICLE:", licensePlate, size);
        console.log("➡️  vehicle._id = ", vehicle._id);
        console.log("📌 parked at spot = ", parkedSpot);

        // await ParkingSpot.findOneAndUpdate(
        //   { level: parkedSpot.level, row: parkedSpot.row, index: parkedSpot.index },
        //   { vehicle: vehicle._id },
        //   { new: true }
        // );

        const spot = await ParkingSpot.findOne({
            level: parkedSpot.level,
            row: parkedSpot.row,
            index: parkedSpot.index
          });
          
          if (!spot) {
            console.error('❌ ไม่เจอ ParkingSpot ใน Mongo สำหรับตำแหน่งนี้:', parkedSpot);
            return res.status(500).json({ success: false, error: 'Cannot find spot in DB' });
          }
          
          spot.vehicle = vehicle._id;
          await spot.save();
          
          console.log("✅ Vehicle saved in spot:", spot);
          
          
          

        return res.status(201).json({ success: true });
      } catch (err) {
        console.error('❌ Parking error:', err);
        return res.status(500).json({ success: false, error: err.message });
      }

    case 'DELETE':
      try {
        const { licensePlate } = req.body;
        const vehicle = await Vehicle.findOne({ licensePlate });

        if (!vehicle) {
          return res.status(404).json({ success: false, message: "Vehicle not found" });
        }

        const dbSpots = await ParkingSpot.find({}).populate('vehicle');
        ParkingManager.initFromData(dbSpots);
        ParkingManager.removeVehicle(licensePlate);

        const updatedSpots = ParkingManager.getSpots();

        for (const spot of updatedSpots) {
          await ParkingSpot.findOneAndUpdate(
            { level: spot.level, row: spot.row, index: spot.index },
            { vehicle: spot.vehicle ? spot.vehicle._id : null }
          );
        }

        return res.status(200).json({ success: true });
      } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
      }

    default:
      res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}
