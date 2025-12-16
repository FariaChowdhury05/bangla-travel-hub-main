import React, { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';

interface Hotel {
  id: number;
  destination_id: number;
  name: string;
  description?: string;
  image_url?: string;
  rating?: number;
}

interface DestinationWithHotels {
  id: number;
  name: string;
  description?: string;
  sequence: number;
  hotels: Hotel[];
}

interface PackageInfo {
  id: number;
  name: string;
  description?: string;
  price: number;
  duration_days: number;
  image_url?: string;
  breakfast?: boolean;
  lunch?: boolean;
  dinner?: boolean;
  transport?: string;
  start_date?: string | null;
  end_date?: string | null;
}

const PackageDetails = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const offerIdParam = searchParams.get('offer_id') ? parseInt(searchParams.get('offer_id')!) : null;
  const pkgId = id ? parseInt(id) : null;
  const [pkg, setPkg] = useState<PackageInfo | null>(null);
  const [destinations, setDestinations] = useState<DestinationWithHotels[]>([]);
  const [mappedRooms, setMappedRooms] = useState<Record<number, any[]>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (pkgId) fetchPackage();
  }, [pkgId]);

  async function fetchPackage() {
    setLoading(true);
    try {
      const res = await fetch(`/api/package_hotels.php?package_id=${pkgId}`);
      const json = await res.json();
      if (json.success) {
        setPkg(json.data.package || null);
        setDestinations(json.data.destinations || []);
        // prefetch mapped rooms for each hotel in destinations
        try {
          const hotelIds: number[] = [];
          (json.data.destinations || []).forEach((d:any) => {
            if (Array.isArray(d.hotels)) d.hotels.forEach((h:any) => hotelIds.push(h.id));
          });
          const roomMap: Record<number, any[]> = {};
          for (const hid of hotelIds) {
            try {
              const rres = await fetch(`/api/package_hotel_rooms.php?package_id=${pkgId}&hotel_id=${hid}`);
              const rj = await rres.json();
              if (rj.success) roomMap[hid] = rj.data || [];
              else roomMap[hid] = [];
            } catch (e) { roomMap[hid] = []; }
          }
          setMappedRooms(roomMap);
        } catch (e) { console.warn('Could not prefetch mapped rooms', e); }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const formatDate = (d: Date) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const computeDatesForPackage = (days: number) => {
    const today = new Date();
    const start = formatDate(today);
    const out = new Date(today);
    out.setDate(out.getDate() + days);
    const end = formatDate(out);
    return { start, end };
  };

  if (!pkgId) return <div>Package not found</div>;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">{pkg ? pkg.name : 'Package details'}</h1>
            <p className="text-sm text-muted-foreground">{pkg ? pkg.description : ''}</p>
          </div>

          {loading ? (
            <div>Loading…</div>
          ) : pkg ? (
            <div className="space-y-6">
              {pkg.image_url ? (
                <img src={pkg.image_url} alt={pkg.name} className="w-full h-64 object-cover rounded-lg" />
              ) : (
                <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center">No image</div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="font-semibold">Duration</div>
                  <div className="text-sm text-muted-foreground">{pkg.duration_days} days</div>
                </div>
                <div>
                  <div className="font-semibold">Transport</div>
                  <div className="text-sm text-muted-foreground">{pkg.transport || 'Not specified'}</div>
                </div>
                <div>
                  <div className="font-semibold">Price</div>
                  <div className="text-sm text-muted-foreground">৳{pkg.price.toFixed(2)}</div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold">Destinations & Hotels</h4>
                {destinations.length === 0 ? (
                  <div className="text-sm text-muted-foreground mt-2">No destinations/hotels found for this package.</div>
                ) : (
                  <div className="space-y-4 mt-3">
                    {destinations.map(dest => (
                      <div key={dest.id} className="border border-border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold">{dest.name}</div>
                            {dest.description && <div className="text-sm text-muted-foreground">{dest.description}</div>}
                          </div>
                        </div>

                        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                            {dest.hotels.length === 0 ? (
                            <div className="text-sm text-muted-foreground">No hotels in this destination.</div>
                          ) : (
                            dest.hotels.map(h => {
                              const dates = computeDatesForPackage(pkg.duration_days || 1);
                              let bookUrl = `/bookings/new?package_id=${pkg.id}&hotel_id=${h.id}&check_in=${dates.start}&check_out=${dates.end}`;
                              if (offerIdParam) bookUrl += `&offer_id=${offerIdParam}`;
                              return (
                                <div key={h.id} className="flex items-center gap-3">
                                  {h.image_url ? (
                                    <img src={h.image_url} className="w-24 h-16 object-cover rounded" alt={h.name} />
                                  ) : (
                                    <div className="w-24 h-16 bg-muted rounded" />
                                  )}
                                  <div className="flex-1">
                                    <div className="font-semibold">{h.name}</div>
                                    <div className="text-sm text-muted-foreground">Rating: {h.rating ?? 'N/A'}</div>
                                  </div>
                                  <div className="flex flex-col gap-2">
                                    <Link to={`/hotels/${h.id}`} className="text-sm underline">View</Link>
                                    <div className="flex items-center gap-2">
                                      <Link to={bookUrl} className="text-sm">
                                        <Button className="px-3 py-1">Book with Hotel</Button>
                                      </Link>
                                      {/* show read-only included rooms */}
                                      {(mappedRooms[h.id] && mappedRooms[h.id].length > 0) ? (
                                        <div className="text-xs text-muted-foreground ml-2">Rooms included: {mappedRooms[h.id].length}</div>
                                      ) : (
                                        <div className="text-xs text-muted-foreground ml-2">No rooms included</div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">Package not found.</div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PackageDetails;
