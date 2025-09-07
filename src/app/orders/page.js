"use client";
import React, { useState, useEffect } from "react";
import { ArrowLeft, Package, Calendar, MapPin, Phone, User } from "lucide-react";
import { fetchWithAuth } from "../lib/fetchWithAuth";

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
      const data = await fetchWithAuth("/api/order");
      if (data.success) {
        setOrders(data.orders);
      } else {
        throw new Error(data.error || "API returned unsuccessful response");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "delivered":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-b-0 border-blue-600"></div>
        <p className="ml-3 text-gray-600">Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 text-2xl mb-3">⚠️</div>
          <p className="text-gray-700 mb-2">Failed to load orders</p>
          <button
            onClick={fetchOrders}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ✅ Order Details View
  if (selectedOrder) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <button
          onClick={() => setSelectedOrder(null)}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Orders
        </button>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">
              Order #{selectedOrder.id}
            </h2>
            <p className="text-gray-600 mt-1">
              Placed on {formatDate(selectedOrder.created_at)}
            </p>
            <span
              className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                selectedOrder.order_status
              )}`}
            >
              {selectedOrder.order_status}
            </span>
          </div>

          {/* Items */}
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Package className="w-5 h-5 mr-2" /> Products
            </h3>
            <div className="space-y-4">
              {selectedOrder.items?.map((item) => (
                <div key={item.id} className="flex gap-4 border rounded-lg p-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded-md"
                    onError={(e) => (e.target.src = "/api/placeholder/100/100")}
                  />
                  <div>
                    <h4 className="font-medium text-gray-900">{item.name}</h4>
                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    <p className="text-sm text-gray-600">
                      Unit: {formatCurrency(item.unitPrice)}
                    </p>
                    <p className="text-sm font-bold text-green-600">
                      Subtotal: {formatCurrency(item.totalPrice)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 text-right">
              <p className="text-gray-600">Total:</p>
              <p className="text-2xl font-bold text-green-700">
                {formatCurrency(selectedOrder.total_amount)}
              </p>
            </div>
          </div>

          {/* Delivery */}
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <MapPin className="w-5 h-5 mr-2" /> Delivery Information
            </h3>
            <p className="text-gray-700 font-medium">{selectedOrder.delivery_name}</p>
            <p className="text-gray-600">{selectedOrder.delivery_phone}</p>
            <p className="text-gray-600">
              {selectedOrder.delivery_address}, {selectedOrder.city},{" "}
              {selectedOrder.state} - {selectedOrder.pincode}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Orders List View (only IDs)
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <p className="text-gray-600">No orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              onClick={() => setSelectedOrder(order)}
              className="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-md transition"
            >
              <div className="flex justify-between items-center">
                <p className="font-medium text-gray-900">#{order.id}</p>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    order.order_status
                  )}`}
                >
                  {order.order_status}
                </span>
              </div>
              <div className="mt-2 text-sm text-gray-600 flex justify-between">
                <span>{order.payment_method}</span>
                <span>{formatCurrency(order.total_amount)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderPage;
