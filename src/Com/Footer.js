import React from 'react'


function Footer() {
  return (
   
       <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4"> florestawud</h3>
             <p className="text-gray-300 text-sm mb-4">
-                India s leading online furniture store offering premium wooden furniture
+                India&apos;s leading online furniture store offering premium wooden furniture
                 at affordable prices since 2015.
               </p>
              <div className="flex space-x-4">
                <span className="text-2xl cursor-pointer hover:text-amber-400">📘</span>
                <span className="text-2xl cursor-pointer hover:text-amber-400">📷</span>
                <span className="text-2xl cursor-pointer hover:text-amber-400">🐦</span>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Shop Categories</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-300 hover:text-white">Living Room</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Bedroom</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Dining Room</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Study Room</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Office</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Customer Service</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-300 hover:text-white">Contact Us</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Track Order</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Return Policy</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Warranty</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">FAQs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact Info</h4>
              <div className="space-y-2 text-sm text-gray-300">
                <p>📞 1800-123-4567</p>
                <p>📧 help@florestawud.com</p>
                <p>📍 100+ stores across India</p>
                <p>🕐 24/7 Customer Support</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p className="text-gray-300 text-sm">
              © 2025 florestawud. All rights reserved. | Privacy Policy | Terms & Conditions
            </p>
          </div>
        </div>
      </footer>
    
  )
}

export default Footer