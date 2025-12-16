import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { API_ENDPOINTS } from '@/lib/api-config';
import { toast } from 'sonner';
import { Loader, MapPin, Calendar, Users, DollarSign } from 'lucide-react';

interface Booking {
  id: number;
  user_id: number;
  user_name?: string | null;
  user_email?: string | null;
  hotel_id: number | null;
  package_id: number | null;
  booking_name: string;
  booking_type: 'hotel' | 'package';
  total_amount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  check_in: string | null;
  check_out: string | null;
  nights: number | null;
  guest_count: number;
  created_at: string;
  guide_id?: number | null;
  guide_name?: string | null;
  guide_rate_per_day?: number | null;
}

const Bookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(userData));
    fetchBookings();
    const handler = () => fetchBookings();
    window.addEventListener('data-updated', handler);
    return () => window.removeEventListener('data-updated', handler);
  }, [navigate]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_ENDPOINTS.BOOKINGS_GET, { credentials: 'include' });
      const json = await res.json();
      if (json.success) setBookings(json.data || []);
      else toast.error(json.error || 'Could not load bookings');
    } catch (err) {
      console.error('Error fetching bookings', err);
      toast.error('Could not load bookings');
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId: number) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    try {
      const res = await fetch(API_ENDPOINTS.BOOKINGS_PATCH, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: bookingId, status: 'cancelled' }),
      });

      const json = await res.json();
      if (json.success) {
        toast.success('Booking cancelled');
        setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b));
      } else {
        toast.error(json.error || 'Failed to cancel booking');
      }
    } catch (err) {
      console.error('Error cancelling booking', err);
      toast.error('Could not cancel booking');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground">My Bookings</h1>
            <p className="text-muted-foreground mt-2">Manage and view all your hotel bookings</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : bookings.length > 0 ? (
            <div className="space-y-4">
              {bookings.map(booking => (
                <Card key={booking.id} className="overflow-hidden hover:shadow-lg transition">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                      <div className="flex-1">
                        <h3 className="text-2xl font-semibold text-foreground mb-4">{booking.booking_name}</h3>
                        {booking.user_name && (
                          <p className="text-sm text-muted-foreground mb-2">Booked by: <strong>{booking.user_name}</strong> {booking.user_email && <span className="ml-2">• {booking.user_email}</span>}</p>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          {booking.check_in && booking.check_out && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Calendar className="h-5 w-5" />
                              <span>{new Date(booking.check_in).toLocaleDateString()} - {new Date(booking.check_out).toLocaleDateString()}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Users className="h-5 w-5" />
                            <span>{booking.guest_count} guest{booking.guest_count > 1 ? 's' : ''}{booking.nights && ` • ${booking.nights} night${booking.nights > 1 ? 's' : ''}`}</span>
                          </div>
                        </div>
                        
                        {booking.guide_name && (
                          <div className="mt-3">
                            <p className="text-sm font-medium">Guide</p>
                            <p className="text-sm text-muted-foreground">{booking.guide_name}{booking.guide_rate_per_day ? ` • ৳${Number(booking.guide_rate_per_day).toFixed(2)}/day` : ''}</p>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-5 w-5 text-primary" />
                          <span className="text-2xl font-bold text-primary">৳{booking.total_amount.toFixed(2)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">{booking.booking_type === 'hotel' ? 'Hotel Booking' : 'Package Booking'}</p>
                      </div>

                      <div className="flex flex-col items-end gap-3">
                        <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>

                          <div className="flex gap-2">
                            {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => cancelBooking(booking.id)}
                              >
                                Cancel
                              </Button>
                            )}
                            <Button variant="outline" size="sm" onClick={() => navigate(`/bookings/${booking.id}`)}>
                              View Details
                            </Button>
                          </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground text-lg mb-4">No bookings yet</p>
                <Button asChild>
                  <a href="/">Start Booking</a>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Bookings;
