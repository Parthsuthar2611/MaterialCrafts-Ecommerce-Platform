import React, { useState, useEffect } from 'react';
import { ProductCard } from '../components/ProductCard';
import { Filter, Search, X } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { useAuth } from '../contexts/AuthContext';

export function MaterialsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
        setLoading(false);
      } catch (err) {
        console.error('Error fetching materials:', err);
        setError('Failed to fetch materials. Please try again later.');
        setLoading(false);
      }
    };

    fetchMaterials();
    const interval = setInterval(fetchMaterials, 5000);
    return () => clearInterval(interval);
  }, [user]);

  const availableSizes = [...new Set(materials.map(material => material.size))];

  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPrice = material.price >= priceRange[0]  && material.price <= priceRange[1] ;
    const matchesSize = selectedSizes.length === 0 || selectedSizes.includes(material.size);
    return matchesSearch && matchesPrice && matchesSize;
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
          <div className="grid grid-cols-2 gap-2">
            {availableSizes.map(size => (
              <label key={size} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedSizes.includes(size)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedSizes([...selectedSizes, size]);
                    } else {
                      setSelectedSizes(selectedSizes.filter(s => s !== size));
                    }
                  }}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">{size}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          onClick={() => {
            setPriceRange([0, 10000]);
            setSelectedSizes([]);
          }}
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
        <div className="text-gray-600">Loading materials...</div>
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
        <h1 className="text-3xl font-bold text-gray-900">Materials</h1>
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
            placeholder="Search materials..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {showFilters && <FilterPanel />}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMaterials.map(material => (
          <ProductCard key={material._id} product={material} />
        ))}
      </div>

      {filteredMaterials.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No materials found matching your criteria</p>
        </div>
      )}
    </div>
  );
}