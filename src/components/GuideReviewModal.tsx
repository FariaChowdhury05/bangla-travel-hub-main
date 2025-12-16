import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { API_ENDPOINTS } from "@/lib/api-config";

interface GuideReviewModalProps {
  guideId: number | null;
}

const GuideReviewModal = ({ guideId }: GuideReviewModalProps) => {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.AUTH_CHECK, { credentials: 'include' });
        const js = await res.json();
        if (js.success && js.isLoggedIn) setLoggedIn(true);
      } catch (e) {}
    };
    check();
  }, []);

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!guideId) return toast.error('No guide selected');
    if (!rating || rating < 1 || rating > 5) return toast.error('Please select a rating');
    if (comment.length < 5) return toast.error('Please write a short comment');

    try {
      const res = await fetch(API_ENDPOINTS.GUIDE_REVIEWS_POST, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guide_id: guideId, rating, comment }),
      });
      const js = await res.json();
      if (js.success) {
        toast.success('Guide review submitted');
        setOpen(false);
        setRating(0);
        setComment('');
        // dispatch event for refresh if needed
        try { window.dispatchEvent(new CustomEvent('guide-review-submitted', { detail: { guideId } })); } catch(e){}
      } else {
        toast.error(js.error || 'Failed submitting review');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error submitting review');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">Review</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Review Guide</DialogTitle>
        </DialogHeader>
        <DialogDescription className="sr-only">Provide a star rating and a short comment about the guide.</DialogDescription>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <div className="flex gap-2">
              {[1,2,3,4,5].map(s => (
                <button key={s} type="button" onClick={() => setRating(s)} className="transition-transform hover:scale-110">
                  <Star className={`h-6 w-6 ${s <= rating ? 'fill-primary text-primary' : 'fill-muted text-muted'}`} />
                </button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">{rating ? `${rating} / 5` : 'Select a rating'}</p>
          </div>

          <div>
            <Textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Write your experience (min 5 chars)" />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="submit">Submit Review</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default GuideReviewModal;
