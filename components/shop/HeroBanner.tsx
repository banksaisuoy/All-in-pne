'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

const banners = [
  {
    id: 1,
    title: "Summer Collection",
    subtitle: "New arrivals for the season",
    color: "bg-blue-100 dark:bg-blue-950",
    textColor: "text-blue-900 dark:text-blue-100",
  },
  {
    id: 2,
    title: "Tech Gadgets",
    subtitle: "Upgrade your setup today",
    color: "bg-purple-100 dark:bg-purple-950",
    textColor: "text-purple-900 dark:text-purple-100",
  },
  {
    id: 3,
    title: "Minimalist Living",
    subtitle: "Essentials for a clean space",
    color: "bg-amber-100 dark:bg-amber-950",
    textColor: "text-amber-900 dark:text-amber-100",
  }
];

export function HeroBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative h-[400px] sm:h-[500px] w-full overflow-hidden mb-12">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className={`absolute inset-0 flex flex-col items-center justify-center text-center p-6 ${banners[currentIndex].color}`}
        >
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={`text-4xl md:text-6xl font-extrabold mb-4 tracking-tight ${banners[currentIndex].textColor}`}
          >
            {banners[currentIndex].title}
          </motion.h2>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className={`text-lg md:text-xl mb-8 font-medium ${banners[currentIndex].textColor} opacity-80`}
          >
            {banners[currentIndex].subtitle}
          </motion.p>
          <motion.div
             initial={{ y: 20, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             transition={{ delay: 0.4 }}
          >
             <Button size="lg" className="rounded-full px-8 shadow-lg hover:shadow-xl transition-shadow">
               Shop Now
             </Button>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Indicators */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2">
        {banners.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              idx === currentIndex ? "bg-primary w-8" : "bg-primary/30"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
