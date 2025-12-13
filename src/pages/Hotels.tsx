import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Star, MapPin } from 'lucide-react';
import HotelDetailsModal from '@/components/HotelDetailsModal';
import { API_ENDPOINTS } from '@/lib/api-config';
import { toast } from 'sonner';
import { Loader } from 'lucide-react';

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

const Hotels = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [selectedHotel, setSelectedHotel] = useState<any>(null);
  const [hotelModalOpen, setHotelModalOpen] = useState(false);

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_ENDPOINTS.HOTELS_GET);
      const json = await res.json();
      if (json.success) setHotels(json.data || []);
      else toast.error('Could not load hotels');
    } catch (err) {
      console.error('Failed to load hotels', err);
      toast.error('Could not load hotels. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
    try {
      const raw = localStorage.getItem('user');
      if (raw) setUser(JSON.parse(raw));
    } catch (e) {}

    const handler = () => fetchHotels();
    window.addEventListener('data-updated', handler);
    return () => window.removeEventListener('data-updated', handler);
  }, []);

  const deleteHotel = async (id: number) => {
    if (!user || user.role !== 'admin') {
      toast.error('Only admins can delete hotels');
      return;
    }
    try {
      const res = await fetch(API_ENDPOINTS.HOTELS_DELETE, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Hotel deleted');
        setHotels(prev => prev.filter(h => h.id !== id));
        try { window.dispatchEvent(new CustomEvent('data-updated')); } catch (e) {}
      } else {
        toast.error(json.error || 'Delete failed');
      }
    } catch (err) {
      console.error('Delete hotel error', err);
      toast.error('Could not delete hotel');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Find Your Perfect Stay</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Browse through hotels across Bangladesh</p>
          </div>

          {/* Filters */}
          <div className="bg-card border border-border rounded-lg p-6 mb-8 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input placeholder="Search hotels..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="coxs-bazar">Cox's Bazar</SelectItem>
                  <SelectItem value="sylhet">Sylhet</SelectItem>
                  <SelectItem value="bandarban">Bandarban</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="budget">Under ৳5,000</SelectItem>
                  <SelectItem value="mid">৳5,000 - ৳10,000</SelectItem>
                  <SelectItem value="luxury">Above ৳10,000</SelectItem>
                </SelectContent>
              </Select>
              <Button className="w-full" onClick={() => fetchHotels()}>Search</Button>
            </div>
          </div>

          {/* Hotel Listings */}
          {loading ? (
            <div className="flex justify-center py-12"><Loader className="h-8 w-8 animate-spin text-primary" /></div>
          ) : hotels.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hotels.map(hotel => (
                <Card key={hotel.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={() => { setSelectedHotel(hotel); setHotelModalOpen(true); }}>
                  {hotel.image_url ? (
                    // eslint-disable-next-line jsx-a11y/img-redundant-alt
                    <img src={hotel.image_url} alt={hotel.name} className="w-full h-48 object-cover" />
                  ) : (
                    <div className="w-full h-48 bg-muted flex items-center justify-center text-sm text-muted-foreground">No image</div>
                  )}
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-semibold text-foreground">{hotel.name}</h3>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-accent fill-accent" />
                        <span className="text-sm font-medium">{hotel.rating ?? 'N/A'}</span>
                      </div>
                    </div>
                    <div className="flex items-center text-muted-foreground mb-4">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="text-sm">{hotel.address}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        {user && user.role === 'admin' && (
                          <Button variant="destructive" onClick={(e) => { e.stopPropagation(); deleteHotel(hotel.id); }}>Delete</Button>
                        )}
                        <Button asChild>
                          <Link to={`/?destination_id=${hotel.destination_id}`}>View Destination</Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12"><p className="text-muted-foreground">No hotels found.</p></div>
          )}
        </div>
      </div>
      <Footer />
      {selectedHotel && (
        <HotelDetailsModal hotel={selectedHotel} open={hotelModalOpen} onOpenChange={(v) => setHotelModalOpen(v)} />
      )}
    </div>
  );
};

export default Hotels;
