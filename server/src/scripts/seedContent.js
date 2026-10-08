import mongoose from "mongoose";
import dotenv from "dotenv";
import Event from "../models/Event.js";
import Leaderboard from "../models/Leaderboard.js";
import Agent from "../models/Agent.js";
import Gallery from "../models/Gallery.js";
import Poster from "../models/Poster.js";
import Contact from "../models/Contact.js";
import Stats from "../models/Stats.js";
import Media from "../models/Media.js";
import Alert from "../models/Alert.js";

dotenv.config();

const agents = [
  { rollNumber:"001", name:"Rehan Iqbal", department:"Cyber Security", position:"S-Class Cyber Phantom", language:"Python", github:"#", linkedin:"#", portfolio:"#", photo:"https://placehold.co/200x200/050505/00FF88?text=AGT-001" },
  { rollNumber:"002", name:"Ananya Rao", department:"Competitive Programming", position:"A-Class Elite Agent", language:"C++", github:"#", linkedin:"#", portfolio:"#", photo:"https://placehold.co/200x200/050505/00D9FF?text=AGT-002" },
  { rollNumber:"003", name:"Kiran Vellanki", department:"Web Development", position:"B-Class Specialist", language:"TypeScript", github:"#", linkedin:"#", portfolio:"#", photo:"https://placehold.co/200x200/050505/00FF88?text=AGT-003" },
  { rollNumber:"004", name:"Sneha Patil", department:"Artificial Intelligence", position:"C-Class Operator", language:"Python", github:"#", linkedin:"#", portfolio:"#", photo:"https://placehold.co/200x200/050505/00D9FF?text=AGT-004" },
  { rollNumber:"005", name:"Devraj Sen", department:"Cyber Security", position:"Ω-Class Command Elite", language:"Rust", github:"#", linkedin:"#", portfolio:"#", photo:"https://placehold.co/200x200/050505/FF3B3B?text=AGT-005" },
  { rollNumber:"006", name:"Meher Chawla", department:"Design", position:"D-Class Recruit", language:"Figma / CSS", github:"#", linkedin:"#", portfolio:"#", photo:"https://placehold.co/200x200/050505/00FF88?text=AGT-006" },
  { rollNumber:"007", name:"Yashwanth Reddy", department:"App Development", position:"A-Class Elite Agent", language:"Kotlin", github:"#", linkedin:"#", portfolio:"#", photo:"https://placehold.co/200x200/050505/00D9FF?text=AGT-007" },
  { rollNumber:"008", name:"Ishita Bose", department:"Core Committee", position:"S-Class Cyber Phantom", language:"Go", github:"#", linkedin:"#", portfolio:"#", photo:"https://placehold.co/200x200/050505/FF3B3B?text=AGT-008" }
];

const leaderboard = [
  {name:"Devraj Sen",nickname:"ZeroDay",department:"Cyber Security",position:"Ω-Class Command Elite",xp:24800,missions:81},
  {name:"Ishita Bose",nickname:"SilentStack",department:"Core Committee",position:"S-Class Cyber Phantom",xp:19870,missions:55},
  {name:"Rehan Iqbal",nickname:"NullByte",department:"Cyber Security",position:"S-Class Cyber Phantom",xp:18420,missions:47},
  {name:"Ananya Rao",nickname:"ShadowRoot",department:"Competitive Programming",position:"A-Class Elite Agent",xp:15310,missions:63},
  {name:"Yashwanth Reddy",nickname:"QuantumHex",department:"App Development",position:"A-Class Elite Agent",xp:13040,missions:38},
  {name:"Kiran Vellanki",nickname:"GhostPacket",department:"Web Development",position:"B-Class Specialist",xp:9210,missions:22},
  {name:"Sneha Patil",nickname:"CipherFox",department:"Artificial Intelligence",position:"C-Class Operator",xp:4120,missions:9},
  {name:"Meher Chawla",nickname:"Echo404",department:"Design",position:"D-Class Recruit",xp:980,missions:3}
];

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


