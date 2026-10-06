import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const MESSAGES = [
  "Initializing CODEOPS...",
  "Loading Security Protocols...",
  "Decrypting Database...",
  "Connecting to Mission Control...",
  "Verifying Agent Credentials...",
];

export default function BootSequence({ onAudioChoice, onDone }) {
  const [phase, setPhase] = useState("choice");
  const [step, setStep] = useState(0);
  const [granted, setGranted] = useState(false);
  const [exit, setExit] = useState(false);

  useEffect(() => {
    if (phase !== "boot") return;
    if (step < MESSAGES.length) {
      const t = setTimeout(() => setStep((s) => s + 1), 400);
      return () => clearTimeout(t);
    }
    if (!granted) {
      const t = setTimeout(() => setGranted(true), 300);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      setExit(true);
      setTimeout(onDone, 700);
    }, 900);
    return () => clearTimeout(t);
  }, [phase, step, granted, onDone]);

  useEffect(() => {
    if (phase !== "video") return;
    const t = setTimeout(() => setPhase("blank"), 3000);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== "blank") return;
    const t = setTimeout(onDone, 500);
    return () => clearTimeout(t);
  }, [phase, onDone]);

  const chooseAudio = (enabled) => {
    onAudioChoice?.(enabled);
    setPhase("video");
  };

  const progress = Math.min((step / MESSAGES.length) * 100, 100);

  return (
    <AnimatePresence mode="wait">
      {!exit && (
        <motion.div
          key={phase}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[100] overflow-hidden bg-[#050505]"
        >
          {phase === "choice" ? (
            <div className="relative flex h-full items-center justify-center px-6">
              <div className="cyber-grid absolute inset-0 opacity-30" />
              <div className="absolute bottom-5 left-5 z-10 font-mono text-[10px] tracking-wider text-white/40">
                Audio by Kevin MacLeod
              </div>
              <div className="relative z-10 w-full max-w-lg border border-[#00FF88]/30 bg-[#050505]/90 p-8 text-center font-mono box-glow-neon md:p-12">
                <div className="mb-8 text-xs tracking-[0.35em] text-[#00D9FF]">CODE_OPS // AUDIO LINK</div>
                <h1 className="font-display text-2xl font-bold tracking-wider text-[#00FF88] text-glow md:text-4xl">
                  Would you like the audio to play?
                </h1>
                <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-white/50">
                  Choose your preferred entry protocol before the transmission begins.
                </p>
                <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
                  <button type="button" onClick={() => chooseAudio(true)} className="border border-[#00FF88] bg-[#00FF88]/10 px-8 py-3 text-xs font-bold uppercase tracking-[0.2em] text-[#00FF88] transition hover:bg-[#00FF88] hover:text-[#050505]">
                    Yes, play audio
                  </button>
                  <button type="button" onClick={() => chooseAudio(false)} className="border border-white/20 px-8 py-3 text-xs font-bold uppercase tracking-[0.2em] text-white/60 transition hover:border-[#00D9FF] hover:text-[#00D9FF]">
                    No, stay silent
                  </button>
                </div>
              </div>
            </div>
          ) : phase === "video" ? (
            <video className="h-full w-full object-cover" src="/vce_logo.mp4" autoPlay muted playsInline aria-label="Code_OPS introduction" />
          ) : phase === "boot" ? (
            <div className="relative z-10 h-full flex flex-col items-center justify-center px-6">
              <div className="cyber-grid absolute inset-0 opacity-30" />
              {!granted ? (
                <div className="relative z-10 w-full max-w-md font-mono text-sm">
                  <div className="text-[#00FF88] font-display tracking-[0.3em] text-center mb-8 text-lg">CODEOPS</div>
                  <div className="space-y-2 min-h-[160px]">
                    {MESSAGES.slice(0, step).map((m, i) => <div key={i} className="text-[#00FF88]/80"><span className="text-[#00D9FF]">[OK]</span> {m}</div>)}
                  </div>
                  <div className="mt-6 h-1.5 w-full bg-white/5 rounded overflow-hidden">
                    <motion.div className="h-full bg-gradient-to-r from-[#00FF88] to-[#00D9FF]" animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
                  </div>
                </div>
              ) : (
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 text-center">
                  <div className="font-display text-4xl md:text-6xl font-black tracking-widest text-[#00FF88] text-glow">ACCESS GRANTED</div>
                  <div className="mt-3 text-white/40 text-xs tracking-[0.3em] uppercase">Welcome, Agent</div>
                </motion.div>
              )}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center bg-[#050505]" />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
