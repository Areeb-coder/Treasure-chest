"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface Visitor {
  _id: string;
  fullName: string;
  phoneNumber: string;
  visitorNumber: number;
}

export default function RegistrationForm({ onRegister }: { onRegister: (v: Visitor) => void }) {
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phoneNumber.trim()) {
      setError("Name and Phone Number are required.");
      return;
    }
    
    // Basic phone validation (10 digits)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phoneNumber)) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, phoneNumber, email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to register");
      
      onRegister(data.visitor);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="w-full max-w-md mx-auto p-6 flex flex-col items-center"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
    >
      <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] shadow-2xl border border-white/40 w-full relative overflow-hidden">
        {/* Soft glow behind form */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-yellow-300/30 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-red-400/20 blur-3xl rounded-full pointer-events-none" />

        <h2 className="text-3xl font-extrabold text-center text-[#2C3E50] mb-2 relative z-10">
          Who are you?
        </h2>
        <p className="text-center text-gray-500 mb-8 relative z-10">
          Enter your details to begin the adventure.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 relative z-10">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1 ml-2">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl bg-gray-50/50 border border-gray-200 focus:outline-none focus:ring-4 focus:ring-yellow-400/30 focus:border-yellow-400 transition-all text-lg placeholder-gray-400 shadow-inner"
              placeholder="e.g. Areeb"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1 ml-2">Mobile Number</label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
              className="w-full px-5 py-4 rounded-2xl bg-gray-50/50 border border-gray-200 focus:outline-none focus:ring-4 focus:ring-yellow-400/30 focus:border-yellow-400 transition-all text-lg placeholder-gray-400 shadow-inner"
              placeholder="10-digit number"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1 ml-2">Email <span className="text-gray-400 font-normal">(Optional)</span></label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl bg-gray-50/50 border border-gray-200 focus:outline-none focus:ring-4 focus:ring-yellow-400/30 focus:border-yellow-400 transition-all text-lg placeholder-gray-400 shadow-inner"
              placeholder="you@example.com"
            />
          </div>

          {error && (
            <motion.p 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-red-500 text-sm text-center font-medium bg-red-50 p-3 rounded-xl"
            >
              {error}
            </motion.p>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            className="w-full mt-4 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-yellow-950 font-bold text-xl py-5 rounded-2xl shadow-[0_8px_30px_rgb(244,208,63,0.3)] hover:shadow-[0_8px_40px_rgb(244,208,63,0.5)] transition-all flex items-center justify-center gap-2 relative overflow-hidden"
          >
            {loading ? (
              <div className="w-6 h-6 border-4 border-yellow-950/20 border-t-yellow-950 rounded-full animate-spin" />
            ) : (
              <>
                <span>✨ Continue Adventure</span>
                {/* Shine effect on button */}
                <div className="absolute inset-0 -translate-x-full bg-white/20 w-1/2 skew-x-12 hover:animate-[shine_1s_ease-in-out]" />
              </>
            )}
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
}
