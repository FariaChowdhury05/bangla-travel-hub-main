import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface Package {
  id: number;
  name: string;
  description?: string;
  price: number;
  duration_days: number;
  image_url?: string;
  destinations: Array<{ id: number; name: string; description?: string; sequence: number }>;
  booking_count: number;
}

const TourPackages = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPackages();
  }, []);

  async function fetchPackages() {
    setLoading(true);
    const res = await fetch('/api/tour_packages.php');
    const json = await res.json();
    setPackages(json.data || []);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Tour Packages
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore our curated tour packages for an unforgettable experience in Bangladesh
            </p>
          </div>

          {loading ? (
            <div>Loading packages…</div>
          ) : packages.length === 0 ? (
            <div>No tour packages available.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packages.map(pkg => (
                <Card key={pkg.id} className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow">
                  {pkg.image_url && (
                    <div className="h-48 overflow-hidden">
                      <img 
                        src={pkg.image_url} 
                        alt={pkg.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-semibold">{pkg.name}</span>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">{pkg.duration_days} days</div>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <div className="mb-2 text-muted-foreground">{pkg.description}</div>
                    <div className="mb-2">
                      <span className="font-semibold">Destinations:</span>
                      <ul className="list-disc ml-6">
                        {pkg.destinations.map(dest => (
                          <li key={dest.id}>{dest.name}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="mt-auto">
                      <div className="text-lg font-bold text-primary mb-2">৳{pkg.price.toFixed(2)}</div>
                      <div className="text-xs text-muted-foreground mb-2">{pkg.booking_count} bookings</div>
                      <Button asChild className="w-full">
                        <Link to={`/bookings/new?package_id=${pkg.id}`}>Book Now</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TourPackages;
