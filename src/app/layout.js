"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "@/Com/Footer";
import Navbar from "@/Com/Navbar";
import { Provider } from "react-redux";
import store from "./store/store";
import Head from "next/head";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <Head>
        <title>FlorestaWud - Home</title>
        <meta
          name="description"
          content="FlorestaWud is your go-to platform for eco-friendly products and sustainable living."
        />
        <meta
          name="keywords"
          content="FlorestaWud, eco-friendly, sustainable living, green products, environmental solutions"
        />
        <meta property="og:title" content="FlorestaWud - Eco-Friendly Solutions" />
        <meta
          property="og:description"
          content="Explore FlorestaWud for sustainable living products and eco-friendly innovations."
        />
        <meta property="og:url" content="https://florestawud.com" />
        <meta property="og:site_name" content="FlorestaWud" />
        <meta property="og:type" content="website" />
        <meta
          property="og:image"
          content="https://florestawud.com/og-image.jpg"
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="FlorestaWud" />
        <meta
          name="twitter:description"
          content="Eco-friendly products and sustainable living."
        />
        <meta
          name="twitter:image"
          content="https://florestawud.com/og-image.jpg"
        />
      </Head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Provider store={store}>
          <Navbar />
          {children}
          <Footer />
        </Provider>
      </body>
    </html>
  );
}
