import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Code2, Briefcase, Globe } from "lucide-react";
import SectionHeading from "../ui/SectionHeading";
import GlowCard from "../ui/GlowCard";
import Reveal from "../ui/Reveal";
import { agents, STATUS_COLORS } from "../../data/agents";

function AgentModal({ agent, onClose }) {
  if (!agent) return null;
  const statusColor = STATUS_COLORS[agent.status] || "#00FF88";
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="glass rounded-2xl max-w-lg w-full p-6 relative box-glow-neon max-h-[85vh] overflow-y-auto"
        >
          <button onClick={onClose} aria-label="Close dossier" className="absolute top-4 right-4 text-white/50 hover:text-[#00FF88]">
            <X size={20} />
          </button>

          <div className="flex items-center gap-4 mb-6">
            <img src={agent.photo} alt={agent.name} className="w-20 h-20 rounded-full border-2" style={{ borderColor: statusColor }} />
            <div>
              <div className="font-mono text-[10px] text-white/40">{agent.id}</div>
              <h3 className="font-display text-xl text-[#00FF88] text-glow">{agent.nickname}</h3>
              <div className="text-white/60 text-sm">{agent.name}</div>
              <div className="flex items-center gap-1.5 mt-1 text-xs" style={{ color: statusColor }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusColor }} />
                {agent.status}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs mb-6">
            <Field label="Division" value={agent.division} />
            <Field label="Threat Class" value={agent.threatClass} />
            <Field label="Clearance Level" value={`${agent.clearance} / 10`} />
            <Field label="Total XP" value={agent.xp.toLocaleString()} />
            <Field label="Missions Completed" value={agent.missions} />
            <Field label="Favourite Language" value={agent.language} />
            <Field label="Joined" value={agent.joined} className="col-span-2" />
            <Field label="Current Project" value={agent.project} className="col-span-2" />
          </div>

          <div className="flex gap-4 pt-4 border-t border-white/10 text-white/50">
            <a href={agent.github} className="hover:text-[#00FF88] flex items-center gap-1.5 text-xs"><Code2 size={14} /> GitHub</a>
            <a href={agent.linkedin} className="hover:text-[#00FF88] flex items-center gap-1.5 text-xs"><Briefcase size={14} /> LinkedIn</a>
            <a href={agent.portfolio} className="hover:text-[#00FF88] flex items-center gap-1.5 text-xs"><Globe size={14} /> Portfolio</a>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function Field({ label, value, className = "" }) {
  return (
    <div className={className}>
      <div className="text-white/35 uppercase tracking-widest text-[10px] mb-0.5">{label}</div>
      <div className="text-white/85">{value}</div>
    </div>
  );
}

export default function AgentDatabase() {
  const [selected, setSelected] = useState(null);

  return (
    <section id="agents" className="relative py-24 px-4 md:px-8 bg-[#070707]">
      <div className="max-w-7xl mx-auto">
        <Reveal>
          <SectionHeading title="Agent Database" />
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {agents.map((agent, i) => {
            const statusColor = STATUS_COLORS[agent.status] || "#00FF88";
            return (
              <Reveal key={agent.id} delay={i * 0.05}>
                <GlowCard className="text-center">
                  <img src={agent.photo} alt={agent.name} className="w-16 h-16 rounded-full mx-auto mb-3 border-2" style={{ borderColor: statusColor }} />
                  <div className="font-mono text-[10px] text-white/40">{agent.id}</div>
                  <h3 className="font-display text-sm text-[#00FF88] mt-1">{agent.nickname}</h3>
                  <div className="text-white/50 text-xs">{agent.name}</div>
                  <div className="text-[10px] mt-2 text-white/40">{agent.division}</div>
                  <div className="flex items-center justify-center gap-1.5 mt-2 text-[11px]" style={{ color: statusColor }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusColor }} />
                    {agent.status}
                  </div>
                  <button
                    onClick={() => setSelected(agent)}
                    className="mt-4 w-full py-2 rounded-md border border-[#00FF88]/40 text-[#00FF88] text-[11px] font-mono uppercase tracking-wider hover:bg-[#00FF88]/10 transition"
                  >
                    View Dossier
                  </button>
                </GlowCard>
              </Reveal>
            );
          })}
        </div>
      </div>

      <AgentModal agent={selected} onClose={() => setSelected(null)} />
    </section>
  );
}