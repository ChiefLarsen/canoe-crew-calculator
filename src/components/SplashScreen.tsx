import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  // Vælger tilfældigt 0, 1 eller 2 ved hver opstart
  const [variant] = useState(() => Math.floor(Math.random() * 3));

  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  // Idé 1: Cinematic Sunset
  const variant0 = {
    initial: { opacity: 0, scale: 1 },
    animate: { opacity: 1, scale: 1.08 },
    transition: { opacity: { duration: 1.2 }, scale: { duration: 5.5, ease: "easeOut" } },
  };

  // Idé 2: Interaktiv Låseeffekt
  const variant1 = {
    initial: { opacity: 0, filter: "blur(10px) brightness(0.4)" },
    animate: { opacity: 1, filter: "blur(0px) brightness(1)" },
    transition: { duration: 2, ease: "easeOut" },
  };

  // Idé 3: Panorering & Segl
  const variant2 = {
    initial: { opacity: 0, y: 15, scale: 1.04 },
    animate: { opacity: 1, y: 0, scale: 1 },
    transition: { duration: 2.5, ease: "easeOut" },
  };

  const variants = [variant0, variant1, variant2];
  const currentVariant = variants[variant];

  return (
    <div
      onClick={onComplete}
      className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-slate-950 text-white overflow-hidden cursor-pointer select-none"
    >
      <motion.div
        initial={currentVariant.initial}
        animate={currentVariant.animate}
        transition={currentVariant.transition}
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/fordelingsnoegle-forside.jpg')" }}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/40 z-10" />

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 1 }}
        className="relative z-20 mt-12 text-center px-4"
      >
        <h1 className="text-2xl font-extrabold tracking-tight text-amber-100 drop-shadow-md">
          Fordelingsnøglen
        </h1>
      </motion.div>
    </div>
  );
}
export default SplashScreen;
