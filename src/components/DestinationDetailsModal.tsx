import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Hotel, Calendar, Info } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from "@/lib/api-config";
import { toast } from "sonner";
import BookingForm from "./BookingForm";

interface DestinationDetailsModalProps {
  destination: {
    id: number;
    name: string;
    description: string;
    image_url: string;
    rating: number;
    hotel_count: number;
    latitude?: number;
    longitude?: number;
    location_info?: string;
    highlights?: string;
    best_time_to_visit?: string;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DestinationDetailsModal = ({ destination, open, onOpenChange }: DestinationDetailsModalProps) => {
  if (!destination) return null;

  const navigate = useNavigate();
  const [hotels, setHotels] = useState<Array<any>>([]);
  const [selectedHotel, setSelectedHotel] = useState<number | null>(null);

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const url = `${API_ENDPOINTS.HOTELS_GET}?destination_id=${destination.id}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.success) {
          setHotels(data.data);
          if (data.data && data.data.length > 0) setSelectedHotel(data.data[0].id);
        }
      } catch (err) {
        console.error('Error fetching hotels', err);
        toast.error('Could not load hotels');
      }
    };

    if (destination) fetchHotels();
  }, [destination]);

  const handleViewOnMap = () => {
    if (destination.latitude && destination.longitude) {
      const mapsUrl = `https://maps.google.com/?q=${destination.latitude},${destination.longitude}`;
      window.open(mapsUrl, '_blank');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{destination.name}</DialogTitle>
        </DialogHeader>
        <DialogDescription className="sr-only">Information about the destination and its hotels.</DialogDescription>

        <div className="space-y-4">
          {/* Image */}
          <div className="relative h-64 rounded-lg overflow-hidden">
            <img
              src={destination.image_url}
              alt={destination.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Rating and Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-muted p-3 rounded-lg text-center">
              <div className="flex items-center justify-center mb-1">
                <Star className="h-5 w-5 fill-accent text-accent mr-1" />
                <span className="font-bold text-lg">{destination.rating}</span>
              </div>
              <p className="text-xs text-muted-foreground">Rating</p>
            </div>
            <div className="bg-muted p-3 rounded-lg text-center">
              <div className="flex items-center justify-center mb-1">
                <Hotel className="h-5 w-5 text-primary mr-1" />
                <span className="font-bold text-lg">{destination.hotel_count}</span>
              </div>
              <p className="text-xs text-muted-foreground">Hotels</p>
            </div>
            <div className="bg-muted p-3 rounded-lg text-center">
              {destination.best_time_to_visit && (
                <>
                  <div className="flex items-center justify-center mb-1">
                    <Calendar className="h-5 w-5 text-primary mr-1" />
                  </div>
                  <p className="text-xs">{destination.best_time_to_visit}</p>
                </>
              )}
            </div>
          </div>

          {/* Location Info */}
          {destination.location_info && (
            <div className="flex items-start gap-2">
              <MapPin className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm">Location</p>
                <p className="text-sm text-muted-foreground">{destination.location_info}</p>
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <h4 className="font-semibold mb-2">About</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">{destination.description}</p>
          </div>

          {/* Highlights */}
          {destination.highlights && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Info className="h-5 w-5 text-primary" />
                <h4 className="font-semibold">Highlights</h4>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                {destination.highlights.split(',').map((highlight, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>{highlight.trim()}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Hotels List */}
          <div>
            <h4 className="font-semibold mt-4 mb-2">Hotels at {destination.name}</h4>
            {hotels.length > 0 ? (
              <div className="space-y-3">
                {hotels.map((h) => (
                  <div
                    key={h.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                      selectedHotel === h.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedHotel(h.id)}
                  >
                    <img src={h.image_url || 'https://via.placeholder.com/80x60?text=Hotel'} alt={h.name} className="w-20 h-14 object-cover rounded" />
                    <div className="flex-1">
                      <p className="font-medium hover:text-primary transition cursor-pointer" onClick={(e) => { e.stopPropagation(); navigate(`/hotels/${h.id}`); onOpenChange(false); }}>{h.name}</p>
                      <p className="text-xs text-muted-foreground">{h.address}</p>
                      <p className="text-sm font-semibold text-primary">Rating: {h.rating}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No hotels listed for this destination.</p>
            )}
          </div>

          {/* Booking Form */}
          {selectedHotel && hotels.length > 0 && (
            <BookingForm hotelId={selectedHotel} onBookingSuccess={() => onOpenChange(false)} />
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button className="flex-1 bg-primary hover:bg-primary/90" onClick={handleViewOnMap}>
              View on Map
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DestinationDetailsModal;
