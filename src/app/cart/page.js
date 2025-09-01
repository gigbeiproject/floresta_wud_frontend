"use client";
import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, MapPin, CreditCard, Truck, User, Phone, Home } from 'lucide-react';
import { fetchWithAuth } from '../lib/fetchWithAuth';
// Real API utility function
import { useSelector, useDispatch } from "react-redux";
import {
  removeItemFromCart,
  clearCart,
  updateItemQuantity,
} from "../store/cartSlice";  // ✅ your redux actions
import AuthGuard from '@/Com/AuthGuard';


const EcommerceCheckout = () => {
  // Cart state - Initialize empty, will load from API/localStorage
 
  const [currentStep, setCurrentStep] = useState('cart'); // cart, address, payment
  const [loading, setLoading] = useState(true);
  
  // Address state
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [orderProcessing, setOrderProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  // Load cart from localStorage and API on component mount
  useEffect(() => {
    loadCartFromStorage();
  }, []);


  const dispatch = useDispatch();
const { items: cartItems, totalQuantity, totalAmount } = useSelector(
  (state) => state.cart
);

// Update quantity
const updateQuantity = (id, newQuantity) => {
  if (newQuantity <= 0) {
    dispatch(removeItemFromCart(id));
  } else {
    dispatch(updateItemQuantity({ id, quantity: newQuantity }));
  }
};

// Remove item
const removeItem = (id) => {
  dispatch(removeItemFromCart(id));
};

// Clear cart
const clearCartItems = () => {
  dispatch(clearCart());
};


  // Load cart from localStorage (for persistence)
  const loadCartFromStorage = () => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        setCartItems(parsedCart.items || []);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading cart from storage:', error);
      setLoading(false);
    }
  };

  // Save cart to localStorage whenever cart changes
  useEffect(() => {
    console.log("cartitems",cartItems);
    if (!loading) {
      localStorage.setItem('cart', JSON.stringify({ 
        items: cartItems,
        lastUpdated: Date.now()
      }));
    }
  }, [cartItems, loading]);

  // Load Razorpay script
  useEffect(() => {
    if (window.Razorpay) return;

    const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existingScript) return;

    const script = document.createElement('script');
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => console.log('Razorpay script loaded');
    script.onerror = () => console.error('Failed to load Razorpay script');
    
    document.body.appendChild(script);

    return () => {
      const scriptToRemove = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      if (scriptToRemove && document.body.contains(scriptToRemove)) {
        document.body.removeChild(scriptToRemove);
      }
    };
  }, []);

  // Cart calculations
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + tax;

  // Cart functions
  const updateQuantityLocal = async (id, newQuantity) => {
    if (newQuantity <= 0) {
      setCartItems(prev => prev.filter(item => item.id !== id));
    } else {
      setCartItems(prev => prev.map(item => 
        item.id === id ? { ...item, quantity: newQuantity } : item
      ));
    }
    
    // Optional: Update quantity on server
    try {
      await fetchWithAuth('/api/cart/update', {
        method: 'PUT',
        body: { productId: id, quantity: newQuantity }
      });
    } catch (error) {
      console.error('Error updating cart on server:', error);
      // Handle error - maybe show toast notification
    }
  };


  const clearCart = async () => {
    const savedCart = localStorage.removeItem('cart');
    console.log("cart",savedCart);
    setCartItems([]);
    
    // Optional: Clear cart on server
    try {
      await fetchWithAuth('/api/cart/clear', {
        method: 'DELETE'
      });
    } catch (error) {
      console.error('Error clearing cart on server:', error);
    }
  };

  // Address functions
   const fetchAddresses = async () => {
   try {
     const data = await fetchWithAuth('/api/address/get_address');
     setAddresses(data.addresses || []);
   } catch (error) {
     console.error('Error fetching addresses:', error.message);
   }
 };


  

const handleAddAddress = async () => {
  // Validate form
  const requiredFields = ['name', 'phone', 'address', 'city', 'state', 'pincode'];
  const missingFields = requiredFields.filter(field => !newAddress[field].trim());

  if (missingFields.length > 0) {
    alert(`Please fill in: ${missingFields.join(', ')}`);
    return;
  }

  try {
    const response = await fetchWithAuth('/api/address/addaddress', {
      method: 'POST',
      body: JSON.stringify(newAddress), // ✅ stringify JSON
    });

    if (response.success) {
      setShowAddAddressModal(false);
      setNewAddress({
        name: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
      });
      fetchAddresses();
    } else {
      alert(response.error || 'Failed to add address');
    }
  } catch (error) {
    console.error('Error adding address:', error.message);
    alert(error.message || 'Failed to add address. Please try again.');
  }
};


  // Order placement
