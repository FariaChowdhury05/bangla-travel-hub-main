import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CreditCard, Wallet, Building2, CheckCircle2 } from "lucide-react";
import { API_ENDPOINTS } from '@/lib/api-config';
import { toast } from 'sonner';

const Payments = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [bookingRef, setBookingRef] = useState('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('card');
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchPayments(); }, []);

  useEffect(() => { fetchBookings(); }, []);

  const fetchPayments = async () => {
    try {
      const res = await fetch(API_ENDPOINTS.PAYMENTS_GET, { credentials: 'include' });
      const js = await res.json();
      if (js.success) setPayments(js.data || []);
      else setPayments([]);
    } catch (e) { console.error(e); setPayments([]); }
  };

  const fetchBookings = async () => {
    try {
      const res = await fetch(API_ENDPOINTS.BOOKINGS_GET, { credentials: 'include' });
      const js = await res.json();
      if (js.success) setBookings(js.data || []);
      else setBookings([]);
    } catch (e) { console.error(e); setBookings([]); }
  };

  const unpaidBookings = bookings.filter((b:any) => b.status !== 'confirmed' && b.status !== 'completed' && b.status !== 'cancelled');

  const processPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingRef || !amount) { toast.error('Booking and amount required'); return; }
    setLoading(true);
    try {
      const payload = { booking_id: parseInt(bookingRef), method, amount: parseFloat(amount), status: 'paid', transaction_id: 'web-' + Date.now() };
      const res = await fetch(API_ENDPOINTS.PAYMENTS_POST, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const js = await res.json();
      if (js.success) {
        toast.success('Payment recorded');
        setBookingRef(''); setAmount(''); setMethod('card');
        fetchPayments();
        fetchBookings();
      } else {
        toast.error(js.error || 'Payment failed');
      }
    } catch (err) { console.error(err); toast.error('Error processing payment'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Payment Center</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Secure payment processing for your bookings</p>
          </div>

          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
            {/* Payment Form */}
            <Card>
              <CardHeader>
                <CardTitle>Make a Payment</CardTitle>
                <CardDescription>Choose your preferred payment method</CardDescription>
              </CardHeader>
              <form onSubmit={processPayment}>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="booking">Booking Reference (ID)</Label>
                    <Input id="booking" value={bookingRef} onChange={e => setBookingRef(e.target.value)} placeholder="Enter numeric booking ID" className="mt-2" />
                  </div>

                  <div>
                    <Label htmlFor="amount">Amount (৳)</Label>
                    <Input id="amount" value={amount} onChange={e => setAmount(e.target.value)} type="number" placeholder="0" className="mt-2" />
                  </div>

                  <div>
                    <Label>Payment Method</Label>
                    <RadioGroup value={method} onValueChange={(v:any) => setMethod(v)} className="mt-3 space-y-3">
                      <div className="flex items-center space-x-3 border rounded-lg p-3 hover:border-primary transition-colors cursor-pointer">
                        <RadioGroupItem value="card" id="card" />
                        <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer flex-1"><CreditCard className="h-5 w-5" /><span>Credit/Debit Card</span></Label>
                      </div>
                      <div className="flex items-center space-x-3 border rounded-lg p-3 hover:border-primary transition-colors cursor-pointer">
                        <RadioGroupItem value="mobile" id="mobile" />
                        <Label htmlFor="mobile" className="flex items-center gap-2 cursor-pointer flex-1"><Wallet className="h-5 w-5" /><span>Mobile Banking (bKash, Nagad)</span></Label>
                      </div>
                      <div className="flex items-center space-x-3 border rounded-lg p-3 hover:border-primary transition-colors cursor-pointer">
                        <RadioGroupItem value="bank" id="bank" />
                        <Label htmlFor="bank" className="flex items-center gap-2 cursor-pointer flex-1"><Building2 className="h-5 w-5" /><span>Bank Transfer</span></Label>
                      </div>
                    </RadioGroup>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" size="lg" type="submit" disabled={loading}>{loading ? 'Processing...' : 'Process Payment'}</Button>
                </CardFooter>
              </form>
            </Card>

            {/* Recent Payments */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Payments</CardTitle>
                  <CardDescription>Your payment history</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    {/* Show user's bookings first so they can pick one to pay */}
                    {bookings.length === 0 ? (
                      <div className="text-muted-foreground">No bookings found.</div>
                    ) : (
                      bookings
                        .filter((b:any) => b.status !== 'confirmed' && b.status !== 'completed' && b.status !== 'cancelled')
                        .map((b:any) => (
                        <div key={b.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm font-semibold">{b.booking_name || `Booking #${b.id}`}</div>
                              <div className="text-xs text-muted-foreground">{b.booking_type || ''} • {b.check_in ? `${new Date(b.check_in).toLocaleDateString()}` : ''}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-primary">৳{Number(b.total_amount || 0).toFixed(2)}</div>
                              <div className="mt-2 flex gap-2">
                                <Button size="sm" onClick={() => { setBookingRef(String(b.id)); setAmount(String(b.total_amount || '')); toast.success('Booking selected'); }}>Pay</Button>
                                <Button variant="outline" size="sm" onClick={() => window.location.href = `/bookings/${b.id}`}>View</Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}

                    {/* then show recent payments */}
                    {payments.length > 0 && (
                      <>
                        <h4 className="text-sm font-semibold mt-4">Recent Payments</h4>
                        {payments.map((payment:any) => (
                          <div key={payment.id} className="border rounded-lg p-4 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-semibold">#{payment.id}</span>
                              <Badge variant="secondary" className="gap-1">{payment.status}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">Booking #{payment.booking_id}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-lg font-bold text-primary">৳{Number(payment.amount).toFixed(2)}</span>
                              <span className="text-xs text-muted-foreground">{new Date(payment.created_at).toLocaleString()}</span>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-primary" />Secure Payments</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>✓ 256-bit SSL encryption</li>
                    <li>✓ PCI DSS compliant</li>
                    <li>✓ 100% secure transactions</li>
                    <li>✓ Instant confirmation</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Payments;
