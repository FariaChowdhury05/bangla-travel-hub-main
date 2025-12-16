import { Button } from "@/components/ui/button";
import { MapPin, User, Menu, UserCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from "@/lib/api-config";
import { toast } from "sonner";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();
  const handleDestinationsClick = (e: any) => {
    e.preventDefault();
    // navigate to index route (HashRouter) then scroll to section
    try {
      navigate('/');
    } catch (err) {
      // ignore
    }
    setTimeout(() => {
      const el = document.getElementById('destinations');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 180);
  };

  useEffect(() => {
    // Load user from localStorage if present, then verify session with server
    const loadLocal = () => {
      try {
        const raw = localStorage.getItem('user');
        if (raw) setUser(JSON.parse(raw));
      } catch (e) {
        console.error('Error parsing user from localStorage', e);
      }
    };

    const checkServerSession = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.AUTH_CHECK, { credentials: 'include' });
        const json = await res.json();
        if (json && json.success && json.isLoggedIn && json.user) {
          setUser(json.user);
          localStorage.setItem('user', JSON.stringify(json.user));
        } else {
          // not logged in on server - clear local state
          localStorage.removeItem('user');
          setUser(null);
        }
      } catch (err) {
        console.warn('Auth check failed', err);
      }
    };

    loadLocal();
    checkServerSession();
  }, []);

  const handleLogout = async () => {
    try {
      const res = await fetch(API_ENDPOINTS.AUTH_LOGOUT, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        localStorage.removeItem('user');
        setUser(null);
        toast.success('Logged out');
        navigate('/');
      } else {
        toast.error(data.error || 'Logout failed');
      }
    } catch (err) {
      console.error('Logout error', err);
      toast.error('Could not logout');
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <MapPin className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-foreground">Bangladesh Tourism</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#destinations" onClick={handleDestinationsClick} className="text-foreground hover:text-primary transition-colors">
              Destinations
            </a>
            <Link to="/hotels" className="text-foreground hover:text-primary transition-colors">
              Hotels
            </Link>
            <Link to="/tour-packages" className="text-foreground hover:text-primary transition-colors">
              Tour Packages
            </Link>
            <Link to="/guides" className="text-foreground hover:text-primary transition-colors">
              Guides
            </Link>
            <Link to="/offers" className="text-foreground hover:text-primary transition-colors">
              Offers
            </Link>
            <Link to="/payments" className="text-foreground hover:text-primary transition-colors">
              Payments
            </Link>
            {user && (
              <Link to="/bookings" className="text-foreground hover:text-primary transition-colors font-medium">
                My Bookings
              </Link>
            )}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                {user.role === 'admin' && (
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/admin">Admin</Link>
                  </Button>
                )}
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50"
                    title="Profile"
                  >
                    <UserCircle className="h-6 w-6" />
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-md shadow-lg z-50 p-3">
                      <p className="font-semibold text-foreground truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      <p className="text-xs text-primary mt-1">Role: {user.role}</p>
                      <div className="mt-3 space-y-2">
                        <Button size="sm" className="w-full" asChild>
                          <Link to="/profile">View Profile</Link>
                        </Button>
                        <Button size="sm" variant="ghost" className="w-full" onClick={handleLogout}>
                          Log out
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login">
                    <User className="h-4 w-4 mr-2" />
                    Login
                  </Link>
                </Button>
                <Button size="sm" className="bg-primary hover:bg-primary/90" asChild>
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="h-6 w-6 text-foreground" />
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 space-y-4 border-t border-border">
            <a href="#destinations" onClick={handleDestinationsClick} className="block text-foreground hover:text-primary">
              Destinations
            </a>
            <Link to="/hotels" className="block text-foreground hover:text-primary">
              Hotels
            </Link>
            <Link to="/tour-packages" className="block text-foreground hover:text-primary">
              Tour Packages
            </Link>
            <Link to="/guides" className="block text-foreground hover:text-primary">
              Guides
            </Link>
            <Link to="/offers" className="block text-foreground hover:text-primary">
              Offers
            </Link>
            <Link to="/payments" className="block text-foreground hover:text-primary">
              Payments
            </Link>
            {user && (
              <Link to="/bookings" className="block text-foreground hover:text-primary font-medium">
                My Bookings
              </Link>
            )}
            <div className="pt-4 space-y-2">
              {user ? (
                <>
                  <div className="px-2">
                    <p className="font-semibold text-foreground truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    <p className="text-xs text-primary">Role: {user.role}</p>
                  </div>
                  {user.role === 'admin' && (
                    <Button variant="ghost" className="w-full" asChild>
                      <Link to="/admin">Admin</Link>
                    </Button>
                  )}
                  <Button variant="ghost" className="w-full" asChild>
                    <Link to="/profile">Profile</Link>
                  </Button>
                  <Button className="w-full bg-destructive text-white" onClick={handleLogout}>
                    Log out
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" className="w-full" asChild>
                    <Link to="/login">Login</Link>
                  </Button>
                  <Button className="w-full bg-primary hover:bg-primary/90" asChild>
                    <Link to="/signup">Sign Up</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
