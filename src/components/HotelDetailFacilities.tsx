import React, { useState } from 'react';
import FacilityGrid from './FacilityGrid';

interface Props {
  hotelId: number | string;
  initialLimit?: number;
}

export default function HotelDetailFacilities({ hotelId, initialLimit = 6 }: Props) {
  const [showAll, setShowAll] = useState(false);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Facilities</h3>
        <button
          type="button"
          className="text-sm text-primary-600 hover:underline"
          onClick={() => setShowAll((s) => !s)}
        >
          {showAll ? 'Show less' : 'Show all'}
        </button>
      </div>

      <FacilityGrid hotelId={hotelId} limit={showAll ? undefined : initialLimit} />
    </section>
  );
}
