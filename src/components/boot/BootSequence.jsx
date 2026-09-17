import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const MESSAGES = [
  "Initializing CODEOPS...",
  "Loading Security Protocols...",
  "Decrypting Database...",
  "Connecting to Mission Control...",
  "Verifying Agent Credentials...",
];

export default function BootSequence({ onDone }) {
  const [step, setStep] = useState(0);
  const [granted, setGranted] = useState(false);
  const [exit, setExit] = useState(false);

  useEffect(() => {
    if (step < MESSAGES.length) {
      const t = setTimeout(() => setStep((s) => s + 1), 550);
      return () => clearTimeout(t);
    } else if (!granted) {
      const t = setTimeout(() => setGranted(true), 300);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => {
        setExit(true);
        setTimeout(onDone, 700);
      }, 1100);
      return () => clearTimeout(t);
    }
  }, [step, granted, onDone]);

  const progress = Math.min((step / MESSAGES.length) * 100, 100);

  return (
    <AnimatePresence>
      {!exit && (
        <motion.div
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="fixed inset-0 z-[100] bg-[#050505] flex flex-col items-center justify-center px-6"
        >
          <div className="cyber-grid absolute inset-0 opacity-30" />
          {!granted ? (
            <div className="relative z-10 w-full max-w-md font-mono text-sm">
              <div className="text-[#00FF88] font-display tracking-[0.3em] text-center mb-8 text-lg">
                CODEOPS
              </div>
              <div className="space-y-2 min-h-[160px]">
                {MESSAGES.slice(0, step).map((m, i) => (
                  <div key={i} className="text-[#00FF88]/80">
                    <span className="text-[#00D9FF]">[OK]</span> {m}
                  </div>
                ))}
              </div>
              <div className="mt-6 h-1.5 w-full bg-white/5 rounded overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#00FF88] to-[#00D9FF]"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative z-10 text-center"
            >
              <div
                className="font-display text-4xl md:text-6xl font-black tracking-widest text-[#00FF88] text-glow"
              >
                ACCESS GRANTED
              </div>
              <div className="mt-3 text-white/40 text-xs tracking-[0.3em] uppercase">
                Welcome, Agent
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}