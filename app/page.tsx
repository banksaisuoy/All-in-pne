'use client';

import { useState } from 'react';
import { Search, Bell, MessageCircle } from 'lucide-react';
import VisualSearch from '@/components/shop/VisualSearch';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <main className="max-w-md mx-auto md:max-w-full md:px-0 min-h-screen">

      {/* 1. Header & Search */}
      <header className="sticky top-0 z-40 bg-gradient-to-r from-orange-500 to-red-600 p-4 pb-8 rounded-b-3xl shadow-lg md:rounded-none">
         <div className="flex justify-between items-center text-white mb-4">
            <h1 className="font-black text-2xl tracking-tighter italic">NeuroMarket</h1>
            <div className="flex gap-4">
                <Bell className="w-6 h-6" />
                <MessageCircle className="w-6 h-6" />
            </div>
         </div>

         <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
                type="text"
                placeholder="Ask Gemini: 'Best gifts for gamers?'"
                className="w-full bg-white text-gray-900 pl-10 pr-12 py-3 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
            <div className="absolute inset-y-0 right-2 flex items-center">
                <VisualSearch />
            </div>
         </div>
      </header>

      {/* 2. Hero Carousel (Mock) */}
      <div className="px-4 -mt-4 mb-6">
        <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white rounded-2xl shadow-sm overflow-hidden h-40 flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center"
        >
            <div className="bg-black/40 w-full h-full flex flex-col items-center justify-center text-white text-center p-4">
                <h2 className="text-2xl font-bold mb-2">Flash Sale Ending Soon!</h2>
                <div className="flex gap-2 font-mono text-sm">
                    <span className="bg-red-600 px-2 py-1 rounded">02</span>:
                    <span className="bg-red-600 px-2 py-1 rounded">14</span>:
                    <span className="bg-red-600 px-2 py-1 rounded">35</span>
                </div>
            </div>
        </motion.div>
      </div>

      {/* 3. Categories */}
      <div className="px-4 mb-8">
        <h3 className="font-bold text-gray-800 mb-4 px-1">Categories</h3>
        <div className="grid grid-cols-5 gap-4">
            {['Fashion', 'Tech', 'Beauty', 'Home', 'Toys', 'Sports', 'Auto', 'Pets', 'Books', 'More'].map((cat, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 text-lg font-bold">
                        {cat[0]}
                    </div>
                    <span className="text-[10px] text-gray-600 font-medium">{cat}</span>
                </div>
            ))}
        </div>
      </div>

      {/* 4. For You (Masonry Grid) */}
      <div className="px-4 pb-24">
        <h3 className="font-bold text-gray-800 mb-4 px-1 text-lg">For You</h3>
        <div className="columns-2 gap-4 space-y-4">
             {[...Array(8)].map((_, i) => (
                 <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="break-inside-avoid bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100"
                 >
                    <div className="h-40 bg-gray-200 w-full relative">
                        {/* Mock Image Placeholder */}
                        <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-md">
                            -{Math.floor(Math.random() * 50) + 10}%
                        </div>
                    </div>
                    <div className="p-3">
                        <h4 className="text-sm font-medium text-gray-800 line-clamp-2 leading-tight mb-2">
                            Ultra Wireless Noise Cancelling Headphones {i}
                        </h4>
                        <div className="flex items-end justify-between">
                            <div>
                                <p className="text-orange-600 font-bold text-base">$129</p>
                                <p className="text-gray-400 text-[10px] line-through">$299</p>
                            </div>
                            <div className="text-[10px] text-gray-500">
                                {Math.floor(Math.random() * 5000)} sold
                            </div>
                        </div>
                    </div>
                 </motion.div>
             ))}
        </div>

        <div className="mt-8 text-center">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
        </div>
      </div>

    </main>
  );
}
