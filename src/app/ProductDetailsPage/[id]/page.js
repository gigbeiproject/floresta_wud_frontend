'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { fetchWithAuth } from '../../lib/fetchWithAuth';
const ProductDetailsPage = ({ params }) => {
  // Unwrap params if it's a Promise (Next may provide params as a Promise in some versions).
  const [resolvedParams, setResolvedParams] = useState(null);


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

  const discountedPrice = getDiscountedPrice(product.price, product.isDiscounted);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Product Images */}
            <div>
              <div className="mb-4">
                <Image
                  src={product.images[selectedImage]?.url || '/placeholder-image.jpg'}
                  alt={product.name}
                  width={500}
                  height={500}
                  className="w-full h-96 object-cover rounded-lg"
                />
              </div>
              <div className="flex space-x-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <Image
                    key={image.id}
                    src={image.url}
                    alt={`${product.name} ${index + 1}`}
                    width={80}
                    height={80}
                    className={`w-20 h-20 object-cover rounded cursor-pointer border-2 ${
                      selectedImage === index ? 'border-blue-500' : 'border-gray-200'
                    }`}
                    onClick={() => setSelectedImage(index)}
                  />
                ))}
              </div>
            </div>

            {/* Product Details */}
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-4">{product.name}</h1>
              <p className="text-gray-600 mb-6">{product.description}</p>
              
              {/* Price */}
              <div className="mb-6">
                <div className="flex items-center space-x-4">
                  <span className="text-3xl font-bold text-green-600">
                    ₹{discountedPrice.toLocaleString()}
                  </span>
                  {product.isDiscounted && (
                    <span className="text-xl text-gray-500 line-through">
                      ₹{product.price.toLocaleString()}
                    </span>
                  )}
                  {product.isDiscounted && (
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">
                      20% OFF
                    </span>
                  )}
                </div>
              </div>

              {/* Dimensions */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Dimensions</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>Length: {product.length} ft</div>
                  <div>Width: {product.width} ft</div>
                  <div>Height: {product.height} ft</div>
                  <div>Total Area: {product.total} sq ft</div>
                </div>
              </div>

              {/* Stock */}
              <div className="mb-6">
                <span className={`px-3 py-1 rounded-full text-sm ${
                  product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
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
                    className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded"
                  >
                    -
                  </button>
                  <span className="px-4 py-1 border rounded">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Total Price */}
              <div className="mb-6">
                <div className="text-xl font-semibold">
                  Total: ₹{(discountedPrice * quantity).toLocaleString()}
                </div>
              </div>

              {/* Buy Button */}
              <button
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
              >
                {product.stock === 0 ? 'Out of Stock' : 'Buy Now'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Address Selection Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-96 overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Select Delivery Address</h2>
            
            {addresses.map((address) => (
              <div
                key={address.id}
                className={`border rounded-lg p-3 mb-3 cursor-pointer ${
                  selectedAddress === address.id ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                }`}
                onClick={() => setSelectedAddress(address.id)}
              >
                <div className="font-medium">{address.name}</div>
                <div className="text-sm text-gray-600">{address.address}</div>
                <div className="text-sm text-gray-600">{address.city}, {address.state} - {address.pincode}</div>
                <div className="text-sm text-gray-600">{address.phone}</div>
              </div>
            ))}

            <button
              onClick={() => setShowAddAddressModal(true)}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded mb-4"
            >
              Add New Address
            </button>

            {/* Payment Method */}
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Payment Method</h3>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-2"
                  />
                  Cash on Delivery
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="online"
                    checked={paymentMethod === 'online'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-2"
                  />
                  Online Payment
                </label>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowAddressModal(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handlePlaceOrder}
                disabled={!selectedAddress || orderProcessing}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-4 rounded"
              >
                {orderProcessing ? 'Processing...' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Address Modal */}
      {showAddAddressModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Address</h2>
            
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                value={newAddress.name}
                onChange={(e) => setNewAddress({...newAddress, name: e.target.value})}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={newAddress.phone}
                onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
              <textarea
                placeholder="Address"
                value={newAddress.address}
                onChange={(e) => setNewAddress({...newAddress, address: e.target.value})}
                className="w-full border border-gray-300 rounded px-3 py-2 h-20"
              />
              <input
                type="text"
                placeholder="City"
                value={newAddress.city}
                onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
              <input
                type="text"
                placeholder="State"
                value={newAddress.state}
                onChange={(e) => setNewAddress({...newAddress, state: e.target.value})}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
              <input
                type="text"
                placeholder="Pincode"
                value={newAddress.pincode}
                onChange={(e) => setNewAddress({...newAddress, pincode: e.target.value})}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowAddAddressModal(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleAddAddress}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
              >
                Add Address
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailsPage;