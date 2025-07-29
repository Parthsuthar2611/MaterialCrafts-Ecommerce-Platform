import React from 'react';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <Mail className="h-5 w-5 mr-2" />
                  info@materialcrafts.com
              </div>
              <div className="flex items-center">
                <Phone className="h-5 w-5 mr-2" />
                  +91 123 456 7890
              </div>
              <div className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                <span>D-31,Ajwa Rd,Vadodara,Gujarat</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="/materials" className="hover:text-indigo-400">Materials</a>
              </li>
              <li>
                <a href="/designs" className="hover:text-indigo-400">Designs</a>
              </li>
              <li>
                <a href="/about" className="hover:text-indigo-400">About Us</a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/share/1DcWSqAVRZ/" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="https://x.com/Shrey_sh3971?t=u7OHQS5bgkTIAVuDQHxP0w&s=08" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400">
                <Twitter className="h-6 w-6" />
              </a>
              <a href="https://www.instagram.com/jay_ambe_metal_works?igsh=MXV4N2g2Ymw1eW1vaA==" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400">
                <Instagram className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} Material & Crafts. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}