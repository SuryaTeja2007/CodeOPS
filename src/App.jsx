import { useState } from "react";
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
// import Register from "./components/sections/Register";
import Contact from "./components/sections/Contact";

export default function App() {
  const [booted, setBooted] = useState(false);

 return (
    <>
      {!booted && <BootSequence onDone={() => setBooted(true)} />}
      <div className="fixed inset-0 opacity-25 pointer-events-none z-0">
        <MatrixRain />
      </div>
      <Navbar />
      <main>
        <Home />
        <StatsDashboard />
        <MissionControl />
        <Events />
        {/* <Register /> */}
        <AlertConsole />
        <AgentDatabase />
        <Leaderboard />
        <Gallery />
        <Posters />
        <Contact />
      </main>
      <Footer />
    </>
  );
}