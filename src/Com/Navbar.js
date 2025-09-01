"use client";
import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import {
  Search,
  Menu,
  X,
  Heart,
  ShoppingCart,
  User,
  Phone,
  Mail,
  Truck,
  CreditCard,
  ChevronDown,
  MapPin,
  Package,
  Star,
  Gift,
  Home,
  Bed,
  ChefHat,
  BookOpen,
  Briefcase,
  Sparkles,
  Tag,
  Sofa,
  Lamp,
  Shield,
  Bell,
  Grid3X3,
  Zap,
  Clock,
  LogOut 
} from "lucide-react";
import {fetchWithAuth} from '../app/lib/fetchWithAuth'

import { useRouter } from 'next/navigation';

function Navbar() {
  const router = useRouter();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [wishlistCount, setWishlistCount] = useState(5);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("Delhi");
  const [showCategoriesDropdown, setShowCategoriesDropdown] = useState(false);
  const searchRef = useRef(null);
  const [searchResults, setSearchResults] = useState([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const fetchSearchResults = async (query) => {
    if (!query) {
      setSearchResults([]);
      return;
    }
     nk 

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setSearchResults(data.products || []);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    }
  };

  const cart = useSelector((state) => state.cart);

  const cartCount = cart?.totalQuantity || 0;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen && !event.target.closest(".mobile-menu-container")) {
        setIsMenuOpen(false);
      }
      if (showCategoriesDropdown && !event.target.closest(".categories-container")) {
        setShowCategoriesDropdown(false);
      }
      if (showLocationDropdown && !event.target.closest(".location-container")) {
        setShowLocationDropdown(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isMenuOpen, showCategoriesDropdown, showLocationDropdown]);

  const locations = ["Delhi", "Mumbai", "Bengaluru", "Chennai", "Hyderabad", "Pune"];

  const quickCategories = [
    { name: "Living Room", icon: Sofa, count: "500+", color: "bg-blue-500" },
    { name: "Bedroom", icon: Bed, count: "800+", color: "bg-purple-500" },
    { name: "Dining", icon: ChefHat, count: "300+", color: "bg-green-500" },
    { name: "Study", icon: BookOpen, count: "200+", color: "bg-indigo-500" },
    { name: "Office", icon: Briefcase, count: "150+", color: "bg-gray-500" },
    { name: "Decor", icon: Lamp, count: "1000+", color: "bg-pink-500" },
    { name: "New Arrivals", icon: Sparkles, count: "50+", color: "bg-yellow-500", isNew: true },
    { name: "Sale", icon: Tag, count: "200+", color: "bg-red-500", isSale: true }
  ];


    const handleLogout = async () => {
    try {
      await fetchWithAuth("/api/logout", { method: "POST" });
      router.push("/login"); // redirect to login
    } catch (err) {
      console.error("Logout failed:", err.message);
    }
  };

  return (
    <>
      {/* Modern Header with Glass Effect */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled 
            ? "bg-white/90 backdrop-blur-xl shadow-2xl border-b border-gray-200/50" 
            : "bg-gradient-to-r from-amber-50 to-orange-50"
        }`}
      >
        {/* Top Announcement Bar */}
        <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white py-2 px-4">
          <div className="container mx-auto flex items-center justify-center text-sm font-medium">
            <Zap size={16} className="mr-2 animate-pulse" />
            <span className="hidden sm:inline">🔥 Summer Sale: Up to 70% OFF on All Furniture | </span>
            <span className="font-bold ml-1">Free Delivery Above ₹p000</span>
            <Bell size={16} className="ml-2 animate-bounce" />
          </div>
        </div>

        <div className="container mx-auto px-4">
          {/* Main Navigation */}
          <div className="flex items-center justify-between py-4">
            {/* Logo with Modern Design */}
            <div className="flex items-center space-x-8">
              <div 
                onClick={() => router.push('/')}
                className="flex items-center space-x-3 cursor-pointer group"
              >
                <div className="relative">
                 
                   <img className="w-10 h-01" src="	https://www.florestawud.com/_next/image?url=%2Flogo.png&w=128&q=75"></img>
                 
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-800 to-orange-700 bg-clip-text text-transparent">
                  florestawud
                  </h1>
                  <p className="text-xs text-gray-500 -mt-1">Premium Furniture</p>
                </div>
              </div>

           
            </div>

            {/* Modern Search Bar */}
            <div className="flex-1 max-w-2xl mx-4 lg:mx-8 relative">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-orange-400/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                <div className="relative">
                  <Search 
                    size={20} 
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-amber-600 transition-colors" 
                  />
                  <input
                    ref={searchRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      fetchSearchResults(e.target.value);
                    }}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                    placeholder="Search for furniture, decor & more..."
                    className="w-full pl-12 pr-6 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-200/50 transition-all duration-300 text-gray-700 placeholder-gray-400 shadow-sm hover:shadow-md group-hover:border-amber-300"
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <kbd className="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-200 rounded-md">⌘K</kbd>
                  </div>
                </div>
              </div>

              {/* Enhanced Search Results */}
              {isSearchFocused && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white rounded-2xl mt-2 shadow-2xl border border-gray-200 z-50 overflow-hidden">
                  <div className="p-4 bg-gray-50 border-b border-gray-200">
                    <p className="text-sm text-gray-600 font-medium">Search Results</p>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {searchResults.map((product, index) => (
                      <div
                        key={product.id || index}
                        className="px-6 py-4 hover:bg-amber-50 cursor-pointer transition-all duration-200 flex items-center space-x-4 border-b border-gray-100 last:border-b-0"
                        onClick={() => router.push(`/ProductDetailsPage/${product.id}`)}
                      >
                        <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Search size={16} className="text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-800 font-medium">{product.name}</p>
                          <p className="text-sm text-gray-500">in Furniture</p>
                        </div>
                        <div className="text-amber-600 font-semibold">₹{product.price || "999"}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modern Action Buttons */}
            <div className="flex items-center space-x-3">
              {/* Location Selector */}
              <div className="hidden lg:block location-container relative">
              

                {showLocationDropdown && (
                  <div className="absolute top-full right-0 mt-2 w-40 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50">
                    {locations.map((location) => (
                      <button
                        key={location}
                        onClick={() => {
                          setSelectedLocation(location);
                          setShowLocationDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-3 hover:bg-amber-50 transition-all duration-200 flex items-center justify-between text-sm ${
                          selectedLocation === location ? "text-amber-600 bg-amber-50 font-medium" : "text-gray-700"
                        }`}
                      >
                        {location}
                        {selectedLocation === location && (
                          <div className="w-2 h-2 bg-amber-600 rounded-full"></div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Account Button */}
              <button className="hidden md:flex items-center space-x-2 px-4 py-2 rounded-xl hover:bg-gray-100 text-gray-700 hover:text-amber-600 transition-all duration-300 group">
                <div className="relative">
                  <User size={20} />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                </div>
                <span className="font-medium">Account</span>
              </button>

              {/* Orders Button */}
              <button
                onClick={() => router.push('/orderr')}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl hover:bg-gray-100 text-gray-700 hover:text-amber-600 transition-all duration-300 relative group"
              >
                <Package size={20} />
                <span className="hidden lg:inline font-medium">Orders</span>
              </button>

              {/* Cart Button with Modern Design */}
              <button 
                onClick={() => router.push('/newcart')} 
                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl relative group"
              >
                <div className="relative">
                  <ShoppingCart size={20} />
                  {mounted && cartCount > 0 && (
                    <div className="absolute -top-2 -right-2 min-w-[20px] h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse">
                      {cartCount}
                    </div>
                  )}
                </div>
                <span className="hidden lg:inline font-medium">Cart</span>
                <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
              </button>

              {/* Mobile Menu Toggle */}
              <button
                className="lg:hidden p-3 rounded-xl hover:bg-gray-100 transition-all duration-300 mobile-menu-container relative group"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <div className="relative w-6 h-6">
                  <span className={`absolute h-0.5 w-6 bg-gray-700 transition-all duration-300 ${isMenuOpen ? 'rotate-45 top-3' : 'top-1'}`}></span>
                  <span className={`absolute h-0.5 w-6 bg-gray-700 transition-all duration-300 ${isMenuOpen ? 'opacity-0' : 'top-3'}`}></span>
                  <span className={`absolute h-0.5 w-6 bg-gray-700 transition-all duration-300 ${isMenuOpen ? '-rotate-45 top-3' : 'top-5'}`}></span>
                </div>
              </button>
                   <button
                onClick={handleLogout}
                className="hidden md:flex items-center space-x-2 px-4 py-2 rounded-xl hover:bg-red-50 text-gray-700 hover:text-red-600 transition-all duration-300 group"
              >
                <LogOut size={20} />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modern Categories Dropdown */}
        {showCategoriesDropdown && (
          <div className="absolute top-full left-0 right-0 bg-white/95 backdrop-blur-xl shadow-2xl border-t border-gray-200/50 z-40 categories-container">
            <div className="container mx-auto px-4 py-8">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                {quickCategories.map((category, index) => {
                  const IconComponent = category.icon;
                  return (
                    <button
                      key={index}
                      onClick={() => {
                        router.push(`/category/${category.name.toLowerCase().replace(' ', '-')}`);
                        setShowCategoriesDropdown(false);
                      }}
                      className="group p-4 rounded-2xl border border-gray-200 hover:border-amber-300 bg-white hover:bg-amber-50 transition-all duration-300 hover:scale-105 hover:shadow-lg relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-amber-400/10 to-orange-400/10 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                      <div className="relative z-10">
                        <div className={`w-12 h-12 ${category.color} rounded-xl flex items-center justify-center text-white mb-3 mx-auto group-hover:scale-110 transition-transform duration-300`}>
                          <IconComponent size={20} />
                        </div>
                        <h3 className="font-semibold text-gray-800 text-sm mb-1">{category.name}</h3>
                        <p className="text-xs text-gray-500">{category.count} items</p>
                        {category.isNew && (
                          <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                            NEW
                          </div>
                        )}
                        {category.isSale && (
                          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold animate-pulse">
                            SALE
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Featured Collections */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Featured Collections</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { name: "Modern Living", image: "🛋️", discount: "40% OFF" },
                    { name: "Luxury Bedroom", image: "🛏️", discount: "35% OFF" },
                    { name: "Workspace Essentials", image: "💼", discount: "50% OFF" },
                    { name: "Home Decor", image: "🏺", discount: "30% OFF" }
                  ].map((collection, index) => (
                    <div key={index} className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 hover:from-amber-50 hover:to-orange-50 cursor-pointer transition-all duration-300 group">
                      <div className="text-3xl mb-2">{collection.image}</div>
                      <h4 className="font-semibold text-gray-800 text-sm">{collection.name}</h4>
                      <p className="text-xs text-amber-600 font-bold">{collection.discount}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-white shadow-2xl border-t border-gray-200 z-40 mobile-menu-container">
            <div className="p-6 space-y-6">
              {/* Mobile Search */}
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                />
              </div>

              {/* Mobile Categories */}
              <div className="space-y-4">
                <h3 className="font-bold text-gray-800">Categories</h3>
                <div className="grid grid-cols-2 gap-3">
                  {quickCategories.slice(0, 6).map((category, index) => {
                    const IconComponent = category.icon;
                    return (
                      <button
                        key={index}
                        className="flex items-center space-x-3 p-3 rounded-xl border border-gray-200 hover:border-amber-300 hover:bg-amber-50 transition-all duration-300"
                      >
                        <div className={`w-8 h-8 ${category.color} rounded-lg flex items-center justify-center text-white`}>
                          <IconComponent size={16} />
                        </div>
                        <span className="text-sm font-medium">{category.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mobile Actions */}
              <div className="space-y-3 pt-4 border-t border-gray-200">
                <button className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-100 transition-all">
                  <User size={20} className="text-gray-600" />
                  <span className="font-medium">My Account</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-100 transition-all">
                  <Package size={20} className="text-gray-600" />
                  <span className="font-medium">My Orders</span>
                </button>
                <button className="w-full flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-200">
                  <div className="flex items-center space-x-3">
                    <ShoppingCart size={20} className="text-amber-600" />
                    <span className="font-medium text-amber-800">Cart</span>
                  </div>
                  {mounted && cartCount > 0 && (
                    <span className="bg-amber-600 text-white text-sm px-3 py-1 rounded-full font-bold">
                      {cartCount}
                    </span>
                  )}
                </button>
              </div>

              {/* Quick Links */}
              <div className="pt-4 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <button className="flex items-center space-x-2 text-gray-600 hover:text-amber-600">
                    <Truck size={16} />
                    <span>Track Order</span>
                  </button>
                  <button className="flex items-center space-x-2 text-gray-600 hover:text-amber-600">
                    <Phone size={16} />
                    <span>Support</span>
                  </button>
                  <button className="flex items-center space-x-2 text-gray-600 hover:text-amber-600">
                    <CreditCard size={16} />
                    <span>EMI Options</span>
                  </button>
                  <button className="flex items-center space-x-2 text-gray-600 hover:text-amber-600">
                    <Shield size={16} />
                    <span>Warranty</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Spacer for fixed header */}
      <div className="h-32"></div>
    </>
  );
}

export default Navbar;