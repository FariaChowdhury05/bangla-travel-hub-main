import { MapPin, Mail, Phone, Facebook, Twitter, Instagram } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <MapPin className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold text-foreground">Bangladesh Tourism</span>
            </div>
            <p className="text-muted-foreground text-sm">
              Discover the beauty of Bangladesh with our comprehensive tourism and hotel booking platform.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#destinations" className="text-muted-foreground hover:text-primary transition-colors">Destinations</a></li>
              <li><a href="#hotels" className="text-muted-foreground hover:text-primary transition-colors">Hotels</a></li>
              <li><a href="#packages" className="text-muted-foreground hover:text-primary transition-colors">Tour Packages</a></li>
              <li><a href="#guides" className="text-muted-foreground hover:text-primary transition-colors">Local Guides</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Help Center</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Contact Us</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start">
                <Mail className="h-4 w-4 text-primary mr-2 mt-1" />
                <span className="text-muted-foreground">info@bdtourism.com</span>
              </li>
              <li className="flex items-start">
                <Phone className="h-4 w-4 text-primary mr-2 mt-1" />
                <span className="text-muted-foreground">+880 1234-567890</span>
              </li>
              <div className="flex space-x-3 pt-2">
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <Instagram className="h-5 w-5" />
                </a>
              </div>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 Bangladesh Tourism. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
