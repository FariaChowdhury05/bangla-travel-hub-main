import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { API_ENDPOINTS } from '@/lib/api-config';
import { toast } from 'sonner';

interface Props {
  hotel: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated?: () => void;
}

const EditHotelModal = ({ hotel, open, onOpenChange, onUpdated }: Props) => {
  const [form, setForm] = useState<any>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (hotel) setForm({
      id: hotel.id,
      destination_id: hotel.destination_id,
      name: hotel.name || '',
      description: hotel.description || '',
      image_url: hotel.image_url || '',
      rating: hotel.rating ?? 4.0,
      address: hotel.address || '',
      phone: hotel.phone || '',
    });
  }, [hotel]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((p: any) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(API_ENDPOINTS.HOTELS_PATCH, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Hotel updated');
        if (onUpdated) onUpdated();
        onOpenChange(false);
      } else {
        toast.error(json.error || 'Update failed');
      }
    } catch (err) {
      console.error('Update hotel error', err);
      toast.error('Could not update hotel');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Hotel</DialogTitle>
        </DialogHeader>
        <DialogDescription className="sr-only">Edit hotel details</DialogDescription>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Name</label>
            <Input name="name" value={form.name || ''} onChange={handleChange} required />
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea name="description" value={form.description || ''} onChange={handleChange} rows={3} />
          </div>
          <div>
            <label className="text-sm font-medium">Image URL</label>
            <Input name="image_url" value={form.image_url || ''} onChange={handleChange} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-sm font-medium">Rating</label>
              <Input name="rating" type="number" step="0.1" value={String(form.rating ?? 4.0)} onChange={handleChange} />
            </div>
            <div>
              <label className="text-sm font-medium">Phone</label>
              <Input name="phone" value={form.phone || ''} onChange={handleChange} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Address</label>
            <Input name="address" value={form.address || ''} onChange={handleChange} />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="submit" className="bg-primary" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditHotelModal;
