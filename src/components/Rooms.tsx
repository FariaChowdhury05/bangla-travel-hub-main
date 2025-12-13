import { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '@/lib/api-config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader } from 'lucide-react';

interface Room {
  id: number;
  hotel_id: number;
  room_number: string;
  type: string;
  price_per_night: number;
  max_guests: number;
  description?: string;
}

interface RoomsProps {
  hotelId: number;
  onRoomSelect?: (roomId: number, price: number) => void;
}

const Rooms = ({ hotelId, onRoomSelect }: RoomsProps) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRooms, setSelectedRooms] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchRooms();
  }, [hotelId]);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_ENDPOINTS.ROOMS_GET}?hotel_id=${hotelId}`);
      const json = await res.json();
      if (json.success) setRooms(json.data || []);
      else toast.error('Could not load rooms');
    } catch (err) {
      console.error('Error loading rooms', err);
      toast.error('Could not load rooms');
    } finally {
      setLoading(false);
    }
  };

  const toggleRoomSelect = (roomId: number) => {
    const newSet = new Set(selectedRooms);
    if (newSet.has(roomId)) {
      newSet.delete(roomId);
    } else {
      newSet.add(roomId);
    }
    setSelectedRooms(newSet);
  };

  return (
    <div className="mt-6">
      <h3 className="text-xl font-semibold mb-4">Available Rooms</h3>
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : rooms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rooms.map(room => (
            <Card key={room.id} className="cursor-pointer hover:shadow-lg transition">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold">Room {room.room_number}</h4>
                    <p className="text-sm text-muted-foreground capitalize">{room.type}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedRooms.has(room.id)}
                    onChange={() => toggleRoomSelect(room.id)}
                    className="w-5 h-5"
                  />
                </div>
                {room.description && <p className="text-sm text-muted-foreground mb-2">{room.description}</p>}
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-2xl font-bold text-primary">৳{room.price_per_night}</p>
                    <p className="text-xs text-muted-foreground">per night</p>
                  </div>
                  <p className="text-sm text-muted-foreground">Up to {room.max_guests} guests</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">No rooms available.</p>
      )}
    </div>
  );
};

export default Rooms;
