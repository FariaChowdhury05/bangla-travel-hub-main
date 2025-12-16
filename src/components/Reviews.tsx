import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Loader, X } from "lucide-react";
import ReviewFormModal from "./ReviewFormModal";
import { API_ENDPOINTS } from "@/lib/api-config";
import { toast } from "sonner";

interface Review {
  id: number;
  name: string;
  location: string;
  rating: number;
  comment: string;
  date: string;
  tour: string;
}

const Reviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.REVIEWS_GET, { credentials: 'include' });
      const data = await response.json();
      
      if (data.success && data.data) {
        // Format the date from database
        const formattedReviews = data.data.map((review: any) => ({
          ...review,
          date: new Date(review.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        }));
        setReviews(formattedReviews);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("Could not load reviews. Make sure your backend is running.");
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // load current user from localStorage (set on login/signup)
    try {
      const raw = localStorage.getItem('user');
      if (raw) setUser(JSON.parse(raw));
    } catch (e) {
      console.error('Failed to parse user from localStorage', e);
    }
  }, []);

  const deleteReview = async (reviewId: number) => {
    if (!user || user.role !== 'admin') {
      toast.error('Only admins can delete reviews');
      return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.REVIEWS_GET, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ id: reviewId })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success("Review deleted successfully");
        // Remove from UI immediately
        setReviews(prev => prev.filter(r => r.id !== reviewId));
      } else {
        toast.error(data.message || "Failed to delete review");
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error("Could not delete review");
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  return (
    <section className="py-16 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            What Our Tourists Say
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Real experiences from travelers who explored Bangladesh with us
          </p>
          
          {/* Review Us Button */}
          <div className="mt-6">
            <ReviewFormModal onReviewSubmitted={fetchReviews} />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : reviews.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {reviews.map((review) => (
              <Card key={review.id} className="hover:shadow-lg transition-shadow relative">
                {user && user.role === 'admin' && (
                <button
                  onClick={() => deleteReview(review.id)}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-destructive hover:bg-destructive/80 text-white transition-colors z-10"
                  title="Delete review"
                >
                  <X className="h-4 w-4" />
                </button>
                )}
                <CardContent className="pt-6">
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < review.rating
                            ? "fill-primary text-primary"
                            : "fill-muted text-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-foreground mb-4 line-clamp-4">
                    "{review.comment}"
                  </p>
                  <div className="pt-4 border-t border-border">
                    <p className="font-semibold text-foreground">{review.name}</p>
                    <p className="text-xs text-muted-foreground">{review.location}</p>
                    <p className="text-xs text-primary mt-1">{review.tour}</p>
                    <p className="text-xs text-muted-foreground mt-1">{review.date}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No reviews available yet. Be the first to share your experience!</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Reviews;
