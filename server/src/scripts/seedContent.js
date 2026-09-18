import mongoose from "mongoose";
import dotenv from "dotenv";
import Event from "../models/Event.js";
import Leaderboard from "../models/Leaderboard.js";
import Agent from "../models/Agent.js";
import Gallery from "../models/Gallery.js";
import Poster from "../models/Poster.js";
import Contact from "../models/Contact.js";
import Stats from "../models/Stats.js";
import SiteSettings from "../models/SiteSettings.js";

dotenv.config();

const agents = [
  { id:"AGT-001", name:"Rehan Iqbal", nickname:"NullByte", division:"Cyber Security", status:"Online", threatClass:"S-Class Cyber Phantom", clearance:9, xp:18420, missions:47, language:"Python", project:"Automated CTF challenge grader", github:"#", linkedin:"#", portfolio:"#", joined:"Aug 2023", photo:"https://placehold.co/200x200/050505/00FF88?text=AGT-001" },
  { id:"AGT-002", name:"Ananya Rao", nickname:"ShadowRoot", division:"Competitive Programming", status:"On Mission", threatClass:"A-Class Elite Agent", clearance:8, xp:15310, missions:63, language:"C++", project:"Div-1 contest prep bootcamp", github:"#", linkedin:"#", portfolio:"#", joined:"Jan 2024", photo:"https://placehold.co/200x200/050505/00D9FF?text=AGT-002" },
  { id:"AGT-003", name:"Kiran Vellanki", nickname:"GhostPacket", division:"Web Development", status:"Deploying", threatClass:"B-Class Specialist", clearance:6, xp:9210, missions:22, language:"TypeScript", project:"Club member portal v2", github:"#", linkedin:"#", portfolio:"#", joined:"Mar 2024", photo:"https://placehold.co/200x200/050505/00FF88?text=AGT-003" },
  { id:"AGT-004", name:"Sneha Patil", nickname:"CipherFox", division:"Artificial Intelligence", status:"Training", threatClass:"C-Class Operator", clearance:4, xp:4120, missions:9, language:"Python", project:"Club chatbot on local LLM", github:"#", linkedin:"#", portfolio:"#", joined:"Jul 2024", photo:"https://placehold.co/200x200/050505/00D9FF?text=AGT-004" },
  { id:"AGT-005", name:"Devraj Sen", nickname:"ZeroDay", division:"Cyber Security", status:"Online", threatClass:"Ω-Class Command Elite", clearance:10, xp:24800, missions:81, language:"Rust", project:"Club infra hardening", github:"#", linkedin:"#", portfolio:"#", joined:"Feb 2022", photo:"https://placehold.co/200x200/050505/FF3B3B?text=AGT-005" },
  { id:"AGT-006", name:"Meher Chawla", nickname:"Echo404", division:"Design", status:"Offline", threatClass:"D-Class Recruit", clearance:2, xp:980, missions:3, language:"Figma / CSS", project:"Poster series — Winter Hackathon", github:"#", linkedin:"#", portfolio:"#", joined:"Jun 2025", photo:"https://placehold.co/200x200/050505/00FF88?text=AGT-006" },
  { id:"AGT-007", name:"Yashwanth Reddy", nickname:"QuantumHex", division:"App Development", status:"Online", threatClass:"A-Class Elite Agent", clearance:7, xp:13040, missions:38, language:"Kotlin", project:"CODEX companion app", github:"#", linkedin:"#", portfolio:"#", joined:"Sep 2023", photo:"https://placehold.co/200x200/050505/00D9FF?text=AGT-007" },
  { id:"AGT-008", name:"Ishita Bose", nickname:"SilentStack", division:"Core Committee", status:"Online", threatClass:"S-Class Cyber Phantom", clearance:9, xp:19870, missions:55, language:"Go", project:"Club-wide ops coordination", github:"#", linkedin:"#", portfolio:"#", joined:"Aug 2022", photo:"https://placehold.co/200x200/050505/FF3B3B?text=AGT-008" }
];

