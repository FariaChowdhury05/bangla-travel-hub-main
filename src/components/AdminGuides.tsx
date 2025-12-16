import React, { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '@/lib/api-config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const AdminGuides = () => {
  const [guides, setGuides] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<any|null>(null);
  const [form, setForm] = useState<any>({ name: '', phone: '', email: '', city: '', experience_years: 0, bio: '', rating: 4.5, status: 'available', rate_per_day: 0, assignedPackages: [] });

  const fetchGuides = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_ENDPOINTS.GUIDES_GET, { credentials: 'include' });
      const js = await res.json();
      if (js.success) setGuides(js.data || []);
    } catch (e) { console.error(e); toast.error('Could not load guides'); }
    finally { setLoading(false); }
  };

  const fetchPackages = async () => {
    try {
      const res = await fetch('/api/tour_packages.php', { credentials: 'include' });
      const js = await res.json();
      if (js.success) setPackages(js.data || []);
    } catch (e) { console.warn('Could not load packages', e); }
  };
  useEffect(() => { fetchGuides(); fetchPackages(); }, []);

  const save = async () => {
    try {
      const url = API_ENDPOINTS.GUIDES_POST;
      const body = editing ? { ...form, id: editing.id } : form;
      const method = editing ? 'PATCH' : 'POST';
      const res = await fetch(url, { method, credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const js = await res.json();
      if (js.success) {
        toast.success('Saved');
        const guideId = editing ? editing.id : js.id;
        // sync package assignments
        const currentAssigned = editing && editing.packages ? editing.packages.map((p:any)=>p.id) : [];
        const newAssigned = form.assignedPackages ? form.assignedPackages.map((p:any)=>p.id) : [];

        // assign or update packages
        for (const ap of (form.assignedPackages || [])) {
          try {
            await fetch(API_ENDPOINTS.PACKAGE_GUIDES, {
              method: 'POST',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ package_id: ap.id, guide_id: guideId, is_primary: ap.is_primary ? 1 : 0 })
            });
          } catch (e) { console.warn('Failed assign package', ap, e); }
        }

        // remove unselected assignments
        for (const oldId of currentAssigned) {
          if (!newAssigned.includes(oldId)) {
            try {
              await fetch(API_ENDPOINTS.PACKAGE_GUIDES, {
                method: 'DELETE',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ package_id: oldId, guide_id: guideId })
              });
            } catch (e) { console.warn('Failed unassign package', oldId, e); }
          }
        }

        setForm({ name: '', phone: '', email: '', city: '', experience_years: 0, bio: '', rating: 4.5, status: 'available', rate_per_day: 0, assignedPackages: [] });
        setEditing(null);
        fetchGuides();
      } else {
        toast.error(js.error || 'Failed to save');
      }
    } catch (e) { console.error(e); toast.error('Error saving guide'); }
  };

  const edit = (g: any) => {
    // prefill form and assigned packages
    const assigned = (g.packages || []).map((p:any) => ({ id: p.id, is_primary: !!p.is_primary }));
    setEditing(g);
    setForm({ ...g, assignedPackages: assigned, rate_per_day: g.rate_per_day || 0 });
  };

  const remove = async (id: number) => {
    if (!confirm('Delete this guide?')) return;
    try {
      const res = await fetch(API_ENDPOINTS.GUIDES_DELETE, { method: 'DELETE', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
      const js = await res.json();
      if (js.success) { toast.success('Deleted'); fetchGuides(); }
      else toast.error(js.error || 'Failed to delete');
    } catch (e) { console.error(e); toast.error('Error deleting guide'); }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xl font-semibold">Manage Guides</h3>
        <Button onClick={() => { setEditing(null); setForm({ name: '', phone: '', email: '', city: '', experience_years: 0, bio: '', rating: 4.5, status: 'available', rate_per_day: 0, assignedPackages: [] }); }}>New Guide</Button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>{editing ? 'Edit Guide' : 'Create Guide'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <Label>Full name</Label>
                  <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                </div>
                <div>
                  <Label>City</Label>
                  <Input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
                </div>
                <div>
                  <Label>Experience (years)</Label>
                  <Input type="number" value={form.experience_years} onChange={e => setForm({ ...form, experience_years: parseInt(e.target.value || '0') })} />
                </div>
                        <div>
                          <Label>Rate (per day)</Label>
                          <Input type="number" value={form.rate_per_day} min={0} onChange={e => setForm({ ...form, rate_per_day: parseFloat(e.target.value || '0') })} />
                        </div>
                        <div>
                          <Label>Assign Packages</Label>
                          <div className="max-h-40 overflow-auto border rounded p-2 mt-2">
                            {packages.length === 0 ? (
                              <div className="text-sm text-muted-foreground">No packages found</div>
                            ) : (
                              packages.map((p:any) => {
                                const assigned = (form.assignedPackages || []).find((ap:any) => ap.id === p.id);
                                return (
                                  <div key={p.id} className="flex items-center justify-between gap-2 mb-2">
                                    <label className="flex items-center gap-2">
                                      <input type="checkbox" checked={!!assigned} onChange={e => {
                                        if (e.target.checked) {
                                          setForm({ ...form, assignedPackages: [...(form.assignedPackages||[]), { id: p.id, is_primary: false }] });
                                        } else {
                                          setForm({ ...form, assignedPackages: (form.assignedPackages||[]).filter((ap:any)=>ap.id !== p.id) });
                                        }
                                      }} />
                                      <span className="text-sm">{p.name}</span>
                                    </label>
                                    <label className="inline-flex items-center gap-2 text-xs">
                                      <input type="checkbox" disabled={!assigned} checked={!!(assigned && assigned.is_primary)} onChange={e => {
                                        const list = (form.assignedPackages||[]).map((ap:any) => ap.id === p.id ? { ...ap, is_primary: e.target.checked } : ap);
                                        setForm({ ...form, assignedPackages: list });
                                      }} />
                                      <span>Primary</span>
                                    </label>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>
                <div>
                  <Label>Status</Label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full rounded-md border px-3 py-2">
                    <option value="available">available</option>
                    <option value="unavailable">unavailable</option>
                  </select>
                </div>
                <div>
                  <Label>Bio</Label>
                  <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} className="w-full rounded-md border px-3 py-2" />
                </div>
                <div>
                  <Label>Languages (comma separated)</Label>
                  <Input value={(form.languages || []).join ? (form.languages || []).join(', ') : (form.languages || '')} onChange={e => {
                    const raw = e.target.value;
                    const list = raw.split(',').map(s => s.trim()).filter(Boolean);
                    setForm({ ...form, languages: list });
                  }} placeholder="e.g. Bengali, English, Hindi" />
                </div>
                <div className="flex gap-2">
                  <Button onClick={save}>{editing ? 'Save' : 'Create'}</Button>
                  {editing && <Button variant="destructive" onClick={() => { setEditing(null); setForm({ name: '', phone: '', email: '', city: '', experience_years: 0, bio: '', rating: 4.5, status: 'available', rate_per_day: 0, assignedPackages: [] }); }}>Cancel</Button>}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <div className="space-y-3">
                {guides.map(g => (
              <div key={g.id} className="p-3 border rounded-md flex items-center justify-between">
                <div>
                  <div className="font-semibold">{g.name} <span className="text-xs text-muted-foreground">{g.city}</span></div>
                  <div className="text-sm text-muted-foreground">{g.experience_years} years • {g.rating} rating • ৳{(g.rate_per_day||0).toLocaleString()}</div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => edit(g)}>Edit</Button>
                  <Button variant="destructive" onClick={() => remove(g.id)}>Delete</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminGuides;
