import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tag, Clock, MapPin, Star } from "lucide-react";
import { Link } from 'react-router-dom';
import { API_ENDPOINTS } from '@/lib/api-config';
import { toast } from 'sonner';

const Offers = () => {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showingAll, setShowingAll] = useState(false);

  useEffect(() => { fetchOffers(); }, []);

  useEffect(() => {
    const handler = () => fetchOffers();
    window.addEventListener('data-updated', handler as EventListener);
    return () => window.removeEventListener('data-updated', handler as EventListener);
  }, []);

  const fetchOffers = async () => {
    setLoading(true);
    setShowingAll(false);
    try {
      // Try to load active offers first (current promotions)
      let res = await fetch(`${API_ENDPOINTS.OFFERS_GET}?active_only=1`, { credentials: 'include' });
      let js = await res.json();
      if (js.success && Array.isArray(js.data) && js.data.length > 0) {
        setOffers(js.data || []);
        setShowingAll(false);
        setLoading(false);
        return;
      }

      // If no active offers found, fetch all offers so admin-created ones are visible
      res = await fetch(`${API_ENDPOINTS.OFFERS_GET}`, { credentials: 'include' });
      js = await res.json();
      if (js.success) {
        setOffers(js.data || []);
        setShowingAll(true);
      } else {
        toast.error(js.error || 'Failed to load offers');
      }
    } catch (e) {
      console.error(e);
      toast.error('Error loading offers');
    } finally {
      setLoading(false);
    }
  };

  const renderDiscountText = (o:any) => {
    if (o.discount_type === 'percentage') return `${o.discount_value}% OFF`;
    return `৳${Number(o.discount_value).toFixed(2)} OFF`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 pt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Special Offers & Deals
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover amazing discounts and exclusive packages for your next adventure in Bangladesh
            </p>
          </div>
          
          <div className="flex items-center justify-between mb-6">
            <div className="text-sm text-muted-foreground">
              {showingAll ? 'No active offers found — showing all offers (including inactive)' : 'Showing active offers'}
            </div>
            <div>
              <Button variant="outline" onClick={() => fetchOffers()}>Refresh</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full text-center py-12">Loading offers...</div>
            ) : offers.length === 0 ? (
              <div className="col-span-full text-center py-12 text-muted-foreground">No active offers found.</div>
            ) : (
              offers.map((offer:any) => (
                <Card key={offer.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <img 
                      src={offer.image_url || '/placeholder.svg'}
                      alt={offer.title}
                      className="w-full h-48 object-cover"
                    />
                    <Badge className="absolute top-4 right-4 bg-accent text-accent-foreground text-lg font-bold px-3 py-1">
                      {renderDiscountText(offer)}
                    </Badge>
                  </div>
                  
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">{offer.title}</CardTitle>
                      {offer.status !== 'active' && (
                        <Badge variant="secondary" className="text-sm">Inactive</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{offer.description}</p>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{offer.start_date} → {offer.end_date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Star className="w-4 h-4 fill-primary text-primary" />
                        <span className="font-semibold text-foreground">{offer.package_ids ? offer.package_ids.length : 0} packages</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      {offer.description}
                    </p>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>Valid from {offer.start_date} to {offer.end_date}</span>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2">
                      <div>
                        <span className="text-2xl font-bold text-primary ml-2">
                          {offer.discount_type === 'percentage' ? offer.discount_value + '% off' : '৳' + Number(offer.discount_value).toFixed(2) + ' off'}
                        </span>
                      </div>
                    </div>
                    
                    <Button className="w-full bg-primary hover:bg-primary/90" asChild>
                      <Link to="/tour-packages">
                        <Tag className="w-4 h-4 mr-2" />
                        View Packages
                      </Link>
                    </Button>
                    
                    {/* show linked package previews */}
                    {offer.packages && offer.packages.length > 0 && (
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {offer.packages.map((p:any) => (
                          <div key={p.id} className="flex items-center gap-3 border rounded p-2">
                            <img src={p.image_url || '/placeholder.svg'} alt={p.name} className="w-20 h-14 object-cover rounded" />
                            <div className="flex-1">
                              <div className="font-medium text-sm">{p.name}</div>
                              <div className="text-xs text-muted-foreground">৳{p.price.toFixed(2)}</div>
                            </div>
                            <div>
                              <Link to={`/bookings/new?package_id=${p.id}&offer_id=${offer.id}`} className="text-sm text-primary underline">Book</Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Offers;
