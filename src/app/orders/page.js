"use client";
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Package, Calendar, MapPin, Phone, User } from 'lucide-react';
import { fetchWithAuth } from '../lib/fetchWithAuth';
import AuthGuard from '@/Com/AuthGuard';

const OrderPage = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await fetchWithAuth('/api/order');

      if (data.success) {
        setOrders(data.orders);
      } else {
        throw new Error(data.error || 'API returned unsuccessful response');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'delivered':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Orders</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchOrders}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ✅ Order Detail Page
  if (selectedOrder) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto p-6">
          <div className="mb-6">
            <button
              onClick={() => setSelectedOrder(null)}
              className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Orders
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Order Header */}
            <div className="p-6 border-b border-gray-200 flex justify-between flex-wrap">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Order #{selectedOrder.id}
                </h2>
                <p className="text-gray-600 mt-1">
                  Placed on {formatDate(selectedOrder.created_at)}
                </p>
              </div>
              <div className="mt-4 md:mt-0 flex flex-col md:items-end">
                <span
                  className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    selectedOrder.order_status
                  )}`}
                >
                  {selectedOrder.order_status}
                </span>
                <span
                  className={`inline-flex px-3 py-1 rounded-full text-xs font-medium mt-2 ${getPaymentStatusColor(
                    selectedOrder.payment_status
                  )}`}
                >
                  Payment: {selectedOrder.payment_status}
                </span>
              </div>
            </div>

            {/* Product List */}
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Package className="w-5 h-5 mr-2" /> Products
              </h3>

              <div className="space-y-4">
                {selectedOrder.order_items?.map((item, index) => (
                  <div key={index} className="flex gap-4 border rounded-lg p-3">
                    <img
                      src={item.image}
                      alt={item.product_name}
                      className="w-24 h-24 object-cover rounded-md"
                      onError={(e) => (e.target.src = '/api/placeholder/100/100')}
                    />
                    <div className="flex-1">
                      <h4 className="text-base font-semibold text-gray-900">{item.product_name}</h4>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      <p className="text-sm text-gray-600">
                        Unit Price: {formatCurrency(item.unit_price)}
                      </p>
                      <p className="text-sm font-bold text-green-600">
                        Subtotal: {formatCurrency(item.quantity * item.unit_price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 text-right">
                <p className="text-gray-600">Total Amount:</p>
                <p className="text-2xl font-bold text-green-700">
                  {formatCurrency(selectedOrder.total_amount)}
                </p>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Delivery Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <User className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-600">Name:</span>
                    <span className="ml-2 font-medium">{selectedOrder.delivery_name}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-600">Phone:</span>
                    <span className="ml-2 font-medium">{selectedOrder.delivery_phone}</span>
                  </div>
                </div>
                <div>
                  <p className="text-gray-600">Address:</p>
                  <p className="ml-2 font-medium">
                    {selectedOrder.delivery_address}, {selectedOrder.city},{' '}
                    {selectedOrder.state}, PIN: {selectedOrder.pincode}
                  </p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="p-6 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2" /> Order Timeline
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span className="font-medium">{formatDate(selectedOrder.created_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Updated:</span>
                  <span className="font-medium">{formatDate(selectedOrder.updated_at)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Orders List Page
  return (
    
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-600 mt-2">Track and manage your orders</p>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders found</h3>
           <p className="text-gray-600">You haven&apos;t placed any orders yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map((order) => (
              <div
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
              >
                <img
                  src={order.order_items?.[0]?.image}
                  alt={order.order_items?.[0]?.product_name}
                  className="w-full h-48 object-cover"
                  onError={(e) => (e.target.src = '/api/placeholder/300/200')}
                />
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900 text-sm truncate">
                      Order #{order.id}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        order.order_status
                      )}`}
                    >
                      {order.order_status}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-2 truncate">
                    {order.order_items?.length > 1
                      ? `${order.order_items[0].product_name} + ${order.order_items.length - 1
                        } more`
                      : order.order_items?.[0]?.product_name}
                  </p>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">
                      {order.order_items?.reduce((sum, i) => sum + i.quantity, 0)} items
                    </span>
                    <span className="font-bold text-green-600">
                      {formatCurrency(order.total_amount)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                    <span>{order.payment_method}</span>
                    <span>{new Date(order.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
   
  );
};

export default OrderPage;
