import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EditPackageModal from '@/components/EditPackageModal';
import PackageDetailsModal from '@/components/PackageDetailsModal';
import { Trash2, Edit3 } from 'lucide-react';

interface Package {
  id: number;
  name: string;
  description?: string;
  price: number;
  duration_days: number;
  image_url?: string;
  destinations: Array<{ id: number; name: string; description?: string; sequence: number }>;
  booking_count: number;
  breakfast?: boolean;
  lunch?: boolean;
  dinner?: boolean;
  transport?: string | null;
}

const TourPackages = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [user, setUser] = useState<any>(null);
  const [editPkgId, setEditPkgId] = useState<number | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const navigate = useNavigate();
  const [detailsPkgId, setDetailsPkgId] = useState<number | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    fetchPackages();
    // load user from localStorage (set by Navbar after auth check)
    try {
      const raw = localStorage.getItem('user');
      if (raw) setUser(JSON.parse(raw));
    } catch (e) { /* ignore */ }
  }, []);

  async function fetchPackages() {
    setLoading(true);
    const res = await fetch('/api/tour_packages.php');
    const json = await res.json();
    setPackages(json.data || []);
    setLoading(false);
  }

  const deletePackage = async (pkgId: number) => {
    if (!user || user.role !== 'admin') {
      alert('Only admins can delete packages');
      return;
    }
    if (!confirm('Delete this package? This action cannot be undone.')) return;
    try {
      const res = await fetch(`/api/tour_packages.php?id=${pkgId}`, { method: 'DELETE', credentials: 'include' });
      const json = await res.json();
      if (json.success) {
        // refresh
        fetchPackages();
        alert('Package deleted');
      } else {
        alert(json.error || 'Delete failed');
      }
    } catch (err) {
      console.error('Delete error', err);
      alert('Delete failed');
    }
  };

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
                <Card key={pkg.id} className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={() => { navigate(`/tour-packages/${pkg.id}`); }}>
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
                      {user && user.role === 'admin' && (
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setEditPkgId(pkg.id); setEditOpen(true); }}>
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); deletePackage(pkg.id); }}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">{pkg.duration_days} days</div>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <div className="mb-2 text-muted-foreground">{pkg.description}</div>
                    {/* package features: meals and transport */}
                    <div className="mb-3 flex flex-wrap gap-2">
                      {pkg.breakfast ? <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">Breakfast</span> : null}
                      {pkg.lunch ? <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">Lunch</span> : null}
                      {pkg.dinner ? <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">Dinner</span> : null}
                      {pkg.transport ? <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">Transport: {pkg.transport}</span> : null}
                    </div>
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
                      <div className="flex gap-2">
                        <Button size="sm" onClick={(e) => { e.stopPropagation(); setDetailsPkgId(pkg.id); setDetailsOpen(true); }}>Book Now</Button>
                        <Button asChild size="sm" variant="outline">
                          <Link to={`/tour-packages/${pkg.id}`}>View</Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
      <EditPackageModal packageId={editPkgId} open={editOpen} onOpenChange={(v) => { setEditOpen(v); if (!v) setEditPkgId(null); }} onSaved={() => fetchPackages()} />
      <PackageDetailsModal packageId={detailsPkgId} open={detailsOpen} onOpenChange={(v) => { setDetailsOpen(v); if (!v) setDetailsPkgId(null); }} />
    </div>
  );
};

export default TourPackages;
