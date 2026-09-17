import { MapPin, User, ExternalLink } from "lucide-react";
import GlowCard from "../ui/GlowCard";
import SectionHeading from "../ui/SectionHeading";
import Reveal from "../ui/Reveal";
import { events } from "../../data/events";
import { useCountdown } from "../../hooks/useCountdown";

function CountdownBlock({ deadline }) {
  const t = useCountdown(deadline);

  if (t.expired) {
    return (
      <div className="text-[#FF3B3B] text-xs font-mono">
        REGISTRATION CLOSED
      </div>
    );
  }

  return (
    <div className="flex gap-3 font-mono text-xs">
      {[
        ["D", t.days],
        ["H", t.hours],
        ["M", t.minutes],
        ["S", t.seconds],
      ].map(([label, val]) => (
        <div key={label} className="text-center">
          <div className="text-[#00D9FF] text-lg font-display">
            {String(val).padStart(2, "0")}
          </div>
          <div className="text-white/40">{label}</div>
        </div>
      ))}
    </div>
  );
}

export default function Events() {
  return (
    <section
      id="events"
      className="relative py-24 px-4 md:px-8 bg-[#070707]"
    >
      <div className="max-w-7xl mx-auto">
        <Reveal>
          <SectionHeading
            title="Mission Files"
            accent="#00D9FF"
          />
        </Reveal>

        <div className="grid md:grid-cols-3 gap-6">
          {events.map((ev, i) => (
            <Reveal key={ev.id} delay={i * 0.1}>
              <GlowCard accent="cyan" className="h-full flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <span className="font-mono text-[10px] text-[#00D9FF] border border-[#00D9FF]/40 px-2 py-1 rounded">
                    {ev.id}
                  </span>

                  <span
                    className={`font-mono text-[10px] px-2 py-1 rounded ${
                      ev.status === "OPEN"
                        ? "text-[#00FF88] border border-[#00FF88]/40"
                        : "text-[#FF3B3B] border border-[#FF3B3B]/40"
                    }`}
                  >
                    {ev.status}
                  </span>
                </div>

                <img
                  src={ev.poster}
                  alt={`${ev.title} poster`}
                  className="rounded-md mb-4 w-full h-40 object-cover"
                  loading="lazy"
                />

                <h3 className="font-display text-base text-white mb-2">
                  {ev.title}
                </h3>

                <p className="text-white/50 text-xs mb-4 leading-relaxed flex-1">
                  {ev.description}
                </p>

                {/* <div className="text-xs text-white/50 flex items-center gap-2 mb-1">
                  <User size={12} />
                  {ev.organiser}
                </div> */}

                <div className="text-xs text-white/50 flex items-center gap-2 mb-4">
                  <MapPin size={12} />
                  {ev.venue}
                </div>

                <CountdownBlock deadline={ev.deadline} />

                <a
                  href={ev.registerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-[#00D9FF] text-black font-mono text-xs font-bold uppercase tracking-wider box-glow-cyan hover:brightness-110 transition"
                >
                  Register <ExternalLink size={12} />
                </a>
              </GlowCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}