import React, { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '@/lib/api-config';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const AdminPayments = () => {
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => { fetchPayments(); }, []);

  useEffect(() => {
    const handler = () => fetchPayments();
    window.addEventListener('data-updated', handler as EventListener);
    return () => window.removeEventListener('data-updated', handler as EventListener);
  }, []);

  const fetchPayments = async () => {
    try {
      const res = await fetch(`${API_ENDPOINTS.PAYMENTS_GET}?admin_all=1`, { credentials: 'include' });
      const js = await res.json();
      if (js.success) setPayments(js.data || []);
      else toast.error(js.error || 'Failed fetching payments');
    } catch (e) { console.error(e); toast.error('Error fetching payments'); }
  };

  const markRefunded = async (id:number) => {
    if (!confirm('Mark this payment as refunded?')) return;
    try {
      const res = await fetch(API_ENDPOINTS.PAYMENTS_PATCH, { method: 'PATCH', credentials: 'include', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ id, status: 'refunded' }) });
      const js = await res.json();
      if (js.success) { toast.success('Updated'); fetchPayments(); } else toast.error(js.error||'Failed');
    } catch (e) { console.error(e); toast.error('Error'); }
  };

  return (
    <div className="bg-card border border-border rounded p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">Payments</h3>
        <div>
          <Button variant="outline" onClick={() => fetchPayments()}>Refresh</Button>
        </div>
      </div>
      <div className="space-y-3">
        {payments.map(p => (
          <div key={p.id} className="p-3 border rounded flex items-center justify-between">
            <div>
              <div className="font-medium">Booking #{p.booking_id} • {p.method} • ৳{Number(p.amount).toFixed(2)}</div>
              <div className="text-sm text-muted-foreground">{p.status} • {p.transaction_id || ''} • {p.created_at}</div>
            </div>
            <div className="flex gap-2">
              {p.status !== 'refunded' && <Button variant="destructive" onClick={() => markRefunded(p.id)}>Mark Refunded</Button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPayments;
