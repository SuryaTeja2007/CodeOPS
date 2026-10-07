import { useEffect, useState } from "react";
import { ArrowLeft, ExternalLink, LogIn, LogOut, Plus, Shield, Trash2, Pencil, Upload } from "lucide-react";
import { api, resolveAssetUrl } from "../../lib/api";

const emptyEvent = { code:"", title:"", description:"", venue:"", deadline:"", status:"OPEN", poster:"", registerUrl:"" };
const emptyLeaderboard = { name:"", nickname:"", threatClass:"", division:"", xp:0, missions:0 };
const emptyAgent = { id:"", name:"", nickname:"", department:"", status:"Online", position:"", clearance:0, xp:0, missions:0, language:"", github:"", linkedin:"", portfolio:"", joined:"", photo:"" };
const emptyGallery = { title:"", category:"Events", img:"" };
const emptyPoster = { title:"", img:"", downloadUrl:"" };
const emptyContact = { facultyCoordinator:"", hod:"", email:"", facebook:"", linkedin:"", instagram:"", discord:"", mapUrl:"" };

const TABS = [
  ["events","Events"], ["stats","Stats Dashboard"], ["leaderboard","Leaderboard"], ["agents","Agent Database"],
  ["gallery","Gallery"], ["posters","Posters"], ["contact","Contact"], ["media","Media Library"], ["visibility","Section Visibility"]
];

const inputClass = "w-full bg-black/50 border border-[#00FF88]/20 rounded px-3 py-2 text-sm text-white placeholder-white/30 focus:border-[#00FF88] outline-none";
const buttonClass = "inline-flex items-center justify-center gap-2 rounded px-4 py-2 bg-[#00FF88] text-black font-bold text-xs uppercase tracking-wider hover:brightness-110";
const secondaryClass = "inline-flex items-center justify-center gap-2 rounded px-3 py-2 border border-white/15 text-white/70 text-xs uppercase hover:border-[#00FF88] hover:text-[#00FF88]";

