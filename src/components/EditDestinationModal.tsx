import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { API_ENDPOINTS } from '@/lib/api-config';
import { toast } from 'sonner';

interface Props {
  destination: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated?: () => void;
}

const EditDestinationModal = ({ destination, open, onOpenChange, onUpdated }: Props) => {
  const [form, setForm] = useState<any>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (destination) setForm({
      id: destination.id,
      name: destination.name || '',
      description: destination.description || '',
      image_url: destination.image_url || '',
      rating: destination.rating ?? 4.5,
      latitude: destination.latitude || '',
      longitude: destination.longitude || '',
      location_info: destination.location_info || '',
      highlights: destination.highlights || '',
      best_time_to_visit: destination.best_time_to_visit || '',
    });
  }, [destination]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((p: any) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(API_ENDPOINTS.DESTINATIONS_PATCH, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Destination updated');
        if (onUpdated) onUpdated();
        onOpenChange(false);
      } else {
        toast.error(json.error || 'Update failed');
      }
    } catch (err) {
      console.error('Update destination error', err);
      toast.error('Could not update destination');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Destination</DialogTitle>
        </DialogHeader>
        <DialogDescription className="sr-only">Edit destination details</DialogDescription>

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
              <label className="text-sm font-medium">Latitude</label>
              <Input name="latitude" value={form.latitude || ''} onChange={handleChange} />
            </div>
            <div>
              <label className="text-sm font-medium">Longitude</label>
              <Input name="longitude" value={form.longitude || ''} onChange={handleChange} />
            </div>
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

export default EditDestinationModal;
