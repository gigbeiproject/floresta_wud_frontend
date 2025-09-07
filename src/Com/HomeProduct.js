"use client";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addItemToCart } from "../app/store/cartSlice"; // Adjust path as needed
import { useRouter } from "next/navigation";
import { Heart, ShoppingCart, Eye, ArrowRight } from "lucide-react";

function HomeProduct() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const dispatch = useDispatch();

  // Get full cart from Redux
  const cart = useSelector(
    (state) => state.cart || { items: [], totalQuantity: 0, totalAmount: 0 }
  );
  const cartItems = cart.items;

  // Sync cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Fetch products from API (limit to 8 for homepage)
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/productsUserside");
        const data = await res.json();
        if (data.products) {
          // Limit to 8 products for homepage
          setProducts(data.products.slice(0, 8));
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Handle add to cart
  const handleAddToCart = (e, product) => {
    e.stopPropagation(); // Prevent navigation when clicking add to cart
    dispatch(
      addItemToCart({
        id: product.id,
        name: product.name,
        price: Number(product.Discounted),
        image: product.image|| "/api/placeholder/300/250",
      })
    );
  };

  // Check if product is already in cart
  const isInCart = (productId) => {
    return Array.isArray(cartItems) && cartItems.some((item) => item.id === productId);
  };

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#3E5E84] mx-auto mb-4"></div>
            <p className="text-gray-500 text-lg">Loading amazing products...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 to-cyan-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-[#3E5E84] to-[#9CC4DC] bg-clip-text text-transparent">
            Best-Sellers of The Season
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Discover our most loved furniture pieces that are transforming homes across the country
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-[#3E5E84] to-[#9CC4DC] mx-auto rounded-full"></div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product, index) => {
            const discountText =
              product.isDiscounted === "PERCENT_20"
                ? "20% OFF"
                : product.isDiscounted === "PERCENT_30"
                ? "30% OFF"
                : "";
            const imageUrl = product.images?.[0]?.url || "/api/placeholder/300/250";
            const productInCart = isInCart(product.id);

            return (
              <div
                key={product.id}
                className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 cursor-pointer border border-gray-100 hover:border-[#9CC4DC]/50"
                style={{ animationDelay: `${index * 100}ms` }}
                 onClick={() => router.push(`/ProductDetailsPage/${product.id}`)}
              >
                <div className="relative overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-64 w-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  
                  {/* Discount Badge */}
                  {discountText && (
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-pink-600 text-white px-3 py-1 text-sm font-bold rounded-full shadow-lg">
                      {discountText}
                    </div>
                  )}

                  {/* Action Buttons Overlay */}
                  <div className="absolute inset-0   group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                    <div className="flex space-x-3 transform translate-y-10 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <button className="p-3 bg-white rounded-full text-gray-700 hover:text-red-500 transition-colors shadow-lg hover:shadow-xl transform hover:scale-110">
                        <Heart className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => router.push(`/ProductDetailsPage/${product.id}`)}
                        className="p-3 bg-white rounded-full text-gray-700 hover:text-[#3E5E84] transition-colors shadow-lg hover:shadow-xl transform hover:scale-110"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                <div 
                  className="p-6"
                  onClick={() => router.push(`/ProductDetailsPage/${product.id}`)}
                >
                  <h3 className="font-bold text-lg mb-2 text-gray-900 group-hover:text-[#3E5E84] transition-colors line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-2xl font-bold bg-gradient-to-r from-[#3E5E84] to-[#9CC4DC] bg-clip-text text-transparent">
                        ₹{Number(product.Discounted).toLocaleString()}
                      </span>
                    
                        <span className="text-sm text-gray-400 line-through">
                          ₹{product.price}
                        </span>
                    
                    </div>
                    
                    <button
                      onClick={(e) => handleAddToCart(e, product)}
                      disabled={productInCart}
                      className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 ${
                        productInCart
                          ? "bg-green-500 text-white cursor-not-allowed"
                          : "bg-gradient-to-r from-[#3E5E84] to-[#9CC4DC] text-white hover:from-[#2E4A6B] hover:to-[#7FB2D3] hover:shadow-lg transform hover:scale-105"
                      }`}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span className="text-sm">
                        {productInCart ? "In Cart" : "Add to Cart"}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* View All Button */}
        <div className="text-center mt-16">
          <button
            onClick={() => router.push('/viewall')}
            className="group bg-gradient-to-r from-[#3E5E84] to-[#9CC4DC] text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-[#2E4A6B] hover:to-[#7FB2D3] transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 flex items-center space-x-3 mx-auto"
          >
            <span>View All Products</span>
            <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
          </button>
          <p className="text-gray-500 mt-4">
            Discover over 1000+ premium furniture pieces
          </p>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-[#9CC4DC]/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-[#3E5E84]/10 rounded-full blur-xl"></div>
      </div>

      <style jsx>{`
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </section>
  );
}

export default HomeProduct;