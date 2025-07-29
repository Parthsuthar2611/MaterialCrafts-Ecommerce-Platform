import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export function CartPage() {
  const { items, removeFromCart, updateQuantity, total, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Create sale record
      const response = await axios.post(
        `${API_BASE_URL}/sales/create`,
        { items },
        {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        }
      );

      if (response.data.success) {
        clearCart();
        alert('Order placed successfully! You can view your order in the Orders page.');
        navigate('/orders');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-semibold text-gray-900">Your cart is empty</h2>
        <p className="mt-2 text-gray-500">Add some items to your cart to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 space-y-4">
          {items.map(item => (
            <div key={item.id} className="flex items-center justify-between border-b border-gray-200 py-4 last:border-0">
              <div className="flex items-center space-x-4">
                <img
                  src={item.product.imageUrl || 'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'}
                  alt={item.product.name}
                  className="w-20 h-20 object-cover rounded"
                />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{item.product.name}</h3>
                  {item.design && (
                    <p className="text-sm text-gray-500">Design: {item.design.name}</p>
                  )}
                  {item.product.size && (
                    <p className="text-sm text-gray-500">Size: {item.product.size}</p>
                  )}
                  <p className="text-sm text-gray-500">
                    Price: ₹{item.product.price.toFixed(2)}
                    {item.design && ` + Design: ₹${item.design.price.toFixed(2)}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="p-1 text-gray-500 hover:text-gray-700"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="text-gray-700">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="p-1 text-gray-500 hover:text-gray-700"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <span className="text-lg font-medium text-gray-900">
                  ₹{((item.product.price + (item.design ? item.design.price : 0)) * item.quantity).toFixed(2)}
                </span>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 p-6 rounded-b-lg">
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium text-gray-900">Total</span>
            <span className="text-2xl font-bold text-indigo-600">₹{total.toFixed(2)}</span>
          </div>
          <div className="mt-6 flex justify-end space-x-4">
            <button
              onClick={clearCart}
              className="px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              Clear Cart
            </button>
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="flex items-center px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:bg-gray-400"
            >
              {loading ? (
                'Processing...'
              ) : (
                <>
                  <ShoppingBag className="h-5 w-5 mr-2" />
                  Place Order
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}