import { AlertTriangle, Bell, Zap, Cpu, RefreshCw } from "lucide-react";
import SectionHeading from "../ui/SectionHeading";
import Reveal from "../ui/Reveal";
import { alerts } from "../../data/misc";

const ICONS = {
  DEADLINE: AlertTriangle,
  WORKSHOP: Bell,
  HACKATHON: Zap,
  UPDATE: RefreshCw,
  SYSTEM: Cpu,
};

export default function AlertConsole() {
  return (
    <section id="notifications" className="relative py-24 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <Reveal>
          <SectionHeading title="Cyber Alert Console" accent="#FF3B3B" />
        </Reveal>
        <div className="glass rounded-xl p-2 divide-y divide-white/5">
          {alerts.map((a, i) => {
            const Icon = ICONS[a.type] || Bell;
            return (
              <Reveal key={a.id} delay={i * 0.06}>
                <div className="flex items-center gap-4 p-4">
                  <div className="w-9 h-9 rounded-md flex items-center justify-center shrink-0 bg-[#FF3B3B]/10 text-[#FF3B3B]">
                    <Icon size={16} />
                  </div>
                  <div className="flex-1">
                    <div className="text-[10px] font-mono text-[#FF3B3B] uppercase tracking-widest mb-0.5">{a.type}</div>
                    <div className="text-sm text-white/80">{a.text}</div>
                  </div>
                  <div className="text-[10px] font-mono text-white/30 shrink-0">{a.time}</div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}