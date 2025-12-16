import React, { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '@/lib/api-config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const AdminOffers = () => {
  const [offers, setOffers] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [form, setForm] = useState<any>({ title: '', description: '', discount_type: 'percentage', discount_value: 0, start_date: '', end_date: '', status: 'inactive', package_ids: [] });
  const [editing, setEditing] = useState<any|null>(null);

  useEffect(() => { fetchOffers(); fetchPackages(); }, []);
  useEffect(() => {
    const handler = () => { fetchOffers(); fetchPackages(); };
    window.addEventListener('data-updated', handler as EventListener);
    return () => window.removeEventListener('data-updated', handler as EventListener);
  }, []);

  async function fetchOffers() {
    try { const res = await fetch(API_ENDPOINTS.OFFERS_GET, { credentials: 'include' }); const js = await res.json(); if (js.success) setOffers(js.data || []); } catch (e) { console.warn(e); }
  }
  async function fetchPackages() {
    try { const res = await fetch('/api/tour_packages.php', { credentials: 'include' }); const js = await res.json(); if (js.success) setPackages(js.data || []); } catch (e) { console.warn(e); }
  }

  const save = async () => {
    if (!form.title || !form.start_date || !form.end_date) { toast.error('Title, start and end dates required'); return; }
    try {
      const method = editing ? 'PATCH' : 'POST';
      const body = editing ? { ...form, id: editing.id } : form;
      const res = await fetch(API_ENDPOINTS.OFFERS_POST, { method, credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const js = await res.json();
      if (js.success) {
        toast.success('Saved');
        setForm({ title: '', description: '', discount_type: 'percentage', discount_value: 0, start_date: '', end_date: '', status: 'inactive', package_ids: [] });
        setEditing(null);
        fetchOffers();
        try { window.dispatchEvent(new CustomEvent('data-updated')); } catch (e) {}
      } else {
        console.error('Offer save error', js);
        toast.error(js.error || 'Failed to save offer');
      }
    } catch (e) { console.error(e); toast.error('Error'); }
  };

  const edit = (o:any) => { setEditing(o); setForm({ ...o, package_ids: o.package_ids || [] }); };
  const remove = async (id:number) => { if (!confirm('Delete offer?')) return; const res = await fetch(API_ENDPOINTS.OFFERS_DELETE, { method: 'DELETE', credentials: 'include', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ id }) }); const js = await res.json(); if (js.success) { toast.success('Deleted'); fetchOffers(); } else toast.error(js.error||'Failed'); };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xl font-semibold">Manage Offers</h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => fetchOffers()}>Refresh</Button>
          <Button onClick={() => { setEditing(null); setForm({ title: '', description: '', discount_type: 'percentage', discount_value: 0, start_date: '', end_date: '', status: 'inactive', package_ids: [] }); }}>New Offer</Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-1">
          <div className="space-y-2">
            <div>
              <Label>Title</Label>
              <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <Label>Description</Label>
              <Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <Label>Discount Type</Label>
              <select value={form.discount_type} onChange={e => setForm({ ...form, discount_type: e.target.value })} className="w-full rounded-md border px-3 py-2">
                <option value="percentage">Percentage</option>
                <option value="flat">Flat amount</option>
              </select>
            </div>
            <div>
              <Label>Discount Value</Label>
              <Input type="number" value={form.discount_value} onChange={e => setForm({ ...form, discount_value: parseFloat(e.target.value||'0') })} />
            </div>
            <div>
              <Label>Start Date</Label>
              <Input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} />
            </div>
            <div>
              <Label>End Date</Label>
              <Input type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} />
            </div>
            <div>
              <Label>Status</Label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full rounded-md border px-3 py-2">
                <option value="active">active</option>
                <option value="inactive">inactive</option>
              </select>
            </div>
            <div>
              <Label>Link Packages</Label>
              <div className="max-h-32 overflow-auto border rounded p-2 mt-2">
                {packages.map(p => (
                  <label key={p.id} className="flex items-center gap-2 mb-1">
                    <input type="checkbox" checked={(form.package_ids||[]).includes(p.id)} onChange={e => {
                      const list = new Set(form.package_ids || []);
                      if (e.target.checked) list.add(p.id); else list.delete(p.id);
                      setForm({ ...form, package_ids: Array.from(list) });
                    }} />
                    <span className="text-sm">{p.name}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              <Button onClick={save}>{editing ? 'Save' : 'Create'}</Button>
              {editing && <Button variant="destructive" onClick={() => { setEditing(null); setForm({ title: '', description: '', discount_type: 'percentage', discount_value: 0, start_date: '', end_date: '', status: 'inactive', package_ids: [] }); }}>Cancel</Button>}
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="space-y-3">
            {offers.map(o => (
              <div key={o.id} className="p-3 border rounded-md flex items-center justify-between">
                <div>
                  <div className="font-semibold">{o.title} <span className="text-xs text-muted-foreground">{o.status}</span></div>
                  <div className="text-sm text-muted-foreground">{o.discount_type === 'percentage' ? o.discount_value + '%' : '৳' + Number(o.discount_value).toFixed(2)} • {o.start_date} → {o.end_date}</div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => edit(o)}>Edit</Button>
                  <Button variant="destructive" onClick={() => remove(o.id)}>Delete</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOffers;
