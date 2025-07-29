import React from 'react';
import { Heart, Package, Palette, Truck } from 'lucide-react';

export function AboutPage() {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <div className="relative bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
              About Material & Crafts
            </h1>
            <p className="mt-4 text-xl text-gray-500 max-w-3xl mx-auto">
              We're passionate about providing high-quality materials and unique designs
              to help bring your creative visions to life.
            </p>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="h-12 w-12 text-indigo-600 mx-auto">
              <Package className="h-full w-full" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Quality Materials</h3>
            <p className="mt-2 text-base text-gray-500">
              We source only the finest materials from trusted suppliers worldwide.
            </p>
          </div>
          <div className="text-center">
            <div className="h-12 w-12 text-indigo-600 mx-auto">
              <Palette className="h-full w-full" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Unique Designs</h3>
            <p className="mt-2 text-base text-gray-500">
              Our designs are created by talented artists and craftspeople.
            </p>
          </div>
          <div className="text-center">
            <div className="h-12 w-12 text-indigo-600 mx-auto">
              <Truck className="h-full w-full" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Fast Shipping</h3>
            <p className="mt-2 text-base text-gray-500">
              Quick and reliable shipping to get your materials to you safely.
            </p>
          </div>
          <div className="text-center">
            <div className="h-12 w-12 text-indigo-600 mx-auto">
              <Heart className="h-full w-full" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Customer Care</h3>
            <p className="mt-2 text-base text-gray-500">
              Dedicated support to help you with any questions or concerns.
            </p>
          </div>
        </div>
      </div>

      {/* Story Section */}
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900">Our Story</h2>
              <p className="mt-4 text-lg text-gray-500">
                Founded in 2025, Material & Crafts began with a simple mission: to provide
                crafters and makers with the highest quality materials and most inspiring
                designs. We understand that every project is unique, and we're here to
                help you bring your creative vision to life.
              </p>
              <p className="mt-4 text-lg text-gray-500">
                Today, we're proud to serve a community of passionate creators, from
                hobbyists to professional craftspeople. Our commitment to quality,
                creativity, and customer service remains at the heart of everything we do.
              </p>
            </div>
            <div className="mt-10 lg:mt-0">
              <img
                className="rounded-lg shadow-lg"
                src="https://images.unsplash.com/photo-1452860606245-08befc0ff44b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
                alt="Our workshop"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}