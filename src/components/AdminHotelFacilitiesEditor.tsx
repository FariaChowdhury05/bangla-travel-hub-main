import React, { useEffect, useState } from 'react';

interface Facility {
  id: number;
  name: string;
  description?: string | null;
}

interface Props {
  hotelId: number;
}

export default function AdminHotelFacilitiesEditor({ hotelId }: Props) {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [hotelFacilities, setHotelFacilities] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchFacilities();
    fetchHotelFacilities();
  }, [hotelId]);

  async function fetchFacilities() {
    setLoading(true);
    const res = await fetch('/api/facilities.php', { credentials: 'include' });
    const data = await res.json();
    setFacilities(Array.isArray(data) ? data : data?.facilities ?? []);
    setLoading(false);
  }

  async function fetchHotelFacilities() {
    setLoading(true);
    const res = await fetch(`/api/hotel_facilities.php?hotel_id=${hotelId}`);
    const data = await res.json();
    setHotelFacilities(Array.isArray(data) ? data.map((f: any) => f.id) : []);
    setLoading(false);
  }

  async function toggleFacility(facilityId: number, checked: boolean) {
    setSaving(true);
    if (checked) {
      await fetch('/api/hotel_facilities.php', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hotel_id: hotelId, facility_id: facilityId }),
      });
    } else {
      await fetch('/api/hotel_facilities.php', {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hotel_id: hotelId, facility_id: facilityId }),
      });
    }
    await fetchHotelFacilities();
    setSaving(false);
    try {
      window.dispatchEvent(new CustomEvent('data-updated'));
    } catch (e) {}
  }

  if (loading) return <div>Loading facilities…</div>;
  if (!facilities.length) return <div>No facilities available.</div>;

  return (
    <div className="space-y-2">
      <h4 className="font-semibold mb-2">Hotel Facilities</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {facilities.map((f) => (
          <label key={f.id} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={hotelFacilities.includes(f.id)}
              disabled={saving}
              onChange={(e) => toggleFacility(f.id, e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span>{f.name}</span>
            {f.description ? <span className="text-xs text-muted-foreground">{f.description}</span> : null}
          </label>
        ))}
      </div>
    </div>
  );
}
