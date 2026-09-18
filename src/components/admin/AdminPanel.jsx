import { useEffect, useMemo, useState } from "react";
import { LogIn, LogOut, Plus, Shield, Trash2, Pencil, Upload } from "lucide-react";
import { api, resolveAssetUrl } from "../../lib/api";

const emptyEvent={title:"",description:"",venue:"",deadline:"",status:"OPEN",poster:"",registerUrl:""};
const emptyLeaderboard={name:"",nickname:"",threatClass:"",division:"",xp:0,missions:0};
const emptyAgent={id:"",name:"",nickname:"",division:"",status:"Online",threatClass:"",clearance:0,xp:0,missions:0,language:"",project:"",github:"",linkedin:"",portfolio:"",joined:"",photo:""};
const emptyGallery={title:"",category:"Events",img:""};
const emptyPoster={title:"",img:"",downloadUrl:""};
const emptyContact={facultyCoordinator:"",hod:"",email:"",facebook:"",linkedin:"",instagram:"",discord:"",mapUrl:""};

const TABS=[
  ["events","Events"],["leaderboard","Leaderboard"],["agents","Agent Database"],
  ["gallery","Gallery"],["posters","Posters"],["contact","Contact"],["media","Media Library"]
];

export default function AdminPanel(){
  const [admin,setAdmin]=useState(null); const [admins,setAdmins]=useState([]); const [login,setLogin]=useState({username:"",password:""});
  const [tab,setTab]=useState("events"); const [events,setEvents]=useState([]); const [leaderboard,setLeaderboard]=useState([]);
  const [agents,setAgents]=useState([]); const [gallery,setGallery]=useState([]); const [posters,setPosters]=useState([]); const [media,setMedia]=useState([]); const [contact,setContact]=useState(emptyContact);
  const [event,setEvent]=useState(emptyEvent); const [leader,setLeader]=useState(emptyLeaderboard); const [agent,setAgent]=useState(emptyAgent); const [galleryItem,setGalleryItem]=useState(emptyGallery); const [poster,setPoster]=useState(emptyPoster);
  const [editing,setEditing]=useState(null); const [newAdmin,setNewAdmin]=useState({username:"",password:""}); const [upload,setUpload]=useState({title:"",kind:"image",file:null});
  const [error,setError]=useState(""); const [message,setMessage]=useState(""); const [loading,setLoading]=useState(true);

  async function loadAll(){
    try{
      const {admin:current}=await api.me(); setAdmin(current);
      const [e,l,a,g,p,c]=await Promise.all([api.events(),api.leaderboard.list(),api.agents.list(),api.gallery.list(),api.posters.list(),api.contact.get()]);
      setEvents(e); setLeaderboard(l); setAgents(a); setGallery(g); setPosters(p); setContact(Object.fromEntries(Object.keys(emptyContact).map(k=>[k,c[k]||""])));
      if(current.role==="superadmin") setAdmins(await api.admins());
      setMedia(await api.media.list());
    }catch{setAdmin(null);}finally{setLoading(false);}
  }
  useEffect(()=>{loadAll();},[]);

  const inputClass="w-full bg-black/50 border border-[#00FF88]/20 rounded px-3 py-2 text-sm text-white placeholder-white/30 focus:border-[#00FF88] outline-none";
  const buttonClass="inline-flex items-center justify-center gap-2 rounded px-4 py-2 bg-[#00FF88] text-black font-bold text-xs uppercase tracking-wider hover:brightness-110";
  const secondary="inline-flex items-center justify-center gap-2 rounded px-3 py-2 border border-white/15 text-white/70 text-xs uppercase hover:border-[#00FF88] hover:text-[#00FF88]";

  function fail(e){setMessage("");setError(e.message);}
  function clearForm(){setEditing(null);setEvent(emptyEvent);setLeader(emptyLeaderboard);setAgent(emptyAgent);setGalleryItem(emptyGallery);setPoster(emptyPoster);}

  async function handleLogin(e){e.preventDefault();try{const r=await api.login(login.username,login.password);setAdmin(r.admin);setLogin({username:"",password:""});await loadAll();}catch(e){fail(e);}}
  async function logout(){await api.logout();setAdmin(null);setAdmins([]);}

  async function save(resource,payload,reset){
    try{
      const saved=editing?.resource===resource
        ? await api[resource].update(editing.id,payload)
        : await api[resource].add(payload);
      if(resource==="leaderboard")setLeaderboard(items=>editing?.resource===resource?items.map(x=>x._id===editing.id?saved:x):[saved,...items]);
      if(resource==="agents")setAgents(items=>editing?.resource===resource?items.map(x=>x._id===editing.id?saved:x):[saved,...items]);
      if(resource==="gallery")setGallery(items=>editing?.resource===resource?items.map(x=>x._id===editing.id?saved:x):[saved,...items]);
      if(resource==="posters")setPosters(items=>editing?.resource===resource?items.map(x=>x._id===editing.id?saved:x):[saved,...items]);
      setEditing(null); reset(); setMessage(editing?.resource===resource?"Updated successfully.":"Created successfully.");setError("");
    }catch(e){fail(e);}
  }

  async function remove(resource,id,setter){
    if(!window.confirm("Delete this item?"))return;
    try{await api[resource].remove(id);setter(items=>items.filter(x=>x._id!==id));setMessage("Deleted.");}catch(e){fail(e);}
  }

  function edit(resource,item){
    setEditing({resource,id:item._id});
    if(resource==="leaderboard")setLeader(Object.fromEntries(Object.keys(emptyLeaderboard).map(k=>[k,item[k]??emptyLeaderboard[k]])));
    if(resource==="agents")setAgent(Object.fromEntries(Object.keys(emptyAgent).map(k=>[k,item[k]??emptyAgent[k]])));
    if(resource==="gallery")setGalleryItem(Object.fromEntries(Object.keys(emptyGallery).map(k=>[k,item[k]??emptyGallery[k]])));
    if(resource==="posters")setPoster(Object.fromEntries(Object.keys(emptyPoster).map(k=>[k,item[k]??emptyPoster[k]])));
    if(resource==="events")setEvent(Object.fromEntries(Object.keys(emptyEvent).map(k=>[k,k==="deadline"?(item.deadline?.slice(0,16)||""):(item[k]??emptyEvent[k])] )));
  }

  async function saveEvent(e){
    e.preventDefault();
    try{
      const payload={...event};
      const saved=editing?.resource==="events"?await api.updateEvent(editing.id,payload):await api.addEvent(payload);
      setEvents(items=>editing?.resource==="events"?items.map(x=>x._id===editing.id?saved:x):[saved,...items]);
      clearForm();setMessage(editing?.resource==="events"?"Event updated.":"Event created.");setError("");
    }catch(e){fail(e);}
  }

  async function removeEvent(id){if(!window.confirm("Delete this event?"))return;try{await api.removeEvent(id);setEvents(items=>items.filter(x=>x._id!==id));setMessage("Event deleted.");}catch(e){fail(e);}}

  async function saveContact(e){e.preventDefault();try{const saved=await api.contact.update(contact);setContact(saved);setMessage("Contact section updated.");setError("");}catch(e){fail(e);}}

  async function addAdmin(e){e.preventDefault();try{const created=await api.addAdmin(newAdmin.username,newAdmin.password);setAdmins(items=>[...items,created]);setNewAdmin({username:"",password:""});setMessage("Admin account created.");setError("");}catch(e){fail(e);}}
  async function removeAdmin(id){if(!window.confirm("Remove this admin account?"))return;try{await api.removeAdmin(id);setAdmins(items=>items.filter(x=>x._id!==id));}catch(e){fail(e);}}

  async function uploadMedia(e){
    e.preventDefault();
    if(!upload.file)return;
    try{const item=await api.media.upload(upload.file,upload.title,upload.kind);setMedia(items=>[item,...items]);setUpload({title:"",kind:"image",file:null});e.target.reset();setMessage("Image uploaded to the media library.");setError("");}
    catch(e){fail(e);}
  }
  async function removeMedia(id){if(!window.confirm("Delete this media? It will be blocked if still in use."))return;try{await api.media.remove(id);setMedia(items=>items.filter(x=>x._id!==id));setMessage("Media deleted.");}catch(e){fail(e);}}

  const mediaOptions=useMemo(()=>media,[media]);
  const MediaSelect=({value,onChange,label="IMAGE / POSTER"})=><div><label className="block text-[10px] text-white/40 mb-1">{label}</label><select className={inputClass} value={value||""} onChange={e=>onChange(e.target.value)}><option value="">Select from media library</option>{mediaOptions.map(m=><option key={m._id} value={m.url}>{m.title||m.url} [{m.kind}]</option>)}</select>{value&&<img src={resolveAssetUrl(value)} alt="" className="mt-2 h-20 w-16 object-cover rounded border border-white/10"/></div>;

  if(loading)return <div className="min-h-screen bg-[#050505] text-[#00FF88] flex items-center justify-center font-mono">AUTHENTICATING...</div>;
  if(!admin)return <main className="min-h-screen bg-[#050505] cyber-grid px-4 py-24 flex items-center justify-center"><form onSubmit={handleLogin} className="w-full max-w-md glass box-glow-neon rounded-lg p-7"><div className="flex items-center gap-3 mb-7 text-[#00FF88]"><Shield/><div><div className="font-display font-bold tracking-widest">CODEOPS ADMIN</div><div className="text-[10px] text-white/40 mt-1">SECURE CONTROL TERMINAL</div></div></div>{error&&<div className="mb-4 border border-[#FF3B3B]/40 text-[#FF3B3B] p-3 text-xs">{error}</div>}<label className="block text-xs text-white/50 mb-2">USERNAME</label><input className={inputClass+" mb-4"} value={login.username} onChange={e=>setLogin({...login,username:e.target.value})}/><label className="block text-xs text-white/50 mb-2">PASSWORD</label><input type="password" className={inputClass+" mb-6"} value={login.password} onChange={e=>setLogin({...login,password:e.target.value})}/><button className={buttonClass+" w-full"}><LogIn size={15}/>Authenticate</button></form></main>;

  return <main className="min-h-screen bg-[#050505] cyber-grid px-4 md:px-8 py-24 text-white"><div className="max-w-7xl mx-auto">
    <header className="flex flex-wrap items-center justify-between gap-4 mb-6"><div><h1 className="font-display text-2xl md:text-3xl">ADMIN PANEL</h1><p className="text-white/40 text-xs mt-2">{admin.username} · {admin.role}</p></div><button onClick={logout} className={secondary}><LogOut size={14}/>Logout</button></header>
    {error&&<div className="mb-4 border border-[#FF3B3B]/40 text-[#FF3B3B] p-3 text-xs">{error}</div>}{message&&<div className="mb-4 border border-[#00FF88]/30 text-[#00FF88] p-3 text-xs">{message}</div>}
    <div className="flex flex-wrap gap-2 mb-6">{TABS.map(([id,label])=><button key={id} onClick={()=>{setTab(id);clearForm();}} className={`px-3 py-2 rounded border text-[10px] uppercase tracking-wider ${tab===id?"bg-[#00FF88] text-black border-[#00FF88]":"border-white/15 text-white/60 hover:text-[#00FF88]"}`}>{label}</button>)}</div>

    {admin.role==="superadmin"&&<section className="glass rounded-lg p-4 mb-6"><div className="flex flex-wrap items-center gap-3"><strong className="font-display text-xs text-[#00FF88]">ADMIN ACCOUNTS</strong><form onSubmit={addAdmin} className="flex flex-wrap gap-2 flex-1"><input className={inputClass+" max-w-xs"} placeholder="Username" value={newAdmin.username} onChange={e=>setNewAdmin({...newAdmin,username:e.target.value})}/><input type="password" className={inputClass+" max-w-xs"} placeholder="Password (8+ chars)" value={newAdmin.password} onChange={e=>setNewAdmin({...newAdmin,password:e.target.value})}/><button className={buttonClass}><Plus size={14}/>Add admin</button></form></div><div className="flex flex-wrap gap-2 mt-3">{admins.map(a=><div key={a._id} className="border border-white/10 rounded px-3 py-2 text-xs">{a.username} <span className="text-white/30">[{a.role}]</span>{a._id!==admin.id&&<button onClick={()=>removeAdmin(a._id)} className="ml-3 text-[#FF3B3B]"><Trash2 size={13} className="inline"/></button>}</div>)}</div></section>}

    {tab==="events"&&<Section title={editing?.resource==="events"?"EDIT EVENT":"CREATE EVENT"}><form onSubmit={saveEvent} className="grid md:grid-cols-2 gap-3"><input className={inputClass} value={editing?.resource==="events"?(event.code||""):"AUTO-GENERATED"} disabled placeholder="EVENT CODE"/><input required className={inputClass} placeholder="EVENT TITLE" value={event.title} onChange={e=>setEvent({...event,title:e.target.value})}/><textarea required className={inputClass+" md:col-span-2"} rows={3} placeholder="DESCRIPTION" value={event.description} onChange={e=>setEvent({...event,description:e.target.value})}/><input required className={inputClass} placeholder="VENUE" value={event.venue} onChange={e=>setEvent({...event,venue:e.target.value})}/><input required type="datetime-local" className={inputClass} value={event.deadline} onChange={e=>setEvent({...event,deadline:e.target.value})}/><input className={inputClass} placeholder="STATUS" value={event.status} onChange={e=>setEvent({...event,status:e.target.value})}/><input className={inputClass} placeholder="REGISTRATION URL (optional)" value={event.registerUrl} onChange={e=>setEvent({...event,registerUrl:e.target.value})}/><div className="md:col-span-2"><MediaSelect value={event.poster} onChange={v=>setEvent({...event,poster:v})} label="POSTER (optional — choose an existing upload)"/></div><div className="flex gap-2 md:col-span-2"><button className={buttonClass}>{editing?"Save event":"Create event"}</button>{editing&&<button type="button" className={secondary} onClick={clearForm}>Cancel</button>}</div></form><List items={events} render={x=><><span className="text-[#00D9FF] mr-3">{x.code}</span><span>{x.title}</span></>} onEdit={x=>edit("events",x)} onDelete={removeEvent}/></Section>}

    {tab==="leaderboard"&&<Section title="MANAGE LEADERBOARD"><form onSubmit={e=>{e.preventDefault();save("leaderboard",leader,()=>setLeader(emptyLeaderboard));}} className="grid md:grid-cols-3 gap-3"><input required className={inputClass} placeholder="NAME" value={leader.name} onChange={e=>setLeader({...leader,name:e.target.value})}/><input className={inputClass} placeholder="CALLSIGN" value={leader.nickname} onChange={e=>setLeader({...leader,nickname:e.target.value})}/><input className={inputClass} placeholder="THREAT CLASS" value={leader.threatClass} onChange={e=>setLeader({...leader,threatClass:e.target.value})}/><input className={inputClass} placeholder="DIVISION" value={leader.division} onChange={e=>setLeader({...leader,division:e.target.value})}/><input type="number" className={inputClass} placeholder="XP" value={leader.xp} onChange={e=>setLeader({...leader,xp:Number(e.target.value)})}/><input type="number" className={inputClass} placeholder="MISSIONS" value={leader.missions} onChange={e=>setLeader({...leader,missions:Number(e.target.value)})}/><div className="flex gap-2 md:col-span-3"><button className={buttonClass}>{editing?.resource==="leaderboard"?"Save":"Add"} leaderboard entry</button>{editing?.resource==="leaderboard"&&<button type="button" className={secondary} onClick={clearForm}>Cancel</button>}</div></form><List items={leaderboard} render={x=><><span className="text-[#00D9FF]">{x.name}</span><span className="text-white/40 ml-3">{x.xp} XP · {x.division}</span></>} onEdit={x=>edit("leaderboard",x)} onDelete={id=>remove("leaderboard",id,setLeaderboard)}/></Section>}

    {tab==="agents"&&<Section title="MANAGE AGENT DATABASE"><form onSubmit={e=>{e.preventDefault();save("agents",agent,()=>setAgent(emptyAgent));}} className="grid md:grid-cols-3 gap-3">{[["id","AGENT ID"],["name","NAME"],["nickname","CALLSIGN"],["division","DIVISION"],["status","STATUS"],["threatClass","THREAT CLASS"],["language","LANGUAGE"],["project","CURRENT PROJECT"],["joined","JOINED"],["github","GITHUB URL"],["linkedin","LINKEDIN URL"],["portfolio","PORTFOLIO URL"]].map(([k,p])=><input key={k} className={inputClass} placeholder={p} value={agent[k]} onChange={e=>setAgent({...agent,[k]:e.target.value})} required={["id","name","nickname"].includes(k)}/>)}<input type="number" className={inputClass} placeholder="CLEARANCE / 10" value={agent.clearance} onChange={e=>setAgent({...agent,clearance:Number(e.target.value)})}/><input type="number" className={inputClass} placeholder="XP" value={agent.xp} onChange={e=>setAgent({...agent,xp:Number(e.target.value)})}/><input type="number" className={inputClass} placeholder="MISSIONS" value={agent.missions} onChange={e=>setAgent({...agent,missions:Number(e.target.value)})}/><div className="md:col-span-3"><MediaSelect value={agent.photo} onChange={v=>setAgent({...agent,photo:v})} label="PROFILE IMAGE"/></div><div className="flex gap-2 md:col-span-3"><button className={buttonClass}>{editing?.resource==="agents"?"Save":"Add"} agent</button>{editing?.resource==="agents"&&<button type="button" className={secondary} onClick={clearForm}>Cancel</button>}</div></form><List items={agents} render={x=><><span className="text-[#00D9FF]">{x.id}</span><span className="ml-3">{x.name} · {x.nickname}</span></>} onEdit={x=>edit("agents",x)} onDelete={id=>remove("agents",id,setAgents)}/></Section>}

    {tab==="gallery"&&<Section title="MANAGE GALLERY"><form onSubmit={e=>{e.preventDefault();save("gallery",galleryItem,()=>setGalleryItem(emptyGallery));}} className="grid md:grid-cols-2 gap-3"><input className={inputClass} placeholder="TITLE (optional)" value={galleryItem.title} onChange={e=>setGalleryItem({...galleryItem,title:e.target.value})}/><input required className={inputClass} placeholder="CATEGORY" value={galleryItem.category} onChange={e=>setGalleryItem({...galleryItem,category:e.target.value})}/><div className="md:col-span-2"><MediaSelect value={galleryItem.img} onChange={v=>setGalleryItem({...galleryItem,img:v})}/></div><div className="flex gap-2 md:col-span-2"><button className={buttonClass}>{editing?.resource==="gallery"?"Save":"Add"} gallery image</button>{editing?.resource==="gallery"&&<button type="button" className={secondary} onClick={clearForm}>Cancel</button>}</div></form><List items={gallery} render={x=><><span className="text-[#00D9FF]">{x.category}</span><span className="ml-3">{x.title||"Untitled image"}</span></>} onEdit={x=>edit("gallery",x)} onDelete={id=>remove("gallery",id,setGallery)}/></Section>}

    {tab==="posters"&&<Section title="MANAGE POSTERS"><form onSubmit={e=>{e.preventDefault();save("posters",poster,()=>setPoster(emptyPoster));}} className="grid md:grid-cols-2 gap-3"><input required className={inputClass} placeholder="POSTER TITLE" value={poster.title} onChange={e=>setPoster({...poster,title:e.target.value})}/><input className={inputClass} placeholder="DOWNLOAD URL (optional)" value={poster.downloadUrl} onChange={e=>setPoster({...poster,downloadUrl:e.target.value})}/><div className="md:col-span-2"><MediaSelect value={poster.img} onChange={v=>setPoster({...poster,img:v})} label="POSTER IMAGE — REUSE AN EXISTING UPLOAD"/></div><div className="flex gap-2 md:col-span-2"><button className={buttonClass}>{editing?.resource==="posters"?"Save":"Add"} poster</button>{editing?.resource==="posters"&&<button type="button" className={secondary} onClick={clearForm}>Cancel</button>}</div></form><List items={posters} render={x=><><span className="text-[#00D9FF]">{x.title}</span></>} onEdit={x=>edit("posters",x)} onDelete={id=>remove("posters",id,setPosters)}/></Section>}

    {tab==="contact"&&<Section title="MANAGE CONTACT SECTION"><form onSubmit={saveContact} className="grid md:grid-cols-2 gap-3">{Object.entries(contact).map(([k,v])=><div key={k}><label className="block text-[10px] text-white/40 mb-1">{k.replace(/([A-Z])/g," $1").toUpperCase()}</label><input className={inputClass} value={v||""} onChange={e=>setContact({...contact,[k]:e.target.value})}/></div>)}<button className={buttonClass+" md:col-span-2"}>Save contact section</button></form></Section>}

    {tab==="media"&&<Section title="MEDIA LIBRARY"><form onSubmit={uploadMedia} className="grid md:grid-cols-3 gap-3 mb-6"><input className={inputClass} placeholder="MEDIA TITLE (optional)" value={upload.title} onChange={e=>setUpload({...upload,title:e.target.value})}/><select className={inputClass} value={upload.kind} onChange={e=>setUpload({...upload,kind:e.target.value})}><option value="image">Image</option><option value="poster">Poster</option></select><input required type="file" accept="image/*" className={inputClass+" file:text-white/60"} onChange={e=>setUpload({...upload,file:e.target.files?.[0]||null})}/><button className={buttonClass+" md:col-span-3"}><Upload size={14}/>Upload to library</button></form><div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">{media.map(m=><div key={m._id} className="border border-white/10 rounded p-3"><img src={resolveAssetUrl(m.url)} alt={m.title} className="w-full h-40 object-cover rounded mb-3"/><div className="text-xs text-white/70 truncate">{m.title||"Untitled"}</div><div className="text-[10px] text-white/30 mb-2">{m.kind}</div><button onClick={()=>removeMedia(m._id)} className="text-[#FF3B3B] text-xs uppercase">Delete</button></div>)}</div></Section>}
  </div></main>;
}

function Section({title,children}){return <section className="glass rounded-lg p-5"><h2 className="font-display text-sm text-[#00D9FF] mb-4">{title}</h2>{children}</section>;}
function List({items,render,onEdit,onDelete}){return <div className="mt-6 space-y-2">{items.map(item=><div key={item._id} className="flex flex-wrap items-center justify-between gap-3 border border-white/10 rounded px-3 py-3 text-xs"><div>{render(item)}</div><div className="flex gap-3"><button onClick={()=>onEdit(item)} className="text-[#00D9FF]"><Pencil size={14}/></button><button onClick={()=>onDelete(item._id)} className="text-[#FF3B3B]"><Trash2 size={14}/></button></div></div>)}{!items.length&&<div className="text-white/30 text-xs">No entries yet.</div>}</div>;}
