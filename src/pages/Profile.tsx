import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Mail, Phone, MapPin, Calendar, CreditCard } from "lucide-react";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '@/lib/api-config';
import { toast } from 'sonner';

const Profile = () => {
  const [user, setUser] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadLocal = () => {
      try {
        const raw = localStorage.getItem('user');
        if (raw) setUser(JSON.parse(raw));
      } catch (e) {
        console.error('Failed to parse user from localStorage', e);
      }
    };

    const checkAuth = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.AUTH_CHECK, { credentials: 'include' });
        const json = await res.json();
        if (json && json.success && json.isLoggedIn) {
          setUser(json.user);
          localStorage.setItem('user', JSON.stringify(json.user));
        } else {
          setUser(null);
          localStorage.removeItem('user');
        }
      } catch (err) {
        console.warn('Auth check failed', err);
      }
    };

    loadLocal();
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) fetchBookings();
  }, [user]);

  const fetchBookings = async () => {
    setLoadingBookings(true);
    try {
      const res = await fetch(`${API_ENDPOINTS.BOOKINGS_GET}`, { credentials: 'include' });
      const js = await res.json();
      if (js.success) {
        setBookings(js.data || []);
      } else {
        setBookings([]);
      }
    } catch (e) {
      console.error('Failed to load bookings', e);
      setBookings([]);
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleSave = () => {
    // No update endpoint yet; persist to localStorage so UI reflects changes.
    try {
      const payload = { ...user };
      localStorage.setItem('user', JSON.stringify(payload));
      toast.success('Profile updated locally');
    } catch (err) {
      console.error('Failed to save profile locally', err);
      toast.error('Could not save profile');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 pt-20 pb-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-foreground mb-8">My Profile</h1>
          
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="profile">Profile Info</TabsTrigger>
              <TabsTrigger value="bookings">My Bookings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-center mb-6">
                    <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-12 h-12 text-primary" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <Input id="firstName" value={user ? String((user.name || '').split(' ')[0]) : ''} onChange={(e) => setUser(prev => ({ ...prev, name: `${e.target.value} ${((prev?.name||'').split(' ').slice(1).join(' '))}` }))} />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <Input id="lastName" value={user ? String((user.name || '').split(' ').slice(1).join(' ')) : ''} onChange={(e) => setUser(prev => ({ ...prev, name: `${(prev?.name||'').split(' ')[0] || ''} ${e.target.value}` }))} />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <Input id="email" type="email" value={user?.email ?? ''} onChange={(e) => setUser(prev => ({ ...prev, email: e.target.value }))} />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <Input id="phone" value={user?.phone ?? ''} onChange={(e) => setUser(prev => ({ ...prev, phone: e.target.value }))} />
                      </div>
                    </div>
                    
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="address">Address</Label>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <Input id="address" value={user?.address ?? ''} onChange={(e) => setUser(prev => ({ ...prev, address: e.target.value }))} />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-4 pt-4">
                    <Button variant="outline" onClick={() => {
                      // reload stored values
                      try { const raw = localStorage.getItem('user'); if (raw) setUser(JSON.parse(raw)); } catch (e) {}
                    }}>Cancel</Button>
                    <Button onClick={handleSave}>Save Changes</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="bookings" className="mt-6">
              <div className="space-y-4">
                {loadingBookings ? (
                  <div className="text-center py-8 text-sm text-muted-foreground">Loading bookings...</div>
                ) : bookings.length === 0 ? (
                  <div className="text-center py-8 text-sm text-muted-foreground">You have no bookings yet.</div>
                ) : (
                  bookings.map((booking) => (
                    <Card key={booking.id}>
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="space-y-2">
                            <h3 className="text-xl font-semibold text-foreground">{booking.booking_name || `Booking #${booking.id}`}</h3>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <MapPin className="w-4 h-4" />
                              <span>{(booking.booking_type || '').toString().replace(/^(.)/, s => s.toUpperCase())}</span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>Check-in: {booking.check_in ?? booking.checkIn ?? '-'}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>Check-out: {booking.check_out ?? booking.checkOut ?? '-'}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col items-start md:items-end gap-2">
                            <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
                              <CreditCard className="w-5 h-5" />
                              <span>৳{Number(booking.total_amount || booking.amount || 0).toFixed(2)}</span>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              (booking.status || '').toLowerCase() === 'confirmed' 
                                ? 'bg-primary/10 text-primary' 
                                : (booking.status || '').toLowerCase() === 'pending'
                                ? 'bg-accent/10 text-accent'
                                : 'bg-muted text-muted-foreground'
                            }`}>
                              {String(booking.status || booking.status?.toString() || '').length ? booking.status : (booking.status === null ? 'N/A' : String(booking.status))}
                            </span>
                            <Button variant="outline" size="sm" onClick={() => navigate(`/bookings/${booking.id}`)}>View Details</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Profile;
