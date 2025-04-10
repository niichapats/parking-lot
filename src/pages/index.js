import { useEffect, useState } from 'react';

export default function Home() {
  const [spots, setSpots] = useState([]);
  const [form, setForm] = useState({ licensePlate: '', size: 'compact' });
  const [unparkPlate, setUnparkPlate] = useState('');

  // 🟢 Auto setup when no spots found
  useEffect(() => {
    async function init() {
      const res = await fetch('/api/parking');
      const data = await res.json();

      if ((data.spots || []).length === 0) {
        await fetch('/api/setup', { method: 'POST' });
        console.log('✅ Auto setup done');
      }

      fetchSpots();
    }

    init();
  }, []);

  // 🔁 Fetch spot data
  async function fetchSpots() {
    const res = await fetch('/api/parking');
    const data = await res.json();
    setSpots(data.spots || []);
  }

  // 🚗 Park vehicle
  async function handlePark() {
    await fetch('/api/parking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });

    setForm({ licensePlate: '', size: 'compact' });
    fetchSpots();
  }

  // 🛑 Unpark vehicle
  async function handleUnpark() {
    await fetch('/api/parking', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ licensePlate: unparkPlate })
    });

    setUnparkPlate('');
    fetchSpots();
  }

  // 🧱 Group spots by level
  const groupedByLevel = spots.reduce((acc, spot) => {
    acc[spot.level] = acc[spot.level] || [];
    acc[spot.level].push(spot);
    return acc;
  }, {});

  return (
    <div className="p-6">
      {/* 🔧 Optional: Manual setup */}
      <button
        className="bg-yellow-500 text-white px-4 py-2 rounded mb-4"
        onClick={async () => {
          await fetch('/api/setup', { method: 'POST' });
          alert('Setup complete');
          fetchSpots();
        }}
      >
        🔧 Setup Parking Lot
      </button>

      <h1 className="text-2xl font-bold mb-4">🚗 Parking Lot System</h1>

      {/* 📝 PARK FORM */}
      <div className="mb-6 p-4 border rounded bg-gray-50">
        <h2 className="font-semibold mb-2">📝 Park a Vehicle</h2>
        <input
          className="border p-2 mr-2"
          placeholder="License Plate"
          value={form.licensePlate}
          onChange={(e) => setForm({ ...form, licensePlate: e.target.value })}
        />
        <select
          className="border p-2 mr-2"
          value={form.size}
          onChange={(e) => setForm({ ...form, size: e.target.value })}
        >
          <option value="motorcycle">Motorcycle</option>
          <option value="compact">Compact</option>
          <option value="large">Large</option>
        </select>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={handlePark}
        >
          Park
        </button>
      </div>

      {/* 🛑 UNPARK FORM */}
      <div className="mb-6 p-4 border rounded bg-gray-50">
        <h2 className="font-semibold mb-2">🛑 Unpark a Vehicle</h2>
        <input
          className="border p-2 mr-2"
          placeholder="License Plate"
          value={unparkPlate}
          onChange={(e) => setUnparkPlate(e.target.value)}
        />
        <button
          className="bg-red-500 text-white px-4 py-2 rounded"
          onClick={handleUnpark}
        >
          Unpark
        </button>
      </div>

      {/* 🧱 DISPLAY PARKING SPOTS BY LEVEL */}
      {Object.keys(groupedByLevel).map((level) => (
        <div key={level} className="mb-8">
          <h3 className="text-lg font-semibold mb-2">🧱 Level {level}</h3>
          <div className="grid grid-cols-10 gap-2">
            {groupedByLevel[level].map((spot) => (
              <div
                key={spot._id}
                className={`p-3 text-center text-sm rounded shadow-md ${
                  spot.vehicle
                    ? 'bg-red-400 text-white'
                    : 'bg-green-300 text-black'
                }`}
              >
                <div>{spot.spotSize?.[0]?.toUpperCase() || '-'}</div>
                {spot.vehicle?.licensePlate && (
                  <div className="text-xs mt-1">{spot.vehicle.licensePlate}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
