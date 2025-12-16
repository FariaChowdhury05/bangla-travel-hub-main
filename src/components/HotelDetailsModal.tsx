import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Star, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { API_ENDPOINTS } from "@/lib/api-config";
import { toast } from "sonner";
import Rooms from "./Rooms";
import BookingForm from "./BookingForm";
import HotelDetailFacilities from './HotelDetailFacilities';

interface Hotel {
  id: number;
  destination_id: number;
  name: string;
  description?: string;
  image_url?: string;
  rating?: number;
  address?: string;
  phone?: string;
}

interface Props {
  hotel: Hotel | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const HotelDetailsModal = ({ hotel, open, onOpenChange }: Props) => {
  const [hotelData, setHotelData] = useState<Hotel | null>(hotel);

  useEffect(() => {
    setHotelData(hotel);
  }, [hotel]);

  // facilities rendering delegated to `HotelDetailFacilities` component

  if (!hotelData) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{hotelData.name}</DialogTitle>
        </DialogHeader>
        <DialogDescription className="sr-only">Details about the hotel, rooms and booking form.</DialogDescription>

        <div className="space-y-4">
          {hotelData.image_url ? (
            <img src={hotelData.image_url} alt={hotelData.name} className="w-full h-64 object-cover rounded-lg" />
          ) : (
            <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center">No image</div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-accent" />
                <span className="font-semibold">{hotelData.rating ?? 'N/A'}</span>
              </div>
              {hotelData.address && (
                <div className="flex items-center text-sm text-muted-foreground mt-2">
                  <MapPin className="h-4 w-4 mr-1" />{hotelData.address}
                </div>
              )}
            </div>
            <div>
              {hotelData.phone && <div className="text-sm">Phone: {hotelData.phone}</div>}
            </div>
          </div>

          {hotelData.description && (
            <div>
              <h4 className="font-semibold">About</h4>
              <p className="text-sm text-muted-foreground">{hotelData.description}</p>
            </div>
          )}

          <div>
            <h4 className="font-semibold">Facilities</h4>
            <div className="mt-2">
              <HotelDetailFacilities hotelId={hotelData.id} />
            </div>
          </div>

          {/* Rooms list */}
          <Rooms hotelId={hotelData.id} />

          {/* Booking form */}
          <BookingForm hotelId={hotelData.id} onBookingSuccess={() => onOpenChange(false)} />

          <div className="flex gap-2 pt-4">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HotelDetailsModal;
