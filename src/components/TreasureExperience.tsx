"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import Particles from "./animations/Particles";

interface Visitor {
  _id: string;
  fullName: string;
  phoneNumber: string;
  visitorNumber: number;
}

interface RewardResponse {
  reward: string;
  rewardId: string | null;
  isWinner: boolean;
  bearsLeft?: number;
  vouchersLeft?: number;
}

export default function TreasureExperience({ visitor }: { visitor: Visitor }) {
  const [screen, setScreen] = useState(0);
  const [selectedChest, setSelectedChest] = useState<string | null>(null);
  const [rewardData, setRewardData] = useState<RewardResponse | null>(null);
  const [isOpening, setIsOpening] = useState(false);

  useEffect(() => {
    if (screen === 0) {
      const timer = setTimeout(() => {
        setScreen(1);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [screen]);

  const handleOpenChest = async () => {
    setIsOpening(true);
    setScreen(7); // Loading / Still opening...
    
    try {
      const res = await fetch("/api/reward", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitorId: visitor._id, selectedChest: selectedChest || 'RED' }),
      });
      const data = await res.json();
      setRewardData(data);
      
      // Simulate suspense delay
      setTimeout(() => setScreen(75), 1500);
      setTimeout(() => setScreen(8), 3500);
    } catch (err) {
      console.error(err);
      setTimeout(() => setScreen(8), 2000); // Proceed anyway to avoid being stuck
    }
  };

  const triggerConfetti = () => {
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#F4D03F', '#E74C3C', '#2ECC71']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#F4D03F', '#E74C3C', '#2ECC71']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  const renderScreen = () => {
    switch (screen) {
      case 0:
        return (
          <motion.div key="s0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center text-center justify-center h-full">
            <motion.div 
              animate={{ rotate: 360 }} 
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full mb-6"
            />
            <h2 className="text-2xl font-bold text-gray-800">Preparing the mystery...</h2>
            <p className="text-gray-500 mt-2">Loading your destiny</p>
          </motion.div>
        );
      case 1:
        return (
          <motion.div key="s1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center text-center">
            <motion.div 
              animate={{ y: [-10, 10, -10], rotate: [-2, 2, -2] }} 
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="relative w-64 h-64 mb-4"
            >
              <div className="absolute inset-0 bg-yellow-400/20 blur-3xl rounded-full" />
              <img src="/master-chest.png" alt="Treasure Chest" className="w-full h-full object-contain drop-shadow-2xl z-10 relative" />
            </motion.div>
            
            <motion.div 
              initial={{ y: 20 }} animate={{ y: 0 }}
              className="bg-white/80 backdrop-blur p-6 rounded-3xl shadow-xl w-full max-w-sm mb-6 border border-white"
            >
              <h2 className="text-xl font-bold text-red-600 mb-2 flex items-center justify-center gap-2">
                ⚠️ WARNING
              </h2>
              <p className="text-gray-700 font-medium">Don't Open This Treasure...</p>
              <p className="text-sm text-gray-500 mt-1">Almost nobody can resist.</p>
            </motion.div>

            <div className="flex flex-col gap-3 w-full max-w-sm">
              <button onClick={() => setScreen(2)} className="bg-gradient-to-r from-red-500 to-red-600 text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                Open Anyway 😈
              </button>
              <button className="bg-gray-100 text-gray-600 font-bold py-4 rounded-2xl hover:bg-gray-200 transition-all">
                I Won't Open 😇
              </button>
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div key="s2" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center text-center">
            <motion.div animate={{ y: [-5, 5, -5] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="relative w-48 h-48 mb-6 drop-shadow-xl">
              <img src="/images/guardian-pose-3.png" alt="Guardian Shocked" className="w-full h-full object-contain" />
            </motion.div>
            <div className="bg-white p-6 rounded-3xl shadow-xl w-full max-w-sm mb-6">
              <p className="text-2xl font-bold text-gray-800 mb-2">WAIT!!</p>
              <p className="text-lg text-gray-600">You actually clicked?</p>
            </div>
            <button onClick={() => setScreen(3)} className="w-full max-w-sm bg-yellow-400 text-yellow-950 font-bold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all">
              Continue
            </button>
          </motion.div>
        );
      case 3:
        return (
          <motion.div key="s3" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex flex-col items-center text-center">
             <motion.div animate={{ y: [-5, 5, -5] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="relative w-48 h-48 mb-6 drop-shadow-xl">
              <img src="/images/guardian-pose-6.png" alt="Guardian Pointing" className="w-full h-full object-contain" />
            </motion.div>
            <div className="bg-white p-6 rounded-3xl shadow-xl w-full max-w-sm mb-6">
              <p className="text-lg font-bold text-gray-800 mb-2">You still have time.</p>
              <p className="text-md text-gray-600">Walk away.</p>
            </div>
            <div className="flex flex-col gap-3 w-full max-w-sm">
              <button onClick={() => setScreen(4)} className="bg-yellow-400 text-yellow-950 font-bold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all">
                Continue
              </button>
              <button className="bg-gray-200 text-gray-600 font-bold py-4 rounded-2xl">
                Leave
              </button>
            </div>
          </motion.div>
        );
      case 4:
        return (
          <motion.div key="s4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center text-center">
            <motion.div animate={{ y: [-5, 5, -5] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="relative w-48 h-48 mb-6 drop-shadow-xl">
              <img src="/images/guardian-pose-11.png" alt="Guardian Disappointed" className="w-full h-full object-contain" />
            </motion.div>
            <motion.div 
              animate={{ x: [-5, 5, -5, 5, 0] }} transition={{ duration: 0.5 }}
              className="bg-white p-6 rounded-3xl shadow-xl w-full max-w-sm mb-6 border-2 border-yellow-400 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-yellow-400/10 animate-pulse" />
              <p className="text-lg font-bold text-gray-800 relative z-10">*Sigh*</p>
              <p className="text-md text-gray-600 relative z-10">The chest is glowing stronger...</p>
            </motion.div>
            <button onClick={() => setScreen(5)} className="w-full max-w-sm bg-yellow-400 text-yellow-950 font-bold py-4 rounded-2xl shadow-lg">
              What now?
            </button>
          </motion.div>
        );
      case 5:
        return (
          <motion.div key="s5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center text-center w-full relative">
            <Particles count={30} color="bg-yellow-300" />
            <div className="bg-white/90 backdrop-blur p-4 rounded-3xl shadow-lg mb-4 max-w-sm w-full relative z-10">
              <p className="text-lg font-bold text-gray-800">Fine...</p>
              <p className="text-md text-gray-600">Choose your destiny.</p>
            </div>
            
            <motion.div animate={{ y: [-3, 3, -3] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="relative w-32 h-32 mb-6 z-10 drop-shadow-xl">
               <img src="/images/guardian-pose-8.png" alt="Guardian Nervous" className="w-full h-full object-contain" />
            </motion.div>

            <div className="flex justify-center gap-4 w-full px-2 relative z-20">
              {['red', 'blue', 'green'].map((color) => (
                <motion.div
                  key={color}
                  initial={{ opacity: 1, scale: 1 }}
                  animate={{ 
                    opacity: selectedChest && selectedChest !== color ? 0 : 1,
                    scale: selectedChest === color ? 1.5 : 1,
                    x: selectedChest === color ? (color === 'red' ? 100 : color === 'green' ? -100 : 0) : 0,
                    y: selectedChest ? (selectedChest === color ? -50 : 0) : [-4, 4, -4]
                  }}
                  transition={{ 
                     y: selectedChest ? { duration: 0.5 } : { duration: 3 + Math.random(), repeat: Infinity, ease: "easeInOut" },
                     opacity: { duration: 0.5 },
                     scale: { duration: 0.5 },
                     x: { duration: 0.5 }
                  }}
                  whileHover={!selectedChest ? { scale: 1.15, y: -10 } : {}}
                  onClick={() => { 
                    if(!selectedChest) {
                      setSelectedChest(color); 
                      setTimeout(handleOpenChest, 800);
                    }
                  }}
                  className={`relative w-28 h-28 cursor-pointer group`}
                >
                  <div className={`absolute inset-0 blur-xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-300 ${color === 'red' ? 'bg-red-500' : color === 'blue' ? 'bg-blue-500' : 'bg-green-500'}`} />
                  <img src={`/chest-${color}.png`} alt={`${color} Chest`} className="w-full h-full object-contain drop-shadow-2xl relative z-10" />
                </motion.div>
              ))}
            </div>
          </motion.div>
        );
      case 7:
        return (
          <motion.div key="s7" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-full w-full text-center relative">
            <Particles count={50} color="bg-white" />
            <motion.div 
              animate={{ x: [-5, 5, -5], y: [-5, 5, -5] }} 
              transition={{ duration: 0.1, repeat: Infinity }}
              className="relative w-64 h-64 mb-6 z-20"
            >
              <div className="absolute inset-0 bg-white blur-3xl rounded-full animate-pulse" />
              <img src={`/chest-${selectedChest}.png`} alt="Shaking Chest" className="w-full h-full object-contain drop-shadow-2xl relative z-10" />
            </motion.div>

            <motion.div className="relative w-32 h-32 -mt-20 z-10" animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
              <img src="/images/guardian-pose-14.png" alt="Guardian Hiding" className="w-full h-full object-contain" />
            </motion.div>
            
            <p className="text-xl font-bold text-gray-800 mt-4 relative z-20 animate-pulse">Opening...</p>
          </motion.div>
        );
      case 75:
        return (
          <motion.div key="s75" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-full w-full text-center relative">
            <Particles count={60} color="bg-yellow-400" />
            <motion.div 
              animate={{ x: [-8, 8, -8], y: [-8, 8, -8], scale: [1, 1.05, 1] }} 
              transition={{ duration: 0.05, repeat: Infinity }}
              className="relative w-64 h-64 mb-6 z-20"
            >
              <div className="absolute inset-0 bg-yellow-400 blur-3xl rounded-full animate-pulse opacity-50" />
              <img src={`/chest-${selectedChest}.png`} alt="Shaking Chest Harder" className="w-full h-full object-contain drop-shadow-2xl relative z-10" />
            </motion.div>

            <motion.div className="relative w-32 h-32 -mt-20 z-10" animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
              <img src="/images/guardian-pose-14.png" alt="Guardian Hiding" className="w-full h-full object-contain" />
            </motion.div>
            
            <p className="text-xl font-bold text-red-600 mt-4 relative z-20 animate-pulse">Still opening... Almost there!</p>
          </motion.div>
        );
      case 8:
        return (
          <motion.div key="s8" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center text-center">
            <motion.div animate={{ y: [-5, 5, -5] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="relative w-48 h-48 mb-6 drop-shadow-xl">
              <img src="/images/guardian-pose-9.png" alt="Guardian Curious" className="w-full h-full object-contain" />
            </motion.div>
            <div className="bg-white/90 backdrop-blur p-6 rounded-3xl shadow-xl w-full max-w-sm mb-6 relative z-10">
              <p className="text-lg font-bold text-gray-800 mb-2">Promise you won't blame me?</p>
            </div>
            <div className="flex flex-col gap-3 w-full max-w-sm relative z-10">
              <button onClick={() => { setScreen(9); triggerConfetti(); }} className="bg-yellow-400 text-yellow-950 font-bold py-4 rounded-2xl shadow-lg">
                I Promise
              </button>
              <button onClick={() => { setScreen(9); triggerConfetti(); }} className="bg-gray-200 text-gray-600 font-bold py-4 rounded-2xl">
                Just Open It
              </button>
            </div>
          </motion.div>
        );
      case 9:
        const won = rewardData?.isWinner;
        return (
          <motion.div key="s9" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center text-center w-full relative z-10">
            <motion.div 
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.6 }}
              className="bg-white/95 backdrop-blur p-8 rounded-[2rem] shadow-2xl w-full max-w-sm mb-6 border-4 border-yellow-200 relative overflow-hidden"
            >
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-300/30 blur-2xl rounded-full" />
              {won ? (
                <>
                  <motion.div animate={{ y: [-5, 5, -5] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} className="relative w-32 h-32 mx-auto mb-4 drop-shadow-xl">
                    <img src="/images/guardian-pose-15.png" alt="Guardian Celebration" className="w-full h-full object-contain" />
                  </motion.div>
                  <h2 className="text-3xl font-black text-green-600 mb-2 drop-shadow-sm">YOU WON! 🎉</h2>
                  <p className="text-xl font-bold text-gray-800 my-4 py-4 bg-gray-50 rounded-xl shadow-inner border border-gray-100">{rewardData?.reward}</p>
                  <p className="text-sm text-gray-500 font-mono bg-gray-100 py-1 px-3 rounded-full inline-block">ID: {rewardData?.rewardId}</p>
                  <p className="text-xs text-gray-400 mt-4">Show this at the counter.</p>
                  
                  {/* Remaining Inventory Banner */}
                  {(rewardData?.bearsLeft !== undefined || rewardData?.vouchersLeft !== undefined) && (
                    <div className="mt-6 flex justify-center gap-4 text-xs font-bold text-gray-500 bg-gray-50 py-2 px-4 rounded-full border border-gray-100">
                      <span>🧸 {rewardData?.bearsLeft ?? 4} Left</span>
                      <span>|</span>
                      <span>🎟️ {rewardData?.vouchersLeft ?? 4} Left</span>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <motion.div animate={{ y: [-5, 5, -5] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="relative w-32 h-32 mx-auto mb-4 drop-shadow-xl">
                    <img src="/images/guardian-pose-2.png" alt="Guardian Smiling" className="w-full h-full object-contain" />
                  </motion.div>
                  <p className="text-xl font-bold text-gray-800 my-4 py-4 px-4 bg-gray-50 rounded-xl shadow-inner border border-gray-100">{rewardData?.reward || "Wait, did someone already take this? Just dust and cobwebs in here... 😂"}</p>
                  
                  {/* Remaining Inventory Banner */}
                  {(rewardData?.bearsLeft !== undefined || rewardData?.vouchersLeft !== undefined) && (
                    <div className="mt-4 flex justify-center gap-4 text-xs font-bold text-gray-500 bg-gray-50 py-2 px-4 rounded-full border border-gray-100">
                      <span>🧸 {rewardData?.bearsLeft ?? 4} Left</span>
                      <span>|</span>
                      <span>🎟️ {rewardData?.vouchersLeft ?? 4} Left</span>
                    </div>
                  )}
                </>
              )}
            </motion.div>
            <button onClick={() => setScreen(10)} className="w-full max-w-sm bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-950 font-bold py-4 rounded-2xl shadow-xl">
              Next
            </button>
          </motion.div>
        );
      case 10:
        return (
          <motion.div key="s10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center text-center">
            <motion.div animate={{ y: [-5, 5, -5] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="relative w-48 h-48 mb-6 drop-shadow-xl">
              <img src="/images/guardian-pose-1.png" alt="Guardian Laughing" className="w-full h-full object-contain" />
            </motion.div>
            <div className="bg-white p-6 rounded-3xl shadow-xl w-full max-w-sm mb-6">
              <p className="text-xl font-bold text-gray-800">😂 I knew you'd open it.</p>
            </div>
            <button onClick={() => setScreen(11)} className="w-full max-w-sm bg-yellow-400 text-yellow-950 font-bold py-4 rounded-2xl shadow-lg">
              Continue
            </button>
          </motion.div>
        );
      case 11:
        return (
          <motion.div key="s11" initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center text-center min-h-screen pt-10">
            {/* Dark background for final screen */}
            <div className="fixed inset-0 bg-[#1A1A1A] -z-10" />
            <motion.div animate={{ y: [-3, 3, -3] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="relative w-64 h-64 mb-6">
              <img src="/images/guardian-pose-16.png" alt="Guardian Whisper" className="w-full h-full object-contain filter brightness-90 drop-shadow-2xl" />
            </motion.div>
            <div className="bg-[#2A2A2A] p-6 rounded-3xl shadow-2xl w-full max-w-sm mb-8 border border-white/10">
              <p className="text-lg font-bold text-gray-200 mb-2">🤫 Pssst...</p>
              <p className="text-md text-gray-400 mb-4">Don't tell the next person what happened...</p>
              <p className="text-md text-yellow-400 font-semibold mt-4 pt-4 border-t border-white/10">Can you keep a secret?</p>
            </div>
            
            <div className="flex flex-col gap-4 w-full max-w-sm px-4">
              <button className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-yellow-950 font-bold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all w-full flex items-center justify-center gap-2">
                <span>✨</span> Explore Collection
              </button>
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 min-h-screen flex flex-col justify-center relative">
      <AnimatePresence mode="wait">
        {renderScreen()}
      </AnimatePresence>
    </div>
  );
}
