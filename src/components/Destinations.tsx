import { useState, useEffect } from "react";
import DestinationCard from "./DestinationCard";
import DestinationDetailsModal from "./DestinationDetailsModal";
import { API_ENDPOINTS } from "@/lib/api-config";
import { toast } from "sonner";
import { Loader } from "lucide-react";

interface Destination {
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
}

const Destinations = () => {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchDestinations();
  }, []);

  useEffect(() => {
    // Re-fetch when admin creates/deletes destinations or hotels
    const handler = () => fetchDestinations();
    window.addEventListener('data-updated', handler);
    return () => window.removeEventListener('data-updated', handler);
  }, []);

  const fetchDestinations = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.DESTINATIONS_GET);
      const data = await response.json();
      
      if (data.success && data.data) {
        setDestinations(data.data);
      } else {
        toast.error("Could not load destinations");
      }
    } catch (error) {
      console.error("Error fetching destinations:", error);
      toast.error("Could not load destinations. Make sure your backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem('user');
      if (raw) setUser(JSON.parse(raw));
    } catch (e) {
      console.error('Failed to parse user from localStorage', e);
    }
  }, []);

  const deleteDestination = async (id: number) => {
    if (!user || user.role !== 'admin') {
      toast.error('Only admins can delete destinations');
      return;
    }

    try {
      const res = await fetch(API_ENDPOINTS.DESTINATIONS_POST, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Destination deleted');
        setDestinations(prev => prev.filter(d => d.id !== id));
        try { window.dispatchEvent(new CustomEvent('data-updated')); } catch (e) {}
      } else {
        toast.error(data.error || 'Delete failed');
      }
    } catch (err) {
      console.error('Delete error', err);
      toast.error('Could not delete destination');
    }
  };

  const handleExplore = (destination: Destination) => {
    setSelectedDestination(destination);
    setModalOpen(true);
  };
  return (
    <section id="destinations" className="py-20 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Featured Destinations
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore the most beautiful places Bangladesh has to offer
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : destinations.length > 0 ? (
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-6 min-w-min">
              {destinations.map((destination) => (
                <div key={destination.id} className="flex-shrink-0 w-80 relative">
                  {user && user.role === 'admin' && (
                    <button
                      onClick={() => deleteDestination(destination.id)}
                      className="absolute top-2 right-2 z-20 p-1.5 rounded-full bg-destructive text-white hover:bg-destructive/90"
                      title="Delete destination"
                    >
                      ✕
                    </button>
                  )}
                  <DestinationCard
                    {...destination}
                    image={destination.image_url}
                    hotels={destination.hotel_count}
                    onExplore={() => handleExplore(destination)}
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No destinations available yet.</p>
          </div>
        )}
      </div>

      <DestinationDetailsModal
        destination={selectedDestination}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </section>
  );
};


export default Destinations;
