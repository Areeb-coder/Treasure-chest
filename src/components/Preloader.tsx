"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function Preloader({ onComplete }: { onComplete: () => void }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Cinematic delay: 2.5 seconds total
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 800); // Wait for fade out animation
    }, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[var(--color-brand-cream)]"
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      style={{
        background: "radial-gradient(circle at center, #ffffff 0%, #FFF5E1 100%)",
      }}
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Soft vignette */}
        <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.03)]" />
      </div>

      <motion.div
        className="relative z-10 flex flex-col items-center"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 1, ease: "easeOut" }}
      >
        <motion.div
          animate={{ y: [-10, 10, -10], rotate: [-2, 2, -2] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="relative w-64 h-64 mb-8"
        >
          {/* Ambient Glow */}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-48 h-12 bg-yellow-400/30 blur-2xl rounded-full" />
          
          <div className="relative w-full h-full drop-shadow-2xl">
            {/* Fallback box if image is missing */}
            <div className="w-full h-full bg-gradient-to-br from-yellow-300 to-yellow-600 rounded-3xl shadow-xl flex items-center justify-center border-4 border-yellow-200">
               <span className="text-4xl">💎</span>
            </div>
          </div>
        </motion.div>

        <h1 className="text-2xl font-bold text-[#D4AC0D] mb-6 drop-shadow-sm flex items-center gap-2">
          <span className="animate-pulse">✨</span> Preparing Your Mystery...
        </h1>

        <div className="flex space-x-3">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-3 h-3 bg-[#E74C3C] rounded-full shadow-md"
              animate={{ y: [0, -10, 0], opacity: [0.5, 1, 0.5] }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
