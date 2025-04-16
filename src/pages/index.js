import { useEffect, useState } from 'react';

export default function Home() {
  const [spots, setSpots] = useState([]);
  const [form, setForm] = useState({ licensePlate: '', size: 'motorcycle' });
  const [unparkPlate, setUnparkPlate] = useState('');

  useEffect(() => {
    async function init() {
      const res = await fetch('/api/parking');
      const data = await res.json();

      console.log("Initial GET /api/parking =>", data);

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

    console.log("Fetched spots:", data);
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
    console.log("POST /api/parking response:", result);

    if (!result.success) {
      alert("❌ Parking failed: " + (result.message || result.error));
    }

    setForm({ licensePlate: '', size: 'motorcycle' });
    fetchSpots();
  }

  async function handleUnpark() {
    console.log("Unparking:", unparkPlate);

    const res = await fetch('/api/parking', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ licensePlate: unparkPlate })
    });

    const result = await res.json();
    console.log("DELETE /api/parking response:", result);

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

  console.log("Grouped Spots by Level:", groupedByLevel);

  return (
    <div className="p-6">
      <div className="flex justify-end">
        <button
          className="bg-indigo-200 text-indigo-800 px-4 py-2 rounded mb-4"
          onClick={async () => {
            const res = await fetch('/api/setup', { method: 'POST' });
            const result = await res.json();
            console.log("🔁 Manual Setup Result:", result);
            alert('Setup complete');
            fetchSpots();
          }}
        >
          Setup Parking Lot
        </button>
      </div>

      <h1 className="text-4xl font-bold text-center mb-10">🚗 Parking Lot System</h1>

      <div className="mb-6 p-4 border border-emerald-700 rounded-xl bg-green-50">
        <h2 className="font-semibold text-black mb-2">Park a Vehicle</h2>
        <input
          className="border border-black placeholder-gray-500 p-2 mr-2 rounded-md"
          placeholder="License Plate"
          value={form.licensePlate}
          onChange={(e) => setForm({ ...form, licensePlate: e.target.value })}
        />
        <select
          className="border border-y-gray-500 p-2 mr-2 rounded-md"
          value={form.size}
          onChange={(e) => setForm({ ...form, size: e.target.value })}
        >
          <option value="motorcycle">Motorcycle</option>
          <option value="car">Car</option>
          <option value="bus">Bus</option>
        </select>
        <button
          className="bg-emerald-300 text-emerald-900 px-4 py-2 rounded"
          onClick={handlePark}
        >
          Park
        </button>
      </div>

      <div className="mb-6 p-4 border border-pink-800 rounded-xl bg-pink-50">
        <h2 className="font-semibold text-black border-black mb-2">Unpark a Vehicle</h2>
        <input
          className="border border-black placeholder-gray-500 p-2 mr-2 rounded-md"
          placeholder="License Plate"
          value={unparkPlate}
          onChange={(e) => setUnparkPlate(e.target.value)}
        />
        <button
          className="bg-pink-300 text-pink-950 px-4 py-2 rounded"
          onClick={handleUnpark}
        >
          Unpark
        </button>
      </div>

      {Object.keys(groupedByLevel).map((level) => (
        <div key={level} className="mb-8">
          <h3 className="text-lg font-semibold mb-2">{level}</h3>
          <div className="grid grid-cols-10 gap-2">
            {groupedByLevel[level].map((spot) => {
              console.log("🔎 spot", spot.level, spot.index, "vehicle:", spot.vehicle);

              return (
                <div
                  key={`${spot.level}-${spot.row}-${spot.index}`}
                  className={`p-3 text-center text-sm rounded shadow-md transition-all duration-150
                    ${spot.vehicle ? 
                      (spot.vehicle.size === 'large' ? 'bg-red-400 text-white' : 'bg-red-300 text-white') 
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
