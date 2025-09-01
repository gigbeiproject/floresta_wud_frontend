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


  return (
    <>
      <Head>
        <title>Furniture @upto 40% OFF | Online Furniture Store in India - Wooden Street</title>
        <meta name="description" content="Buy Furniture Online from our extensive collection of wooden furniture units to give your home an elegant touch at affordable prices." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* Header */}
     
  
      <main>
        {/* Hero Section */}
        <Hero/>

        {/* Categories Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
              Shop by Category
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
              {categories.map((category, index) => (
                <div
                  key={index}
                  className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <div className="h-32 bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center text-4xl group-hover:scale-105 transition-transform">
                    {category.icon}
                  </div>
                  <div className="p-4 text-center">
                    <h3 className="font-semibold text-gray-900">{category.name}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products */}
          <HomeProduct/>
        {/* Wood Types Section */}
        <section className="py-16 bg-amber-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
              Premium Wood Materials
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { name: 'Sheesham Wood', description: 'Dense and strong Indian rosewood with deep reddish-brown color' },
                { name: 'Mango Wood', description: 'Hardwood known for strength with beautiful grain patterns' },
                { name: 'Teak Wood', description: 'Most popular choice with natural resistance to moisture and decay' },
                { name: 'Engineered Wood', description: 'Versatile and economical option for modern homes' }
              ].map((wood, index) => (
                <div key={index} className="bg-white rounded-lg p-6 shadow-md">
                  <div className="w-16 h-16 bg-amber-200 rounded-full flex items-center justify-center mb-4 mx-auto">
                    🌳
                  </div>
                  <h3 className="text-lg font-semibold text-center mb-3 text-gray-900">
                    {wood.name}
                  </h3>
                  <p className="text-sm text-gray-600 text-center">
                    {wood.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
              What Our Customers Say
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-white rounded-lg p-6 shadow-md">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-amber-200 rounded-full flex items-center justify-center mr-4">
                      👤
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                      <p className="text-sm text-gray-600">{testimonial.location}</p>
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">{testimonial.text}</p>
                  <div className="flex text-yellow-400 mt-4">
                    {'★'.repeat(5)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-gray-900 text-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl mb-4">🚚</div>
                <h3 className="text-lg font-semibold mb-2">Free Delivery</h3>
                <p className="text-gray-300 text-sm">Free delivery on orders above ₹15,000</p>
              </div>
              <div>
                <div className="text-4xl mb-4">🛡️</div>
                <h3 className="text-lg font-semibold mb-2">1 Year Warranty</h3>
                <p className="text-gray-300 text-sm">Comprehensive warranty on all products</p>
              </div>
              <div>
                <div className="text-4xl mb-4">💳</div>
                <h3 className="text-lg font-semibold mb-2">Easy EMI</h3>
                <p className="text-gray-300 text-sm">No cost EMI available on all products</p>
              </div>
              <div>
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-lg font-semibold mb-2">Customization</h3>
                <p className="text-gray-300 text-sm">Get furniture customized as per your needs</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
   
    </>
  );
};

export default Home;