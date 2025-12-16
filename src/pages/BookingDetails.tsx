import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { API_ENDPOINTS } from '@/lib/api-config';
import { toast } from 'sonner';
import { Calendar, Users, DollarSign, MapPin, Loader, Phone } from 'lucide-react';

interface BookingDetail {
  id: number;
  user_id: number;
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
  rooms?: Array<{
    id: number;
    room_id: number;
    room_number: string;
    type: string;
    price_per_night: number;
  }>;
  destinations?: Array<{
    id: number;
    name: string;
    description?: string;
    sequence: number;
  }>;
}

interface Room {
  id: number;
  room_id: number;
  room_number: string;
  price_per_night: number;
}

const BookingDetails = () => {
  const { id } = useParams();
  const bookingId = Number(id || 0);
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    fetchBookingDetails();
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_ENDPOINTS.BOOKINGS_GET}?id=${bookingId}`, { credentials: 'include' });
      const json = await res.json();
      if (json.success && json.data) {
        setBooking(json.data);
        fetchPayments(json.data.id);
      } else {
        toast.error(json.error || 'Booking not found');
      }
    } catch (err) {
      console.error('Error fetching booking', err);
      toast.error('Could not load booking details');
    } finally {
      setLoading(false);
    }
  };

  const fetchPayments = async (bId?: number) => {
    const idToUse = bId || bookingId;
    try {
      const res = await fetch(`${API_ENDPOINTS.PAYMENTS_GET}?booking_id=${idToUse}`, { credentials: 'include' });
      const js = await res.json();
      if (js.success) setPayments(js.data || []);
      else setPayments([]);
    } catch (e) { console.error(e); setPayments([]); }
  };

  const payNow = async () => {
    if (!booking) return;
    if (!confirm('Simulate payment now and mark as paid?')) return;
    try {
      const payload = { booking_id: booking.id, method: 'manual', amount: booking.total_amount, status: 'paid', transaction_id: 'manual-' + Date.now() };
      const res = await fetch(API_ENDPOINTS.PAYMENTS_POST, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const js = await res.json();
      if (js.success) {
        toast.success('Payment recorded');
        fetchPayments();
        // refresh booking to get updated status
        fetchBookingDetails();
      } else toast.error(js.error || 'Payment failed');
    } catch (e) { console.error(e); toast.error('Error'); }
  };

  const cancelBooking = async () => {
    if (!booking || !confirm('Cancel this booking?')) return;

    try {
      const res = await fetch(API_ENDPOINTS.BOOKINGS_PATCH, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: booking.id, status: 'cancelled' }),
      });

      const json = await res.json();
      if (json.success) {
        toast.success('Booking cancelled');
        setBooking({ ...booking, status: 'cancelled' });
      } else {
        toast.error(json.error || 'Failed to cancel');
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
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground">Booking Details</h1>
              <p className="text-muted-foreground mt-2">Booking ID: #{bookingId}</p>
            </div>
            <Button asChild variant="outline">
              <Link to="/bookings">Back to Bookings</Link>
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : booking ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Hotel/Package Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>{booking.booking_type === 'hotel' ? 'Hotel' : 'Package'} Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="text-2xl font-bold">{booking.booking_name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {booking.booking_type === 'hotel' ? 'Hotel' : 'Package'} ID: {booking.booking_type === 'hotel' ? booking.hotel_id : booking.package_id}
                      </p>
                    </div>
                    {booking.booking_type === 'hotel' && (
                      <Button asChild variant="outline">
                        <Link to={`/hotels/${booking.hotel_id}`}>View Hotel Details</Link>
                      </Button>
                    )}
                    {booking.booking_type === 'package' && (
                      <Button asChild variant="outline">
                        <Link to={`/tour-packages`}>View All Packages</Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>

                {/* Booking Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>Booking Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {booking.check_in && booking.check_out && (
                        <>
                          <div>
                            <p className="text-sm text-muted-foreground">Check-In</p>
                            <p className="text-lg font-semibold flex items-center gap-2">
                              <Calendar className="h-5 w-5 text-primary" />
                              {new Date(booking.check_in).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Check-Out</p>
                            <p className="text-lg font-semibold flex items-center gap-2">
                              <Calendar className="h-5 w-5 text-primary" />
                              {new Date(booking.check_out).toLocaleDateString()}
                            </p>
                          </div>
                        </>
                      )}
                      <div>
                        <p className="text-sm text-muted-foreground">Guest Count</p>
                        <p className="text-lg font-semibold flex items-center gap-2">
                          <Users className="h-5 w-5 text-primary" />
                          {booking.guest_count} guest{booking.guest_count > 1 ? 's' : ''}
                        </p>
                      </div>
                      {booking.nights && (
                        <div>
                          <p className="text-sm text-muted-foreground">Duration</p>
                          <p className="text-lg font-semibold">{booking.nights} night{booking.nights > 1 ? 's' : ''}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Status */}
                <Card>
                  <CardHeader>
                    <CardTitle>Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">Created: {new Date(booking.created_at).toLocaleString()}</p>
                  </CardContent>
                </Card>

                {/* Rooms/Destinations Booked */}
                {booking.booking_type === 'hotel' && booking.rooms && booking.rooms.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Rooms Booked</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {booking.rooms.map((room, idx) => (
                          <div key={room.id || idx} className="border border-border rounded-lg p-4 bg-muted/50">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="font-semibold text-lg">Room {room.room_number}</p>
                                <p className="text-sm text-muted-foreground capitalize mt-1">{room.type}</p>
                                {booking.nights && (
                                  <p className="text-sm font-medium text-primary mt-2">
                                    ৳{room.price_per_night}/night × {booking.nights} nights = ৳{(room.price_per_night * booking.nights).toFixed(2)}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {booking.booking_type === 'package' && booking.destinations && booking.destinations.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Package Destinations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {booking.destinations.map((dest, idx) => (
                          <div key={dest.id || idx} className="border border-border rounded-lg p-4 bg-muted/50">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="font-semibold text-lg">{dest.name}</p>
                                {dest.description && (
                                  <p className="text-sm text-muted-foreground mt-1">{dest.description}</p>
                                )}
                                <p className="text-xs text-muted-foreground mt-2">Sequence: {dest.sequence}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Pricing Summary */}
              <aside>
                <Card>
                  <CardHeader>
                    <CardTitle>Price Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Total Amount</span>
                      <span className="text-2xl font-bold text-primary flex items-center gap-1">
                        <DollarSign className="h-6 w-6" />
                        ৳{booking.total_amount.toFixed(2)}
                      </span>
                    </div>

                      <div className="border-t pt-4 space-y-3">
                        {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                          <Button
                            variant="destructive"
                            className="w-full"
                            onClick={cancelBooking}
                          >
                            Cancel Booking
                          </Button>
                        )}
                        {/* Simulate a payment for testing */}
                        {booking.status === 'pending' && (
                          <Button className="w-full" onClick={payNow}>Pay Now (simulate)</Button>
                        )}
                        <Button asChild className="w-full">
                          <Link to="/bookings">Back to Bookings</Link>
                        </Button>
                      </div>

                      {/* Payment history */}
                      <div className="mt-4">
                        <h4 className="text-sm font-semibold mb-2">Payments</h4>
                        <div className="space-y-2">
                          {payments.length === 0 ? (
                            <div className="text-sm text-muted-foreground">No payments yet</div>
                          ) : (
                            payments.map(p => (
                              <div key={p.id} className="p-2 border rounded flex justify-between items-center">
                                <div>
                                  <div className="font-medium">{p.method} • ৳{p.amount.toFixed(2)}</div>
                                  <div className="text-xs text-muted-foreground">{p.status} • {p.transaction_id || ''} • {new Date(p.created_at).toLocaleString()}</div>
                                </div>
                                <div className="text-sm font-medium">{p.status === 'paid' ? <span className="text-green-600">Paid</span> : <span className="text-gray-600">{p.status}</span>}</div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                  </CardContent>
                </Card>
              </aside>
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground text-lg">Booking not found</p>
                <Button asChild className="mt-4">
                  <Link to="/bookings">Back to Bookings</Link>
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

export default BookingDetails;