export default function AdminPanel() {
  const [admin, setAdmin] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [login, setLogin] = useState({ username:"", password:"" });
  const [tab, setTab] = useState(() => new URLSearchParams(window.location.search).get("tab") || "events");
  const [events, setEvents] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [agents, setAgents] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [posters, setPosters] = useState([]);
  const [media, setMedia] = useState([]);
  const [contact, setContact] = useState(emptyContact);
  const [sections, setSections] = useState({ home:true, stats:true, missionControl:true, events:true, notifications:true, agents:true, leaderboard:true, gallery:true, posters:true, contact:true });
  const [stats, setStats] = useState({ communityMembers:0, projectsCompleted:0, workshopsConducted:0, hackathonsOrganised:0 });
  const [event, setEvent] = useState(emptyEvent);
  const [leader, setLeader] = useState(emptyLeaderboard);
  const [agent, setAgent] = useState(emptyAgent);
  const [galleryItem, setGalleryItem] = useState(emptyGallery);
  const [poster, setPoster] = useState(emptyPoster);
  const [editing, setEditing] = useState(null);
  const [newAdmin, setNewAdmin] = useState({ username:"", password:"" });
  const [upload, setUpload] = useState({ title:"", kind:"image", file:null });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const fail = (e) => { setMessage(""); setError(e?.message || "Request failed"); };

  useEffect(() => {
    if (!error && !message) return;
    const timer = window.setTimeout(() => {
      setError("");
      setMessage("");
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [error, message]);

  const clearForm = () => {
    setEditing(null); setEvent(emptyEvent); setLeader(emptyLeaderboard);
    setAgent(emptyAgent); setGalleryItem(emptyGallery); setPoster(emptyPoster);
  };

  async function loadAll() {
    try {
      const { admin: current } = await api.me();
      setAdmin(current);
      const [e,l,a,g,p,c,settings,s] = await Promise.all([
        api.events(), api.leaderboard.list(), api.agents.list(), api.gallery.list(), api.posters.list(),
        api.contact.get(), api.siteSettings.get(), api.stats.get()
      ]);
      setEvents(e); setLeaderboard(l); setAgents(a); setGallery(g); setPosters(p);
      setContact(Object.fromEntries(Object.keys(emptyContact).map((key) => [key, c?.[key] || ""])));
      setSections(settings?.sections || { home:true, stats:true, missionControl:true, events:true, notifications:true, agents:true, leaderboard:true, gallery:true, posters:true, contact:true });
      setStats({ communityMembers: s?.communityMembers || 0, projectsCompleted: s?.projectsCompleted || 0, workshopsConducted: s?.workshopsConducted || 0, hackathonsOrganised: s?.hackathonsOrganised || 0 });
      if (current.role === "superadmin") setAdmins(await api.admins());
      setMedia(await api.media.list());
    } catch { setAdmin(null); } finally { setLoading(false); }
  }

  useEffect(() => { loadAll(); }, []);

  async function handleLogin(e) {
    e.preventDefault();
    try {
      const result = await api.login(login.username, login.password);
      setAdmin(result.admin); setLogin({ username:"", password:"" }); await loadAll();
    } catch (e) { fail(e); }
  }

  async function logout() {
    try { await api.logout(); } finally { setAdmin(null); setAdmins([]); }
  }

  async function save(resource, payload, reset) {
    try {
      const isEdit = editing?.resource === resource;
      const saved = isEdit ? await api[resource].update(editing.id, payload) : await api[resource].add(payload);
      const setters = { leaderboard:setLeaderboard, agents:setAgents, gallery:setGallery, posters:setPosters };
      const setter = setters[resource];
      if (setter) setter((items) => isEdit ? items.map((item) => item._id === editing.id ? saved : item) : [saved, ...items]);
      setEditing(null); reset(); setMessage(isEdit ? "Updated successfully." : "Created successfully."); setError("");
    } catch (e) { fail(e); }
  }

  async function remove(resource, id, setter) {
    if (!window.confirm("Delete this item?")) return;
    try {
      await api[resource].remove(id); setter((items) => items.filter((item) => item._id !== id));
      setMessage("Deleted."); setError("");
    } catch (e) { fail(e); }
  }

  function edit(resource, item) {
    setEditing({ resource, id:item._id });
    if (resource === "events") setEvent({
      ...emptyEvent,
      ...Object.fromEntries(Object.keys(emptyEvent).map((key) => [
        key, key === "deadline" ? (item.deadline ? item.deadline.slice(0,16) : "") : (item[key] ?? emptyEvent[key])
      ]))
    });
    if (resource === "leaderboard") setLeader({ ...emptyLeaderboard, ...item });
    if (resource === "agents") setAgent({ ...emptyAgent, ...item });
    if (resource === "gallery") setGalleryItem({ ...emptyGallery, ...item });
    if (resource === "posters") setPoster({ ...emptyPoster, ...item });
  }

  async function saveEvent(e) {
    e.preventDefault();
    try {
      const isEdit = editing?.resource === "events";
      const saved = isEdit ? await api.updateEvent(editing.id, event) : await api.addEvent(event);
      setEvents((items) => isEdit ? items.map((item) => item._id === editing.id ? saved : item) : [saved, ...items]);
      clearForm(); setMessage(isEdit ? "Event updated." : "Event created."); setError("");
    } catch (e) { fail(e); }
  }

  async function removeEvent(id) {
    if (!window.confirm("Delete this event?")) return;
    try {
      await api.removeEvent(id); setEvents((items) => items.filter((item) => item._id !== id));
      setMessage("Event deleted."); setError("");
    } catch (e) { fail(e); }
  }

  async function saveContact(e) {
    e.preventDefault();
    try {
      const saved = await api.contact.update(contact);
      setContact(Object.fromEntries(Object.keys(emptyContact).map((key) => [key, saved?.[key] || ""])));
      setMessage("Contact section updated."); setError("");
    } catch (e) { fail(e); }
  }

  async function addAdmin(e) {
    e.preventDefault();
    try {
      const created = await api.addAdmin(newAdmin.username, newAdmin.password);
      setAdmins((items) => [...items, created]); setNewAdmin({ username:"", password:"" });
      setMessage("Admin account created."); setError("");
    } catch (e) { fail(e); }
  }

  async function removeAdmin(id) {
    if (!window.confirm("Remove this admin account?")) return;
    try { await api.removeAdmin(id); setAdmins((items) => items.filter((item) => item._id !== id)); setError(""); }
    catch (e) { fail(e); }
  }

  async function uploadMedia(e) {
    e.preventDefault();
    if (!upload.file) { setError("Choose an image first."); return; }
    try {
      const item = await api.media.upload(upload.file, upload.title, upload.kind);
      setMedia((items) => [item, ...items]); setUpload({ title:"", kind:"image", file:null });
      e.currentTarget.reset(); setMessage("Image uploaded to the media library."); setError("");
    } catch (e) { fail(e); }
  }

  async function removeMedia(id) {
    if (!window.confirm("Delete this media? It will be blocked if still in use.")) return;
    try {
      await api.media.remove(id); setMedia((items) => items.filter((item) => item._id !== id));
      setMessage("Media deleted."); setError("");
    } catch (e) { fail(e); }
  }

  async function uploadInlineMedia(file, kind, onChange) {
    if (!file) return;
    try {
      const item = await api.media.upload(file, "", kind);
      setMedia((items) => [item, ...items]); onChange(item.url);
      setMessage("Image uploaded and selected."); setError("");
    } catch (e) { fail(e); }
  }

  const mediaSelect = (value, onChange, label = "IMAGE / POSTER", allowUpload = false) => (
    <div>
      <label className="block text-[10px] text-white/40 mb-1">{label}</label>
      <div>
        <select
          className={inputClass}
          value={value || ""}
          onChange={(e) => {
            const selected = e.target.value;
            if (selected === "__UPLOAD_NEW__") {
              const fileInput = e.currentTarget.parentElement.querySelector('input[type="file"]');
              if (fileInput) fileInput.click();
              e.currentTarget.value = value || "";
              return;
            }
            onChange(selected);
          }}
        >
          <option value="">Select from media library</option>
          {media.map((item) => <option key={item._id} value={item.url}>{item.title || item.url} [{item.kind}]</option>)}
          {allowUpload ? <option value="__UPLOAD_NEW__">+ Upload new image...</option> : null}
        </select>
        {allowUpload ? (
          <input type="file" accept="image/*" className="hidden" onChange={(e) => {
            uploadInlineMedia(e.target.files?.[0], label.toLowerCase().includes("poster") ? "poster" : "image", onChange);
            e.target.value = "";
          }} />
        ) : null}
      </div>
      {allowUpload ? <div className="text-[10px] text-white/30 mt-1">Select “+ Upload new image...” to upload directly from this field. The image is added to the media library automatically.</div> : null}
      {value ? <img src={resolveAssetUrl(value)} alt="" className="mt-2 h-20 w-16 object-cover rounded border border-white/10" /> : null}
    </div>
  );

  if (loading) return <div className="min-h-screen bg-[#050505] text-[#00FF88] flex items-center justify-center font-mono">AUTHENTICATING...</div>;

  if (!admin) {
    return (
      <main className="min-h-screen bg-[#050505] cyber-grid px-4 py-24 flex items-center justify-center">
        <form onSubmit={handleLogin} className="w-full max-w-md glass box-glow-neon rounded-lg p-7">
          <div className="flex items-center gap-3 mb-7 text-[#00FF88]"><Shield /><div><div className="font-display font-bold tracking-widest">CODEOPS ADMIN</div><div className="text-[10px] text-white/40 mt-1">SECURE CONTROL TERMINAL</div></div></div>
          {error ? <div className="mb-4 border border-[#FF3B3B]/40 text-[#FF3B3B] p-3 text-xs">{error}</div> : null}
          <label className="block text-xs text-white/50 mb-2">USERNAME</label>
          <input className={inputClass + " mb-4"} value={login.username} onChange={(e) => setLogin({ ...login, username:e.target.value })} />
          <label className="block text-xs text-white/50 mb-2">PASSWORD</label>
          <input type="password" className={inputClass + " mb-6"} value={login.password} onChange={(e) => setLogin({ ...login, password:e.target.value })} />
          <div className="flex flex-wrap items-center gap-2">
            <button className={buttonClass} type="submit"><LogIn size={15} />Authenticate</button>
            <a href="/" onClick={() => { try { sessionStorage.setItem("skipCodeOpsBoot", "1"); } catch {} }} className={secondaryClass}><ArrowLeft size={14} />Back to website</a>
          </div>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] cyber-grid px-4 md:px-8 py-24 text-white">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div><h1 className="font-display text-2xl md:text-3xl">ADMIN PANEL</h1><p className="text-white/40 text-xs mt-2">{admin.username} · {admin.role}</p></div>
          <div className="flex flex-wrap gap-2">
            <a href="/" onClick={() => { try { sessionStorage.setItem("skipCodeOpsBoot", "1"); } catch {} }} className={secondaryClass}><ExternalLink size={14} />View website</a>
            <button onClick={logout} className={secondaryClass}><LogOut size={14} />Logout</button>
          </div>
        </header>
        {error ? <div className="mb-4 border border-[#FF3B3B]/40 text-[#FF3B3B] p-3 text-xs">{error}</div> : null}
        {message ? <div className="mb-4 border border-[#00FF88]/30 text-[#00FF88] p-3 text-xs">{message}</div> : null}
        <div className="flex flex-wrap gap-2 mb-6">{TABS.map(([id,label]) => <button key={id} onClick={() => { setTab(id); clearForm(); }} className={"px-3 py-2 rounded border text-[10px] uppercase tracking-wider " + (tab === id ? "bg-[#00FF88] text-black border-[#00FF88]" : "border-white/15 text-white/60 hover:text-[#00FF88]")}>{label}</button>)}</div>

        {admin.role === "superadmin" ? (
          <section className="glass rounded-lg p-4 mb-6">
            <div className="flex flex-wrap items-center gap-3"><strong className="font-display text-xs text-[#00FF88]">ADMIN ACCOUNTS</strong><form onSubmit={addAdmin} className="flex flex-wrap gap-2 flex-1"><input className={inputClass + " max-w-xs"} placeholder="Username" value={newAdmin.username} onChange={(e) => setNewAdmin({ ...newAdmin, username:e.target.value })} /><input type="password" className={inputClass + " max-w-xs"} placeholder="Password (8+ chars)" value={newAdmin.password} onChange={(e) => setNewAdmin({ ...newAdmin, password:e.target.value })} /><button className={buttonClass} type="submit"><Plus size={14} />Add admin</button></form></div>
            <div className="flex flex-wrap gap-2 mt-3">{admins.map((item) => <div key={item._id} className="border border-white/10 rounded px-3 py-2 text-xs">{item.username} <span className="text-white/30">[{item.role}]</span>{item._id !== admin.id ? <button onClick={() => removeAdmin(item._id)} className="ml-3 text-[#FF3B3B]"><Trash2 size={13} className="inline" /></button> : null}</div>)}</div>
          </section>
        ) : null}

        {tab === "events" ? (
          <Section title={editing?.resource === "events" ? "EDIT EVENT" : "CREATE EVENT"}>
            <form onSubmit={saveEvent} className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-white/40 mb-1">EVENT ID / CODE (optional)</label>
                <input className={inputClass} placeholder="e.g. CX-002 — leave blank to auto-generate" value={event.code} onChange={(e) => setEvent({ ...event, code:e.target.value })} />
              </div>
              <input required className={inputClass} placeholder="EVENT TITLE" value={event.title} onChange={(e) => setEvent({ ...event, title:e.target.value })} />
              <textarea required className={inputClass + " md:col-span-2"} rows={3} placeholder="DESCRIPTION" value={event.description} onChange={(e) => setEvent({ ...event, description:e.target.value })} />
              <input required className={inputClass} placeholder="VENUE" value={event.venue} onChange={(e) => setEvent({ ...event, venue:e.target.value })} />
              <input required type="datetime-local" className={inputClass} value={event.deadline} onChange={(e) => setEvent({ ...event, deadline:e.target.value })} />
              <input className={inputClass} placeholder="STATUS" value={event.status} onChange={(e) => setEvent({ ...event, status:e.target.value })} />
              <input className={inputClass} placeholder="REGISTRATION URL (optional)" value={event.registerUrl} onChange={(e) => setEvent({ ...event, registerUrl:e.target.value })} />
              <div className="md:col-span-2">{mediaSelect(event.poster, (value) => setEvent({ ...event, poster:value }), "POSTER (optional)", true)}</div>
              <div className="flex gap-2 md:col-span-2"><button className={buttonClass} type="submit">{editing ? "Save event" : "Create event"}</button>{editing ? <button type="button" className={secondaryClass} onClick={clearForm}>Cancel</button> : null}</div>
            </form>
            <List items={events} render={(item) => <span><span className="text-[#00D9FF] mr-3">{item.code}</span>{item.title}</span>} onEdit={(item) => edit("events", item)} onDelete={removeEvent} />
          </Section>
        ) : null}

        {tab === "stats" ? <Section title="MANAGE STATS DASHBOARD">
          <p className="text-xs text-white/40 mb-4">Active Agents and Total XP Earned are calculated automatically from the agent database. Update the other values here.</p>
          <form onSubmit={async (e) => {
            e.preventDefault();
            try {
              const saved = await api.stats.update(stats);
              setStats({
                communityMembers: saved.communityMembers || 0,
                projectsCompleted: saved.projectsCompleted || 0,
                workshopsConducted: saved.workshopsConducted || 0,
                hackathonsOrganised: saved.hackathonsOrganised || 0,
              });
              setMessage("Stats dashboard updated."); setError("");
            } catch (e) { fail(e); }
          }} className="grid md:grid-cols-2 gap-3">
            {[
              ["communityMembers","COMMUNITY MEMBERS"],
              ["projectsCompleted","PROJECTS COMPLETED"],
              ["workshopsConducted","WORKSHOPS CONDUCTED"],
              ["hackathonsOrganised","HACKATHONS ORGANISED"],
            ].map(([key,label]) => (
              <div key={key}>
                <label className="block text-[10px] text-white/40 mb-1">{label}</label>
                <input type="number" min="0" className={inputClass} value={stats[key]} onChange={(e) => setStats({ ...stats, [key]:Number(e.target.value) })} />
              </div>
            ))}
            <button className={buttonClass + " md:col-span-2"} type="submit">Save stats dashboard</button>
          </form>
        </Section> : null}

        {tab === "leaderboard" ? <Section title="MANAGE LEADERBOARD"><form onSubmit={(e) => { e.preventDefault(); save("leaderboard", leader, () => setLeader(emptyLeaderboard)); }} className="grid md:grid-cols-3 gap-3"><input required className={inputClass} placeholder="NAME" value={leader.name} onChange={(e) => setLeader({ ...leader, name:e.target.value })} /><input className={inputClass} placeholder="CALLSIGN" value={leader.nickname} onChange={(e) => setLeader({ ...leader, nickname:e.target.value })} /><input className={inputClass} placeholder="THREAT CLASS" value={leader.threatClass} onChange={(e) => setLeader({ ...leader, threatClass:e.target.value })} /><input className={inputClass} placeholder="DIVISION" value={leader.division} onChange={(e) => setLeader({ ...leader, division:e.target.value })} /><div>
                <label className="block text-[10px] text-white/40 mb-1">EXPERIENCE POINTS (XP)</label>
                <input type="number" min="0" className={inputClass} placeholder="e.g. 24800" value={leader.xp} onChange={(e) => setLeader({ ...leader, xp:Number(e.target.value) })} />
              </div>
              <div>
                <label className="block text-[10px] text-white/40 mb-1">MISSIONS COMPLETED</label>
                <input type="number" min="0" className={inputClass} placeholder="e.g. 81" value={leader.missions} onChange={(e) => setLeader({ ...leader, missions:Number(e.target.value) })} />
              </div><div className="flex gap-2 md:col-span-3"><button className={buttonClass} type="submit">{editing?.resource === "leaderboard" ? "Save" : "Add"} leaderboard entry</button>{editing?.resource === "leaderboard" ? <button type="button" className={secondaryClass} onClick={clearForm}>Cancel</button> : null}</div></form><List items={leaderboard} render={(item) => <span><span className="text-[#00D9FF]">{item.name}</span><span className="text-white/40 ml-3">{item.xp} XP · {item.division}</span></span>} onEdit={(item) => edit("leaderboard", item)} onDelete={(id) => remove("leaderboard", id, setLeaderboard)} /></Section> : null}

        {tab === "agents" ? <Section title="MANAGE AGENT DATABASE"><form onSubmit={(e) => { e.preventDefault(); save("agents", agent, () => setAgent(emptyAgent)); }} className="grid md:grid-cols-3 gap-3">{[["id","AGENT ID"],["name","NAME"],["nickname","CALLSIGN"],["department","DEPARTMENT"],["status","STATUS"],["position","POSITION"],["language","LANGUAGE"],["joined","JOINED"],["github","GITHUB URL"],["linkedin","LINKEDIN URL"],["portfolio","PORTFOLIO URL"]].map(([key,placeholder]) => <input key={key} className={inputClass} placeholder={placeholder} value={agent[key]} onChange={(e) => setAgent({ ...agent, [key]:e.target.value })} required={["id","name","nickname"].includes(key)} />)}<input type="number" className={inputClass} placeholder="CLEARANCE / 10" value={agent.clearance} onChange={(e) => setAgent({ ...agent, clearance:Number(e.target.value) })} /><input type="number" className={inputClass} placeholder="XP" value={agent.xp} onChange={(e) => setAgent({ ...agent, xp:Number(e.target.value) })} /><input type="number" className={inputClass} placeholder="MISSIONS" value={agent.missions} onChange={(e) => setAgent({ ...agent, missions:Number(e.target.value) })} /><div className="md:col-span-3">{mediaSelect(agent.photo, (value) => setAgent({ ...agent, photo:value }), "PROFILE IMAGE", true)}</div><div className="flex gap-2 md:col-span-3"><button className={buttonClass} type="submit">{editing?.resource === "agents" ? "Save" : "Add"} agent</button>{editing?.resource === "agents" ? <button type="button" className={secondaryClass} onClick={clearForm}>Cancel</button> : null}</div></form><List items={agents} render={(item) => <span><span className="text-[#00D9FF]">{item.id}</span><span className="ml-3">{item.name} · {item.nickname}</span></span>} onEdit={(item) => edit("agents", item)} onDelete={(id) => remove("agents", id, setAgents)} /></Section> : null}

        {tab === "gallery" ? <Section title="MANAGE GALLERY"><form onSubmit={(e) => { e.preventDefault(); save("gallery", galleryItem, () => setGalleryItem(emptyGallery)); }} className="grid md:grid-cols-2 gap-3"><input className={inputClass} placeholder="TITLE (optional)" value={galleryItem.title} onChange={(e) => setGalleryItem({ ...galleryItem, title:e.target.value })} /><input required className={inputClass} placeholder="CATEGORY" value={galleryItem.category} onChange={(e) => setGalleryItem({ ...galleryItem, category:e.target.value })} /><div className="md:col-span-2">{mediaSelect(galleryItem.img, (value) => setGalleryItem({ ...galleryItem, img:value }), "GALLERY IMAGE", true)}</div><div className="flex gap-2 md:col-span-2"><button className={buttonClass} type="submit">{editing?.resource === "gallery" ? "Save" : "Add"} gallery image</button>{editing?.resource === "gallery" ? <button type="button" className={secondaryClass} onClick={clearForm}>Cancel</button> : null}</div></form><List items={gallery} render={(item) => <span><span className="text-[#00D9FF]">{item.category}</span><span className="ml-3">{item.title || "Untitled image"}</span></span>} onEdit={(item) => edit("gallery", item)} onDelete={(id) => remove("gallery", id, setGallery)} /></Section> : null}

        {tab === "posters" ? <Section title="MANAGE POSTERS"><form onSubmit={(e) => { e.preventDefault(); save("posters", poster, () => setPoster(emptyPoster)); }} className="grid md:grid-cols-2 gap-3"><input required className={inputClass} placeholder="POSTER TITLE" value={poster.title} onChange={(e) => setPoster({ ...poster, title:e.target.value })} /><input className={inputClass} placeholder="DOWNLOAD URL (optional)" value={poster.downloadUrl} onChange={(e) => setPoster({ ...poster, downloadUrl:e.target.value })} /><div className="md:col-span-2">{mediaSelect(poster.img, (value) => setPoster({ ...poster, img:value }), "POSTER IMAGE — REUSE AN EXISTING UPLOAD", true)}</div><div className="flex gap-2 md:col-span-2"><button className={buttonClass} type="submit">{editing?.resource === "posters" ? "Save" : "Add"} poster</button>{editing?.resource === "posters" ? <button type="button" className={secondaryClass} onClick={clearForm}>Cancel</button> : null}</div></form><List items={posters} render={(item) => <span className="text-[#00D9FF]">{item.title}</span>} onEdit={(item) => edit("posters", item)} onDelete={(id) => remove("posters", id, setPosters)} /></Section> : null}

        {tab === "visibility" ? <Section title="CONTROL WEBSITE SECTIONS"><p className="text-xs text-white/40 mb-4">Turn sections on or off without deleting their content. Hidden sections are removed from the public website and their navigation links are hidden too.</p><form onSubmit={async (e) => { e.preventDefault(); try { const saved = await api.siteSettings.update(sections); setSections(saved.sections); setMessage("Website section visibility updated."); setError(""); } catch (e) { fail(e); } }} className="space-y-3">{[["home","Home"],["stats","Stats Dashboard"],["missionControl","Mission Control"],["events","Events"],["notifications","Notifications"],["agents","Agent Database"],["leaderboard","Leaderboard"],["gallery","Gallery"],["posters","Posters"],["contact","Contact"]].map(([key,label]) => <label key={key} className="flex items-center justify-between gap-4 border border-white/10 rounded px-4 py-3 cursor-pointer"><span><span className="block text-sm">{label}</span><span className="text-[10px] text-white/30">{sections[key] ? "VISIBLE ON WEBSITE" : "HIDDEN FROM WEBSITE"}</span></span><button
                type="button"
                role="switch"
                aria-checked={!!sections[key]}
                aria-label={`Toggle ${label} section`}
                onClick={() => setSections({ ...sections, [key]:!sections[key] })}
                className={`min-w-[86px] px-3 py-2 rounded border font-mono text-[10px] font-bold uppercase tracking-wider transition-colors ${sections[key] ? "bg-[#00FF88] text-black border-[#00FF88]" : "bg-[#FF3B3B]/10 text-[#FF3B3B] border-[#FF3B3B]/50"}`}
              >
                {sections[key] ? "ON — VISIBLE" : "OFF — HIDDEN"}
              </button></label>)}<button className={buttonClass} type="submit">Save section visibility</button></form></Section> : null}

        {tab === "contact" ? <Section title="MANAGE CONTACT SECTION"><form onSubmit={saveContact} className="grid md:grid-cols-2 gap-3">{Object.entries(contact).map(([key,value]) => <div key={key}><label className="block text-[10px] text-white/40 mb-1">{key.replace(/([A-Z])/g, " $1").toUpperCase()}</label><input className={inputClass} value={value || ""} onChange={(e) => setContact({ ...contact, [key]:e.target.value })} /></div>)}<button className={buttonClass + " md:col-span-2"} type="submit">Save contact section</button></form></Section> : null}

        {tab === "media" ? <Section title="MEDIA LIBRARY"><form onSubmit={uploadMedia} className="grid md:grid-cols-3 gap-3 mb-6"><input className={inputClass} placeholder="MEDIA TITLE (optional)" value={upload.title} onChange={(e) => setUpload({ ...upload, title:e.target.value })} /><select className={inputClass} value={upload.kind} onChange={(e) => setUpload({ ...upload, kind:e.target.value })}><option value="image">Image</option><option value="poster">Poster</option></select><input required type="file" accept="image/*" className={inputClass + " file:text-white/60"} onChange={(e) => setUpload({ ...upload, file:e.target.files?.[0] || null })} /><button className={buttonClass + " md:col-span-3"} type="submit"><Upload size={14} />Upload to library</button></form><div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">{media.map((item) => <div key={item._id} className="border border-white/10 rounded p-3"><img src={resolveAssetUrl(item.url)} alt={item.title || ""} className="w-full h-40 object-cover rounded mb-3" /><div className="text-xs text-white/70 truncate">{item.title || "Untitled"}</div><div className="text-[10px] text-white/30 mb-2">{item.kind}</div><button onClick={() => removeMedia(item._id)} className="text-[#FF3B3B] text-xs uppercase">Delete</button></div>)}</div></Section> : null}
      </div>
    </main>
  );
}

function Section({ title, children }) { return <section className="glass rounded-lg p-5"><h2 className="font-display text-sm text-[#00D9FF] mb-4">{title}</h2>{children}</section>; }

function List({ items, render, onEdit, onDelete }) {
  return <div className="mt-6 space-y-2">
    {items.map((item) => <div key={item._id} className="flex flex-wrap items-center justify-between gap-3 border border-white/10 rounded px-3 py-3 text-xs"><div>{render(item)}</div><div className="flex gap-3"><button type="button" onClick={() => onEdit(item)} className="text-[#00D9FF]"><Pencil size={14} /></button><button type="button" onClick={() => onDelete(item._id)} className="text-[#FF3B3B]"><Trash2 size={14} /></button></div></div>)}
    {!items.length ? <div className="text-white/30 text-xs">No entries yet.</div> : null}
  </div>;
}