const leaderboard = [
  [["Devraj Sen","ZeroDay","Cyber Security","Ω-Class Command Elite",24800,81],["Ishita Bose","SilentStack","Core Committee","S-Class Cyber Phantom",19870,55],
  ["Rehan Iqbal","NullByte","Cyber Security","S-Class Cyber Phantom",18420,47],["Ananya Rao","ShadowRoot","Competitive Programming","A-Class Elite Agent",15310,63],
  ["Yashwanth Reddy","QuantumHex","App Development","A-Class Elite Agent",13040,38],["Kiran Vellanki","GhostPacket","Web Development","B-Class Specialist",9210,22],
  ["Sneha Patil","CipherFox","Artificial Intelligence","C-Class Operator",4120,9],["Meher Chawla","Echo404","Design","D-Class Recruit",980,3]
].map(([name,nickname,division,threatClass,xp,missions])=>({name,nickname,division,threatClass,xp,missions}));

const gallery = [
  ["Events 01","Events","https://placehold.co/500x350/050505/00FF88?text=Events+01"],
  ["Events 02","Events","https://placehold.co/500x650/050505/00D9FF?text=Events+02"],
  ["Meetup 01","Meetup","https://placehold.co/500x400/050505/FF3B3B?text=Meetup+01"],
  ["Events 03","Events","https://placehold.co/500x550/050505/00FF88?text=Events+03"],
  ["Events 04","Events","https://placehold.co/500x350/050505/00D9FF?text=Events+04"],
  ["Meetup 02","Meetup","https://placehold.co/500x600/050505/FF3B3B?text=Meetup+02"],
  ["Events 05","Events","https://placehold.co/500x400/050505/00FF88?text=Events+05"],
  ["Events 06","Events","https://placehold.co/500x500/050505/00D9FF?text=Events+06"]
];

const posters = [
  { title:"Inauguration", img:"https://placehold.co/500x650/050505/00FF88?text=Inauguration+Poster", downloadUrl:"" }
];

const defaultEvent = {
  code:"CX-001", title:"Inauguration Event",
  poster:"https://placehold.co/500x650/050505/00FF88?text=CX-001",
  description:"The official inauguration marking the launch of our club, bringing together members to celebrate the beginning of a new journey in technology, innovation, and collaboration.",
  venue:"1009 Seminar Hall", deadline:"2026-09-11T23:59:00", status:"OPEN", registerUrl:"https://forms.gle/example1"
};

export async function seedDefaultContent() {
  await mongoose.connect(process.env.MONGODB_URI);
  const marker = await SiteSettings.findOne({ key:"default-content" });
  if (marker?.initialized) {
    console.log("Default content already initialized.");
    return;
  }

  await Event.findOneAndUpdate({ code:defaultEvent.code }, defaultEvent, { upsert:true, new:true, setDefaultsOnInsert:true });
  for (const item of leaderboard) await Leaderboard.findOneAndUpdate({name:item.name,nickname:item.nickname},item,{upsert:true,new:true,setDefaultsOnInsert:true});
  for (const item of agents) await Agent.findOneAndUpdate({id:item.id},item,{upsert:true,new:true,setDefaultsOnInsert:true});
  for (const [title,category,img] of gallery) await Gallery.findOneAndUpdate({title,category},{title,category,img},{upsert:true,new:true,setDefaultsOnInsert:true});
  for (const item of posters) await Poster.findOneAndUpdate({title:item.title},item,{upsert:true,new:true,setDefaultsOnInsert:true});
  await Contact.findOneAndUpdate({}, {
    facultyCoordinator:"Sai Kalyan, Rupa Santoshi, Sashivanth — Dept. of CSD",
    hod:"Shanthi Makka — Dept. of CSD",
    email:"VCE",
    facebook:"", linkedin:"", instagram:"https://www.instagram.com/codex_vce", discord:"",
    mapUrl:"https://www.google.com/maps?q=Vardhaman%20College%20of%20Engineering&output=embed"
  }, {upsert:true,new:true,setDefaultsOnInsert:true});
  await Stats.findOneAndUpdate({}, {activeAgents:18,communityMembers:540,projectsCompleted:76,workshopsConducted:34,hackathonsOrganised:12}, {upsert:true,new:true,setDefaultsOnInsert:true});
  await SiteSettings.findOneAndUpdate({key:"default-content"},{key:"default-content",initialized:true},{upsert:true,new:true,setDefaultsOnInsert:true});
  console.log("Default CodeOPS content initialized.");
}

if (process.argv[1]?.endsWith("seedContent.js")) {
  mongoose.connect(process.env.MONGODB_URI).then(() => seedDefaultContent())
    .catch((error)=>{ console.error(error); process.exitCode=1; })
    .finally(async()=>{ await mongoose.disconnect(); });
}
