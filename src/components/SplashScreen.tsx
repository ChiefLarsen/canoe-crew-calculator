// Copilot integrationstest OK
import React, { useEffect, useRef, useState } from "react";
import { motion, Variants } from "framer-motion";

type Props = { onComplete: () => void };

const SplashScreen: React.FC<Props> = ({ onComplete }) => {
  const variantRef = useRef(Math.floor(Math.random() * 3));
  const [exiting, setExiting] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    timerRef.current = window.setTimeout(() => handleComplete(), 5000);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleComplete = () => {
    if (exiting) return;
    setExiting(true);
    // give exit animation time then notify parent
    window.setTimeout(() => onComplete(), 400);
  };

  const commonBg = {
    backgroundImage: "url('/fordelingsnoegle-forside.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
  } as React.CSSProperties;

  const bgVariants: Variants = {
    initial: { opacity: 0 },
    animate1: { opacity: 1, scale: 1, transition: { duration: 0.8 } },
    animate2: { opacity: 1, transition: { duration: 0.8 } },
    animate3: { opacity: 1, transition: { duration: 0.8 } },
    exit: { opacity: 0, transition: { duration: 0.3 } },
  };

  const bgMotionStyle = (idx: number) => {
    if (idx === 0) {
      // Ken Burns zoom (scale slowly over time)
      return { transformOrigin: "center", animate: { scale: 1 }, transition: { duration: 5 } };
    }
    if (idx === 1) {
      // starts dark/blurred then brightens
      return { filter: "blur(4px) brightness(0.6)", animate: { filter: "blur(0px) brightness(1)" }, transition: { duration: 1.2 } };
    }
    // idx === 2: panning
    return { backgroundPosition: ["center", "30% center"], transition: { duration: 5 } };
  };

  const keyVariants: Variants = {
    initial: { opacity: 0, rotate: -10, y: 12 },
    animate1: { opacity: 1, rotate: 0, y: 0, transition: { delay: 0.6, duration: 0.9 } },
    animate2: { opacity: 1, rotate: [ -12, 6, -3, 0 ], transition: { delay: 0.6, duration: 1 } },
    animate3: { opacity: 1, x: [ -40, 0 ], transition: { delay: 0.6, duration: 1 } },
    exit: { opacity: 0, transition: { duration: 0.25 } },
  };

  const idx = variantRef.current;

  return (
    <motion.div
      onClick={handleComplete}
      className="fixed inset-0 z-50 flex items-center justify-center cursor-pointer select-none"
      initial="initial"
      animate={exiting ? "exit" : idx === 0 ? "animate1" : idx === 1 ? "animate2" : "animate3"}
      exit="exit"
      variants={bgVariants}
      style={commonBg}
    >
      {/* subtle overlay for variants that need it */}
      <motion.div
        className="absolute inset-0"
        aria-hidden
        style={{ background: "rgba(0,0,0,0.12)" }}
        animate={idx === 1 ? { filter: ["blur(4px)", "blur(0px)"], backgroundColor: ["rgba(0,0,0,0.35)", "rgba(0,0,0,0.08)"] } : {}}
        transition={{ duration: idx === 1 ? 1.2 : 0. }}
      />

      {/* key / emblem */}
      <motion.div className="relative z-10 flex flex-col items-center gap-6 text-white">
        <motion.div
          aria-hidden
          variants={keyVariants}
          initial="initial"
          animate={exiting ? "exit" : idx === 0 ? "animate1" : idx === 1 ? "animate2" : "animate3"}
          className="w-28 h-28 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center"
        >
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white">
            <path d="M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
            <path d="M19 21l-3-3" />
            <path d="M12 14v7" />
          </svg>
        </motion.div>
      </motion.div>

      {/* invisible motion to drive long-running background pans/zooms */}
      {idx === 0 ? (
        <motion.div animate={{ scale: [1.04, 1] }} transition={{ duration: 5 }} className="absolute inset-0" />
      ) : null}
      {idx === 2 ? (
        <motion.div
          animate={{ backgroundPosition: ["center", "30% center"] }}
          transition={{ duration: 5 }}
          className="absolute inset-0"
        />
      ) : null}
    </motion.div>
  );
};

export default SplashScreen;
