import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { API_ENDPOINTS, TOUR_OPTIONS } from "@/lib/api-config";

interface ReviewFormModalProps {
  onReviewSubmitted?: () => void;
}

const ReviewFormModal = ({ onReviewSubmitted }: ReviewFormModalProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    location: "",
    tour: "",
    comment: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTourChange = (value: string) => {
    setFormData((prev) => ({ ...prev, tour: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (
      !formData.name ||
      !formData.email ||
      !formData.location ||
      !formData.tour ||
      !formData.comment ||
      rating === 0
    ) {
      toast.error("Please fill in all fields and select a rating");
      return;
    }

    if (formData.comment.length < 10) {
      toast.error("Review comment must be at least 10 characters long");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(API_ENDPOINTS.REVIEWS_POST, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          rating,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Review submitted successfully! It will be displayed after approval.");
        setFormData({ name: "", email: "", location: "", tour: "", comment: "" });
        setRating(0);
        setOpen(false);
        
        // Call callback to refresh reviews
        if (onReviewSubmitted) {
          onReviewSubmitted();
        }
      } else {
        toast.error(data.error || "Failed to submit review");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Error submitting review. Please check if your backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground h-full">
          Review Us
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Share Your Experience</DialogTitle>
          <DialogDescription>
            Tell us about your journey with us. Your feedback helps us improve!
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              name="name"
              placeholder="Your name"
              value={formData.name}
              onChange={handleInputChange}
              disabled={loading}
            />
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="your.email@example.com"
              value={formData.email}
              onChange={handleInputChange}
              disabled={loading}
            />
          </div>

          {/* Location Field */}
          <div className="space-y-2">
            <Label htmlFor="location">Location/City *</Label>
            <Input
              id="location"
              name="location"
              placeholder="Your city/country"
              value={formData.location}
              onChange={handleInputChange}
              disabled={loading}
            />
          </div>

          {/* Tour Selection */}
          <div className="space-y-2">
            <Label htmlFor="tour">Tour Package *</Label>
            <Select value={formData.tour} onValueChange={handleTourChange}>
              <SelectTrigger id="tour" disabled={loading}>
                <SelectValue placeholder="Select a tour package" />
              </SelectTrigger>
              <SelectContent>
                {TOUR_OPTIONS.map((tour) => (
                  <SelectItem key={tour} value={tour}>
                    {tour}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Rating Stars */}
          <div className="space-y-2">
            <Label>Rating *</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  disabled={loading}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-6 w-6 ${
                      star <= (hoveredRating || rating)
                        ? "fill-primary text-primary"
                        : "fill-muted text-muted"
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-muted-foreground">{rating} out of 5 stars</p>
            )}
          </div>

          {/* Comment Field */}
          <div className="space-y-2">
            <Label htmlFor="comment">Your Review *</Label>
            <Textarea
              id="comment"
              name="comment"
              placeholder="Share your experience (minimum 10 characters)"
              value={formData.comment}
              onChange={handleInputChange}
              disabled={loading}
              className="min-h-32"
            />
            <p className="text-xs text-muted-foreground">
              {formData.comment.length}/500 characters
            </p>
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Submitting..." : "Submit Review"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewFormModal;
