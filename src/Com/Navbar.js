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
  LogOut,
  ArrowLeft
} from "lucide-react";
import {fetchWithAuth} from '../app/lib/fetchWithAuth'

import { useRouter } from 'next/navigation';

function Navbar() {
  const router = useRouter();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [wishlistCount, setWishlistCount] = useState(5);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("Delhi");
  const [showCategoriesDropdown, setShowCategoriesDropdown] = useState(false);
  const searchRef = useRef(null);
  const mobileSearchRef = useRef(null);
  const [searchResults, setSearchResults] = useState([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const fetchSearchResults = async (query) => {
    if (!query) {
      setSearchResults([]);
      return;
    }

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

  // Auto-focus mobile search when opened
  useEffect(() => {
    if (isMobileSearchOpen && mobileSearchRef.current) {
      mobileSearchRef.current.focus();
    }
  }, [isMobileSearchOpen]);

  const locations = ["Delhi", "Mumbai", "Bengaluru", "Chennai", "Hyderabad", "Pune"];

  const quickCategories = [
    { name: "Living Room", icon: Sofa, count: "500+", color: "bg-blue-500" },
    { name: "Bedroom", icon: Bed, count: "800+", color: "bg-indigo-500" },
    { name: "Dining", icon: ChefHat, count: "300+", color: "bg-cyan-500" },
    { name: "Study", icon: BookOpen, count: "200+", color: "bg-slate-500" },
    { name: "Office", icon: Briefcase, count: "150+", color: "bg-gray-500" },
    { name: "Decor", icon: Lamp, count: "1000+", color: "bg-sky-500" },
    { name: "New Arrivals", icon: Sparkles, count: "50+", color: "bg-emerald-500", isNew: true },
    { name: "Sale", icon: Tag, count: "200+", color: "bg-red-500", isSale: true }
  ];

  const handleLogout = async () => {
    try {
      await fetchWithAuth("/api/logout", { method: "POST" });
      router.push("/LoginRegisterPage");
    } catch (err) {
      console.error("Logout failed:", err.message);
    }
  };

  const closeMobileSearch = () => {
    setIsMobileSearchOpen(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  return (
    <>
      {/* Mobile Search Overlay */}
      {isMobileSearchOpen && (
        <div className="fixed inset-0 bg-white z-[60] lg:hidden">
          <div className="flex items-center p-4 border-b border-gray-200">
            <button
              onClick={closeMobileSearch}
              className="p-2 mr-3 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <div className="flex-1 relative">
              <Search 
                size={18} 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
              />
              <input
                ref={mobileSearchRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  fetchSearchResults(e.target.value);
                }}
                placeholder="Search for furniture, decor & more..."
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#3E5E84] focus:ring-2 focus:ring-[#9CC4DC]/30 transition-all duration-300"
              />
            </div>
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSearchResults([]);
                }}
                className="p-2 ml-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={18} className="text-gray-400" />
              </button>
            )}
          </div>

          {/* Mobile Search Results */}
          <div className="flex-1 overflow-y-auto">
            {searchResults.length > 0 ? (
              <div className="p-4">
                <p className="text-sm text-gray-600 font-medium mb-4">Search Results ({searchResults.length})</p>
                <div className="space-y-3">
                  {searchResults.map((product, index) => (
                    <div
                      key={product.id || index}
                      className="flex items-center space-x-4 p-3 bg-white rounded-xl border border-gray-100 hover:border-[#9CC4DC] cursor-pointer transition-all duration-200"
                      onClick={() => {
                        router.push(`/ProductDetailsPage/${product.id}`);
                        closeMobileSearch();
                      }}
                    >
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Package size={20} className="text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{product.name}</p>
                        <p className="text-sm text-gray-500">in Furniture</p>
                      </div>
                      <div className="text-[#3E5E84] font-bold">₹{product.price || "999"}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : searchQuery ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <Search size={48} className="mb-4 opacity-50" />
                <p className="text-lg font-medium">No results found</p>
                <p className="text-sm">Try searching with different keywords</p>
              </div>
            ) : (
              <div className="p-4">
                <p className="text-sm text-gray-600 font-medium mb-4">Popular Searches</p>
                <div className="space-y-2">
                  {["Sofa Set", "Dining Table", "Bed", "Office Chair", "Wardrobe", "Study Table"].map((term, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSearchQuery(term);
                        fetchSearchResults(term);
                      }}
                      className="flex items-center space-x-3 w-full p-3 text-left rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Search size={16} className="text-gray-400" />
                      <span className="text-gray-700">{term}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modern Header with Glass Effect */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled 
            ? "bg-white/90 backdrop-blur-xl shadow-2xl border-b border-gray-200/50" 
            : "bg-gradient-to-r from-blue-50 to-cyan-50"
        }`}
      >
        {/* Top Announcement Bar */}
        <div className="bg-gradient-to-r from-[#3E5E84] to-[#9CC4DC] text-white py-2 px-4">
          <div className="container mx-auto flex items-center justify-center text-sm font-medium">
            <Zap size={16} className="mr-2 animate-pulse" />
            <span className="hidden sm:inline">🔥 Summer Sale: Up to 70% OFF on All Furniture | </span>
            <span className="font-bold ml-1">Free Delivery Above ₹5000</span>
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
                  <img className="w-14 h-10" src="/floresta wud logo 2.png" alt="Logo" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#9CC4DC] rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-[#3E5E84] to-[#9CC4DC] bg-clip-text text-transparent">
                    florestawud
                  </h1>
                  <p className="text-xs text-gray-500 -mt-1">Premium Furniture</p>
                </div>
              </div>
            </div>

            {/* Desktop Search Bar */}
            <div className="hidden md:block flex-1 max-w-2xl mx-4 lg:mx-8 relative">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-[#3E5E84]/20 to-[#9CC4DC]/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                <div className="relative">
                  <Search 
                    size={20} 
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-[#3E5E84] transition-colors" 
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
                    className="w-full pl-12 pr-6 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-[#3E5E84] focus:ring-4 focus:ring-[#9CC4DC]/30 transition-all duration-300 text-gray-700 placeholder-gray-400 shadow-sm hover:shadow-md group-hover:border-[#9CC4DC]"
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    {/* <kbd className="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-200 rounded-md"></kbd> */}
                  </div>
                </div>
              </div>

              {/* Desktop Search Results */}
              {isSearchFocused && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white rounded-2xl mt-2 shadow-2xl border border-gray-200 z-50 overflow-hidden">
                  <div className="p-4 bg-gray-50 border-b border-gray-200">
                    <p className="text-sm text-gray-600 font-medium">Search Results</p>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {searchResults.map((product, index) => (
                      <div
                        key={product.id || index}
                        className="px-6 py-4 hover:bg-[#9CC4DC]/10 cursor-pointer transition-all duration-200 flex items-center space-x-4 border-b border-gray-100 last:border-b-0"
                        onClick={() => router.push(`/ProductDetailsPage/${product.id}`)}
                      >
                        <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Search size={16} className="text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-800 font-medium">{product.name}</p>
                          <p className="text-sm text-gray-500">in Furniture</p>
                        </div>
                        <div className="text-[#3E5E84] font-semibold">₹{product.price || "999"}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2 md:space-x-3">
              {/* Mobile Search Button */}
              <button
                onClick={() => setIsMobileSearchOpen(true)}
                className="md:hidden p-3 rounded-xl hover:bg-gray-100 text-gray-700 hover:text-[#3E5E84] transition-all duration-300"
              >
                <Search size={20} />
              </button>

              {/* Location Selector - Desktop Only */}
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
                        className={`w-full text-left px-4 py-3 hover:bg-[#9CC4DC]/10 transition-all duration-200 flex items-center justify-between text-sm ${
                          selectedLocation === location ? "text-[#3E5E84] bg-[#9CC4DC]/10 font-medium" : "text-gray-700"
                        }`}
                      >
                        {location}
                        {selectedLocation === location && (
                          <div className="w-2 h-2 bg-[#3E5E84] rounded-full"></div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Account Button - Desktop Only */}
              <button className="hidden lg:flex items-center space-x-2 px-4 py-2 rounded-xl hover:bg-gray-100 text-gray-700 hover:text-[#3E5E84] transition-all duration-300 group">
                <div className="relative">
                  <User size={20} />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#9CC4DC] rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                </div>
                <span className="font-medium">Account</span>
              </button>

              {/* Orders Button */}
              <button
                onClick={() => router.push('/orderr')}
                className="hidden md:flex items-center space-x-2 px-4 py-2 rounded-xl hover:bg-gray-100 text-gray-700 hover:text-[#3E5E84] transition-all duration-300 relative group"
              >
                <Package size={20} />
                <span className="hidden lg:inline font-medium">Orders</span>
              </button>

              {/* Cart Button */}
              <button 
                onClick={() => router.push('/newcart')} 
                className="flex items-center space-x-2 px-3 md:px-4 py-2 rounded-xl bg-gradient-to-r from-[#3E5E84] to-[#9CC4DC] text-white hover:from-[#2E4A6B] hover:to-[#7FB2D3] transition-all duration-300 shadow-lg hover:shadow-xl relative group"
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
              </button>

              {/* Logout - Desktop Only */}
              <button
                onClick={handleLogout}
                className="hidden lg:flex items-center space-x-2 px-4 py-2 rounded-xl hover:bg-red-50 text-gray-700 hover:text-red-600 transition-all duration-300 group"
              >
                <LogOut size={20} />
                <span className="font-medium">Logout</span>
              </button>

              {/* Mobile Menu Toggle */}
              <button
                className="md:hidden p-3 rounded-xl hover:bg-gray-100 transition-all duration-300 mobile-menu-container relative group"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <div className="relative w-6 h-6">
                  <span className={`absolute h-0.5 w-6 bg-gray-700 transition-all duration-300 ${isMenuOpen ? 'rotate-45 top-3' : 'top-1'}`}></span>
                  <span className={`absolute h-0.5 w-6 bg-gray-700 transition-all duration-300 ${isMenuOpen ? 'opacity-0' : 'top-3'}`}></span>
                  <span className={`absolute h-0.5 w-6 bg-gray-700 transition-all duration-300 ${isMenuOpen ? '-rotate-45 top-3' : 'top-5'}`}></span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-2xl border-t border-gray-200 z-40 mobile-menu-container">
            <div className="p-6 space-y-6">
              {/* User Account Section */}
              <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-[#9CC4DC]/10 to-[#3E5E84]/10 rounded-xl">
                <div className="w-12 h-12 bg-[#3E5E84] rounded-full flex items-center justify-center">
                  <User size={20} className="text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Welcome Back!</p>
                  <p className="text-sm text-gray-600">Manage your account</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/orderr')}
                  className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <Package size={20} className="text-gray-600" />
                    <span className="font-medium">My Orders</span>
                  </div>
                  <ChevronDown size={16} className="text-gray-400 -rotate-90" />
                </button>

                <button
                  onClick={() => router.push('/newcart')}
                  className="w-full flex items-center justify-between p-4 rounded-xl bg-[#9CC4DC]/10 border border-[#9CC4DC]/30"
                >
                  <div className="flex items-center space-x-3">
                    <ShoppingCart size={20} className="text-[#3E5E84]" />
                    <span className="font-medium text-[#3E5E84]">Shopping Cart</span>
                  </div>
                  {mounted && cartCount > 0 && (
                    <span className="bg-[#3E5E84] text-white text-sm px-3 py-1 rounded-full font-bold">
                      {cartCount}
                    </span>
                  )}
                </button>

                <button className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-all">
                  <div className="flex items-center space-x-3">
                    <Heart size={20} className="text-gray-600" />
                    <span className="font-medium">Wishlist</span>
                  </div>
                  <span className="bg-red-100 text-red-600 text-sm px-2 py-1 rounded-full font-bold">
                    {wishlistCount}
                  </span>
                </button>
              </div>

              {/* Categories */}
              <div className="space-y-4">
                <h3 className="font-bold text-gray-800 flex items-center">
                  <Grid3X3 size={20} className="mr-2" />
                  Browse Categories
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {quickCategories.map((category, index) => {
                    const IconComponent = category.icon;
                    return (
                      <button
                        key={index}
                        onClick={() => {
                          router.push(`/category/${category.name.toLowerCase().replace(' ', '-')}`);
                          setIsMenuOpen(false);
                        }}
                        className="flex flex-col items-center p-4 rounded-xl border border-gray-200 hover:border-[#9CC4DC] hover:bg-[#9CC4DC]/5 transition-all duration-300 relative"
                      >
                        <div className={`w-10 h-10 ${category.color} rounded-xl flex items-center justify-center text-white mb-2`}>
                          <IconComponent size={18} />
                        </div>
                        <span className="text-xs font-medium text-center">{category.name}</span>
                        <span className="text-xs text-gray-500">{category.count}</span>
                        {category.isNew && (
                          <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs px-1 py-0.5 rounded-full font-bold">
                            NEW
                          </div>
                        )}
                        {category.isSale && (
                          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 py-0.5 rounded-full font-bold">
                            SALE
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Services */}
              <div className="pt-4 border-t border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-3">Quick Services</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <button className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-50 text-gray-600 hover:text-[#3E5E84]">
                    <Truck size={16} />
                    <span>Track Order</span>
                  </button>
                  <button className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-50 text-gray-600 hover:text-[#3E5E84]">
                    <Phone size={16} />
                    <span>Support</span>
                  </button>
                  <button className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-50 text-gray-600 hover:text-[#3E5E84]">
                    <CreditCard size={16} />
                    <span>EMI Options</span>
                  </button>
                  <button className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-50 text-gray-600 hover:text-[#3E5E84]">
                    <Shield size={16} />
                    <span>Warranty</span>
                  </button>
                </div>
              </div>

              {/* Location & Logout */}
              <div className="pt-4 border-t border-gray-200 space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <MapPin size={18} className="text-[#3E5E84]" />
                    <span className="font-medium">Deliver to: {selectedLocation}</span>
                  </div>
                  <ChevronDown size={16} className="text-gray-400" />
                </div>
                
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center space-x-3 p-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all duration-300"
                >
                  <LogOut size={20} />
                  <span className="font-medium">Logout</span>
                </button>
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