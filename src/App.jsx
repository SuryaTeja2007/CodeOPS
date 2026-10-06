import { useEffect, useRef, useState } from "react";
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
import AdminSectionControls from "./components/admin/AdminSectionControls";

export default function App() {
  const audioRef = useRef(null);
  const [booted, setBooted] = useState(() => {
    try {
      return sessionStorage.getItem("skipCodeOpsBoot") === "1";
    } catch {
      return false;
    }
  });
  const [sections, setSections] = useState({ home:true, stats:true, missionControl:true, events:true, notifications:true, agents:true, leaderboard:true, gallery:true, posters:true, contact:true });
  const [admin, setAdmin] = useState(null);
  const isAdminRoute = window.location.pathname === "/admin";

  useEffect(() => {
    try {
      if (booted) sessionStorage.removeItem("skipCodeOpsBoot");
    } catch {}
  }, [booted]);

  useEffect(() => () => audioRef.current?.pause(), []);

  const handleAudioChoice = (enabled) => {
    if (!enabled) return;
    const audio = new Audio("/bgm1.mp3");
    audio.loop = true;
    audio.volume = 0.35;
    audioRef.current = audio;
    audio.play().catch(() => { audioRef.current = null; });
  };

  useEffect(() => {
    api.siteSettings.get().then((data) => setSections(data.sections)).catch(() => {});
    api.me().then((data) => setAdmin(data.admin || null)).catch(() => setAdmin(null));
  }, []);

  if (isAdminRoute) return <AdminPanel />;

  return (
    <>
      {!booted && <BootSequence onAudioChoice={handleAudioChoice} onDone={() => setBooted(true)} />}
      <div className="fixed inset-0 opacity-25 pointer-events-none z-0">
        <MatrixRain />
      </div>
      <Navbar sections={sections} admin={admin} />
      <main>
        <AdminManagedSection sectionKey="home" label="Home" visible={sections.home} admin={admin} sections={sections} setSections={setSections}>
          <Home />
        </AdminManagedSection>
        <AdminManagedSection sectionKey="stats" label="Stats Dashboard" visible={sections.stats} admin={admin} sections={sections} setSections={setSections}>
          <StatsDashboard />
        </AdminManagedSection>
        <AdminManagedSection sectionKey="missionControl" label="Mission Control" visible={sections.missionControl} admin={admin} sections={sections} setSections={setSections}>
          <MissionControl />
        </AdminManagedSection>
        <AdminManagedSection sectionKey="events" label="Events" visible={sections.events} admin={admin} sections={sections} setSections={setSections}>
          <Events />
        </AdminManagedSection>
        <AdminManagedSection sectionKey="notifications" label="Notifications" visible={sections.notifications} admin={admin} sections={sections} setSections={setSections}>
          <AlertConsole />
        </AdminManagedSection>
        <AdminManagedSection sectionKey="agents" label="Agent Database" visible={sections.agents} admin={admin} sections={sections} setSections={setSections}>
          <AgentDatabase />
        </AdminManagedSection>
        <AdminManagedSection sectionKey="leaderboard" label="Leaderboard" visible={sections.leaderboard} admin={admin} sections={sections} setSections={setSections}>
          <Leaderboard />
        </AdminManagedSection>
        <AdminManagedSection sectionKey="gallery" label="Gallery" visible={sections.gallery} admin={admin} sections={sections} setSections={setSections}>
          <Gallery />
        </AdminManagedSection>
        <AdminManagedSection sectionKey="posters" label="Posters" visible={sections.posters} admin={admin} sections={sections} setSections={setSections}>
          <Posters />
        </AdminManagedSection>
        <AdminManagedSection sectionKey="contact" label="Contact" visible={sections.contact} admin={admin} sections={sections} setSections={setSections}>
          <Contact />
        </AdminManagedSection>
      </main>
      <Footer sections={sections} admin={admin} />
    </>
  );
}

function AdminManagedSection({ sectionKey, label, visible, admin, sections, setSections, children }) {
  if (!visible && !admin) return null;

  const isHiddenForPublic = !visible;
  return (
    <div className="relative">
      {admin ? (
        <>
          <AdminSectionControls
            sectionKey={sectionKey}
            label={label}
            visible={visible}
            sections={sections}
            setSections={setSections}
          />
          {isHiddenForPublic ? (
            <div className="absolute top-4 left-4 z-40 px-3 py-1.5 rounded border border-white/20 bg-black/80 text-white/50 font-mono text-[10px] font-bold uppercase tracking-wider pointer-events-none">
              Hidden from public website
            </div>
          ) : null}
        </>
      ) : null}
      <div className={isHiddenForPublic ? "grayscale opacity-40" : ""}>
        {children}
      </div>
    </div>
  );
}
