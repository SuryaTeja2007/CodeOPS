import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import introVideo from "../../../vce_logo.mp4";

export default function BootSequence({ onAudioChoice, onDone }) {
  const [phase, setPhase] = useState("choice");

  useEffect(() => {
    if (phase !== "video") return undefined;

    const videoTimer = setTimeout(() => setPhase("blank"), 3000);
    return () => clearTimeout(videoTimer);
  }, [phase]);

  useEffect(() => {
    if (phase !== "blank") return undefined;

    const blankTimer = setTimeout(onDone, 500);
    return () => clearTimeout(blankTimer);
  }, [phase, onDone]);

  const chooseAudio = (enabled) => {
    onAudioChoice(enabled);
    setPhase("video");
  };

  return (
    <AnimatePresence>
      {(
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
                  <button
                    type="button"
                    onClick={() => chooseAudio(true)}
                    className="border border-[#00FF88] bg-[#00FF88]/10 px-8 py-3 text-xs font-bold uppercase tracking-[0.2em] text-[#00FF88] transition hover:bg-[#00FF88] hover:text-[#050505]"
                  >
                    Yes, play audio
                  </button>
                  <button
                    type="button"
                    onClick={() => chooseAudio(false)}
                    className="border border-white/20 px-8 py-3 text-xs font-bold uppercase tracking-[0.2em] text-white/60 transition hover:border-[#00D9FF] hover:text-[#00D9FF]"
                  >
                    No, stay silent
                  </button>
                </div>
              </div>
            </div>
          ) : phase === "video" ? (
            <video
              className="h-full w-full object-cover"
              src={introVideo}
              autoPlay
              muted
              playsInline
              aria-label="Code_OPS introduction"
            />
          ) : null}
          {phase === "blank" && <div className="absolute inset-0 bg-[#050505]" />}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
