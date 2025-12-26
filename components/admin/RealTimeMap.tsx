'use client';

import { motion } from 'framer-motion';

export default function RealTimeMap() {
  return (
    <motion.div
       initial={{ opacity: 0, y: 20 }}
       animate={{ opacity: 1, y: 0 }}
       transition={{ delay: 0.1 }}
       className="bg-gray-900 p-6 rounded-2xl shadow-sm text-white overflow-hidden relative"
    >
        <div className="absolute top-0 right-0 p-4">
            <span className="flex items-center gap-2 text-xs font-mono text-green-400 bg-green-400/10 px-2 py-1 rounded-full border border-green-400/20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                LIVE
            </span>
        </div>
        <h3 className="text-lg font-bold mb-1">Global War Room</h3>
        <p className="text-gray-400 text-sm mb-6">Live Orders Heatmap</p>

        <div className="relative w-full h-[300px] flex items-center justify-center bg-gray-800 rounded-xl border border-gray-700">
             {/* Abstract Map Representation */}
             <div className="absolute inset-0 opacity-20"
                style={{
                    backgroundImage: 'radial-gradient(#4b5563 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                }}
             ></div>

             {/* Mock Live Orders popping up */}
             {[...Array(5)].map((_, i) => (
                 <motion.div
                    key={i}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{
                        scale: [1, 2, 1],
                        opacity: [0, 1, 0],
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: i * 0.8,
                        ease: "easeOut"
                    }}
                    className="absolute w-4 h-4 rounded-full bg-orange-500 blur-sm"
                    style={{
                        top: `${Math.random() * 80 + 10}%`,
                        left: `${Math.random() * 80 + 10}%`
                    }}
                 />
             ))}

             <p className="text-gray-500 font-mono text-xs">Waiting for real-time signal...</p>
        </div>
    </motion.div>
  );
}
