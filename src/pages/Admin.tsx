import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { API_ENDPOINTS } from '@/lib/api-config';
import { toast } from 'sonner';
import { Loader, Plus, Trash2, Eye, Calendar, Users, DollarSign, Map, Building2, Sparkles, DoorOpen, CheckCircle2, MessageSquare } from 'lucide-react';
import AdminFacilityEditor from '@/components/AdminFacilityEditor';
// Add this import for the editor UI
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('destinations');
  const [loading, setLoading] = useState(false);
  const [destinations, setDestinations] = useState<Array<any>>([]);
  const [destLoading, setDestLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '',
    rating: 4.5,
    hotel_count: 0,
    latitude: '',
    longitude: '',
    location_info: '',
    highlights: '',
    best_time_to_visit: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rating' || name === 'hotel_count' || name === 'latitude' || name === 'longitude' 
        ? parseFloat(value) || value 
        : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description || !formData.image_url) {
      toast.error('Please fill in name, description, and image URL');
      return;
    }

    setLoading(true);
    try {
      let response;

      // If user selected a file in the file input, send multipart/form-data
      const fileInput = (document.getElementById('image_file') as HTMLInputElement | null);
      const file = fileInput && fileInput.files && fileInput.files[0] ? fileInput.files[0] : null;

      if (file) {
        const fd = new FormData();
        fd.append('name', String(formData.name));
        fd.append('description', String(formData.description));
        fd.append('rating', String(formData.rating));
        fd.append('hotel_count', String(formData.hotel_count));
        if (formData.latitude !== '') fd.append('latitude', String(formData.latitude));
        if (formData.longitude !== '') fd.append('longitude', String(formData.longitude));
        if (formData.location_info) fd.append('location_info', String(formData.location_info));
        if (formData.highlights) fd.append('highlights', String(formData.highlights));
        if (formData.best_time_to_visit) fd.append('best_time_to_visit', String(formData.best_time_to_visit));
        fd.append('image', file);

        response = await fetch(API_ENDPOINTS.DESTINATIONS_POST, {
          method: 'POST',
          credentials: 'include',
          body: fd,
        });
      } else {
        // Fallback to JSON body with image_url
        response = await fetch(API_ENDPOINTS.DESTINATIONS_POST, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(formData),
        });
      }

      const data = await response.json();

      if (data.success) {
        toast.success('Destination created successfully!');
        // Reset form
        setFormData({
          name: '',
          description: '',
          image_url: '',
          rating: 4.5,
          hotel_count: 0,
          latitude: '',
          longitude: '',
          location_info: '',
          highlights: '',
          best_time_to_visit: '',
        });
        if (fileInput) fileInput.value = '';
        // Notify other components to refresh data (destinations/hotels)
        try {
          window.dispatchEvent(new CustomEvent('data-updated'));
        } catch (e) {
          // ignore in non-browser environments
        }
      } else {
        toast.error(data.error || 'Failed to create destination');
      }
    } catch (error) {
      console.error('Error creating destination:', error);
      toast.error('Could not create destination');
    } finally {
      setLoading(false);
    }
  };

  // --- Hotels tab state & handlers ---
  const [destOptions, setDestOptions] = useState<Array<any>>([]);
  const [hotelOptions, setHotelOptions] = useState<Array<any>>([]);
  const [hotels, setHotels] = useState<Array<any>>([]);
  const [hotelLoading, setHotelLoading] = useState(false);
  const [hotelForm, setHotelForm] = useState({
    destination_id: '',
    name: '',
    description: '',
    image_url: '',
    rating: 4.0,
    address: '',
    phone: '',
  });

  // Fetch destinations for both tabs
  const fetchDestinations = async () => {
    try {
      const res = await fetch(API_ENDPOINTS.DESTINATIONS_GET, { credentials: 'include' });
      if (!res.ok) {
        console.error('Failed to fetch destinations:', res.status);
        return;
      }
      const json = await res.json();
      if (json.success) {
        setDestinations(json.data || []);
        setDestOptions(json.data || []);
      }
    } catch (err) {
      console.warn('Could not load destinations', err);
    }
  };

  // Fetch hotels for both tabs
  const fetchHotels = async () => {
    try {
      const res = await fetch(API_ENDPOINTS.HOTELS_GET, { credentials: 'include' });
      const json = await res.json();
      if (json.success) {
        setHotels(json.data || []);
        setHotelOptions(json.data || []);
      }
    } catch (err) {
      console.warn('Could not load hotels', err);
    }
  };

  // Fetch on mount and when tabs change
  useEffect(() => {
    fetchDestinations();
    fetchHotels();
  }, []);

  useEffect(() => {
    if (activeTab === 'destinations') fetchDestinations();
    if (activeTab === 'hotels') fetchHotels();
  }, [activeTab]);

  const handleHotelChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setHotelForm(prev => ({ ...prev, [name]: value }));
  };

  const handleHotelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hotelForm.destination_id || !hotelForm.name) {
      toast.error('Please select a destination and enter hotel name');
      return;
    }
    setHotelLoading(true);
    try {
      // If a file is selected, send multipart/form-data, otherwise send JSON
      const fileInput = (document.getElementById('hotel_image_file') as HTMLInputElement | null);
      const file = fileInput && fileInput.files && fileInput.files[0] ? fileInput.files[0] : null;
      let res;
      if (file) {
        const fd = new FormData();
        fd.append('destination_id', String(hotelForm.destination_id));
        fd.append('name', hotelForm.name);
        if (hotelForm.description) fd.append('description', hotelForm.description);
        fd.append('rating', String(hotelForm.rating));
        if (hotelForm.address) fd.append('address', hotelForm.address);
        if (hotelForm.phone) fd.append('phone', hotelForm.phone);
        fd.append('image', file);
        res = await fetch(API_ENDPOINTS.HOTELS_POST, {
          method: 'POST',
          credentials: 'include',
          body: fd,
        });
      } else {
        res = await fetch(API_ENDPOINTS.HOTELS_POST, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            destination_id: hotelForm.destination_id,
            name: hotelForm.name,
            description: hotelForm.description,
            image_url: hotelForm.image_url,
            rating: parseFloat(String(hotelForm.rating)) || 4.0,
            address: hotelForm.address,
            phone: hotelForm.phone,
          }),
        });
      }
      const json = await res.json();
      if (json.success) {
        toast.success('Hotel created successfully');
        setHotelForm({ destination_id: '', name: '', description: '', image_url: '', rating: 4.0, address: '', phone: '' });
        try {
          window.dispatchEvent(new CustomEvent('data-updated'));
        } catch (e) {}
      } else {
        toast.error(json.error || 'Failed to create hotel');
      }
    } catch (err) {
      console.error('Error creating hotel', err);
      toast.error('Could not create hotel');
    } finally {
      setHotelLoading(false);
    }
  };

  // --- Rooms tab state & handlers ---
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [rooms, setRooms] = useState<Array<any>>([]);
  const [roomForm, setRoomForm] = useState({
    hotel_id: '',
    room_number: '',
    type: 'standard',
    price_per_night: '',
    max_guests: '2',
    description: '',
  });

  useEffect(() => {
    // fetch hotels for select dropdown in rooms tab
    const fetchHotels = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.HOTELS_GET, { credentials: 'include' });
        const json = await res.json();
        if (json.success) setHotelOptions(json.data || []);
      } catch (err) {
        console.warn('Could not load hotels for room admin', err);
      }
    };
    fetchHotels();
  }, []);

  const handleRoomChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setRoomForm(prev => ({ ...prev, [name]: value }));
  };

  const handleRoomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomForm.hotel_id || !roomForm.room_number || !roomForm.price_per_night) {
      toast.error('Please fill in hotel, room number, and price');
      return;
    }
    setRoomsLoading(true);
    try {
      const res = await fetch(API_ENDPOINTS.ROOMS_POST, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          hotel_id: parseInt(roomForm.hotel_id),
          room_number: roomForm.room_number,
          type: roomForm.type,
          price_per_night: parseFloat(roomForm.price_per_night),
          max_guests: parseInt(roomForm.max_guests),
          description: roomForm.description,
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Room created successfully');
        setRoomForm({ hotel_id: '', room_number: '', type: 'standard', price_per_night: '', max_guests: '2', description: '' });
        fetchRooms();
      } else {
        toast.error(json.error || 'Failed to create room');
      }
    } catch (err) {
      console.error('Error creating room', err);
      toast.error('Could not create room');
    } finally {
      setRoomsLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      const res = await fetch(API_ENDPOINTS.ROOMS_GET, { credentials: 'include' });
      const json = await res.json();
      if (json.success) setRooms(json.data || []);
    } catch (err) {
      console.warn('Could not load rooms', err);
    }
  };

  // --- Bookings admin state & handlers ---
  const [bookings, setBookings] = useState<Array<any>>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingStatusFilter, setBookingStatusFilter] = useState('all');

  const fetchAdminBookings = async () => {
    setBookingsLoading(true);
    try {
      let url = `${API_ENDPOINTS.BOOKINGS_GET}?admin_all=1`;
      if (bookingStatusFilter !== 'all') {
        url += `&status=${bookingStatusFilter}`;
      }
      const res = await fetch(url, { credentials: 'include' });
      const json = await res.json();
      if (json.success) setBookings(json.data || []);
      else toast.error('Could not load bookings');
    } catch (err) {
      console.error('Error loading bookings', err);
      toast.error('Could not load bookings');
    } finally {
      setBookingsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'rooms') fetchRooms();
    if (activeTab === 'bookings') fetchAdminBookings();
  }, [activeTab]);

  const handleDeleteRoom = async (roomId: number) => {
    if (!window.confirm('Delete this room?')) return;
    try {
      const res = await fetch(`${API_ENDPOINTS.ROOMS_DELETE}?id=${roomId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Room deleted');
        fetchRooms();
      } else {
        toast.error(json.error || 'Failed to delete room');
      }
    } catch (err) {
      console.error('Error deleting room', err);
      toast.error('Could not delete room');
    }
  };

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">Manage destinations, reviews, and site content</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-border overflow-x-auto">
          <button
            onClick={() => setActiveTab('destinations')}
            className={`px-4 py-3 font-medium border-b-2 transition whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'destinations'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Map className="h-4 w-4" />
            Destinations
          </button>
          <button
            onClick={() => setActiveTab('hotels')}
            className={`px-4 py-3 font-medium border-b-2 transition whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'hotels'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Building2 className="h-4 w-4" />
            Hotels
          </button>
          <button
            onClick={() => setActiveTab('facilities')}
            className={`px-4 py-3 font-medium border-b-2 transition whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'facilities'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            Facilities
          </button>
          <button
            onClick={() => setActiveTab('tour_packages')}
            className={`px-4 py-3 font-medium border-b-2 transition whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'tour_packages'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Calendar className="h-4 w-4" />
            Tour Packages
          </button>
          <button
            onClick={() => setActiveTab('rooms')}
            className={`px-4 py-3 font-medium border-b-2 transition whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'rooms'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <DoorOpen className="h-4 w-4" />
            Rooms
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-3 font-medium border-b-2 transition whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'bookings'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <CheckCircle2 className="h-4 w-4" />
            Bookings
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-4 py-3 font-medium border-b-2 transition whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'reviews'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            Reviews
          </button>
        </div>

        {/* Destinations Tab */}
        {activeTab === 'destinations' && (
          <div className="bg-card border border-border rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Plus className="h-6 w-6" />
              Add New Destination
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <Label htmlFor="name" className="text-base font-medium">Destination Name *</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="e.g., Cox's Bazar"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="mt-2"
                />
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description" className="text-base font-medium">Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe the destination in detail..."
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="mt-2"
                />
              </div>

              {/* Image URL */}
              <div>
                <Label htmlFor="image_url" className="text-base font-medium">Image URL or File *</Label>
                <div className="space-y-2 mt-2">
                  <Input
                    id="image_file"
                    name="image"
                    type="file"
                    accept="image/*"
                    className="cursor-pointer"
                  />
                  <div className="text-center text-sm text-muted-foreground">or</div>
                  <Input
                    id="image_url"
                    name="image_url"
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={formData.image_url}
                    onChange={handleInputChange}
                    className=""
                  />
                </div>
                {formData.image_url && (
                  <div className="mt-3 w-32 h-32 rounded-lg overflow-hidden border border-border">
                    <img src={formData.image_url} alt="preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Rating and Hotel Count */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rating" className="text-base font-medium">Rating (1-5)</Label>
                  <Input
                    id="rating"
                    name="rating"
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={formData.rating}
                    onChange={handleInputChange}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="hotel_count" className="text-base font-medium">Number of Hotels</Label>
                  <Input
                    id="hotel_count"
                    name="hotel_count"
                    type="number"
                    value={formData.hotel_count}
                    onChange={handleInputChange}
                    className="mt-2"
                  />
                </div>
              </div>

              {/* Location Info */}
              <div>
                <Label htmlFor="location_info" className="text-base font-medium">Location Info</Label>
                <Input
                  id="location_info"
                  name="location_info"
                  type="text"
                  placeholder="e.g., Chittagong Division, Southeast Bangladesh"
                  value={formData.location_info}
                  onChange={handleInputChange}
                  className="mt-2"
                />
              </div>

              {/* Latitude and Longitude */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="latitude" className="text-base font-medium">Latitude</Label>
                  <Input
                    id="latitude"
                    name="latitude"
                    type="number"
                    step="0.0001"
                    placeholder="e.g., 21.4272"
                    value={formData.latitude}
                    onChange={handleInputChange}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="longitude" className="text-base font-medium">Longitude</Label>
                  <Input
                    id="longitude"
                    name="longitude"
                    type="number"
                    step="0.0001"
                    placeholder="e.g., 92.0058"
                    value={formData.longitude}
                    onChange={handleInputChange}
                    className="mt-2"
                  />
                </div>
              </div>

              {/* Highlights */}
              <div>
                <Label htmlFor="highlights" className="text-base font-medium">Highlights (comma-separated)</Label>
                <Textarea
                  id="highlights"
                  name="highlights"
                  placeholder="e.g., World's longest beach, water sports, seafood restaurants"
                  value={formData.highlights}
                  onChange={handleInputChange}
                  rows={2}
                  className="mt-2"
                />
              </div>

              {/* Best Time to Visit */}
              <div>
                <Label htmlFor="best_time_to_visit" className="text-base font-medium">Best Time to Visit</Label>
                <Input
                  id="best_time_to_visit"
                  name="best_time_to_visit"
                  type="text"
                  placeholder="e.g., October - March"
                  value={formData.best_time_to_visit}
                  onChange={handleInputChange}
                  className="mt-2"
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90">
                  {loading ? (
                    <>
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Destination'
                  )}
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/">Back to Home</Link>
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Hotels Tab */}
        {activeTab === 'hotels' && (
          <div className="bg-card border border-border rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Plus className="h-6 w-6" />
              Add New Hotel
            </h2>

            <form onSubmit={handleHotelSubmit} className="space-y-6">
              <div>
                <Label htmlFor="destination_id" className="text-base font-medium">Destination *</Label>
                <select
                  id="destination_id"
                  name="destination_id"
                  value={hotelForm.destination_id}
                  onChange={handleHotelChange}
                  className="mt-2 w-full rounded-md border px-3 py-2"
                  required
                >
                  <option value="">Select a destination</option>
                  {destOptions.map((d: any) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="hotel_name" className="text-base font-medium">Hotel Name *</Label>
                <Input id="hotel_name" name="name" value={hotelForm.name} onChange={handleHotelChange} required className="mt-2" />
              </div>

              <div>
                <Label htmlFor="hotel_description" className="text-base font-medium">Description</Label>
                <Textarea id="hotel_description" name="description" value={hotelForm.description} onChange={handleHotelChange} rows={3} className="mt-2" />
              </div>

              <div>
                <Label htmlFor="hotel_image_file" className="text-base font-medium">Image (optional)</Label>
                <input id="hotel_image_file" name="image" type="file" accept="image/*" className="mt-2" />
                <div className="mt-2">
                  <Label htmlFor="hotel_image_url" className="text-sm">Or image URL</Label>
                  <Input id="hotel_image_url" name="image_url" value={hotelForm.image_url} onChange={handleHotelChange} placeholder="https://example.com/hotel.jpg" className="mt-1" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="hotel_rating" className="text-base font-medium">Rating</Label>
                  <Input id="hotel_rating" name="rating" type="number" step="0.1" min="1" max="5" value={String(hotelForm.rating)} onChange={handleHotelChange} className="mt-2" />
                </div>
                <div>
                  <Label htmlFor="hotel_phone" className="text-base font-medium">Phone</Label>
                  <Input id="hotel_phone" name="phone" value={hotelForm.phone} onChange={handleHotelChange} className="mt-2" />
                </div>
              </div>

              <div>
                <Label htmlFor="hotel_address" className="text-base font-medium">Address</Label>
                <Input id="hotel_address" name="address" value={hotelForm.address} onChange={handleHotelChange} className="mt-2" />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={hotelLoading} className="bg-primary hover:bg-primary/90">
                  {hotelLoading ? (
                    <>
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Hotel'
                  )}
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/">Back to Home</Link>
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Rooms Tab */}
        {activeTab === 'rooms' && (
          <div className="bg-card border border-border rounded-lg p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Add Room Form */}
              <div>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Plus className="h-6 w-6" />
                  Add New Room
                </h2>

                <form onSubmit={handleRoomSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="room_hotel_id" className="text-base font-medium">Hotel *</Label>
                    <select
                      id="room_hotel_id"
                      name="hotel_id"
                      value={roomForm.hotel_id}
                      onChange={handleRoomChange}
                      className="mt-2 w-full rounded-md border border-border px-3 py-2 bg-background"
                      required
                    >
                      <option value="">Select a hotel</option>
                      {hotelOptions.map((h: any) => (
                        <option key={h.id} value={h.id}>{h.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="room_number" className="text-base font-medium">Room Number *</Label>
                    <Input
                      id="room_number"
                      name="room_number"
                      placeholder="e.g., 101, 102A"
                      value={roomForm.room_number}
                      onChange={handleRoomChange}
                      required
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="room_type" className="text-base font-medium">Room Type *</Label>
                    <select
                      id="room_type"
                      name="type"
                      value={roomForm.type}
                      onChange={handleRoomChange}
                      className="mt-2 w-full rounded-md border border-border px-3 py-2 bg-background"
                    >
                      <option value="standard">Standard</option>
                      <option value="deluxe">Deluxe</option>
                      <option value="suite">Suite</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price_per_night" className="text-base font-medium">Price/Night (৳) *</Label>
                      <Input
                        id="price_per_night"
                        name="price_per_night"
                        type="number"
                        step="50"
                        min="0"
                        placeholder="e.g., 3000"
                        value={roomForm.price_per_night}
                        onChange={handleRoomChange}
                        required
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="max_guests" className="text-base font-medium">Max Guests *</Label>
                      <Input
                        id="max_guests"
                        name="max_guests"
                        type="number"
                        min="1"
                        max="10"
                        value={roomForm.max_guests}
                        onChange={handleRoomChange}
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="room_description" className="text-base font-medium">Description</Label>
                    <Textarea
                      id="room_description"
                      name="description"
                      placeholder="e.g., Spacious room with ocean view, AC, WiFi..."
                      value={roomForm.description}
                      onChange={handleRoomChange}
                      rows={3}
                      className="mt-2"
                    />
                  </div>

                  <Button type="submit" disabled={roomsLoading} className="w-full bg-primary hover:bg-primary/90">
                    {roomsLoading ? (
                      <>
                        <Loader className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Room'
                    )}
                  </Button>
                </form>
              </div>

              {/* Rooms List */}
              <div>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Eye className="h-6 w-6" />
                  Existing Rooms
                </h2>

                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {rooms.length > 0 ? (
                    rooms.map((room: any) => {
                      const hotel = hotelOptions.find((h: any) => h.id === room.hotel_id);
                      return (
                        <div key={room.id} className="border border-border rounded-lg p-4 bg-muted/50">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-semibold text-sm">{hotel?.name || 'Hotel'} - Room {room.room_number}</p>
                              <p className="text-xs text-muted-foreground capitalize">{room.type} • Max {room.max_guests} guests</p>
                              <p className="text-sm font-bold text-primary mt-1">৳ {room.price_per_night}/night</p>
                              {room.description && (
                                <p className="text-xs text-muted-foreground mt-2">{room.description}</p>
                              )}
                            </div>
                            <Button
                              onClick={() => handleDeleteRoom(room.id)}
                              size="sm"
                              variant="destructive"
                              className="ml-2"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">No rooms yet. Create one to get started.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Facilities Tab */}
        {activeTab === 'facilities' && (
          <div className="bg-card border border-border rounded-lg p-8">
            <AdminFacilityEditor />
          </div>
        )}

        {/* Tour Packages Tab */}
        {activeTab === 'tour_packages' && (
          <div className="bg-card border border-border rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Calendar className="h-6 w-6" />
              Manage Tour Packages
            </h2>
            <TourPackagesAdmin />
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="bg-card border border-border rounded-lg p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-4">All Bookings</h2>
              <div className="flex gap-2">
                <select
                  value={bookingStatusFilter}
                  onChange={(e) => setBookingStatusFilter(e.target.value)}
                  className="px-3 py-2 border rounded-md bg-background"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <Button onClick={fetchAdminBookings} disabled={bookingsLoading}>
                  {bookingsLoading ? <Loader className="h-4 w-4 animate-spin" /> : 'Refresh'}
                </Button>
              </div>
            </div>

            {bookingsLoading ? (
              <div className="flex justify-center py-12">
                <Loader className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : bookings.length > 0 ? (
              <div className="space-y-4">
                {bookings.map((booking) => {
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

                  const isHotel = booking.booking_type === 'hotel';

                  return (
                    <div key={booking.id} className="border border-border rounded-lg p-4 bg-muted/50">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="text-lg font-semibold">{booking.booking_name}</h4>
                            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                              {isHotel ? 'Hotel' : 'Package'}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(booking.status)}`}>
                              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            {isHotel && booking.check_in && booking.check_out ? (
                              <>
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <Calendar className="h-4 w-4" />
                                  <span>{new Date(booking.check_in).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <Calendar className="h-4 w-4" />
                                  <span>{new Date(booking.check_out).toLocaleDateString()}</span>
                                </div>
                              </>
                            ) : (
                              <div className="text-muted-foreground text-xs">Package Booking</div>
                            )}
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Users className="h-4 w-4" />
                              <span>{booking.guest_count} guest{booking.guest_count > 1 ? 's' : ''}</span>
                            </div>
                            {booking.nights && (
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <span>{booking.nights} night{booking.nights > 1 ? 's' : ''}</span>
                              </div>
                            )}
                          </div>

                          {/* Hotel Rooms */}
                          {isHotel && booking.rooms && booking.rooms.length > 0 && (
                            <div className="mt-3">
                              <p className="text-xs font-semibold text-muted-foreground mb-1">Rooms:</p>
                              <div className="flex flex-wrap gap-2">
                                {booking.rooms.map((room: any) => (
                                  <span key={room.id} className="bg-primary/10 text-primary text-xs px-2 py-1 rounded">
                                    Room {room.room_number} ({room.type})
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Package Destinations */}
                          {!isHotel && booking.destinations && booking.destinations.length > 0 && (
                            <div className="mt-3">
                              <p className="text-xs font-semibold text-muted-foreground mb-1">Destinations:</p>
                              <div className="flex flex-wrap gap-2">
                                {booking.destinations.map((dest: any) => (
                                  <span key={dest.id} className="bg-primary/10 text-primary text-xs px-2 py-1 rounded">
                                    {dest.name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="text-right flex-shrink-0">
                          <p className="text-2xl font-bold text-primary">৳{booking.total_amount.toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">Booking #{booking.id}</p>
                          <Button asChild variant="outline" size="sm" className="mt-2">
                            <Link to={`/bookings/${booking.id}`}>View</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No bookings found.</p>
              </div>
            )}
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="bg-card border border-border rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-4">Manage Reviews</h2>
            <p className="text-muted-foreground">Review management features coming soon. Reviews can be viewed and deleted from the homepage.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;

function TourPackagesAdmin() {
  const [packages, setPackages] = React.useState<any[]>([]);
  const [destinations, setDestinations] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [editing, setEditing] = React.useState<any | null>(null);
  const [form, setForm] = React.useState({
    name: '',
    description: '',
    price: '',
    duration_days: 1,
    image_url: '',
    destinations: [] as number[],
  });
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    fetchPackages();
    fetchDestinations();
  }, []);

  async function fetchPackages() {
    setLoading(true);
    const res = await fetch('/api/tour_packages.php');
    const json = await res.json();
    setPackages(json.data || []);
    setLoading(false);
  }
  async function fetchDestinations() {
    const res = await fetch('/api/destinations.php');
    const json = await res.json();
    setDestinations(json.data || []);
  }

  function startEdit(pkg: any) {
    setEditing(pkg);
    setForm({
      name: pkg.name,
      description: pkg.description || '',
      price: String(pkg.price),
      duration_days: pkg.duration_days,
      image_url: pkg.image_url || '',
      destinations: pkg.destinations ? pkg.destinations.map((d: any) => d.id) : [],
    });
  }
  function startCreate() {
    setEditing(null);
    setForm({ name: '', description: '', price: '', duration_days: 1, image_url: '', destinations: [] });
  }
  async function save() {
    setSaving(true);
    const method = editing ? 'PATCH' : 'POST';
    const url = editing ? `/api/tour_packages.php?id=${editing.id}` : '/api/tour_packages.php';
    const res = await fetch(url, {
      method,
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        duration_days: form.duration_days,
        image_url: form.image_url,
      }),
    });
    const json = await res.json();
    if (json.success) {
      // Map destinations
      if (form.destinations.length) {
        for (const destId of form.destinations) {
          await fetch('/api/package_destinations.php', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ package_id: editing ? editing.id : json.id, destination_id: destId }),
          });
        }
      }
      fetchPackages();
      startCreate();
    }
    setSaving(false);
  }
  async function remove(id: number) {
    if (!window.confirm('Delete this package?')) return;
    await fetch(`/api/tour_packages.php?id=${id}`, { method: 'DELETE', credentials: 'include' });
    fetchPackages();
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-2">{editing ? 'Edit Package' : 'Create Package'}</h3>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4" onSubmit={e => { e.preventDefault(); save(); }}>
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Name" className="px-3 py-2 border rounded-md" required />
          <input value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="Price" type="number" className="px-3 py-2 border rounded-md" required />
          <input value={form.duration_days} onChange={e => setForm(f => ({ ...f, duration_days: Number(e.target.value) }))} placeholder="Duration (days)" type="number" className="px-3 py-2 border rounded-md" required />
          <input value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} placeholder="Image URL" className="px-3 py-2 border rounded-md" />
          <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Description" className="px-3 py-2 border rounded-md md:col-span-2" />
          <div className="md:col-span-2">
            <label className="font-medium">Destinations</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {destinations.map((d: any) => (
                <label key={d.id} className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.destinations.includes(d.id)}
                    onChange={e => setForm(f => ({ ...f, destinations: e.target.checked ? [...f.destinations, d.id] : f.destinations.filter(id => id !== d.id) }))}
                  />
                  {d.name}
                </label>
              ))}
            </div>
          </div>
          <div className="md:col-span-2 flex gap-2 mt-2">
            <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
            <Button type="button" variant="outline" onClick={startCreate}>Cancel</Button>
          </div>
        </form>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">All Packages</h3>
        {loading ? (
          <div>Loading…</div>
        ) : packages.length === 0 ? (
          <div>No packages yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {packages.map(pkg => (
              <Card key={pkg.id}>
                <CardHeader>
                  <CardTitle>{pkg.name}</CardTitle>
                  <div className="text-xs text-muted-foreground">৳{pkg.price.toFixed(2)} • {pkg.duration_days} days</div>
                </CardHeader>
                <CardContent>
                  <div className="mb-2 text-muted-foreground">{pkg.description}</div>
                  <div className="mb-2">
                    <span className="font-semibold">Destinations:</span>
                    <ul className="list-disc ml-6">
                      {pkg.destinations.map((dest: any) => (
                        <li key={dest.id}>{dest.name}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="text-xs text-muted-foreground mb-2">{pkg.booking_count} bookings</div>
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" onClick={() => startEdit(pkg)}>Edit</Button>
                    <Button size="sm" variant="destructive" onClick={() => remove(pkg.id)}>Delete</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
