'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { fetchWithAuth } from '../../lib/fetchWithAuth';
const ProductDetailsPage = ({ params }) => {
  // Unwrap params if it's a Promise (Next may provide params as a Promise in some versions).
  const [resolvedParams, setResolvedParams] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });


  useEffect(() => {
  const script = document.createElement('script');
  script.src = "https://checkout.razorpay.com/v1/checkout.js";
  script.async = true;
  document.body.appendChild(script);

  return () => {
    document.body.removeChild(script);
  };
}, []);

  useEffect(() => {
    let mounted = true;
    const resolveParams = async () => {
      try {
        const p = params && typeof params.then === 'function' ? await params : params;
        if (mounted) setResolvedParams(p);
      } catch (err) {
        console.error('Failed to resolve params:', err);
      }
    };
    resolveParams();
    return () => { mounted = false; };
  }, [params]);

  // Keep accessing resolvedParams.id in the client component
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });
  const [orderProcessing, setOrderProcessing] = useState(false);

  // Fetch product details (use resolvedParams instead of params)
  useEffect(() => {
    const fetchProduct = async () => {
      console.log("nnn",resolvedParams.id);
      try {
        const response = await fetch(`/api/products/${resolvedParams.id}`);
        const data = await response.json();
        setProduct(data.product);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching product:', error);
        setLoading(false);
      }
    };

    if (resolvedParams?.id) {
      fetchProduct();
    }
  }, [resolvedParams?.id]);

  // Fetch addresses when modal opens
  const fetchAddresses = async () => {
  try {
    const data = await fetchWithAuth('/api/address/get_address');
    setAddresses(data.addresses || []);
  } catch (error) {
    console.error('Error fetching addresses:', error.message);
  }
};

  // Add new address
  const handleAddAddress = async () => {
  try {
    await fetchWithAuth('/api/address/addaddress', {
      method: 'POST',
      body: JSON.stringify(newAddress),
    });

    // Reset form & refresh addresses
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
  } catch (error) {
    console.error('Error adding address:', error.message);
  }
};

  // Handle buy now click
  const handleBuyNow = () => {
    setShowAddressModal(true);
    fetchAddresses();
  };

  // Handle order placement

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      alert('Please select an address');
      return;
    }

    setOrderProcessing(true);

    try {
      if (paymentMethod === 'cod') {
        // ✅ Cash on Delivery
      const response = await fetchWithAuth('/api/payment/cart_payment', {
    method: 'POST',
    body: JSON.stringify({
      addressId: selectedAddress,
      items: [
        {
          productId: product.id,
          quantity: quantity
        }
      ]
    }),
  });

        if (response.success) {
          alert('Order placed successfully! You will pay on delivery.');
          router.push('/orders');
        } else {
          alert(response.error || 'Failed to place COD order');
        }

      } else {
        // ✅ Online Payment using Razorpay
        const orderData = await fetchWithAuth('/api/payment/cart_payment_createOrder', {
      method: 'POST',
      body: JSON.stringify({
        addressId: selectedAddress,
        items: [
          {
            productId: product.id,
            quantity: quantity
          }
        ]
      }),
    });


        if (!orderData.success) {
          alert(orderData.error || 'Failed to create online order.');
          setOrderProcessing(false);
          return;
        }

        // Razorpay options
        const options = {
          key: orderData.key, // Razorpay Key
          amount: orderData.amount, // in paise
          currency: orderData.currency,
          name: product.name,
          description: `Order #${orderData.orderId}`,
          order_id: orderData.razorpayOrderId,
          handler: async function (response) {
            // Verify payment
            const verifyResponse = await fetchWithAuth('/api/payment/verify_payment', {
              method: 'POST',
              body: JSON.stringify({
                orderId: orderData.orderId,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature
              }),
            });

            if (verifyResponse.success) {
              alert('Payment successful! Order placed.');
              router.push('/orders');
            } else {
              alert(verifyResponse.error || 'Payment verification failed. Please contact support.');
            }
          },
          prefill: {
            name: '', // Optional
            email: '', // Optional
            contact: '' // Optional
          },
          theme: {
            color: "#3399cc"
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      }

    } catch (error) {
      console.error('Error placing order:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setOrderProcessing(false);
    }
  };



  // Simulate payment processing
  const processPayment = async (orderId, amount) => {
    // This would integrate with actual payment gateway like Razorpay, Stripe, etc.
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          paymentId: `pay_${Date.now()}`,
          signature: `sig_${Date.now()}`
        });
      }, 2000);
    });
  };

  // Calculate discounted price
  const getDiscountedPrice = (price, discount) => {
    if (discount === 'PERCENT_20') {
      return price * 0.8;
    }
    return price;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Product not found</div>
      </div>
    );
  }


   const handleMouseMove = (e) => {
    if (!isZoomed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
  };

  const discountedPrice = getDiscountedPrice(product.price, product.isDiscounted);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
    <div className="max-w-8xl mx-auto px-4">
  <div className="bg-white rounded-lg shadow-lg overflow-hidden">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
      {/* Product Images */}
    <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100">
  <div className="flex flex-col md:flex-row gap-4">
    {/* Main Image with Zoom */}
    <div className="flex-1 order-1 md:order-2">
      <div
        className="relative w-full h-96 rounded-xl overflow-hidden cursor-zoom-in bg-white shadow-lg"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={(e) => {
          if (!isZoomed) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;
          setMousePosition({ x, y });
        }}
      >
        <Image
          src={product.images[selectedImage]?.url || '/placeholder-image.jpg'}
          alt={product.name}
          width={500}
          height={500}
          className={`w-full h-96 object-cover transition-transform duration-300 ${
            isZoomed ? 'scale-150' : 'scale-100'
          }`}
          style={{
            transformOrigin: isZoomed
              ? `${mousePosition.x}% ${mousePosition.y}%`
              : 'center',
          }}
        />
      </div>
    </div>

    {/* Thumbnail Column */}
    <div className="flex flex-row md:flex-col space-x-3 md:space-x-0 md:space-y-3 order-2 md:order-1 overflow-x-auto md:overflow-x-visible">
      {product.images.map((image, index) => (
        <Image
          key={image.id}
          src={image.url}
          alt={`${product.name} ${index + 1}`}
          width={80}
          height={80}
          className={`w-20 h-20 object-cover rounded-lg cursor-pointer border-2 transition-all duration-200 ${
            selectedImage === index
              ? 'border-blue-500 ring-2 ring-blue-200 scale-105'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onClick={() => setSelectedImage(index)}
        />
      ))}
    </div>
  </div>
</div>

      {/* Product Details */}
     <div className="p-8 bg-white rounded-2xl shadow-lg">
  {/* Product Name */}
  <h1 className="text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>
  <p className="text-gray-600 mb-6">{product.description}</p>

  {/* Price */}
  <div className="mb-6">
    <div className="flex items-center space-x-4">
      <span className="text-3xl font-bold text-green-600">
        ₹{product.Discounted.toLocaleString()}
      </span>
      {product.isDiscounted && (
        <span className="text-lg text-gray-400 line-through">
          ₹{product.price.toLocaleString()}
        </span>
      )}
      {product.isDiscounted !== "NONE" && (
        <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
          {product.isDiscounted === "PERCENT_20" && "20% OFF"}
          {product.isDiscounted === "PERCENT_30" && "30% OFF"}
          {product.isDiscounted === "PERCENT_40" && "40% OFF"}
          {product.isDiscounted === "PERCENT_50" && "50% OFF"}
        </span>
      )}
    </div>
  </div>

  {/* Dimensions */}
  <div className="mb-6">
    <h3 className="text-lg font-semibold mb-2 text-gray-800">Dimensions</h3>
    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
      <div className="bg-gray-50 p-3 rounded-lg">Length: {product.length} ft</div>
      <div className="bg-gray-50 p-3 rounded-lg">Width: {product.width} ft</div>
      <div className="bg-gray-50 p-3 rounded-lg">Height: {product.height} ft</div>
      <div className="bg-gray-50 p-3 rounded-lg">Total Area: {product.total} sq ft</div>
    </div>
  </div>

  {/* Stock */}
  <div className="mb-6">
    <span
      className={`px-4 py-2 rounded-full text-sm font-semibold ${
        product.stock > 0
          ? "bg-green-100 text-green-700"
          : "bg-red-100 text-red-700"
      }`}
    >
      {product.stock > 0
        ? `In Stock (${product.stock} available)`
        : "Out of Stock"}
    </span>
  </div>

  {/* Quantity */}
  <div className="mb-6">
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Quantity
    </label>
    <div className="flex items-center space-x-2">
      <button
        onClick={() => setQuantity(Math.max(1, quantity - 1))}
        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded"
      >
        -
      </button>
      <span className="px-6 py-2 border border-gray-300 rounded text-gray-800 font-semibold">
        {quantity}
      </span>
      <button
        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded"
      >
        +
      </button>
    </div>
  </div>

  {/* Total Price */}
  <div className="mb-6">
    <div className="text-xl font-semibold text-gray-900">
      Total: ₹{(product.Discounted * quantity).toLocaleString()}
    </div>
  </div>

  {/* Buy Button */}
  <button
    onClick={handleBuyNow}
    disabled={product.stock === 0}
    className="w-full bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:text-gray-100 font-semibold py-3 px-6 rounded-lg transition duration-200 shadow-md"
  >
    {product.stock === 0 ? "Out of Stock" : "Buy Now"}
  </button>
</div>

    </div>
  </div>
</div>

      {/* Address Selection Modal */}
  {showAddressModal && (
  <div className="fixed inset-0 bg-gradient-to-br from-blue-900 to-purple-900 bg-opacity-95 flex items-start sm:items-center justify-center z-50 p-2 sm:p-4">
    <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full h-full sm:h-auto max-w-full sm:max-w-6xl max-h-full sm:max-h-[95vh] overflow-hidden flex flex-col">
      
      {/* Header - Fixed */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 sm:p-6 md:p-8 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold leading-tight">
              Select Address & Payment
            </h2>
            <p className="text-xs sm:text-sm text-blue-100 mt-1 hidden sm:block">
              Choose delivery address and payment method
            </p>
          </div>
          <button 
            onClick={() => setShowAddressModal(false)}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 sm:p-3 transition-all duration-200 flex-shrink-0"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="flex flex-col lg:flex-row flex-1 min-h-0 overflow-y-auto">
        
        {/* Left Side - Addresses */}
      <div className="overflow-y-auto flex-shrink-0 bg-white border-t lg:border-t-0 lg:border-l border-gray-200 mt-10">
          <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold mb-4 sm:mb-6 text-gray-800 sticky top-0 bg-gray-50 pb-2">
            Choose Your Address
          </h3>

          <div className="space-y-3 sm:space-y-4 pb-4">
            {addresses.map((address) => (
              <div
                key={address.id}
                className={`bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 cursor-pointer transition-all duration-300 shadow-md ${
                  selectedAddress === address.id 
                    ? 'border-2 border-blue-500 bg-blue-50 shadow-lg transform scale-[1.02]' 
                    : 'border border-gray-200 hover:shadow-lg active:scale-[0.98]'
                }`}
                onClick={() => setSelectedAddress(address.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm sm:text-base lg:text-lg text-gray-800 mb-1 sm:mb-2 truncate">
                      {address.name}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 mb-1 line-clamp-2">
                      {address.address}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 mb-1">
                      {address.city}, {address.state} - {address.pincode}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 font-medium">
                      {address.phone}
                    </div>
                  </div>
                  {selectedAddress === address.id && (
                    <div className="bg-blue-500 text-white rounded-full p-1 sm:p-2 ml-2 flex-shrink-0">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setShowAddAddressModal(true)}
            className="w-full mt-4 sm:mt-6 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 active:scale-95 text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-xl sm:rounded-2xl transition-all duration-200 shadow-lg text-sm sm:text-base"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Address
          </button>
        </div>

          {/* Payment & Order Summary Section */}
          <div className="overflow-y-auto flex-shrink-0 bg-white border-t lg:border-t-0 lg:border-l border-gray-200 mt-10">
            <div className="p-4 sm:p-6 lg:p-8 lg:w-80">
              
              {/* Payment Method */}
              <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-4 text-gray-800">
                Payment Method
              </h3>

              <div className="space-y-3 mb-6">
                <label className={`flex items-center p-3 sm:p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                  paymentMethod === 'cod' ? 'bg-blue-50 border-2 border-blue-500' : 'bg-gray-50 border-2 border-gray-200 active:bg-gray-100'
                }`}>
                  <input
                    type="radio"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 mr-3 flex-shrink-0 ${
                    paymentMethod === 'cod' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                  }`}>
                    {paymentMethod === 'cod' && (
                      <div className="w-full h-full rounded-full bg-white transform scale-50"></div>
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-sm sm:text-base text-gray-800">Cash on Delivery</div>
                    <div className="text-xs sm:text-sm text-gray-600">Pay when you receive</div>
                  </div>
                </label>

                <label className={`flex items-center p-3 sm:p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                  paymentMethod === 'online' ? 'bg-blue-50 border-2 border-blue-500' : 'bg-gray-50 border-2 border-gray-200 active:bg-gray-100'
                }`}>
                  <input
                    type="radio"
                    value="online"
                    checked={paymentMethod === 'online'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 mr-3 flex-shrink-0 ${
                    paymentMethod === 'online' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                  }`}>
                    {paymentMethod === 'online' && (
                      <div className="w-full h-full rounded-full bg-white transform scale-50"></div>
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-sm sm:text-base text-gray-800">Online Payment</div>
                    <div className="text-xs sm:text-sm text-gray-600">UPI, Cards, Wallet</div>
                  </div>
                </label>
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <h4 className="font-semibold text-sm sm:text-base mb-3 text-gray-800">Order Summary</h4>
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-semibold">₹{(product?.Discounted * quantity).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery:</span>
                    <span className="font-semibold text-green-600">Free</span>
                  </div>
                  <hr className="my-2" />
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="font-bold">Total:</span>
                    <span className="font-bold text-blue-600">₹{(product?.Discounted * quantity).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handlePlaceOrder}
                  disabled={!selectedAddress || orderProcessing}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-3 sm:py-4 px-4 rounded-xl transition-all duration-200 shadow-lg disabled:shadow-none text-sm sm:text-base active:scale-95 disabled:active:scale-100"
                >
                  {orderProcessing ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </div>
                  ) : (
                    'Place Order'
                  )}
                </button>

                <button
                  onClick={() => setShowAddressModal(false)}
                  className="w-full bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-800 font-semibold py-3 sm:py-4 px-4 rounded-xl transition-all duration-200 text-sm sm:text-base active:scale-95"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

)}


      {/* Add Address Modal */}
 {showAddAddressModal && (
  <div className="fixed inset-0 bg-gradient-to-br from-purple-900 to-blue-900 bg-opacity-95 flex items-center justify-center z-50 p-4">
    {/* Wrapper for scrollable modal */}
    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100">
      
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-3xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl md:text-2xl font-bold">Add New Address</h2>
            <p className="text-indigo-100 text-sm md:text-base mt-1">Fill in your delivery details</p>
          </div>
          <button 
            onClick={() => setShowAddAddressModal(false)}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Form Content */}
      <div className="p-6 md:p-8 space-y-6">
        
        {/* Full Name */}
        <div className="relative">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
          <input
            type="text"
            placeholder="Enter your full name"
            value={newAddress.name}
            onChange={(e) => setNewAddress({...newAddress, name: e.target.value})}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 pl-12 focus:border-indigo-500 focus:ring-0 transition-all duration-200 bg-gray-50 focus:bg-white text-sm md:text-base"
          />
          <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>

        {/* Phone Number */}
        <div className="relative">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
          <input
            type="tel"
            placeholder="Enter your phone number"
            value={newAddress.phone}
            onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 pl-12 focus:border-indigo-500 focus:ring-0 transition-all duration-200 bg-gray-50 focus:bg-white text-sm md:text-base"
          />
          <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        </div>

        {/* Address */}
        <div className="relative">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Complete Address</label>
          <textarea
            placeholder="House no, Building, Street, Area"
            value={newAddress.address}
            onChange={(e) => setNewAddress({...newAddress, address: e.target.value})}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 pl-12 focus:border-indigo-500 focus:ring-0 transition-all duration-200 bg-gray-50 focus:bg-white h-24 resize-none text-sm md:text-base"
          />
          <svg className="w-5 h-5 text-gray-400 absolute left-4 top-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>

        {/* City + State */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
            <input
              type="text"
              placeholder="City"
              value={newAddress.city}
              onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-indigo-500 focus:ring-0 transition-all duration-200 bg-gray-50 focus:bg-white text-sm md:text-base"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">State</label>
            <input
              type="text"
              placeholder="State"
              value={newAddress.state}
              onChange={(e) => setNewAddress({...newAddress, state: e.target.value})}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-indigo-500 focus:ring-0 transition-all duration-200 bg-gray-50 focus:bg-white text-sm md:text-base"
            />
          </div>
        </div>

        {/* Pincode */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Pincode</label>
          <input
            type="text"
            placeholder="6-digit pincode"
            value={newAddress.pincode}
            onChange={(e) => setNewAddress({...newAddress, pincode: e.target.value})}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-indigo-500 focus:ring-0 transition-all duration-200 bg-gray-50 focus:bg-white text-sm md:text-base"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row gap-4 mt-6">
          <button
            onClick={() => setShowAddAddressModal(false)}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-all duration-200 border-2 border-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleAddAddress}
            className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Address
          </button>
        </div>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default ProductDetailsPage;