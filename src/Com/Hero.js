"use client";
import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Star, Truck, Shield } from "lucide-react";

function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroSlides = [
    {
      id: 1,
      title: "Premium Furniture",
      subtitle: "Up to 50% OFF",
      description:
        "Transform your living space with our handcrafted wooden furniture collection",
      buttonText: "Shop Collection",
      buttonSecondary: "View Catalog",
      badge: "Limited Time",
      image: "/4.png", // Modern furniture showroom
    },
    {
      id: 2,
      title: "Best-Sellers 2024",
      subtitle: "Trending Now",
      description:
        "Discover the most loved furniture pieces that are flying off our shelves",
      buttonText: "Explore Trending",
      buttonSecondary: "See Reviews",
      badge: "Customer Favorite",
      image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80", // Living room setup
    },
    {
      id: 3,
      title: "Custom Kitchen",
      subtitle: "Design Studio",
      description:
        "Create your dream modular kitchen with our expert designers and premium materials",
      buttonText: "Start Designing",
      buttonSecondary: "Book Consultation",
      badge: "Free Design",
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80", // Modern kitchen
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + heroSlides.length) % heroSlides.length
    );
  };

  return (
    <section className="relative h-96 md:h-[500px] lg:h-[600px] overflow-hidden">
      {/* Background Slides */}
      <div className="absolute inset-0">
        <div
          className="flex transition-transform duration-500 ease-in-out h-full"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {heroSlides.map((slide) => (
            <div
              key={slide.id}
              className="min-w-full h-full relative flex items-center"
            >
              {/* Background Image */}
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                  backgroundImage: `url('${slide.image}')`,
                }}
              />

              {/* Dark overlay with blue tint */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#3E5E84]/60 to-[#9CC4DC]/40"></div>

              {/* Content */}
              <div className="relative z-10 container mx-auto px-6 lg:px-12">
                <div className="max-w-2xl">
                  <div className="inline-block bg-[#3E5E84] text-white px-4 py-2 rounded-full text-sm font-semibold mb-4 shadow-lg">
                    {slide.badge}
                  </div>

                  <p className="text-[#9CC4DC] text-lg md:text-xl font-semibold mb-2">
                    {slide.subtitle}
                  </p>

                  <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                    {slide.title}
                  </h1>

                  <p className="text-gray-200 text-lg md:text-xl mb-6 max-w-xl leading-relaxed">
                    {slide.description}
                  </p>

                  <div className="flex items-center space-x-6 mb-8 text-white">
                    <div className="flex items-center space-x-1">
                      <Star className="w-5 h-5 text-yellow-400 fill-current" />
                      <span className="font-semibold">4.9</span>
                      <span className="text-gray-300">(12K+)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Truck className="w-5 h-5 text-[#9CC4DC]" />
                      <span>Free Delivery</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <button className="bg-gradient-to-r from-[#3E5E84] to-[#9CC4DC] text-white px-8 py-3 rounded-lg text-lg font-semibold hover:from-[#2E4A6B] hover:to-[#7FB2D3] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                      {slide.buttonText}
                    </button>
                    <button className="border-2 border-[#9CC4DC] text-[#9CC4DC] px-8 py-3 rounded-lg text-lg font-semibold hover:bg-[#9CC4DC] hover:text-[#3E5E84] transition-all duration-300 backdrop-blur-sm">
                      {slide.buttonSecondary}
                    </button>
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-gray-300">
                    <div className="flex items-center space-x-1">
                      <Shield className="w-4 h-4 text-[#9CC4DC]" />
                      <span>Lifetime Warranty</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Truck className="w-4 h-4 text-[#9CC4DC]" />
                      <span>Free Installation</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-[#3E5E84]/30 text-white p-3 rounded-full hover:bg-[#3E5E84]/50 transition-all duration-300 backdrop-blur-sm border border-white/20"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-[#3E5E84]/30 text-white p-3 rounded-full hover:bg-[#3E5E84]/50 transition-all duration-300 backdrop-blur-sm border border-white/20"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-6 left-6 z-20">
        <div className="flex space-x-2 mb-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              className={`w-8 h-1 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? "bg-[#9CC4DC] shadow-lg"
                  : "bg-white bg-opacity-40 hover:bg-opacity-60"
              }`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
        <div className="text-white text-sm">
          <span className="text-[#9CC4DC] font-semibold">
            {(currentSlide + 1).toString().padStart(2, "0")}
          </span>
          <span className="mx-1">/</span>
          <span>{heroSlides.length.toString().padStart(2, "0")}</span>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-4 right-4 z-20">
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-[#9CC4DC] animate-pulse"></div>
          <div className="w-3 h-3 rounded-full bg-[#3E5E84] animate-pulse delay-100"></div>
          <div className="w-3 h-3 rounded-full bg-[#9CC4DC] animate-pulse delay-200"></div>
        </div>
      </div>
    </section>
  );
}

export default Hero;