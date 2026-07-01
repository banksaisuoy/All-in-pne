'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const banners = [
  {
    id: 1,
    title: "Summer Sale is Live!",
    subtitle: "Up to 50% off on selected electronics.",
    color: "bg-gradient-to-r from-blue-500 to-cyan-400",
  },
  {
    id: 2,
    title: "New Arrivals",
    subtitle: "Check out the latest tech gadgets.",
    color: "bg-gradient-to-r from-purple-500 to-pink-500",
  },
  {
    id: 3,
    title: "Free Shipping",
    subtitle: "On all orders over $99.",
    color: "bg-gradient-to-r from-emerald-400 to-teal-500",
  },
];

export function HeroBanner() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative h-[200px] md:h-[300px] w-full overflow-hidden rounded-2xl mb-8">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.5 }}
          className={`absolute inset-0 flex flex-col items-center justify-center text-white p-6 text-center ${banners[current].color}`}
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-2 tracking-tight">
            {banners[current].title}
          </h2>
          <p className="text-lg md:text-xl opacity-90">
            {banners[current].subtitle}
          </p>
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
        {banners.map((_, idx) => (
          <button
            key={idx}
            className={`w-2 h-2 rounded-full transition-all ${
              idx === current ? 'bg-white w-6' : 'bg-white/50'
            }`}
            onClick={() => setCurrent(idx)}
          />
        ))}
      </div>
    </div>
  );
}
