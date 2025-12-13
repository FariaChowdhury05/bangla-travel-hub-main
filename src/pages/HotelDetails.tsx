import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { API_ENDPOINTS } from '@/lib/api-config';
import { toast } from 'sonner';
import Rooms from '@/components/Rooms';
import BookingForm from '@/components/BookingForm';
import HotelDetailFacilities from '@/components/HotelDetailFacilities';

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

const HotelDetails = () => {
  const { id } = useParams();
  const hotelId = Number(id || 0);
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchHotel = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_ENDPOINTS.HOTELS_GET);
      const json = await res.json();
      if (json.success) {
        const found = (json.data || []).find((h: any) => Number(h.id) === hotelId);
        if (found) setHotel(found);
        else toast.error('Hotel not found');
      } else {
        toast.error('Could not load hotel');
      }
    } catch (err) {
      console.error('Error loading hotel', err);
      toast.error('Could not load hotel');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hotelId > 0) fetchHotel();
  }, [hotelId]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-20 pb-12">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex justify-center py-12">Loading...</div>
          ) : hotel ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  {hotel.image_url ? (
                    <img src={hotel.image_url} alt={hotel.name} className="w-full h-64 object-cover rounded-lg" />
                  ) : (
                    <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center">No image</div>
                  )}
                  <h1 className="text-3xl font-bold mt-4">{hotel.name}</h1>
                  {hotel.address && <p className="text-sm text-muted-foreground mt-2">{hotel.address}</p>}
                  {hotel.description && <p className="mt-4 text-muted-foreground">{hotel.description}</p>}

                  <div className="mt-8 pt-8 border-t border-border">
                    <HotelDetailFacilities hotelId={hotel.id} />
                  </div>

                  <div className="mt-8 pt-8 border-t border-border">
                    <Rooms hotelId={hotel.id} />
                  </div>
                </div>

                <aside>
                  <Card>
                    <CardContent>
                      <BookingForm hotelId={hotel.id} onBookingSuccess={() => { window.dispatchEvent(new CustomEvent('data-updated')); }} />
                    </CardContent>
                  </Card>
                </aside>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Hotel not found.</p>
              <div className="mt-4">
                <Button asChild>
                  <Link to="/hotels">Back to Hotels</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HotelDetails;
