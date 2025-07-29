import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, DollarSign, Package, Palette } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { useAuth } from '../contexts/AuthContext';

export function AdminPanel() {
  const [activeTab, setActiveTab] = useState('materials');
  const [materials, setMaterials] = useState([]);
  const [designs, setDesigns] = useState([]);
  const [sales, setSales] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    imageUrl: '',
    size: ''
  });
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = {
          'Authorization': `Bearer ${user.token}`
        };

        const [materialsRes, designsRes, salesRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/materials`, { headers }),
          axios.get(`${API_BASE_URL}/designs`, { headers }),
          axios.get(`${API_BASE_URL}/sales`, { headers })
        ]);

        setMaterials(materialsRes.data);
        setDesigns(designsRes.data);
        setSales(salesRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    if (user?.token) {
      fetchData();
      const interval = setInterval(fetchData, 5000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleAddItem = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      price: '',
      description: '',
      imageUrl: '',
      size: ''
    });
    setShowModal(true);
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setFormData(item);
    setShowModal(true);
  };

  const handleDeleteItem = async (id) => {
    try {
      const endpoint = activeTab === 'materials' ? 'materials' : 'designs';
      await axios.delete(`${API_BASE_URL}/${endpoint}/${id}`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      if (activeTab === 'materials') {
        setMaterials(materials.filter(item => item._id !== id));
      } else {
        setDesigns(designs.filter(item => item._id !== id));
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = activeTab === 'materials' ? 'materials' : 'designs';
    const newItem = {
      ...formData,
      price: parseFloat(formData.price)
    };

    try {
      const headers = {
        'Authorization': `Bearer ${user.token}`
      };

      if (editingItem) {
        const response = await axios.put(
          `${API_BASE_URL}/${endpoint}/${editingItem._id}`,
          newItem,
          { headers }
        );
        
        if (activeTab === 'materials') {
          setMaterials(materials.map(item => 
            item._id === editingItem._id ? response.data : item
          ));
        } else {
          setDesigns(designs.map(item => 
            item._id === editingItem._id ? response.data : item
          ));
        }
      } else {
        const response = await axios.post(
          `${API_BASE_URL}/${endpoint}`,
          newItem,
          { headers }
        );
        
        if (activeTab === 'materials') {
          setMaterials([...materials, response.data]);
        } else {
          setDesigns([...designs, response.data]);
        }
      }

      setShowModal(false);
    } catch (error) {
      console.error('Error saving item:', error);
    }
  };

  const renderInventoryGrid = () => {
    const items = activeTab === 'materials' ? materials : designs;
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div key={item._id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                  <p className="text-sm text-gray-500">{item.description}</p>
                  {item.size && (
                    <p className="text-sm text-gray-500">Size: {item.size}</p>
                  )}
                  <p className="mt-2 text-lg font-bold text-indigo-600">
                    ₹{item.price.toFixed(2)}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditItem(item)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item._id)}
                    className="text-red-400 hover:text-red-700"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const calculateTotalSales = () => {
    return sales.reduce((total, sale) => total + sale.total, 0);
  };

  const renderSalesHistory = () => (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-indigo-50 p-4 rounded-lg">
            <p className="text-sm text-indigo-600">Total Sales</p>
            <p className="text-2xl font-bold text-indigo-900">₹{calculateTotalSales().toFixed(2)}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-600">Total Orders</p>
            <p className="text-2xl font-bold text-green-900">{sales.length}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-purple-600">Average Order Value</p>
            <p className="text-2xl font-bold text-purple-900">
              ₹{sales.length > 0 ? (calculateTotalSales() / sales.length).toFixed(2) : '0.00'}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
          {sales.length === 0 ? (
            <p className="text-gray-500">No orders yet</p>
          ) : (
            <div className="space-y-4">
              {sales.map((sale) => (
                <div key={sale._id} className="border-b border-gray-200 last:border-0 pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-gray-500">
                        Order placed on {new Date(sale.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        Customer: {sale.customer.email}
                      </p>
                      <p className="mt-1 text-lg font-semibold text-gray-900">
                        Total: ₹{sale.total.toFixed(2)}
                      </p>
                    </div>
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                      sale.status === 'completed' 
                        ? 'text-green-800 bg-green-100'
                        : 'text-yellow-800 bg-yellow-100'
                    }`}>
                      {sale.status}
                    </span>
                  </div>
                  <div className="mt-2">
                    <h4 className="text-sm font-medium text-gray-900">Items:</h4>
                    <ul className="mt-1 space-y-1">
                      {sale.items.map((item, index) => (
                        <li key={index} className="text-sm text-gray-600">
                          {item.quantity}x {item.productName} - ₹{item.price.toFixed(2)}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('materials')}
            className={`${
              activeTab === 'materials'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            <Package className="h-5 w-5 mr-2" />
            Materials
          </button>
          <button
            onClick={() => setActiveTab('designs')}
            className={`${
              activeTab === 'designs'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            <Palette className="h-5 w-5 mr-2" />
            Designs
          </button>
          <button
            onClick={() => setActiveTab('sales')}
            className={`${
              activeTab === 'sales'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            <DollarSign className="h-5 w-5 mr-2" />
            Sales History
          </button>
        </nav>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        {activeTab === 'sales' ? (
          renderSalesHistory()
        ) : (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {activeTab === 'materials' ? 'Materials' : 'Designs'}
              </h2>
              <button
                onClick={handleAddItem}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add {activeTab === 'materials' ? 'Material' : 'Design'}
              </button>
            </div>
            {renderInventoryGrid()}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingItem ? 'Edit' : 'Add'} {activeTab === 'materials' ? 'Material' : 'Design'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Price (₹)</label>
                <input
                  type="text"
                  value={formData.price}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || /^\d*\.?\d*$/.test(value)) {
                      setFormData({ ...formData, price: value });
                    }
                  }}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter price"
                  required
                />
              </div>
              {activeTab === 'materials' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Size</label>
                  <input
                    type="text"
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  rows="3"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Image URL</label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  {editingItem ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}