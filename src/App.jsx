import { useEffect, useState } from "react";
import BootSequence from "./components/boot/BootSequence";
import MatrixRain from "./components/ui/MatrixRain";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import Home from "./components/sections/Home";
import StatsDashboard from "./components/sections/StatsDashboard";
import MissionControl from "./components/sections/MissionControl";
import Events from "./components/sections/Events";
import AlertConsole from "./components/sections/AlertConsole";
import AgentDatabase from "./components/sections/AgentDatabase";
import Leaderboard from "./components/sections/Leaderboard";
import Gallery from "./components/sections/Gallery";
import Posters from "./components/sections/Posters";
import Contact from "./components/sections/Contact";
import AdminPanel from "./components/admin/AdminPanel";
import { api } from "./lib/api";

export default function App() {
  const [booted, setBooted] = useState(() => {
    try {
      return sessionStorage.getItem("skipCodeOpsBoot") === "1";
    } catch {
      return false;
    }
  });
  const [sections, setSections] = useState({ home:true, stats:true, missionControl:true, events:true, notifications:true, agents:true, leaderboard:true, gallery:true, posters:true, contact:true });
  const isAdminRoute = window.location.pathname === "/admin";

  useEffect(() => {
    try {
      if (booted) sessionStorage.removeItem("skipCodeOpsBoot");
    } catch {}
  }, [booted]);

  useEffect(() => { api.siteSettings.get().then((data) => setSections(data.sections)).catch(() => {}); }, []);

  if (isAdminRoute) return <AdminPanel />;

  return (
    <>
      {!booted && <BootSequence onDone={() => setBooted(true)} />}
      <div className="fixed inset-0 opacity-25 pointer-events-none z-0">
        <MatrixRain />
      </div>
      <Navbar sections={sections} />
      <main>
        {sections.home && <Home />}
        {sections.stats && <StatsDashboard />}
        {sections.missionControl && <MissionControl />}
        {sections.events && <Events />}
        {sections.notifications && <AlertConsole />}
        {sections.agents && <AgentDatabase />}
        {sections.leaderboard && <Leaderboard />}
        {sections.gallery && <Gallery />}
        {sections.posters && <Posters />}
        {sections.contact && <Contact />}
      </main>
      <Footer sections={sections} />
    </>
  );
}