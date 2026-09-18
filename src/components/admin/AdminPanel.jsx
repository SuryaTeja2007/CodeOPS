import { useEffect, useState } from "react";
import { LogIn, LogOut, Plus, Shield, Trash2 } from "lucide-react";
import { api } from "../../lib/api";

const emptyEvent = {
  id: "",
  title: "",
  description: "",
  venue: "",
  deadline: "",
  status: "OPEN",
  poster: "",
  registerUrl: "",
};

export default function AdminPanel() {
  const [admin, setAdmin] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [events, setEvents] = useState([]);
  const [login, setLogin] = useState({ username: "", password: "" });
  const [newAdmin, setNewAdmin] = useState({ username: "", password: "" });
  const [event, setEvent] = useState(emptyEvent);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const { admin: current } = await api.me();
      setAdmin(current);
      if (current.role === "superadmin") {
        const [adminList, eventList] = await Promise.all([api.admins(), api.events()]);
        setAdmins(adminList);
        setEvents(eventList);
      } else {
        const { events: eventList } = await api.events();
        setEvents(eventList);
      }
    } catch {
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function showError(e) {
    setMessage("");
    setError(e.message);
  }

  async function handleLogin(e) {
    e.preventDefault();
    try {
      setError("");
      const result = await api.login(login.username, login.password);
      setAdmin(result.admin);
      setLogin({ username: "", password: "" });
      const eventList = await api.events();
      setEvents(eventList);
      if (result.admin.role === "superadmin") setAdmins(await api.admins());
    } catch (e) { showError(e); }
  }

  async function handleLogout() {
    await api.logout();
    setAdmin(null);
    setAdmins([]);
    setEvents([]);
  }

  async function handleAddAdmin(e) {
    e.preventDefault();
    try {
      const created = await api.addAdmin(newAdmin.username, newAdmin.password);
      setAdmins((items) => [...items, created]);
      setNewAdmin({ username: "", password: "" });
      setMessage("Admin account created.");
      setError("");
    } catch (e) { showError(e); }
  }

  async function handleRemoveAdmin(id) {
    if (!window.confirm("Remove this admin account?")) return;
    try {
      await api.removeAdmin(id);
      setAdmins((items) => items.filter((item) => item._id !== id && item.id !== id));
    } catch (e) { showError(e); }
  }

  function editEvent(item) {
    setEditingId(item._id);
    setEvent({
      id: item.id || "",
      title: item.title || "",
      description: item.description || "",
      venue: item.venue || "",
      deadline: item.deadline ? item.deadline.slice(0, 16) : "",
      status: item.status || "OPEN",
      poster: item.poster || "",
      registerUrl: item.registerUrl || "",
    });
  }

  async function handleEvent(e) {
    e.preventDefault();
    try {
      const payload = { ...event };
      let saved;
      if (editingId) {
        saved = await api.updateEvent(editingId, payload);
        setEvents((items) => items.map((item) => item._id === editingId ? saved : item));
      } else {
        saved = await api.addEvent(payload);
        setEvents((items) => [saved, ...items]);
      }
      setEvent(emptyEvent);
      setEditingId(null);
      setMessage(editingId ? "Event updated." : "Event created.");
      setError("");
    } catch (e) { showError(e); }
  }

  async function handleRemoveEvent(id) {
    if (!window.confirm("Delete this event?")) return;
    try {
      await api.removeEvent(id);
      setEvents((items) => items.filter((item) => item._id !== id));
    } catch (e) { showError(e); }
  }

  if (loading) return <div className="min-h-screen bg-[#050505] text-[#00FF88] flex items-center justify-center font-mono">AUTHENTICATING...</div>;

  const inputClass = "w-full bg-black/50 border border-[#00FF88]/20 rounded px-3 py-2 text-sm text-white placeholder-white/30 focus:border-[#00FF88] outline-none";
  const buttonClass = "inline-flex items-center justify-center gap-2 rounded px-4 py-2 bg-[#00FF88] text-black font-bold text-xs uppercase tracking-wider hover:brightness-110";

  if (!admin) {
    return (
      <main className="min-h-screen bg-[#050505] cyber-grid px-4 py-24 flex items-center justify-center">
        <form onSubmit={handleLogin} className="w-full max-w-md glass box-glow-neon rounded-lg p-7">
          <div className="flex items-center gap-3 mb-7 text-[#00FF88]">
            <Shield />
            <div>
              <div className="font-display font-bold tracking-widest">CODEOPS ADMIN</div>
              <div className="text-[10px] text-white/40 mt-1">SECURE CONTROL TERMINAL</div>
            </div>
          </div>
          {error && <div className="mb-4 border border-[#FF3B3B]/40 text-[#FF3B3B] p-3 text-xs">{error}</div>}
          <label className="block text-xs text-white/50 mb-2">USERNAME</label>
          <input className={inputClass + " mb-4"} value={login.username} onChange={(e) => setLogin({ ...login, username: e.target.value })} autoComplete="username" />
          <label className="block text-xs text-white/50 mb-2">PASSWORD</label>
          <input type="password" className={inputClass + " mb-6"} value={login.password} onChange={(e) => setLogin({ ...login, password: e.target.value })} autoComplete="current-password" />
          <button className={buttonClass + " w-full"}><LogIn size={15} /> Authenticate</button>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] cyber-grid px-4 md:px-8 py-24 text-white">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <div className="text-[#00FF88] text-xs tracking-[0.3em]">CONTROL // AUTHORIZED</div>
            <h1 className="font-display text-2xl md:text-3xl mt-2">ADMIN PANEL</h1>
            <p className="text-white/40 text-xs mt-2">{admin.username} · {admin.role}</p>
          </div>
          <button onClick={handleLogout} className="px-4 py-2 border border-white/20 rounded text-xs uppercase hover:border-[#00FF88]"><LogOut size={14} className="inline mr-2" />Logout</button>
        </header>

        {error && <div className="mb-4 border border-[#FF3B3B]/40 text-[#FF3B3B] p-3 text-xs">{error}</div>}
        {message && <div className="mb-4 border border-[#00FF88]/30 text-[#00FF88] p-3 text-xs">{message}</div>}

        <div className="grid lg:grid-cols-3 gap-6">
          {admin.role === "superadmin" && (
            <section className="glass rounded-lg p-5">
              <h2 className="font-display text-sm text-[#00FF88] mb-4">ADMIN ACCOUNTS</h2>
              <form onSubmit={handleAddAdmin} className="space-y-3 mb-6">
                <input className={inputClass} placeholder="Username" value={newAdmin.username} onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })} />
                <input type="password" className={inputClass} placeholder="Password (8+ chars)" value={newAdmin.password} onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })} />
                <button className={buttonClass}><Plus size={14} /> Add admin</button>
              </form>
              <div className="space-y-2">
                {admins.map((item) => (
                  <div key={item._id} className="flex items-center justify-between border border-white/10 rounded px-3 py-2 text-xs">
                    <span>{item.username} <span className="text-white/30">[{item.role}]</span></span>
                    {item._id !== admin.id && <button onClick={() => handleRemoveAdmin(item._id)} className="text-[#FF3B3B]"><Trash2 size={14} /></button>}
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="lg:col-span-2 glass rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-sm text-[#00D9FF]">{editingId ? "EDIT EVENT" : "CREATE EVENT"}</h2>
              {editingId && <button onClick={() => { setEditingId(null); setEvent(emptyEvent); }} className="text-xs text-white/50">Cancel</button>}
            </div>
            <form onSubmit={handleEvent} className="grid md:grid-cols-2 gap-3">
              {Object.entries(event).map(([key, value]) => (
                <input key={key} type={key === "deadline" ? "datetime-local" : "text"} className={inputClass} placeholder={key.toUpperCase()} value={value} onChange={(e) => setEvent({ ...event, [key]: e.target.value })} required={["id","title","description","venue","deadline","registerUrl"].includes(key)} />
              ))}
              <button className={buttonClass + " md:col-span-2"}><Plus size={14} /> {editingId ? "Save event" : "Create event"}</button>
            </form>
          </section>
        </div>

        <section className="glass rounded-lg p-5 mt-6">
          <h2 className="font-display text-sm text-[#00D9FF] mb-4">MISSION FILES</h2>
          <div className="space-y-2">
            {events.map((item) => (
              <div key={item._id} className="flex flex-wrap items-center justify-between gap-3 border border-white/10 rounded px-3 py-3 text-xs">
                <div>
                  <span className="text-[#00D9FF] mr-3">{item.id}</span>
                  <span>{item.title}</span>
                  <span className="text-white/30 ml-3">{item.status}</span>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => editEvent(item)} className="text-[#00D9FF]">EDIT</button>
                  <button onClick={() => handleRemoveEvent(item._id)} className="text-[#FF3B3B]">DELETE</button>
                </div>
              </div>
            ))}
            {!events.length && <div className="text-white/30 text-xs">No events in database.</div>}
          </div>
        </section>
      </div>
    </main>
  );
}
