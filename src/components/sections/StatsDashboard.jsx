import StatCounter from "../ui/StatCounter";
import Reveal from "../ui/Reveal";
import { statsData } from "../../data/misc";

export default function StatsDashboard() {
  return (
    <section className="relative py-16 px-4 md:px-8 bg-[#070707]">
      <div className="max-w-7xl mx-auto">
        <Reveal>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {statsData.map((s) => (
              <StatCounter key={s.label} value={s.value} label={s.label} />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}