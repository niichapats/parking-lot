import dbConnect from '@/lib/mongodb';
import Vehicle from '@/models/Vehicle.schema';
import ParkingSpot from '@/models/ParkingSpot.schema';
import ParkingManager from '@/models/ParkingManager';
import { Vehicle as VehicleClass } from '@/models/Vehicle';

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

        // 🧠 Map UI size to internal model size
        let mappedSize = size;
        if (size === 'car') mappedSize = 'compact';
        if (size === 'bus') mappedSize = 'large';

        // ✅ Find or create the vehicle in DB
        let vehicleDoc = await Vehicle.findOne({ licensePlate });
        if (!vehicleDoc) {
          vehicleDoc = await Vehicle.create({ licensePlate, size: mappedSize });
        }

        // 🧠 Create class instance (used in logic layer)
        const vehicle = new VehicleClass(vehicleDoc.licensePlate, vehicleDoc.size);
        vehicle._id = vehicleDoc._id;

        // 🧠 Load current spots from DB → memory
        const dbSpots = await ParkingSpot.find({}).populate('vehicle');
        ParkingManager.initFromData(dbSpots);

        // ✅ Add vehicle (returns list of spot(s) assigned)
        const parkedSpots = ParkingManager.addVehicle(vehicle);
        console.log("P A R K S P O T : ", parkedSpots)
        if (!parkedSpots || parkedSpots.length === 0) {
          return res.status(404).json({ success: false, message: "No available spot" });
        }

        // ✅ Sync _id เข้า memory (important for ._id in DB)
        for (const spot of ParkingManager.getSpots()) {
          if (spot.vehicle && spot.vehicle.licensePlate === licensePlate) {
            spot.vehicle._id = vehicle._id;
          }
        }

        // ✅ Update DB slots that are occupied
        const updated = [];
        for (const spot of ParkingManager.getSpots()) {
          if (spot.vehicle && spot.vehicle._id?.toString() === vehicle._id.toString()) {
            await ParkingSpot.findOneAndUpdate(
              { level: spot.level, row: spot.row, index: spot.index },
              { vehicle: vehicle._id }
            );
            updated.push(`${spot.level}-${spot.row}-${spot.index}`);
          }
        }

        console.log("📌 Updated DB spots for:", vehicle?.licensePlate ?? 'unknown', "=>", updated);


        // ✅ Re-sync memory with latest DB state to prevent stale cache
        const freshSpots = await ParkingSpot.find({}).populate('vehicle');
        ParkingManager.initFromData(freshSpots);

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
