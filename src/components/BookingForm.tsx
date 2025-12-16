import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '@/lib/api-config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

interface Room {
  id: number;
  hotel_id: number;
  room_number: string;
  type: string;
  price_per_night: number;
  max_guests: number;
}

interface BookingFormProps {
  hotelId?: number;
  onBookingSuccess?: () => void;
}

const BookingForm = ({ hotelId, onBookingSuccess }: BookingFormProps) => {
  const [searchParams] = useSearchParams();
  const packageId = searchParams.get('package_id') ? parseInt(searchParams.get('package_id')!) : null;
  const guideIdParam = searchParams.get('guide_id') ? parseInt(searchParams.get('guide_id')!) : null;
  const hotelIdParam = searchParams.get('hotel_id') ? parseInt(searchParams.get('hotel_id')!) : null;
  const offerIdParam = searchParams.get('offer_id') ? parseInt(searchParams.get('offer_id')!) : null;
  
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [hotels, setHotels] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guestCount, setGuestCount] = useState('1');
  const [selectedRooms, setSelectedRooms] = useState<Set<number>>(new Set());
  const [packageDetails, setPackageDetails] = useState<any | null>(null);
  const [packageGuides, setPackageGuides] = useState<any[]>([]);
  const [appliedOffer, setAppliedOffer] = useState<any | null>(null);
  const [selectedGuideId, setSelectedGuideId] = useState<number | null>(null);
  const [includeHotel, setIncludeHotel] = useState(false);
  const [selectedHotelId, setSelectedHotelId] = useState<number | null>(null);

  useEffect(() => {
    // if booking link provides dates, prefill them
    const ci = searchParams.get('check_in');
    const co = searchParams.get('check_out');
    if (ci) setCheckIn(ci);
    if (co) setCheckOut(co);

    if (hotelId && !packageId) {
      fetchRooms();
    }
    if (packageId) {
      fetchPackageDetails();
      fetchPackageGuides();
    }
    // if guided booking param provided, preselect the guide after guides load
    if (guideIdParam && packageId) {
      setSelectedGuideId(guideIdParam);
    }
    // if hotel param present in url and booking package, preselect hotel and show hotel selection
    if (hotelIdParam && packageId) {
      setSelectedHotelId(hotelIdParam);
      setIncludeHotel(true);
    }
  }, [hotelId, packageId]);

  // once package details loaded, fetch hotels filtered by package destinations
  useEffect(() => {
    if (packageId && packageDetails) {
      // For package bookings, fetch hotels that belong to the package destinations
      fetchPackageHotels();
    }
  }, [packageDetails, packageId]);

  // ensure rooms load when includeHotel is toggled on and we have a selected hotel
  useEffect(() => {
    if (includeHotel && selectedHotelId) fetchRooms();
  }, [includeHotel, selectedHotelId]);

  // if an offer_id is present for this package, try to load offer details
  useEffect(() => {
    if (!packageId || !offerIdParam) return;
    (async () => {
      try {
        const res = await fetch(`${API_ENDPOINTS.OFFERS_GET}?package_id=${packageId}`);
        const js = await res.json();
        if (js.success && Array.isArray(js.data)) {
          const found = js.data.find((o:any) => Number(o.id) === Number(offerIdParam));
          if (found) setAppliedOffer(found);
        }
      } catch (e) {
        console.warn('Could not fetch offer details', e);
      }
    })();
  }, [packageId, offerIdParam]);

  useEffect(() => {
    if (selectedHotelId) fetchRooms();
  }, [selectedHotelId]);

  // refetch rooms when guest count changes to update availability UI
  useEffect(() => {
    if (selectedHotelId) fetchRooms();
  }, [guestCount]);

  // compute nights for display/price calculations
  const computedNights = (() => {
    try {
      if (checkIn && checkOut) {
        const ci = new Date(checkIn);
        const co = new Date(checkOut);
        const days = Math.max(0, Math.round((+co - +ci) / (1000 * 60 * 60 * 24)));
        return days;
      }
    } catch (e) {}
    // fallback to package duration
    if (packageDetails && packageDetails.duration_days) return packageDetails.duration_days;
    return 0;
  })();

  const selectedGuide = packageGuides.find(g => g.id === selectedGuideId) || null;
  const roomObjects = rooms.filter(r => selectedRooms.has(r.id));
  const roomsTotal = roomObjects.reduce((s, r) => s + (r.price_per_night || 0), 0) * (computedNights || 1);
  const guideTotal = (selectedGuide ? (selectedGuide.rate_per_day || 0) : 0) * (computedNights || 1);
  const packagePriceOriginal = packageDetails ? (packageDetails.price || 0) : 0;
  let packagePrice = packagePriceOriginal;
  if (appliedOffer) {
    if (appliedOffer.discount_type === 'percentage') {
      packagePrice = packagePriceOriginal * (1 - (Number(appliedOffer.discount_value) / 100));
    } else {
      packagePrice = Math.max(0, packagePriceOriginal - Number(appliedOffer.discount_value));
    }
  }
  const grandTotal = packagePrice + guideTotal + roomsTotal;

  const fetchRooms = async (hOverride?: number | null) => {
    setLoading(true);
    try {
      const hId = typeof hOverride !== 'undefined' ? hOverride : (packageId ? selectedHotelId || hotelId : hotelId);
      if (!hId) {
        setRooms([]);
        return;
      }
      // If booking a package and includeHotel is true, prefer the package->hotel mapping endpoint
      if (packageId && includeHotel) {
        const res = await fetch(`/api/package_hotel_rooms.php?package_id=${packageId}&hotel_id=${hId}`);
        const json = await res.json();
        if (json && json.success) {
          setRooms(json.data || []);
          // automatically select mapped rooms so backend still receives room_ids
          setSelectedRooms(new Set((json.data || []).map((r:any) => r.id)));
        } else {
          setRooms([]);
          setSelectedRooms(new Set());
        }
      } else {
        const res = await fetch(`${API_ENDPOINTS.ROOMS_GET}?hotel_id=${hId}`);
        const json = await res.json();
        if (json && json.success) setRooms(json.data || []);
        else if (Array.isArray(json)) setRooms(json || []);
        else setRooms([]);
      }
    } catch (err) {
      console.error('Error loading rooms', err);
      toast.error('Could not load rooms');
    } finally {
      setLoading(false);
    }
  };

  const fetchHotels = async () => {
    try {
      const res = await fetch(API_ENDPOINTS.HOTELS_GET);
      const json = await res.json();
      if (json.success) {
        const all = json.data || [];
        // if packageDetails contains destinations, filter hotels to those destinations
        const destIds = (packageDetails && packageDetails.destinations) ? packageDetails.destinations.map((d:any) => d.id) : [];
        if (destIds.length > 0) {
          const filtered = all.filter((h:any) => destIds.includes(h.destination_id));
          setHotels(filtered);
          // if booking a package and hotels exist, show hotel selection UI by default
          if (packageId && filtered.length > 0) setIncludeHotel(true);
        } else {
          setHotels(all);
        }
      }
    } catch (err) {
      console.warn('Could not load hotels', err);
    }
  };

  const fetchPackageHotels = async () => {
    if (!packageId) return;
    try {
      const res = await fetch(`/api/package_hotels.php?package_id=${packageId}`);
      const json = await res.json();
        if (json.success) {
          const dests = json.data && json.data.destinations ? json.data.destinations : (json.data || []).map((d:any) => d);
          // flatten hotels from destinations
          const flat: any[] = [];
          dests.forEach((d:any) => {
            if (Array.isArray(d.hotels)) flat.push(...d.hotels);
          });
          setHotels(flat);
          if (flat.length > 0) {
            setIncludeHotel(true);
            // if no hotel preselected, pick the first available and immediately load rooms for it
            if (!selectedHotelId) {
              const firstId = flat[0].id;
              setSelectedHotelId(firstId);
              fetchRooms(firstId);
            }
          }
        }
    } catch (e) {
      console.warn('Could not load package hotels', e);
    }
  };

  const fetchPackageDetails = async () => {
    try {
      const res = await fetch('/api/tour_packages.php');
      const json = await res.json();
      if (json.success) {
        const pkg = (json.data || []).find((p: any) => p.id === packageId);
        setPackageDetails(pkg || null);
        if (pkg) {
          if (pkg.start_date && pkg.end_date) {
            setCheckIn(pkg.start_date);
            setCheckOut(pkg.end_date);
          } else if (pkg.duration_days) {
            // compute default dates based on duration (start today)
            const today = new Date();
            const yyyy = today.getFullYear();
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const dd = String(today.getDate()).padStart(2, '0');
            const start = `${yyyy}-${mm}-${dd}`;
            const out = new Date(today);
            out.setDate(out.getDate() + Number(pkg.duration_days));
            const yyyy2 = out.getFullYear();
            const mm2 = String(out.getMonth() + 1).padStart(2, '0');
            const dd2 = String(out.getDate()).padStart(2, '0');
            const end = `${yyyy2}-${mm2}-${dd2}`;
            setCheckIn(start);
            setCheckOut(end);
          }
        }
      }
    } catch (err) {
      console.warn('Could not load package details', err);
    }
  };

  const fetchPackageGuides = async () => {
    if (!packageId) return;
    try {
      const res = await fetch(`${API_ENDPOINTS.PACKAGE_GUIDES}?package_id=${packageId}`, { credentials: 'include' });
      const json = await res.json();
      if (json.success) setPackageGuides(json.data || []);
    } catch (e) {
      console.warn('Could not load package guides', e);
    }
  };

  const toggleRoom = (roomId: number, checked?: boolean) => {
    const newSet = new Set(selectedRooms);
    const isChecked = typeof checked === 'boolean' ? checked : !newSet.has(roomId);
    if (isChecked) newSet.add(roomId);
    else newSet.delete(roomId);
    setSelectedRooms(newSet);
  };

  const guestCountNumber = Math.max(1, parseInt(guestCount || '1'));
  const totalSelectedCapacity = rooms.filter(r => selectedRooms.has(r.id)).reduce((s, r) => s + (r.max_guests || 0), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const user = localStorage.getItem('user');
    if (!user) {
      toast.error('Please log in to make a booking');
      return;
    }

    if (packageId) {
      // Package booking (support optional hotel + rooms)
      // require guide selection
      if (packageGuides.length === 0) {
        toast.error('No guides are available for this package; cannot proceed');
        return;
      }
      if (!selectedGuideId) {
        toast.error('Please select a guide for this package');
        return;
      }
      if (!guestCount) {
        toast.error('Please enter number of guests');
        return;
      }

      if (includeHotel) {
        if (!selectedHotelId) {
          toast.error('Please select a hotel to include with the package');
          return;
        }
        if (!checkIn || !checkOut || selectedRooms.size === 0) {
          toast.error('Please select check-in, check-out and at least one room for the hotel');
          return;
        }
      }

      setSubmitting(true);
      try {
        const payload: any = {
          package_id: packageId,
          guest_count: parseInt(guestCount),
        };
        if (offerIdParam) payload.offer_id = offerIdParam;
        if (selectedGuideId) payload.guide_id = selectedGuideId;
        if (packageDetails) {
          if (packageDetails.breakfast) payload.breakfast = 1;
          if (packageDetails.lunch) payload.lunch = 1;
          if (packageDetails.dinner) payload.dinner = 1;
          if (packageDetails.transport) payload.transport = packageDetails.transport;
        }

        if (includeHotel) {
          payload.hotel_id = selectedHotelId;
          payload.room_ids = Array.from(selectedRooms);
          payload.check_in = checkIn;
          payload.check_out = checkOut;
          try {
            const ci = new Date(checkIn);
            const co = new Date(checkOut);
            const nights = Math.max(0, Math.round((+co - +ci) / (1000 * 60 * 60 * 24)));
            payload.nights = nights;
          } catch (e) {}
        }

        const res = await fetch(API_ENDPOINTS.BOOKINGS_POST, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const json = await res.json();
        if (json.success) {
          toast.success(includeHotel ? 'Package + hotel booking created!' : 'Package booking created successfully!');
          setGuestCount('1');
          setIncludeHotel(false);
          setSelectedHotelId(null);
          setSelectedRooms(new Set());
          setCheckIn('');
          setCheckOut('');
          try {
            window.dispatchEvent(new CustomEvent('data-updated'));
          } catch (e) {}
          onBookingSuccess?.();
        } else {
          toast.error(json.error || 'Failed to create booking');
        }
      } catch (err) {
        console.error('Error creating booking', err);
        toast.error('Could not create booking');
      } finally {
        setSubmitting(false);
      }
    } else {
      // Hotel booking
      if (!checkIn || !checkOut || selectedRooms.size === 0) {
        toast.error('Please select check-in date, check-out date, and at least one room');
        return;
      }

      setSubmitting(true);
      try {
        const res = await fetch(API_ENDPOINTS.BOOKINGS_POST, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            hotel_id: hotelId,
            check_in: checkIn,
            check_out: checkOut,
            guest_count: parseInt(guestCount),
            room_ids: Array.from(selectedRooms),
          }),
        });

        const json = await res.json();
        if (json.success) {
          toast.success('Booking created successfully!');
          setCheckIn('');
          setCheckOut('');
          setGuestCount('1');
          setSelectedRooms(new Set());
          try {
            window.dispatchEvent(new CustomEvent('data-updated'));
          } catch (e) {}
          onBookingSuccess?.();
        } else {
          toast.error(json.error || 'Failed to create booking');
        }
      } catch (err) {
        console.error('Error creating booking', err);
        toast.error('Could not create booking');
      } finally {
        setSubmitting(false);
      }
    }
  };

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>{packageId ? 'Book This Package' : 'Book Your Stay'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {!packageId && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="check-in">Check-In Date</Label>
                  <Input
                    id="check-in"
                    type="date"
                    value={checkIn}
                    onChange={e => setCheckIn(e.target.value)}
                    required
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="check-out">Check-Out Date</Label>
                  <Input
                    id="check-out"
                    type="date"
                    value={checkOut}
                    onChange={e => setCheckOut(e.target.value)}
                    required
                    className="mt-2"
                  />
                </div>
              </div>

              <div>
                <Label className="text-base font-semibold">Select Rooms</Label>
                {loading ? (
                  <div className="flex justify-center py-4">
                    <Loader className="h-5 w-5 animate-spin text-primary" />
                  </div>
                ) : rooms.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                    {rooms.map(room => (
                      <label key={room.id} className={`flex items-center gap-3 p-3 border rounded-lg ${room.max_guests < guestCountNumber ? 'opacity-60' : 'cursor-pointer hover:bg-muted'}`}>
                        <input
                          type="checkbox"
                          checked={selectedRooms.has(room.id)}
                          onChange={(e) => toggleRoom(room.id, e.target.checked)}
                          className="w-4 h-4"
                          disabled={room.max_guests < guestCountNumber}
                        />
                        <div className="flex-1">
                          <p className="font-medium">Room {room.room_number} <span className="text-xs text-muted-foreground">• {room.type}</span></p>
                          <p className="text-sm text-muted-foreground">৳{room.price_per_night}/night • max {room.max_guests} guests</p>
                        </div>
                        {room.max_guests < guestCountNumber && (
                          <div className="text-xs text-destructive">Too small for {guestCountNumber}</div>
                        )}
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground mt-2">No rooms available.</p>
                )}
              </div>
            </>
          )}

          {packageId && packageDetails && (
            <div className="space-y-4">
              <div className="p-3 border rounded-md bg-muted/30">
                <h3 className="font-semibold">{packageDetails.name}</h3>
                <div className="text-sm text-muted-foreground">{packageDetails.duration_days} days • ৳{packageDetails.price.toFixed(2)}</div>
                {packageDetails.description && <p className="text-sm mt-2 text-muted-foreground">{packageDetails.description}</p>}
                <div className="flex gap-2 mt-3 flex-wrap">
                  {packageDetails.breakfast ? <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">Breakfast</span> : null}
                  {packageDetails.lunch ? <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">Lunch</span> : null}
                  {packageDetails.dinner ? <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">Dinner</span> : null}
                  {packageDetails.transport ? <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">Transport: {packageDetails.transport}</span> : null}
                </div>
              </div>

              <div>
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" checked={includeHotel} onChange={e => { setIncludeHotel(e.target.checked); if (!e.target.checked) { setSelectedHotelId(null); setSelectedRooms(new Set()); } }} />
                  <span className="text-sm">Include hotel with this package (optional)</span>
                </label>
              </div>

              {includeHotel && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-medium">Select Hotel</Label>
                    <select value={String(selectedHotelId || '')} onChange={e => { const v = e.target.value; setSelectedHotelId(v ? parseInt(v) : null); setSelectedRooms(new Set()); }} className="mt-2 w-full rounded-md border px-3 py-2">
                      <option value="">Select a hotel</option>
                      {hotels.map(h => (
                        <option key={h.id} value={h.id}>{h.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="check-in">Check-In Date</Label>
                      <Input id="check-in" type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)} required className="mt-2" />
                    </div>
                    <div>
                      <Label htmlFor="check-out">Check-Out Date</Label>
                      <Input id="check-out" type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)} required className="mt-2" />
                    </div>
                  </div>

                  <div>
                    {packageId && includeHotel ? (
                      <>
                        <div className="text-sm text-muted-foreground mb-2">Rooms included in this package for the selected hotel (read-only)</div>
                        {loading ? (
                          <div className="flex justify-center py-4">
                            <Loader className="h-5 w-5 animate-spin text-primary" />
                          </div>
                        ) : rooms.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                            {rooms.map((room:any) => (
                              <div key={room.id} className="p-3 border rounded-lg">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-medium">Room {room.room_number} <span className="text-xs text-muted-foreground">• {room.type}</span></p>
                                    <p className="text-sm text-muted-foreground">৳{room.price_per_night}/night • max {room.max_guests} guests</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted-foreground mt-2">No rooms mapped to this package and hotel.</p>
                        )}
                      </>
                    ) : (
                      <>
                        <Label className="text-base font-semibold">Select Rooms</Label>
                        {loading ? (
                          <div className="flex justify-center py-4">
                            <Loader className="h-5 w-5 animate-spin text-primary" />
                          </div>
                        ) : rooms.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                            {rooms.map(room => (
                              <label key={room.id} className={`flex items-center gap-3 p-3 border rounded-lg ${room.max_guests < guestCountNumber ? 'opacity-60' : 'cursor-pointer hover:bg-muted'}`}>
                                <input type="checkbox" checked={selectedRooms.has(room.id)} onChange={(e) => toggleRoom(room.id, e.target.checked)} className="w-4 h-4" disabled={room.max_guests < guestCountNumber} />
                                <div className="flex-1">
                                  <p className="font-medium">Room {room.room_number} <span className="text-xs text-muted-foreground">• {room.type}</span></p>
                                  <p className="text-sm text-muted-foreground">৳{room.price_per_night}/night • max {room.max_guests} guests</p>
                                </div>
                                {room.max_guests < guestCountNumber && (
                                  <div className="text-xs text-destructive">Too small for {guestCountNumber}</div>
                                )}
                              </label>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted-foreground mt-2">No rooms available for selected hotel.</p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Price summary when package booking */}
              <div className="mt-4 p-3 border rounded bg-muted/30">
                    <div className="text-sm text-muted-foreground">Price summary</div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="text-sm">Package</div>
                      <div className="font-semibold">
                        {appliedOffer ? (
                          <span className="flex items-baseline gap-2">
                            <span className="line-through text-muted-foreground">৳{packagePriceOriginal.toFixed(2)}</span>
                            <span>৳{packagePrice.toFixed(2)}</span>
                          </span>
                        ) : (
                          `৳${packagePrice.toFixed(2)}`
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="text-sm">Guide{selectedGuide ? ` (${selectedGuide.name})` : ''} • {computedNights} day(s)</div>
                      <div className="font-semibold">৳{guideTotal.toFixed(2)}</div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="text-sm">Rooms • {computedNights} night(s)</div>
                      <div className="font-semibold">৳{roomsTotal.toFixed(2)}</div>
                    </div>
                    <div className="border-t mt-3 pt-3 flex items-center justify-between">
                      <div className="text-sm font-medium">Total</div>
                      <div className="text-lg font-bold text-primary">৳{grandTotal.toFixed(2)}</div>
                    </div>
                    </div>
            </div>
          )}

          {/* Guide selection for package bookings */}
          {packageId && (
            <div>
              <Label className="text-base font-semibold">Select a Guide</Label>
              {packageGuides.length === 0 ? (
                <p className="text-sm text-muted-foreground mt-2">No guides available for this package.</p>
              ) : (
                <div className="grid gap-2 mt-3">
                  {packageGuides.map(g => (
                    <label key={g.id} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted">
                      <input type="radio" name="guide" checked={selectedGuideId === g.id} onChange={() => setSelectedGuideId(g.id)} className="w-4 h-4" />
                      <div className="flex-1">
                        <p className="font-medium">{g.name} {g.is_primary ? <span className="text-xs text-primary ml-2">Primary</span> : null}</p>
                        <p className="text-sm text-muted-foreground">{g.city} • {g.experience_years} yrs • {g.rating} rating • ৳{(g.rate_per_day || 0).toLocaleString()}/day</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          <div>
            <Label htmlFor="guests">Number of Guests</Label>
            <Input
              id="guests"
              type="number"
              min="1"
              value={guestCount}
              onChange={e => setGuestCount(e.target.value)}
              className="mt-2"
            />
          </div>

          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? (
              <>
                <Loader className="h-4 w-4 mr-2 animate-spin" />
                Booking...
              </>
            ) : (
              'Complete Booking'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default BookingForm;
