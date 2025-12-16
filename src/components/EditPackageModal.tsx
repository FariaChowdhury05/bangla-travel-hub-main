import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { API_ENDPOINTS } from '@/lib/api-config';
import { toast } from 'sonner';

interface Props {
  packageId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
}

const EditPackageModal = ({ packageId, open, onOpenChange, onSaved }: Props) => {
  const [pkg, setPkg] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && packageId) fetchPackage();
    if (!open) setPkg(null);
  }, [open, packageId]);

  const fetchPackage = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tour_packages.php');
      const json = await res.json();
      if (json.success) {
        const found = (json.data || []).find((p: any) => p.id === packageId) || null;
        setPkg(found);
      }
    } catch (e) {
      console.error(e);
      toast.error('Could not load package');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!pkg || !packageId) return;
    setSaving(true);
    try {
      const payload: any = {
        name: pkg.name,
        description: pkg.description,
        price: Number(pkg.price) || 0,
        duration_days: pkg.duration_days || 1,
        breakfast: pkg.breakfast ? 1 : 0,
        lunch: pkg.lunch ? 1 : 0,
        dinner: pkg.dinner ? 1 : 0,
        transport: pkg.transport || null,
        start_date: pkg.start_date || null,
        end_date: pkg.end_date || null,
        image_url: pkg.image_url || null,
      };

      const res = await fetch(`/api/tour_packages.php?id=${packageId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Package updated');
        onOpenChange(false);
        onSaved?.();
      } else {
        toast.error(json.error || 'Update failed');
      }
    } catch (e) {
      console.error(e);
      toast.error('Error updating package');
    } finally {
      setSaving(false);
    }
  };

  if (!pkg) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Package</DialogTitle>
        </DialogHeader>
        <DialogDescription className="sr-only">Edit package details such as price, duration, meals and transport options.</DialogDescription>

        <div className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input value={pkg.name || ''} onChange={e => setPkg({ ...pkg, name: e.target.value })} className="mt-2" />
          </div>
          <div>
            <Label>Description</Label>
            <Input value={pkg.description || ''} onChange={e => setPkg({ ...pkg, description: e.target.value })} className="mt-2" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Price</Label>
              <Input type="number" value={pkg.price ?? 0} onChange={e => setPkg({ ...pkg, price: Number(e.target.value) })} className="mt-2" />
            </div>
            <div>
              <Label>Duration (days)</Label>
              <Input type="number" value={pkg.duration_days ?? 1} onChange={e => setPkg({ ...pkg, duration_days: Number(e.target.value) })} className="mt-2" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={!!pkg.breakfast} onChange={e => setPkg({ ...pkg, breakfast: e.target.checked })} />
              <span>Breakfast</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={!!pkg.lunch} onChange={e => setPkg({ ...pkg, lunch: e.target.checked })} />
              <span>Lunch</span>
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={!!pkg.dinner} onChange={e => setPkg({ ...pkg, dinner: e.target.checked })} />
              <span>Dinner</span>
            </label>
            <div>
              <Label>Transport</Label>
              <Input value={pkg.transport || ''} onChange={e => setPkg({ ...pkg, transport: e.target.value })} className="mt-2" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Start Date</Label>
              <Input type="date" value={pkg.start_date || ''} onChange={e => setPkg({ ...pkg, start_date: e.target.value })} className="mt-2" />
            </div>
            <div>
              <Label>End Date</Label>
              <Input type="date" value={pkg.end_date || ''} onChange={e => setPkg({ ...pkg, end_date: e.target.value })} className="mt-2" />
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditPackageModal;
