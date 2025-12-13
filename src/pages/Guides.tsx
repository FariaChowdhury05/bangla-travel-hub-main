import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Star, MapPin, Languages, Phone } from "lucide-react";

const Guides = () => {
  const guides = [
    {
      id: 1,
      name: "Rakib Ahmed",
      specialty: "Beach Tours",
      location: "Cox's Bazar",
      rating: 4.9,
      reviews: 128,
      languages: ["Bengali", "English"],
      experience: "8 years",
      rate: 2000,
      phone: "+880 1712-345678"
    },
    {
      id: 2,
      name: "Fatema Sultana",
      specialty: "Nature & Tea Gardens",
      location: "Sylhet",
      rating: 4.8,
      reviews: 95,
      languages: ["Bengali", "English", "Hindi"],
      experience: "6 years",
      rate: 1800,
      phone: "+880 1812-345678"
    },
    {
      id: 3,
      name: "Arif Hossain",
      specialty: "Hill Trekking",
      location: "Bandarban",
      rating: 5.0,
      reviews: 142,
      languages: ["Bengali", "English", "Tribal Languages"],
      experience: "10 years",
      rate: 2500,
      phone: "+880 1912-345678"
    },
    {
      id: 4,
      name: "Nusrat Jahan",
      specialty: "Cultural Tours",
      location: "Dhaka",
      rating: 4.7,
      reviews: 87,
      languages: ["Bengali", "English", "French"],
      experience: "5 years",
      rate: 1500,
      phone: "+880 1512-345678"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Professional Tour Guides
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Book experienced local guides to make your journey memorable and hassle-free
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {guides.map((guide) => (
              <Card key={guide.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="text-center pb-4">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary mx-auto mb-4 flex items-center justify-center">
                    <span className="text-3xl font-bold text-primary-foreground">
                      {guide.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <CardTitle className="text-xl">{guide.name}</CardTitle>
                  <CardDescription>{guide.specialty}</CardDescription>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <Star className="h-4 w-4 fill-primary text-primary" />
                    <span className="text-sm font-semibold">{guide.rating}</span>
                    <span className="text-xs text-muted-foreground">({guide.reviews} reviews)</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{guide.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Languages className="h-4 w-4 text-muted-foreground" />
                    <span>{guide.languages.join(", ")}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs">{guide.phone}</span>
                  </div>
                  <div className="pt-2">
                    <Badge variant="secondary">{guide.experience} experience</Badge>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-3">
                  <div className="w-full text-center">
                    <p className="text-2xl font-bold text-primary">৳{guide.rate.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">per day</p>
                  </div>
                  <Button className="w-full">Hire Guide</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Guides;
