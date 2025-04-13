import { useEffect, useState } from 'react';

export default function Home() {
  const [spots, setSpots] = useState([]);
  const [form, setForm] = useState({ licensePlate: '', size: 'motorcycle' });
  const [unparkPlate, setUnparkPlate] = useState('');

  useEffect(() => {
    async function init() {
      const res = await fetch('/api/parking');
      const data = await res.json();

      console.log("🚀 Initial GET /api/parking =>", data);

      if ((data.spots || []).length === 0) {
        await fetch('/api/setup', { method: 'POST' });
        console.log('🔧 Auto setup complete');
      }

      fetchSpots();
    }

    init();
  }, []);

  async function fetchSpots() {
    const res = await fetch('/api/parking');
    const data = await res.json();

    console.log("🟢 Fetched spots:", data);
    setSpots(data.spots || []);
  }

  async function handlePark() {
    console.log("🚗 Parking:", form);

    const res = await fetch('/api/parking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });

    const result = await res.json();
    console.log("📥 POST /api/parking response:", result);

    if (!result.success) {
      alert("❌ Parking failed: " + (result.message || result.error));
    }

    setForm({ licensePlate: '', size: 'motorcycle' });
    fetchSpots();
  }

  async function handleUnpark() {
    console.log("🛑 Unparking:", unparkPlate);

    const res = await fetch('/api/parking', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ licensePlate: unparkPlate })
    });

    const result = await res.json();
    console.log("📤 DELETE /api/parking response:", result);

    if (!result.success) {
      alert("❌ Unpark failed: " + (result.message || result.error));
    }

    setUnparkPlate('');
    fetchSpots();
  }

  const groupedByLevel = spots.reduce((acc, spot) => {
    const levelKey = `Level ${spot.level + 1}`;
    acc[levelKey] = acc[levelKey] || [];
    acc[levelKey].push(spot);
    return acc;
  }, {});

  console.log("📊 Grouped Spots by Level:", groupedByLevel);

  return (
    <div className="p-6">
      <button
        className="bg-yellow-500 text-white px-4 py-2 rounded mb-4"
        onClick={async () => {
          const res = await fetch('/api/setup', { method: 'POST' });
          const result = await res.json();
          console.log("🔁 Manual Setup Result:", result);
          alert('Setup complete');
          fetchSpots();
        }}
      >
        🔧 Setup Parking Lot
      </button>

      <h1 className="text-2xl font-bold mb-4">🚗 Parking Lot System</h1>

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
          <option value="car">Car</option>
          <option value="bus">Bus</option>
        </select>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={handlePark}
        >
          Park
        </button>
      </div>

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

      {Object.keys(groupedByLevel).map((level) => (
        <div key={level} className="mb-8">
          <h3 className="text-lg font-semibold mb-2">🧱 {level}</h3>
          <div className="grid grid-cols-10 gap-2">
            {groupedByLevel[level].map((spot) => {
              console.log("🔎 spot", spot.level, spot.index, "vehicle:", spot.vehicle);

              return (
                <div
                  key={`${spot.level}-${spot.row}-${spot.index}`}
                  className={`p-3 text-center text-sm rounded shadow-md transition-all duration-150
                    ${spot.vehicle ? 
                      (spot.vehicle.size === 'large' ? 'bg-red-700 text-white' : 'bg-red-400 text-white') 
                      : 'bg-green-300 text-black'
                    }`}
                >
                  <div>{spot.spotSize?.[0]?.toUpperCase() || '-'}</div>
                  {spot.vehicle && (
                    <div className="text-xs mt-1 truncate">
                      {spot.vehicle.licensePlate || '[No plate]'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
