import { Button } from "@/components/ui/button";
import { Search, Calendar } from "lucide-react";
import heroImage from "@/assets/hero-bangladesh.jpg";
import ReviewFormModal from "./ReviewFormModal";

const Hero = () => {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.3)), url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
          Discover the Beauty of Bangladesh
        </h1>
        <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
          From pristine beaches to lush hills, explore the hidden gems of Cox's Bazar, Sylhet, and Bandarban
        </p>
        
        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-2xl p-4 md:p-6 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center border border-border rounded-lg px-4 py-3">
              <Search className="h-5 w-5 text-muted-foreground mr-2" />
              <input
                type="text"
                placeholder="Where do you want to go?"
                className="flex-1 outline-none text-foreground"
              />
            </div>
            
            <div className="flex items-center border border-border rounded-lg px-4 py-3">
              <Calendar className="h-5 w-5 text-muted-foreground mr-2" />
              <input
                type="text"
                placeholder="Check-in - Check-out"
                className="flex-1 outline-none text-foreground"
              />
            </div>
            
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground h-full">
              Search Hotels
            </Button>
          </div>
        </div>


      </div>
    </section>
  );
};

export default Hero;