const alerts = [
  { type:"DEADLINE", text:"Registrations for MSN-014 close in 14 days.", priority:"NORMAL" },
  { type:"WORKSHOP", text:"New workshop scheduled: Intro to Web Exploitation.", priority:"NORMAL" },
  { type:"HACKATHON", text:"Ghost Protocol venue confirmed — CSE Seminar Hall.", priority:"HIGH" },
  { type:"UPDATE", text:"Leaderboard recalculated after CP Dojo round 3.", priority:"NORMAL" },
  { type:"SYSTEM", text:"Agent database sync complete. 8 active profiles.", priority:"NORMAL" },
];
const defaultEvent = {
  code:"CO-001", title:"Inauguration Event",
  poster:"https://placehold.co/500x650/050505/00FF88?text=CO-001",
  description:"The official inauguration marking the launch of our club, bringing together members to celebrate the beginning of a new journey in technology, innovation, and collaboration.",
  venue:"1009 Seminar Hall", deadline:"2026-09-11T23:59:00", status:"OPEN", registerUrl:"https://forms.gle/example1"
};

export async function seedDefaultContent() {
  const marker = await Event.findOne({ code:defaultEvent.code }).select("_id").lean();
  if (marker) {
    for (const item of alerts) {
      await Alert.findOneAndUpdate({ type:item.type, text:item.text }, item, { upsert:true, new:true, setDefaultsOnInsert:true });
    }
    console.log("Default content already initialized.");
    return;
  }

  await Event.findOneAndUpdate({ code:defaultEvent.code }, defaultEvent, { upsert:true, new:true, setDefaultsOnInsert:true });
  for (const item of alerts) await Alert.findOneAndUpdate({ type:item.type, text:item.text },item,{upsert:true,new:true,setDefaultsOnInsert:true});
  for (const item of leaderboard) await Leaderboard.findOneAndUpdate({name:item.name,nickname:item.nickname},item,{upsert:true,new:true,setDefaultsOnInsert:true});
  for (const item of agents) await Agent.findOneAndUpdate({rollNumber:item.rollNumber},item,{upsert:true,new:true,setDefaultsOnInsert:true});
  for (const [title,category,img] of gallery) await Gallery.findOneAndUpdate({title,category},{title,category,img},{upsert:true,new:true,setDefaultsOnInsert:true});
  for (const item of posters) {
    await Poster.findOneAndUpdate({title:item.title},item,{upsert:true,new:true,setDefaultsOnInsert:true});
    await Media.findOneAndUpdate({url:item.img},{title:item.title,url:item.img,kind:"poster"},{upsert:true,new:true,setDefaultsOnInsert:true});
  }
  await Media.findOneAndUpdate({url:defaultEvent.poster},{title:"Inauguration Event",url:defaultEvent.poster,kind:"poster"},{upsert:true,new:true,setDefaultsOnInsert:true});
  await Contact.findOneAndUpdate({}, {
    facultyCoordinator:"Sai Kalyan, Rupa Santoshi, Sashivanth — Dept. of CSD",
    hod:"Shanthi Makka — Dept. of CSD",
    email:"VCE",
    facebook:"", linkedin:"", instagram:"https://www.instagram.com/codex_vce", discord:"",
    mapUrl:"https://www.google.com/maps?q=Vardhaman%20College%20of%20Engineering&output=embed"
  }, {upsert:true,new:true,setDefaultsOnInsert:true});
  await Stats.findOneAndUpdate({}, {activeAgents:18,communityMembers:540,projectsCompleted:76,workshopsConducted:34,hackathonsOrganised:12}, {upsert:true,new:true,setDefaultsOnInsert:true});
  console.log("Default CodeOPS content initialized.");
}

if (process.argv[1]?.endsWith("seedContent.js")) {
  mongoose.connect(process.env.MONGODB_URI).then(() => seedDefaultContent())
    .catch((error)=>{ console.error(error); process.exitCode=1; })
    .finally(async()=>{ await mongoose.disconnect(); });
}
