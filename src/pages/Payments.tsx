import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CreditCard, Wallet, Building2, CheckCircle2 } from "lucide-react";

const Payments = () => {
  const recentPayments = [
    {
      id: "PAY001",
      booking: "Cox's Bazar Beach Paradise",
      amount: 15000,
      date: "2024-01-15",
      status: "completed"
    },
    {
      id: "PAY002",
      booking: "Sylhet Tea Garden Tour",
      amount: 12000,
      date: "2024-01-10",
      status: "completed"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Payment Center
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Secure payment processing for your bookings
            </p>
          </div>

          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
            {/* Payment Form */}
            <Card>
              <CardHeader>
                <CardTitle>Make a Payment</CardTitle>
                <CardDescription>Choose your preferred payment method</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="booking">Booking Reference</Label>
                  <Input 
                    id="booking" 
                    placeholder="Enter booking ID"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="amount">Amount (৳)</Label>
                  <Input 
                    id="amount" 
                    type="number" 
                    placeholder="0"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Payment Method</Label>
                  <RadioGroup defaultValue="card" className="mt-3 space-y-3">
                    <div className="flex items-center space-x-3 border rounded-lg p-3 hover:border-primary transition-colors cursor-pointer">
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer flex-1">
                        <CreditCard className="h-5 w-5" />
                        <span>Credit/Debit Card</span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 border rounded-lg p-3 hover:border-primary transition-colors cursor-pointer">
                      <RadioGroupItem value="mobile" id="mobile" />
                      <Label htmlFor="mobile" className="flex items-center gap-2 cursor-pointer flex-1">
                        <Wallet className="h-5 w-5" />
                        <span>Mobile Banking (bKash, Nagad)</span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 border rounded-lg p-3 hover:border-primary transition-colors cursor-pointer">
                      <RadioGroupItem value="bank" id="bank" />
                      <Label htmlFor="bank" className="flex items-center gap-2 cursor-pointer flex-1">
                        <Building2 className="h-5 w-5" />
                        <span>Bank Transfer</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="card-number">Card Number</Label>
                  <Input 
                    id="card-number" 
                    placeholder="1234 5678 9012 3456"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <Input 
                      id="expiry" 
                      placeholder="MM/YY"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cvv">CVV</Label>
                    <Input 
                      id="cvv" 
                      placeholder="123"
                      type="password"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" size="lg">
                  Process Payment
                </Button>
              </CardFooter>
            </Card>

            {/* Recent Payments */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Payments</CardTitle>
                  <CardDescription>Your payment history</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentPayments.map((payment) => (
                    <div key={payment.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold">{payment.id}</span>
                        <Badge variant="secondary" className="gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          {payment.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{payment.booking}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-primary">
                          ৳{payment.amount.toLocaleString()}
                        </span>
                        <span className="text-xs text-muted-foreground">{payment.date}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    Secure Payments
                  </CardTitle>
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
