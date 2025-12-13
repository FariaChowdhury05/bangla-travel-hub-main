import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tag, Clock, MapPin, Star } from "lucide-react";

const Offers = () => {
  const offers = [
    {
      id: 1,
      title: "Early Bird Special - Cox's Bazar",
      hotel: "Sea Pearl Beach Resort",
      location: "Cox's Bazar",
      discount: "40% OFF",
      originalPrice: "$200",
      offerPrice: "$120",
      validUntil: "Dec 31, 2024",
      rating: 4.8,
      description: "Book 30 days in advance and save big on your beach vacation!",
      image: "/placeholder.svg",
    },
    {
      id: 2,
      title: "Weekend Getaway - Sylhet",
      hotel: "Grand Sultan Tea Resort",
      location: "Sylhet",
      discount: "35% OFF",
      originalPrice: "$150",
      offerPrice: "$97",
      validUntil: "Jan 15, 2025",
      rating: 4.6,
      description: "Perfect weekend escape to the tea gardens with complimentary breakfast.",
      image: "/placeholder.svg",
    },
    {
      id: 3,
      title: "Adventure Package - Bandarban",
      hotel: "Hill View Resort",
      location: "Bandarban",
      discount: "30% OFF",
      originalPrice: "$180",
      offerPrice: "$126",
      validUntil: "Dec 20, 2024",
      rating: 4.7,
      description: "Includes trekking guide, meals, and transportation to major viewpoints.",
      image: "/placeholder.svg",
    },
    {
      id: 4,
      title: "Couple's Retreat - Cox's Bazar",
      hotel: "Ocean Paradise Hotel",
      location: "Cox's Bazar",
      discount: "45% OFF",
      originalPrice: "$300",
      offerPrice: "$165",
      validUntil: "Feb 14, 2025",
      rating: 4.9,
      description: "Romantic package with candlelight dinner and spa treatment for two.",
      image: "/placeholder.svg",
    },
    {
      id: 5,
      title: "Family Fun Package - Rangamati",
      hotel: "Lake View Resort",
      location: "Rangamati",
      discount: "25% OFF",
      originalPrice: "$250",
      offerPrice: "$187",
      validUntil: "Jan 31, 2025",
      rating: 4.5,
      description: "Perfect for families with kids activities and boat tours included.",
      image: "/placeholder.svg",
    },
    {
      id: 6,
      title: "Long Stay Discount - Dhaka",
      hotel: "City Center Grand Hotel",
      location: "Dhaka",
      discount: "50% OFF",
      originalPrice: "$400",
      offerPrice: "$200",
      validUntil: "Mar 31, 2025",
      rating: 4.4,
      description: "Stay 7 nights or more and enjoy half price with breakfast included.",
      image: "/placeholder.svg",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 pt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Special Offers & Deals
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover amazing discounts and exclusive packages for your next adventure in Bangladesh
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offers.map((offer) => (
              <Card key={offer.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img 
                    src={offer.image} 
                    alt={offer.title}
                    className="w-full h-48 object-cover"
                  />
                  <Badge className="absolute top-4 right-4 bg-accent text-accent-foreground text-lg font-bold px-3 py-1">
                    {offer.discount}
                  </Badge>
                </div>
                
                <CardHeader>
                  <CardTitle className="text-xl">{offer.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{offer.hotel}</p>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{offer.location}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="w-4 h-4 fill-primary text-primary" />
                      <span className="font-semibold text-foreground">{offer.rating}</span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    {offer.description}
                  </p>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>Valid until {offer.validUntil}</span>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <span className="text-sm text-muted-foreground line-through">
                        {offer.originalPrice}
                      </span>
                      <span className="text-2xl font-bold text-primary ml-2">
                        {offer.offerPrice}
                      </span>
                      <span className="text-sm text-muted-foreground"> / night</span>
                    </div>
                  </div>
                  
                  <Button className="w-full bg-primary hover:bg-primary/90">
                    <Tag className="w-4 h-4 mr-2" />
                    Book Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Offers;
