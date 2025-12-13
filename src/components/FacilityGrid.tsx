import React, { useEffect, useState } from 'react';
import FacilityBadge from './FacilityBadge';

type Facility = {
  id: number;
  name: string;
  description?: string | null;
  notes?: string | null;
  available?: boolean;
};

interface FacilityGridProps {
  hotelId: number | string;
  limit?: number; // if provided, only show up to `limit` facilities
  className?: string;
}

export default function FacilityGrid({ hotelId, limit, className }: FacilityGridProps) {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!hotelId) return;
    setLoading(true);
    fetch(`/api/hotel_facilities.php?hotel_id=${hotelId}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setFacilities(data);
        else if (data && Array.isArray(data.facilities)) setFacilities(data.facilities);
      })
      .catch(() => setFacilities([]))
      .finally(() => setLoading(false));
  }, [hotelId]);

  if (loading) return <div className={`text-sm text-muted-foreground ${className ?? ''}`}>Loading facilities…</div>;
  if (!facilities.length) return <div className={`text-sm text-muted-foreground ${className ?? ''}`}>No facilities listed.</div>;

  const toShow = typeof limit === 'number' ? facilities.slice(0, limit) : facilities;

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 ${className ?? ''}`}>
      {toShow.map((f) => (
        <FacilityBadge key={f.id} name={f.name} description={f.description ?? f.notes} isAvailable={f.available ?? true} />
      ))}
    </div>
  );
}
