import { useMemo, useState } from "react";
import { Search, ArrowUpDown } from "lucide-react";
import SectionHeading from "../ui/SectionHeading";
import Reveal from "../ui/Reveal";
import { leaderboard } from "../../data/misc";
import { DIVISIONS as ALL_DIVISIONS } from "../../data/agents";

export default function Leaderboard() {
  const [query, setQuery] = useState("");
  const [division, setDivision] = useState("All");
  const [sortKey, setSortKey] = useState("rank");
  const [asc, setAsc] = useState(true);

  const rows = useMemo(() => {
    let data = leaderboard.filter((r) => {
      const matchesQuery =
        r.name.toLowerCase().includes(query.toLowerCase()) ||
        r.nickname.toLowerCase().includes(query.toLowerCase());
      const matchesDivision = division === "All" || r.division === division;
      return matchesQuery && matchesDivision;
    });
    data = [...data].sort((a, b) => {
      const dir = asc ? 1 : -1;
      if (typeof a[sortKey] === "number") return (a[sortKey] - b[sortKey]) * dir;
      return String(a[sortKey]).localeCompare(String(b[sortKey])) * dir;
    });
    return data;
  }, [query, division, sortKey, asc]);

  const toggleSort = (key) => {
    if (sortKey === key) setAsc(!asc);
    else {
      setSortKey(key);
      setAsc(true);
    }
  };

  const cols = [
    ["rank", "Rank"],
    ["name", "Agent"],
    ["nickname", "Callsign"],
    ["threatClass", "Threat Class"],
    ["xp", "XP"],
    ["missions", "Missions"],
    ["division", "Division"],
  ];

  return (
    <section id="leaderboard" className="relative py-24 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <Reveal>
          <SectionHeading title="Leaderboard" accent="#00D9FF" />
        </Reveal>

        <Reveal delay={0.1}>
          <div className="flex flex-col md:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search agent or callsign..."
                className="w-full glass rounded-md pl-9 pr-3 py-2.5 text-sm text-white/80 outline-none placeholder:text-white/30"
              />
            </div>
            <select
              value={division}
              onChange={(e) => setDivision(e.target.value)}
              className="glass rounded-md px-3 py-2.5 text-sm text-white/80 outline-none"
            >
              <option>All</option>
              {ALL_DIVISIONS.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="glass rounded-xl overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="border-b border-white/10 text-white/50 text-xs uppercase tracking-wider">
                  {cols.map(([key, label]) => (
                    <th key={key} className="text-left px-4 py-3 cursor-pointer select-none" onClick={() => toggleSort(key)}>
                      <span className="flex items-center gap-1">{label} <ArrowUpDown size={10} /></span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.rank} className="border-b border-white/5 hover:bg-[#00FF88]/5 transition">
                    <td className="px-4 py-3 font-display text-[#00FF88]">#{r.rank}</td>
                    <td className="px-4 py-3 text-white/80">{r.name}</td>
                    <td className="px-4 py-3 text-[#00D9FF]">{r.nickname}</td>
                    <td className="px-4 py-3 text-white/60 text-xs">{r.threatClass}</td>
                    <td className="px-4 py-3 text-white/80">{r.xp.toLocaleString()}</td>
                    <td className="px-4 py-3 text-white/60">{r.missions}</td>
                    <td className="px-4 py-3 text-white/50 text-xs">{r.division}</td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-white/30 text-sm">
                      No agents match that query.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Reveal>
      </div>
    </section>
  );
}