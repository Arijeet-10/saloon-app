import Link from 'next/link';
import { Facebook, Instagram, Twitter } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div className="text-center md:text-left">
            <h3 className="font-bold text-lg mb-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">Bookify</h3>
            <p className="text-gray-600 text-sm">
              Professional hair and beauty services tailored to your unique style.
            </p>
          </div>
          
          {/* Quick Links */}
          <div className="text-center">
            <h3 className="font-semibold text-gray-800 mb-3">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/landing" className="text-gray-600 hover:text-blue-600 text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/upcoming-appointments" className="text-gray-600 hover:text-blue-600 text-sm">
                  Appointments
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-gray-600 hover:text-blue-600 text-sm">
                  Services
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Social Media */}
          <div className="text-center md:text-right">
            <h3 className="font-semibold text-gray-800 mb-3">Connect With Us</h3>
            <div className="flex justify-center md:justify-end space-x-4">
              <a href="#" className="text-gray-500 hover:text-blue-600" aria-label="Facebook">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-500 hover:text-pink-600" aria-label="Instagram">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-500 hover:text-blue-400" aria-label="Twitter">
                <Twitter size={20} />
              </a>
            </div>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="border-t border-gray-200 mt-6 pt-6 text-center">
          <p className="text-sm text-gray-500">
            © {currentYear} Bookify. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;