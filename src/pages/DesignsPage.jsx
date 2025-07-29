import React, { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { API_BASE_URL } from '../config';

function DesignCard({ design, onAddToCart }) {
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [isSelectingMaterial, setIsSelectingMaterial] = useState(false);
  const [materials, setMaterials] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/materials`, {
          headers: user?.token ? {
            'Authorization': `Bearer ${user.token}`
          } : {}
        });
        setMaterials(response.data);
      } catch (err) {
        console.error('Failed to fetch materials:', err);
      }
    };

    if (isSelectingMaterial) {
      fetchMaterials();
    }
  }, [isSelectingMaterial, user]);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <img
        src={design.imageUrl || 'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'}
        alt={design.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900">{design.name}</h3>
        <p className="text-sm text-gray-500">{design.description}</p>
        <div className="mt-4">
          <span className="text-xl font-bold text-indigo-600">
            ₹{design.price.toFixed(2)}
          </span>
          {!isSelectingMaterial ? (
            <button
              onClick={() => setIsSelectingMaterial(true)}
              className="mt-2 w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Choose Material
            </button>
          ) : (
            <div className="mt-2 space-y-2">
              <select
                value={selectedMaterial?._id || ''}
                onChange={(e) => {
                  const material = materials.find(m => m._id === e.target.value);
                  setSelectedMaterial(material || null);
                }}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select a material</option>
                {materials.map(material => (
                  <option key={material._id} value={material._id}>
                    {material.name} - ₹{material.price.toFixed(2)}
                  </option>
                ))}
              </select>
              <div className="flex space-x-2">
                <button
                  onClick={() => setIsSelectingMaterial(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (selectedMaterial) {
                      onAddToCart(selectedMaterial);
                      setIsSelectingMaterial(false);
                      setSelectedMaterial(null);
                    }
                  }}
                  disabled={!selectedMaterial}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Add to Cart
                </button>
              </div>
              {selectedMaterial && (
                <div className="mt-2 p-2 bg-gray-50 rounded-md">
                  <p className="text-sm font-medium text-gray-900">Total Price:</p>
                  <p className="text-lg font-bold text-indigo-600">
                    ₹{(selectedMaterial.price + design.price).toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">
                    (Material: ₹{selectedMaterial.price.toFixed(2)} + Design: ₹{design.price.toFixed(2)})
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function DesignsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    const fetchDesigns = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/designs`, {
          headers: user?.token ? {
            'Authorization': `Bearer ${user.token}`
          } : {}
        });
        setDesigns(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching designs:', err);
        setError('Failed to fetch designs. Please try again later.');
        setLoading(false);
      }
    };

    fetchDesigns();
    const interval = setInterval(fetchDesigns, 5000);
    return () => clearInterval(interval);
  }, [user]);

  const filteredDesigns = designs.filter(design => {
    const matchesSearch = design.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPrice = design.price >= priceRange[0] && design.price <= priceRange[1];
    return matchesSearch && matchesPrice;
  });

  const FilterPanel = () => (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        <button
          onClick={() => setShowFilters(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Price Range (₹{priceRange[0]} - ₹{priceRange[1]})
          </label>
          <div className="flex items-center space-x-4">
            <input
              type="range"
              min="0"
              max="10000"
              step="100"
              value={priceRange[0]}
              onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
              className="w-full"
            />
            <input
              type="range"
              min="0"
              max="10000"
              step="100"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
              className="w-full"
            />
          </div>
        </div>

        <button
          onClick={() => setPriceRange([0, 10000])}
          className="w-full px-4 py-2 text-sm text-indigo-600 border border-indigo-600 rounded-md hover:bg-indigo-50"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-600">Loading designs...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Designs</h1>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900"
        >
          <Filter className="h-5 w-5 mr-2" />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="relative">
          <Search className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search designs..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {showFilters && <FilterPanel />}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDesigns.map(design => (
          <DesignCard
            key={design._id}
            design={design}
            onAddToCart={(material) => addToCart(material, design)}
          />
        ))}
      </div>

      {filteredDesigns.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No designs found matching your criteria</p>
        </div>
      )}
    </div>
  );
}