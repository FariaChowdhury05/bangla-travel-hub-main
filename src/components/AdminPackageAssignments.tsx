import React, { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '@/lib/api-config';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const AdminPackageAssignments = () => {
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tour_packages.php', { credentials: 'include' });
      const js = await res.json();
      if (js.success) setPackages(js.data || []);
    } catch (e) {
      console.error('Could not load packages', e);
      toast.error('Could not load packages');
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignedGuides = async (pkgId: number) => {
    try {
      const res = await fetch(`${API_ENDPOINTS.PACKAGE_GUIDES}?package_id=${pkgId}`, { credentials: 'include' });
      const js = await res.json();
      if (js.success) return js.data || [];
    } catch (e) { console.warn('Could not load assigned guides', e); }
    return [];
  };

  useEffect(() => { fetchPackages(); }, []);

  const setPrimary = async (packageId: number, guideId: number) => {
    try {
      const res = await fetch(API_ENDPOINTS.PACKAGE_GUIDES, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ package_id: packageId, guide_id: guideId, is_primary: 1 })
      });
      const js = await res.json();
      if (js.success) {
        toast.success('Primary guide set');
        fetchPackages();
      } else toast.error(js.error || 'Failed');
    } catch (e) { console.error(e); toast.error('Failed'); }
  };

  const unassign = async (packageId: number, guideId: number) => {
    if (!confirm('Remove this guide from the package?')) return;
    try {
      const res = await fetch(API_ENDPOINTS.PACKAGE_GUIDES, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ package_id: packageId, guide_id: guideId })
      });
      const js = await res.json();
      if (js.success) {
        toast.success('Unassigned');
        fetchPackages();
      } else toast.error(js.error || 'Failed');
    } catch (e) { console.error(e); toast.error('Failed'); }
  };

  return (
    <div>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Package Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? <div className="text-sm">Loading...</div> : (
            <div className="space-y-4">
              {packages.map((p:any) => (
                <PackageRow key={p.id} pkg={p} fetchAssignedGuides={fetchAssignedGuides} onSetPrimary={setPrimary} onUnassign={unassign} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const PackageRow = ({ pkg, fetchAssignedGuides, onSetPrimary, onUnassign }: any) => {
  const [assigned, setAssigned] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const data = await fetchAssignedGuides(pkg.id);
    setAssigned(data);
    setLoading(false);
  };

  return (
    <div className="p-3 border rounded-md">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-semibold">{pkg.name}</div>
          <div className="text-sm text-muted-foreground">{pkg.duration_days} days • ৳{Number(pkg.price || 0).toFixed(2)}</div>
        </div>
        <div className="text-sm">
          {loading ? 'Loading...' : (assigned.length === 0 ? <span className="text-muted-foreground">No guides</span> : (
            <div className="space-y-2">
              {assigned.map((g:any) => (
                <div key={g.id} className="flex items-center justify-between gap-2">
                  <div>{g.name} {g.is_primary ? <span className="text-xs text-primary ml-2">• Primary</span> : null}</div>
                  <div className="flex gap-2">
                    {!g.is_primary && <Button size="sm" onClick={() => onSetPrimary(pkg.id, g.id)}>Set Primary</Button>}
                    <Button size="sm" variant="destructive" onClick={() => onUnassign(pkg.id, g.id)}>Unassign</Button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPackageAssignments;
