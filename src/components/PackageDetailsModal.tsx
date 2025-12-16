import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

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

interface Props {
  packageId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PackageDetailsModal = ({ packageId, open, onOpenChange }: Props) => {
  const [pkg, setPkg] = useState<PackageInfo | null>(null);
  const [destinations, setDestinations] = useState<DestinationWithHotels[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && packageId) fetchPackage();
    if (!open) {
      setPkg(null);
      setDestinations([]);
    }
  }, [open, packageId]);

  async function fetchPackage() {
    setLoading(true);
    try {
      const res = await fetch(`/api/package_hotels.php?package_id=${packageId}`);
      const json = await res.json();
      if (json.success) {
        setPkg(json.data.package || null);
        setDestinations(json.data.destinations || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  if (!pkg) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{pkg.name}</DialogTitle>
        </DialogHeader>
        <DialogDescription className="sr-only">Details about the package, its destinations and available hotels.</DialogDescription>

        <div className="space-y-4">
          {pkg.image_url ? (
            <img src={pkg.image_url} alt={pkg.name} className="w-full h-56 object-cover rounded-lg" />
          ) : (
            <div className="w-full h-56 bg-muted rounded-lg flex items-center justify-center">No image</div>
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
              <div className="font-semibold">Dates</div>
              <div className="text-sm text-muted-foreground">
                {pkg.start_date ? new Date(pkg.start_date).toLocaleDateString() : '-'}
                {' '}—{' '}
                {pkg.end_date ? new Date(pkg.end_date).toLocaleDateString() : '-'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="font-semibold">Meals</div>
              <div className="text-sm text-muted-foreground">
                {pkg.breakfast ? 'Breakfast ' : ''}{pkg.lunch ? '• Lunch ' : ''}{pkg.dinner ? '• Dinner' : ''}
                {!pkg.breakfast && !pkg.lunch && !pkg.dinner && 'Not specified'}
              </div>
            </div>
            <div className="md:col-span-2">
              <div className="font-semibold">About</div>
              <div className="text-sm text-muted-foreground">{pkg.description}</div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold">Destinations & Hotels</h4>
            {loading ? (
              <div>Loading…</div>
            ) : destinations.length === 0 ? (
              <div className="text-sm text-muted-foreground">No destinations/hotels found for this package.</div>
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
                        dest.hotels.map(h => (
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
                              <Link to={`/bookings/new?package_id=${pkg.id}&hotel_id=${h.id}`} className="text-sm">
                                <Button className="px-3 py-1">Book with Hotel</Button>
                              </Link>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PackageDetailsModal;
