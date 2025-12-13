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
  
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guestCount, setGuestCount] = useState('1');
  const [selectedRooms, setSelectedRooms] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (hotelId && !packageId) {
      fetchRooms();
    }
  }, [hotelId, packageId]);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_ENDPOINTS.ROOMS_GET}?hotel_id=${hotelId}`);
      const json = await res.json();
      if (json.success) setRooms(json.data || []);
    } catch (err) {
      console.error('Error loading rooms', err);
      toast.error('Could not load rooms');
    } finally {
      setLoading(false);
    }
  };

  const toggleRoom = (roomId: number) => {
    const newSet = new Set(selectedRooms);
    if (newSet.has(roomId)) {
      newSet.delete(roomId);
    } else {
      newSet.add(roomId);
    }
    setSelectedRooms(newSet);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const user = localStorage.getItem('user');
    if (!user) {
      toast.error('Please log in to make a booking');
      return;
    }

    if (packageId) {
      // Package booking
      if (!guestCount) {
        toast.error('Please enter number of guests');
        return;
      }

      setSubmitting(true);
      try {
        const res = await fetch(API_ENDPOINTS.BOOKINGS_POST, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            package_id: packageId,
            guest_count: parseInt(guestCount),
          }),
        });

        const json = await res.json();
        if (json.success) {
          toast.success('Package booking created successfully!');
          setGuestCount('1');
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
                      <label key={room.id} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted">
                        <input
                          type="checkbox"
                          checked={selectedRooms.has(room.id)}
                          onChange={() => toggleRoom(room.id)}
                          className="w-4 h-4"
                        />
                        <div className="flex-1">
                          <p className="font-medium">Room {room.room_number}</p>
                          <p className="text-sm text-muted-foreground">৳{room.price_per_night}/night ({room.type})</p>
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground mt-2">No rooms available.</p>
                )}
              </div>
            </>
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
