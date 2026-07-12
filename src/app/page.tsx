"use client";

import { useState } from "react";
import Preloader from "@/components/Preloader";
import RegistrationForm from "@/components/RegistrationForm";
import TreasureExperience from "@/components/TreasureExperience";
import { AnimatePresence, motion } from "framer-motion";

interface Visitor {
  _id: string;
  fullName: string;
  phoneNumber: string;
  visitorNumber: number;
}

export default function Home() {
  const [stage, setStage] = useState<"preload" | "register" | "game">("preload");
  const [visitor, setVisitor] = useState<Visitor | null>(null);

  const handlePreloadComplete = () => {
    setStage("register");
  };

  const handleRegistrationComplete = (v: Visitor) => {
    setVisitor(v);
    setStage("game");
  };

  return (
    <main className="relative min-h-screen w-full overflow-hidden flex flex-col justify-center items-center font-[family-name:var(--font-outfit)] bg-transparent">
      
      {/* Background Particles Layer */}
      <div className="fixed inset-0 pointer-events-none -z-10">
         {[...Array(15)].map((_, i) => (
           <div 
             key={i}
             className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-sparkle opacity-0"
             style={{
               top: `${Math.random() * 100}%`,
               left: `${Math.random() * 100}%`,
               animationDelay: `${Math.random() * 3}s`,
               filter: 'blur(2px)'
             }}
           />
         ))}
      </div>

      <AnimatePresence mode="wait">
        {stage === "preload" && (
          <Preloader key="preload" onComplete={handlePreloadComplete} />
        )}
        
        {stage === "register" && (
          <motion.div
             key="register"
             className="w-full flex justify-center"
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0, scale: 0.95 }}
             transition={{ duration: 0.5 }}
          >
             <RegistrationForm onRegister={handleRegistrationComplete} />
          </motion.div>
        )}

        {stage === "game" && visitor && (
          <motion.div
             key="game"
             className="w-full flex justify-center h-full"
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ duration: 0.5 }}
          >
             <TreasureExperience visitor={visitor} />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
