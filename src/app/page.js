"use client";
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Navbar from '@/Com/Navbar';
import Footer from '@/Com/Footer';
import HomeProduct from '@/Com/HomeProduct';
import Hero from '@/Com/Hero';

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const categories = [
    { name: 'Living Room', icon: '🛋️', image: '/api/placeholder/250/200' },
    { name: 'Bedroom', icon: '🛏️', image: '/api/placeholder/250/200' },
    { name: 'Dining Room', icon: '🍽️', image: '/api/placeholder/250/200' },
    { name: 'Study Room', icon: '📚', image: '/api/placeholder/250/200' },
    { name: 'Kids Room', icon: '🧸', image: '/api/placeholder/250/200' },
    { name: 'Office', icon: '💼', image: '/api/placeholder/250/200' },
    { name: 'Outdoor', icon: '🌿', image: '/api/placeholder/250/200' },
    { name: 'Home Decor', icon: '🏠', image: '/api/placeholder/250/200' }
  ];

  const testimonials = [
    {
      name: "Mr. Manish Gadhvi",
      location: "Bengaluru",
      text: "CEO of Funds India in B2B Design, was looking for office furniture that doesn't give the traditional boring vibes. Got the desired fun-filled, vibrant office furniture.",
      image: "/api/placeholder/80/80"
    },
    {
      name: "Ms. Aarti Rajendra Shetty",
      location: "Bengaluru",
      text: "Furnished the model flat of 'Disha Pursuit of Elements'. From living room to master bedroom, every room was decorated with exclusive furniture collection.",
      image: "/api/placeholder/80/80"
    },
    {
      name: "Mr. Sudheer KK and Sreedevi Madhavan",
      location: "Bengaluru",
      text: "After visiting our showroom, liked our collection in just one glance. They were delighted with their entire shopping experience.",
      image: "/api/placeholder/80/80"
    }
  ];

  const woodTypes = [
    { 
      name: 'Sheesham Wood', 
      description: 'Dense and strong Indian rosewood with deep reddish-brown color',
      icon: '🌳'
    },
    { 
      name: 'Mango Wood', 
      description: 'Hardwood known for strength with beautiful grain patterns',
      icon: '🥭'
    },
    { 
      name: 'Teak Wood', 
      description: 'Most popular choice with natural resistance to moisture and decay',
      icon: '🌲'
    },
    { 
      name: 'Engineered Wood', 
      description: 'Versatile and economical option for modern homes',
      icon: '🔧'
    }
  ];

  const features = [
    {
      icon: '🚚',
      title: 'Free Delivery',
      description: 'Free delivery on orders above ₹15,000',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: '🛡️',
      title: '1 Year Warranty',
      description: 'Comprehensive warranty on all products',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: '💳',
      title: 'Easy EMI',
      description: 'No cost EMI available on all products',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: '🎯',
      title: 'Customization',
      description: 'Get furniture customized as per your needs',
      color: 'from-orange-500 to-orange-600'
    }
  ];

  return (
    <>
      <Head>
        <title>Furniture @upto 40% OFF | Online Furniture Store in India - Wooden Street</title>
        <meta name="description" content="Buy Furniture Online from our extensive collection of wooden furniture units to give your home an elegant touch at affordable prices." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className="bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
        {/* Hero Section */}
        <Hero/>

        {/* Categories Section */}
        <section className="py-20 bg-gradient-to-br from-[#98C0D9]/20 to-[#3D5B80]/10 relative">
          {/* Decorative background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-10 left-10 w-32 h-32 bg-[#98C0D9]/20 rounded-full blur-xl"></div>
            <div className="absolute bottom-10 right-10 w-48 h-48 bg-[#3D5B80]/10 rounded-full blur-xl"></div>
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="bg-gradient-to-r from-[#3D5B80] to-[#98C0D9] bg-clip-text text-transparent">
                  Shop by Category
                </span>
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Discover our premium furniture collections designed for every room in your home
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6 md:gap-8">
              {categories.map((category, index) => (
                <div
                  key={index}
                  className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:scale-105 border border-[#98C0D9]/20"
                >
                  <div className="h-40 bg-gradient-to-br from-[#98C0D9] to-[#3D5B80] flex items-center justify-center text-5xl group-hover:scale-110 transition-transform duration-300 relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/10"></div>
                    <span className="relative z-10 drop-shadow-lg">{category.icon}</span>
                  </div>
                  <div className="p-6 text-center">
                    <h3 className="font-bold text-[#3D5B80] text-lg group-hover:text-[#98C0D9] transition-colors">
                      {category.name}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <HomeProduct/>

        {/* Wood Types Section */}
        <section className="py-20 bg-gradient-to-r from-[#3D5B80] to-[#98C0D9] relative overflow-hidden">
          {/* Decorative patterns */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
              <div className="absolute top-20 left-20 w-64 h-64 border border-white/30 rounded-full"></div>
              <div className="absolute bottom-20 right-20 w-80 h-80 border border-white/20 rounded-full"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-white/10 rounded-full"></div>
            </div>
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Premium Wood Materials
              </h2>
              <p className="text-white/80 text-lg max-w-2xl mx-auto">
                Crafted from the finest wood materials to ensure durability and elegance
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {woodTypes.map((wood, index) => (
                <div 
                  key={index} 
                  className="group bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 border border-white/30"
                >
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-[#98C0D9] to-[#3D5B80] rounded-full flex items-center justify-center mb-6 mx-auto text-3xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                      {wood.icon}
                    </div>
                    <h3 className="text-xl font-bold text-[#3D5B80] mb-4 group-hover:text-[#98C0D9] transition-colors">
                      {wood.name}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {wood.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 bg-gradient-to-br from-gray-50 to-[#98C0D9]/10">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="bg-gradient-to-r from-[#3D5B80] to-[#98C0D9] bg-clip-text text-transparent">
                  What Our Customers Say
                </span>
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Real stories from satisfied customers who transformed their homes with our furniture
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div 
                  key={index} 
                  className="group bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 border border-[#98C0D9]/20"
                >
                  <div className="flex items-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#98C0D9] to-[#3D5B80] rounded-full flex items-center justify-center mr-4 text-2xl text-white shadow-lg">
                      👤
                    </div>
                    <div>
                      <h4 className="font-bold text-[#3D5B80] text-lg">{testimonial.name}</h4>
                      <p className="text-[#98C0D9] font-medium">{testimonial.location}</p>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed mb-6 italic">
                    &ldquo;{testimonial.text}&rdquo;
                  </p>
                  <div className="flex text-yellow-400 text-xl">
                    {'★'.repeat(5)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-gradient-to-r from-[#3D5B80] via-[#4A6B8A] to-[#98C0D9] relative overflow-hidden">
          {/* Animated background */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse"></div>
              <div className="absolute bottom-20 right-20 w-40 h-40 bg-white/5 rounded-full blur-xl animate-pulse delay-1000"></div>
              <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-white/10 rounded-full blur-xl animate-pulse delay-500"></div>
            </div>
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Why Choose Us?
              </h2>
              <p className="text-white/80 text-lg max-w-2xl mx-auto">
                Experience the difference with our premium services and unmatched quality
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="group text-center bg-white/10 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/20 transition-all duration-500 transform hover:scale-105 border border-white/20"
                >
                  <div className={`text-6xl mb-6 group-hover:scale-110 transition-transform duration-300 drop-shadow-lg`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4 group-hover:text-yellow-200 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-white/80 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="py-16 bg-gradient-to-r from-[#98C0D9] to-[#3D5B80]">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Transform Your Home?
            </h2>
            <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
              Browse our exclusive collection and find the perfect furniture pieces for your space
            </p>
            <button className="bg-white text-[#3D5B80] px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg">
              Shop Now
            </button>
          </div>
        </section>
      </main>
    </>
  );
};

export default Home;