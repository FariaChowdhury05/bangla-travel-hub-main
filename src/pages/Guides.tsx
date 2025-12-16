import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Star, MapPin, Languages, Phone, Loader } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import GuideReviewModal from '@/components/GuideReviewModal';
import { API_ENDPOINTS } from "@/lib/api-config";
import { toast } from "sonner";

const Guides = () => {
  const [guides, setGuides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGuides = async () => {
      setLoading(true);
      try {
        const res = await fetch(API_ENDPOINTS.GUIDES_GET);
        const js = await res.json();
        if (js.success) setGuides(js.data || []);
      } catch (e) {
        console.error('Could not load guides', e);
        toast.error('Could not load guides');
      } finally {
        setLoading(false);
      }
    };
    fetchGuides();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Professional Tour Guides
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Book experienced local guides to make your journey memorable and hassle-free
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {guides.map((guide) => (
                <Card key={guide.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardHeader className="text-center pb-4">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary mx-auto mb-4 flex items-center justify-center">
                      <span className="text-3xl font-bold text-primary-foreground">
                        {guide.name.split(' ').map((n: string) => n[0]).join('')}
                      </span>
                    </div>
                    <CardTitle className="text-xl">{guide.name}</CardTitle>
                    <CardDescription>{guide.city}</CardDescription>
                    <div className="flex items-center justify-center gap-1 mt-2">
                      <Star className="h-4 w-4 fill-primary text-primary" />
                      <span className="text-sm font-semibold">
                        {guide.avg_rating != null ? guide.avg_rating : 'No reviews yet'}
                      </span>
                      {guide.review_count != null && (
                        <span className="text-xs text-muted-foreground ml-2">({guide.review_count})</span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{guide.city}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Languages className="h-4 w-4 text-muted-foreground" />
                      <span>{guide.languages && guide.languages.length ? guide.languages.join(', ') : 'Not specified'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs">{guide.phone}</span>
                    </div>
                    <div className="pt-2">
                      <Badge variant="secondary">{guide.experience_years} years experience</Badge>
                    </div>

                    {guide.packages && guide.packages.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-semibold text-muted-foreground mb-1">Supports packages:</p>
                        <div className="flex flex-wrap gap-2">
                          {guide.packages.map((p: any) => (
                            <span key={p.id} className="bg-primary/10 text-primary text-xs px-2 py-1 rounded">{p.name}{p.is_primary ? ' • Primary' : ''}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex flex-col gap-3">
                    <div className="w-full text-center">
                      <p className="text-2xl font-bold text-primary">৳{(guide.rate_per_day || 0).toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">per day</p>
                    </div>
                    <div className="flex gap-2">
                      <Button className="flex-1" onClick={() => {
                        // find primary package or first package
                        const pkg = guide.packages && guide.packages.length ? (guide.packages.find((p: any) => p.is_primary) || guide.packages[0]) : null;
                        if (!pkg) {
                          toast.error('This guide is not assigned to any package. Please contact support.');
                          return;
                        }
                        // navigate to booking with package and guide
                        navigate(`/bookings/new?package_id=${pkg.id}&guide_id=${guide.id}`);
                      }}>Hire Guide</Button>
                      <GuideReviewModal guideId={guide.id} />
                    </div>
                  </CardFooter>
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

export default Guides;
