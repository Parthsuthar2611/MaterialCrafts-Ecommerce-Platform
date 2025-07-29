import React from 'react';
import { Link } from 'react-router-dom';
import { Package, Palette } from 'lucide-react';

export function HomePage() {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <div className="relative">
        <div className="absolute inset-0">
          <img
            className="w-full h-[600px] object-cover"
            src="https://images.unsplash.com/photo-1565538810643-b5bdb714032a?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80"
            alt="Craft materials"
          />
          <div className="absolute inset-0 bg-gray-900 bg-opacity-60"></div>
        </div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Craft Your Vision
          </h1>
          <p className="mt-6 text-xl text-gray-100 max-w-3xl">
            Discover premium materials and unique designs for your next creative project.
            From fabric to wood, we have everything you need to bring your ideas to life.
          </p>
          <div className="mt-10 flex space-x-4">
            <Link
              to="/materials"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Browse Materials
            </Link>
            <Link
              to="/designs"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50"
            >
              Explore Designs
            </Link>
          </div>
        </div>
      </div>

      {/* Featured Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="relative rounded-lg overflow-hidden">
            <img
              className="w-full h-96 object-cover"
              src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
              alt="Materials"
            />
            <div className="absolute inset-0 bg-gray-900 bg-opacity-40 flex items-center justify-center">
              <div className="text-center">
                <Package className="h-12 w-12 text-white mx-auto" />
                <h2 className="mt-4 text-2xl font-bold text-white">Quality Materials</h2>
                <Link
                  to="/materials"
                  className="mt-4 inline-block px-4 py-2 rounded-md text-white border-2 border-white hover:bg-white hover:text-gray-900 transition-colors"
                >
                  Shop Materials
                </Link>
              </div>
            </div>
          </div>
          <div className="relative rounded-lg overflow-hidden">
            <img
              className="w-full h-96 object-cover"
              src="https://i.im.ge/2025/04/29/v0p7yF.istockphoto-1387919157-612x612.webp"
              alt="Designs"
            />
            <div className="absolute inset-0 bg-gray-900 bg-opacity-40 flex items-center justify-center">
              <div className="text-center">
                <Palette className="h-12 w-12 text-white mx-auto" />
                <h2 className="mt-4 text-2xl font-bold text-white">Custom Designs</h2>
                <Link
                  to="/designs"
                  className="mt-4 inline-block px-4 py-2 rounded-md text-white border-2 border-white hover:bg-white hover:text-gray-900 transition-colors"
                >
                  Browse Designs
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}