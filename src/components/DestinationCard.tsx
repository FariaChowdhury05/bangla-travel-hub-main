import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Star } from "lucide-react";

interface DestinationCardProps {
  id: number;
  name: string;
  description: string;
  image: string;
  rating: number;
  hotels: number;
  latitude?: number;
  longitude?: number;
  onExplore?: () => void;
}

const DestinationCard = ({ name, description, image, rating, hotels, latitude, longitude, onExplore }: DestinationCardProps) => {
  const handleViewOnMap = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (latitude && longitude) {
      const mapsUrl = `https://maps.google.com/?q=${latitude},${longitude}`;
      window.open(mapsUrl, '_blank');
    }
  };

  return (
    <Card className="overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-[var(--card-hover-shadow)] border-border">
      <div className="relative h-64 overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-4 text-white">
          <h3 className="text-2xl font-bold mb-1">{name}</h3>
          <div className="flex items-center space-x-2 text-sm">
            <Star className="h-4 w-4 fill-accent text-accent" />
            <span>{rating} Rating</span>
            <span>•</span>
            <span>{hotels} Hotels</span>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <p className="text-muted-foreground mb-4 line-clamp-2">{description}</p>
        <div className="flex items-center justify-between">
          <button 
            onClick={handleViewOnMap}
            className="flex items-center text-primary hover:text-primary/80 transition"
          >
            <MapPin className="h-4 w-4 mr-1" />
            <span className="text-sm font-medium">View on Map</span>
          </button>
          <Button size="sm" className="bg-primary hover:bg-primary/90" onClick={onExplore}>
            Explore
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default DestinationCard;