// Order placement
const handlePlaceOrder = async () => {
  if (!selectedAddress) {
    alert("Please select an address");
    return;
  }

  if (cartItems.length === 0) {
    alert("Your cart is empty");
    return;
  }

  setOrderProcessing(true);

  try {
    // --- COD ---
    if (paymentMethod === "cod") {
    const payload = {
  addressId: selectedAddress,   // must be the `id` from your addresses table
  items: cartItems.map(item => ({
    productId: String(item.id),   // ✅ make sure it's a string
    quantity: Number(item.quantity), // ✅ ensure number
  })),
};

      console.log("COD Payload Sending:", payload);

      const response = await fetchWithAuth("/api/payment/cart_payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log("COD API Response:", response);

      if (response.success) {
        setOrderPlaced(true);
        setCartItems([]);
        localStorage.removeItem("cart");
        alert("Order placed successfully (COD).");
      } else {
        alert(response.error || "Failed to place COD order");
      }

      setOrderProcessing(false);
      return;
    }

    // --- ONLINE PAYMENT ---
    const orderData = await fetchWithAuth("/api/payment/cart_payment_createOrder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        addressId: selectedAddress,
        items: cartItems.map(item => ({
          productId: item.id,
          quantity: item.quantity,
        })),
        amount: total,
      }),
    });

    if (!orderData.success) {
      alert(orderData.error || "Failed to create online order.");
      setOrderProcessing(false);
      return;
    }

    if (!window.Razorpay) {
      alert("Payment system not loaded. Please refresh and try again.");
      setOrderProcessing(false);
      return;
    }

    const selectedAddr = addresses.find((addr) => addr.id === selectedAddress);

    const options = {
      key: orderData.key,
      amount: orderData.amount,
      currency: orderData.currency,
      name: "Your Store",
      description: `Order #${orderData.orderId}`,
      order_id: orderData.razorpayOrderId,
      handler: async function (response) {
        try {
          const verifyResponse = await fetchWithAuth("/api/payment/verify_payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: orderData.orderId,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            }),
          });

          if (verifyResponse.success) {
            setOrderPlaced(true);
            setCartItems([]);
            localStorage.removeItem("cart");
            alert("Payment successful! Order placed.");
          } else {
            alert(
              verifyResponse.error ||
              "Payment verification failed. Please contact support."
            );
          }
        } catch (error) {
          console.error("Payment verification error:", error);
          alert("Payment verification failed. Please contact support.");
        } finally {
          setOrderProcessing(false);
        }
      },
      prefill: {
        name: selectedAddr?.name || "",
        contact: selectedAddr?.phone || "",
      },
      theme: { color: "#f59e0b" },
      modal: {
        ondismiss: function () {
          setOrderProcessing(false);
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();

  } catch (error) {
    console.error("Error placing order:", error);
    alert("Something went wrong. Please try again.");
    setOrderProcessing(false);
  }
};




  // Step navigation
  const goToAddresses = () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty');
      return;
    }
    setCurrentStep('address');
    fetchAddresses();
  };

  const goToPayment = () => {
    if (!selectedAddress) {
      alert('Please select an address');
      return;
    }
    setCurrentStep('payment');
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your cart...</p>
        </div>
      </div>
    );
  }

  // Order success screen
  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-16">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h2>
          <p className="text-gray-600 mb-6">Thank you for your purchase. You will receive a confirmation email shortly.</p>
          <button
            onClick={() => {
              setOrderPlaced(false);
              setCurrentStep('cart');
            }}
            className="bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  // Empty cart
  if (cartItems.length === 0 && currentStep === 'cart') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-16">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md text-center">
          <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Cart is Empty</h2>
   
          <p className="text-gray-600 mb-6">Looks like you haven&apos;t added any items to your cart yet.</p>

          <button
            onClick={() => window.history.back()}
            className="bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
  
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            {['cart', 'address', 'payment'].map((step, index) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  currentStep === step ? 'bg-amber-600 text-white' : 
                  ['cart', 'address', 'payment'].indexOf(currentStep) > index ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  {index + 1}
                </div>
                <span className="ml-2 font-medium capitalize">{step}</span>
                {index < 2 && <div className="w-16 h-0.5 bg-gray-300 mx-4" />}
              </div>
            ))}
          </div>
        </div>

        {/* Cart Step */}
        {currentStep === 'cart' && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
              <button onClick={clearCart} className="text-red-600 hover:text-red-700 underline">
                Clear Cart
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="bg-white rounded-lg shadow-md p-6 flex items-center gap-4">
                    <img src={item.image} alt={item.name} className="h-20 w-20 object-cover rounded-lg flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">{item.name}</h3>
                      <p className="text-amber-600 font-bold">₹{item.price}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-lg font-bold text-gray-900">₹{item.price * item.quantity}</p>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-700 p-2"
                      title="Remove item"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="lg:col-span-1 bg-white rounded-lg shadow-md p-6 h-fit sticky top-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal ({totalQuantity} items)</span>
                    <span className="font-semibold">₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-semibold text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (18%)</span>
                    <span className="font-semibold">₹{tax}</span>
                  </div>
                  <hr className="border-gray-200" />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-amber-600">₹{total}</span>
                  </div>
                </div>

                <button 
                  onClick={goToAddresses}
                  className="w-full bg-amber-600 text-white py-3 rounded-lg font-semibold hover:bg-amber-700 transition-colors mb-3"
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Address Step */}
        {currentStep === 'address' && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Select Address</h1>
              <button
                onClick={() => setCurrentStep('cart')}
                className="text-amber-600 hover:text-amber-700 underline"
              >
                Back to Cart
              </button>
            </div>

            {addressLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading addresses...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                  {addresses.map((address) => (
                    <div
                      key={address.id}
                      onClick={() => setSelectedAddress(address.id)}
                      className={`bg-white rounded-lg shadow-md p-6 cursor-pointer border-2 transition-colors ${
                        selectedAddress === address.id ? 'border-amber-600' : 'border-transparent'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <User className="w-4 h-4 text-gray-500" />
                            <span className="font-semibold">{address.name}</span>
                            {address.isDefault && (
                              <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded">Default</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <Phone className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-600">{address.phone}</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-gray-500 mt-1" />
                            <div className="text-gray-600">
                              <div>{address.address}</div>
                              <div>{address.city}, {address.state} - {address.pincode}</div>
                            </div>
                          </div>
                        </div>
                        <input
                          type="radio"
                          checked={selectedAddress === address.id}
                          onChange={() => setSelectedAddress(address.id)}
                          className="mt-1 text-amber-600"
                        />
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={() => setShowAddAddressModal(true)}
                    className="w-full bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-6 hover:bg-gray-200 transition-colors"
                  >
                    <Plus className="w-6 h-6 mx-auto mb-2 text-gray-500" />
                    <span className="text-gray-600 font-medium">Add New Address</span>
                  </button>
                </div>

                <div className="lg:col-span-1 bg-white rounded-lg shadow-md p-6 h-fit sticky top-4">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-semibold">₹{subtotal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax (18%)</span>
                      <span className="font-semibold">₹{tax}</span>
                    </div>
                    <hr className="border-gray-200" />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-amber-600">₹{total}</span>
                    </div>
                  </div>

                  <button
                    onClick={goToPayment}
                    disabled={!selectedAddress}
                    className="w-full bg-amber-600 text-white py-3 rounded-lg font-semibold hover:bg-amber-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Continue to Payment
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Payment Step */}
        {currentStep === 'payment' && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Payment</h1>
              <button
                onClick={() => setCurrentStep('address')}
                className="text-amber-600 hover:text-amber-700 underline"
              >
                Back to Address
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold mb-4">Payment Method</h3>
                  <div className="space-y-4">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="payment"
                        value="online"
                        checked={paymentMethod === 'online'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="text-amber-600"
                      />
                      <CreditCard className="w-5 h-5 text-gray-500" />
                      <span className="font-medium">Online Payment (UPI, Cards, Wallet)</span>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="payment"
                        value="cod"
                        checked={paymentMethod === 'cod'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="text-amber-600"
                      />
                      <Truck className="w-5 h-5 text-gray-500" />
                      <span className="font-medium">Cash on Delivery</span>
                    </label>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold mb-4">Delivery Address</h3>
                  {selectedAddress && addresses.find(addr => addr.id === selectedAddress) && (
                    <div className="border rounded-lg p-4 bg-gray-50">
                      {(() => {
                        const address = addresses.find(addr => addr.id === selectedAddress);
                        return (
                          <div>
                            <div className="font-semibold mb-1">{address.name}</div>
                            <div className="text-gray-600 mb-1">{address.phone}</div>
                            <div className="text-gray-600">
                              {address.address}<br />
                              {address.city}, {address.state} - {address.pincode}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>

              <div className="lg:col-span-1 bg-white rounded-lg shadow-md p-6 h-fit sticky top-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
                <div className="space-y-3 mb-6">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-600">{item.name} x{item.quantity}</span>
                      <span className="font-semibold">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                  <hr className="border-gray-200" />
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold">₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (18%)</span>
                    <span className="font-semibold">₹{tax}</span>
                  </div>
                  <hr className="border-gray-200" />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-amber-600">₹{total}</span>
                  </div>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={orderProcessing}
                  className="w-full bg-amber-600 text-white py-3 rounded-lg font-semibold hover:bg-amber-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {orderProcessing ? 'Processing...' : `Place Order - ₹${total}`}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Address Modal */}
        {showAddAddressModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold mb-4">Add New Address</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={newAddress.name}
                  onChange={(e) => setNewAddress({...newAddress, name: e.target.value})}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={newAddress.phone}
                  onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
                <textarea
                  placeholder="Address"
                  value={newAddress.address}
                  onChange={(e) => setNewAddress({...newAddress, address: e.target.value})}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 h-24"
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="City"
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={newAddress.state}
                    onChange={(e) => setNewAddress({...newAddress, state: e.target.value})}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Pincode"
                  value={newAddress.pincode}
                  onChange={(e) => setNewAddress({...newAddress, pincode: e.target.value})}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => setShowAddAddressModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddAddress}
                  className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                >
                  Add Address
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  
  );
};

export default EcommerceCheckout;