"use client";

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { app } from "@/lib/firebase";
import { useEffect, useState } from "react";
import { Menu, User, LogOut, Calendar, Home } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    const auth = getAuth(app);
    try {
      await signOut(auth);
      router.push('/login');
      localStorage.removeItem('user');
      toast({
        title: "Sign out successful",
        description: "You have been signed out",
      });
    } catch (error) {
      console.error("Sign out error", error);
      toast({
        title: "Error signing out",
        description: "There was an error signing out",
        variant: "destructive",
      });
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">Bookify</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/landing" className="text-gray-700 hover:text-blue-600 font-medium flex items-center">
              <Home size={18} className="mr-1" />
              <span>Home</span>
            </Link>
            <Link href="/upcoming-appointments" className="text-gray-700 hover:text-blue-600 font-medium flex items-center">
              <Calendar size={18} className="mr-1" />
              <span>Appointments</span>
            </Link>
            <Link href='/categories' className="text-gray-700 hover:text-blue-600 font-medium flex items-center">
               {/* <Calendar size={18} className="mr-1" /> */}
               Categories
            </Link>
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-2 border-gray-300 hover:bg-gray-100">
                    <User size={16} />
                    <span>Account</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem className="text-gray-600">
                    {user.email || "User Account"}
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600 focus:text-red-700 cursor-pointer" onClick={handleSignOut}>
                    <LogOut size={16} className="mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1"
            >
              <Menu size={24} />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-4">
            <div className="flex flex-col space-y-4 pt-2 pb-3">
              <Link 
                href="/landing" 
                className="text-gray-700 hover:text-blue-600 px-4 py-2 rounded-md font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                href="/upcoming-appointments" 
                className="text-gray-700 hover:text-blue-600 px-4 py-2 rounded-md font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
               Appointments
              </Link>
              <Link 
                href="/categories" 
                className="text-gray-700 hover:text-blue-600 px-4 py-2 rounded-md font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
               Categories
              </Link>
              {user && (
                <Button 
                  variant="outline" 
                  className="flex items-center justify-center gap-2 mt-2 w-full"
                  onClick={() => {
                    handleSignOut();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <LogOut size={16} />
                  Sign Out
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;