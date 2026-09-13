import type React from "react";
import { FormEvent, useEffect, useState } from "react";

type Review = { name:string; avatar:string; rating:number; date:string; text:string; published:boolean };
type Screenshot = { src:string; alt:string };
type Feature = { icon:string; text:string; enabled:boolean };
type SafetyItem = { icon:string; title:string; desc:string; enabled:boolean };
type SimilarApp = { name:string; icon:string; rating:number; category:string; url:string; enabled:boolean };
type SocialLink = { platform:string; url:string; icon:string; text:string; enabled:boolean };
type ButtonConfig = { text:string; url:string; enabled:boolean; newTab:boolean };
type SiteConfig = {
  app:{name:string; developer:string; category:string; version:string; size:string; downloads:string; ageRating:string; rating:number; totalReviews:number; updateDate:string; compatibility:string; shortDescription:string; description:string};
  logo:string; banner:string; screenshots:Screenshot[]; tags:string[]; features:Feature[]; reviews:Review[];
  ratingDistribution:{5:number;4:number;3:number;2:number;1:number}; safetyIntro:string; safety:SafetyItem[]; similarApps:SimilarApp[];
  social:SocialLink[]; buttons:{download:ButtonConfig; telegram:ButtonConfig}; sections:Record<string,boolean>; footer:{copyright:string; columns:string};
  seo:{title:string; description:string; keywords:string; canonical:string; ogImage:string}; appearance:{primary:string; primaryHover:string; background:string};
};

const DEFAULT:SiteConfig = {
 app:{name:"StreamVibe",developer:"StreamVibe Dev",category:"Entertainment",version:"2.5.1",size:"28.4 MB",downloads:"10,000,000+",ageRating:"PEGI 12",rating:4.5,totalReviews:24583,updateDate:"Dec 15, 2024",compatibility:"Android 5.0+",shortDescription:"Your ultimate entertainment companion.",description:`StreamVibe is your ultimate entertainment companion, bringing you unlimited access to thousands of movies, TV shows, documentaries, and exclusive content — all completely free!\n\nWith StreamVibe, you can explore a vast library of content across multiple genres including Action, Comedy, Drama, Sci-Fi, Horror, Romance, and many more. Our intelligent recommendation engine learns your preferences and suggests content you'll love.\n\nKey highlights include HD and 4K streaming quality, subtitle support in 50+ languages, offline downloads, Chromecast support, and a beautiful dark mode interface that's easy on the eyes.`},
 logo:"/images/logo.webp",banner:"/images/banner.webp",
 screenshots:[1,2,3,4].map((n)=>({src:`/images/screenshot${n}.jpg`,alt:["Home Feed Screen","Content Detail Screen","Search Screen","Profile Screen"][n-1]})),
 tags:["Entertainment","Streaming","Movies & TV","Video Player","Free Content"],
 features:["🎬|Unlimited Movies & TV Shows","📺|HD & 4K Streaming Quality","🌐|Subtitles in 50+ Languages","📥|Offline Downloads","🔄|Daily Content Updates","🌙|Dark Mode Interface","📱|Chromecast Support","⚡|Lightweight & Fast"].map(x=>{const [icon,text]=x.split("|");return {icon,text,enabled:true}}),
 reviews:[
  ["Alex Thompson","AT",5,"December 10, 2024","Absolutely amazing app! The streaming quality is incredible and I love the dark mode. Content library is huge and updates daily. Best free streaming app I've ever used."],
  ["Sarah Mitchell","SM",4,"December 8, 2024","Great app with a fantastic selection of movies and shows. The offline download feature is a lifesaver for my commute. Only wish the search was a bit faster."],
  ["David Chen","DC",5,"December 5, 2024","This app is a game changer! No ads, smooth playback, and the Chromecast support works flawlessly. Recommended to all my friends."],
  ["Maria Garcia","MG",4,"November 29, 2024","Really enjoy using StreamVibe. The subtitle support is great for watching foreign films. Interface is clean and easy to navigate."],
  ["James Wilson","JW",5,"November 22, 2024","Been using this for 3 months now and it just keeps getting better. Zero buffering issues on my connection."]
 ].map(([name,avatar,rating,date,text])=>({name,avatar,rating:Number(rating),date,text,published:true})),
 ratingDistribution:{5:62,4:23,3:9,2:4,1:2},
 safetyIntro:"Safety starts with understanding how developers collect and share your data. Data privacy and security practices may vary based on your use, region, and age.",
 safety:["🔒|Data encrypted in transit|Your data is securely encrypted using TLS 1.3 during transmission.","🛡️|Data can't be deleted|The developer doesn't provide a way to request deletion of your data.","📊|Data shared with third parties|This app may share certain data types with third parties for analytics.","📦|Data collected|App activity, device info, and approximate location may be collected.","✅|Independent security review|This app has been independently reviewed for security compliance."].map(x=>{const [icon,title,desc]=x.split("|");return {icon,title,desc,enabled:true}}),
 similarApps:["MusicStream Pro|/images/app1.webp|4.3|Music & Audio","VidCast Player|/images/app2.webp|4.1|Video Players","DownSync Manager|/images/app3.webp|4.6|Download Manager","MovieHub Free|/images/app1.webp|4.0|Entertainment","ShowTime Plus|/images/app2.webp|4.4|Entertainment","CastFlow TV|/images/app3.webp|3.9|Media & Video"].map(x=>{const [name,icon,rating,category]=x.split("|");return {name,icon,rating:Number(rating),category,url:"#",enabled:true}}),
 social:[{platform:"Telegram",url:"https://t.me/streamvibeofficial",icon:"✈️",text:"Join Telegram",enabled:true}],
 buttons:{download:{text:"Download APK",url:"https://example.com/streamvibe-v2.5.apk",enabled:true,newTab:true},telegram:{text:"Join Telegram",url:"https://t.me/streamvibeofficial",enabled:true,newTab:true}},
 sections:{banner:true,appInfo:true,tags:true,screenshots:true,description:true,features:true,reviews:true,ratings:true,safety:true,similarApps:true,social:true,sticky:true},
 footer:{copyright:"All rights reserved. Independent app listing and download page.",columns:"About|Privacy|Terms|Support|Contact|Developer information"},
 seo:{title:"StreamVibe - Download APK",description:"Download the latest StreamVibe APK.",keywords:"apk download, android games, mod apk",canonical:"",ogImage:""},
 appearance:{primary:"#01875f",primaryHover:"#016e4f",background:"#ffffff"}
};

const AUTH="streamvibe-admin-auth";

type AuthSession = { access_token:string; refresh_token:string; expires_at:number; user:{id:string;email?:string|null} };
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

function authConfigured(){ return Boolean(SUPABASE_URL && SUPABASE_KEY); }
function loadAuthSession():AuthSession|null{ try { return JSON.parse(localStorage.getItem(AUTH)||"null") } catch { return null } }
function saveAuthSession(s:AuthSession){ localStorage.setItem(AUTH, JSON.stringify(s)); }
function clearAuthSession(){ localStorage.removeItem(AUTH); }
async function supabaseAuth(path:string, options:RequestInit={}){
  if(!authConfigured()) throw new Error("Supabase Auth is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  const headers = new Headers(options.headers||{});
  headers.set("apikey", SUPABASE_KEY!);
  headers.set("Content-Type", "application/json");
  return fetch(`${SUPABASE_URL}/auth/v1${path}`, {...options, headers});
}
async function supabaseSignIn(email:string,password:string):Promise<AuthSession>{
  const r=await supabaseAuth("/token?grant_type=password",{method:"POST",body:JSON.stringify({email,password})});
  const j=await r.json(); if(!r.ok) throw new Error(j.msg||j.error_description||j.message||"Login failed");
  return {access_token:j.access_token,refresh_token:j.refresh_token,expires_at:Math.floor(Date.now()/1000)+(j.expires_in||3600),user:{id:j.user.id,email:j.user.email}};
}
async function getAuthUser(session:AuthSession){
  const r=await supabaseAuth("/user",{headers:{Authorization:`Bearer ${session.access_token}`}});
  if(!r.ok) return null; const j=await r.json(); return j?.id?j:null;
}
async function refreshAuthSession(session:AuthSession):Promise<AuthSession|null>{
  const r=await supabaseAuth("/token?grant_type=refresh_token",{method:"POST",body:JSON.stringify({refresh_token:session.refresh_token})});
  const j=await r.json(); if(!r.ok) return null;
  return {access_token:j.access_token,refresh_token:j.refresh_token||session.refresh_token,expires_at:Math.floor(Date.now()/1000)+(j.expires_in||3600),user:{id:j.user?.id||session.user.id,email:j.user?.email||session.user.email}};
}
async function isAdminUser(session:AuthSession){
  const r=await fetch(`${SUPABASE_URL}/rest/v1/admin_users?select=user_id&user_id=eq.${encodeURIComponent(session.user.id)}&limit=1`,{headers:{apikey:SUPABASE_KEY!,Authorization:`Bearer ${session.access_token}`}});
  if(!r.ok) return false; const rows=await r.json(); return Array.isArray(rows)&&rows.length===1;
}
async function globalSignOut(session:AuthSession){
  try { await supabaseAuth("/logout",{method:"POST",headers:{Authorization:`Bearer ${session.access_token}`}}); } catch {}
  clearAuthSession();
}
async function changeSupabasePassword(currentPassword:string,newPassword:string,email:string,session:AuthSession){
  await supabaseSignIn(email,currentPassword);
  const r=await supabaseAuth("/user",{method:"PUT",headers:{Authorization:`Bearer ${session.access_token}`},body:JSON.stringify({password:newPassword})});
  const j=await r.json(); if(!r.ok) throw new Error(j.msg||j.message||"Password update failed");
}

function jsonHeaders(session?:AuthSession){
  const h:Record<string,string>={apikey:SUPABASE_KEY!,"Content-Type":"application/json"};
  if(session?.access_token) h.Authorization=`Bearer ${session.access_token}`;
  return h;
}
async function fetchRemoteConfig():Promise<SiteConfig|null>{
  if(!authConfigured()) return null;
  const r=await fetch(`${SUPABASE_URL}/rest/v1/site_settings?site_key=eq.main&select=site_value&limit=1`,{cache:"no-store",headers:{...jsonHeaders(),"Cache-Control":"no-cache"}});
  if(!r.ok) throw new Error(`Failed to load site settings (${r.status})`);
  const rows=await r.json();
  if(!Array.isArray(rows)||rows.length===0||!rows[0]?.site_value) return null;
  try{return JSON.parse(rows[0].site_value) as SiteConfig}catch{throw new Error("The Supabase site_settings record contains invalid JSON.")}
}
function assertNoBrowserOnlyImageUrls(c:SiteConfig){
  const urls=[c.logo,c.banner,c.seo.ogImage,...c.screenshots.map(x=>x.src),...c.similarApps.map(x=>x.icon)];
  for(const u of urls){
    const v=String(u||"").trim();
    if(/^data:/i.test(v)||/^blob:/i.test(v)||/^file:/i.test(v)||/^[A-Za-z]:[\\/]/.test(v)||v.startsWith("\\\\")) throw new Error("A browser-only/local image URL was found. Upload the image to Supabase Storage or use a public HTTPS URL before saving.");
  }
}
async function saveRemoteConfig(c:SiteConfig,session:AuthSession){
  if(!authConfigured()) throw new Error("Supabase is not configured.");
  assertNoBrowserOnlyImageUrls(c);
  const r=await fetch(`${SUPABASE_URL}/rest/v1/site_settings?on_conflict=site_key`,{method:"POST",headers:{...jsonHeaders(session),Prefer:"resolution=merge-duplicates,return=minimal"},body:JSON.stringify([{site_key:"main",site_value:JSON.stringify(c)}])});
  if(!r.ok){const text=await r.text();throw new Error(text||`Failed to save site settings (${r.status})`)}
}
async function uploadPublicImage(file:File,session:AuthSession){
  if(file.size>5*1024*1024) throw new Error("Image must be under 5 MB.");
  if(!file.type.startsWith("image/")) throw new Error("Please select an image file.");
  const safe=file.name.toLowerCase().replace(/[^a-z0-9._-]+/g,"-");
  const path=`admin/${session.user.id}/${Date.now()}-${safe}`;
  const r=await fetch(`${SUPABASE_URL}/storage/v1/object/site-media/${path}`,{method:"POST",headers:{apikey:SUPABASE_KEY!,Authorization:`Bearer ${session.access_token}`,"Content-Type":file.type,"x-upsert":"true"},body:file});
  if(!r.ok){const text=await r.text();throw new Error(text||`Image upload failed (${r.status})`)}
  return `${SUPABASE_URL}/storage/v1/object/public/site-media/${path}`;
}
function subscribeToSiteSettings(onConfig:(c:SiteConfig)=>void){
  if(!authConfigured()||typeof WebSocket==="undefined") return ()=>{};
  const wsUrl=`${SUPABASE_URL!.replace(/^http/,"ws")}/realtime/v1/websocket?apikey=${encodeURIComponent(SUPABASE_KEY!)}&vsn=1.0.0`;
  const ws=new WebSocket(wsUrl); let heartbeat:number|undefined; let ref=0;
  const send=(msg:any)=>{if(ws.readyState===WebSocket.OPEN) ws.send(JSON.stringify(msg))};
  ws.onopen=()=>{
    send({topic:"realtime:site-settings",event:"phx_join",payload:{config:{broadcast:{ack:false,self:false},presence:{key:""},postgres_changes:[{event:"*",schema:"public",table:"site_settings",filter:"site_key=eq.main"}],private:false}},ref:String(++ref)});
    heartbeat=window.setInterval(()=>send({topic:"phoenix",event:"heartbeat",payload:{},ref:String(++ref)}),25000);
  };
  ws.onmessage=(event)=>{
    try{const msg=JSON.parse(event.data); if(msg.event!=="postgres_changes")return; const record=msg.payload?.data?.record; if(record?.site_key!=="main"||!record?.site_value)return; const c=JSON.parse(record.site_value) as SiteConfig; onConfig(c)}catch{}
  };
  return ()=>{if(heartbeat)clearInterval(heartbeat);try{ws.close()}catch{}};
}

function LazyImage({src,alt,className="",priority=false}:{src:string;alt:string;className?:string;priority?:boolean}){return <img src={src} alt={alt} className={className} loading={priority?"eager":"lazy"} fetchPriority={priority?"high":"auto"} decoding="async" onError={(e)=>{(e.currentTarget as HTMLImageElement).style.opacity=".35"}}/>}
function Stars({rating}:{rating:number}){return <span className="stars">{[1,2,3,4,5].map(s=><span key={s}>{s<=Math.round(rating)?"★":"☆"}</span>)}</span>}
function Field({label,value,onChange,type="text",placeholder}:{label:string;value:any;onChange:(v:any)=>void;type?:string;placeholder?:string}){return <label className="field"><span>{label}</span><input type={type} value={value ?? ""} placeholder={placeholder} onChange={e=>onChange(type==="number"?Number(e.target.value):e.target.value)}/></label>}
function TextArea({label,value,onChange}:{label:string;value:string;onChange:(v:string)=>void}){return <label className="field"><span>{label}</span><textarea value={value} onChange={e=>onChange(e.target.value)} /></label>}
function Toggle({label,value,onChange}:{label:string;value:boolean;onChange:(v:boolean)=>void}){return <label className="toggle"><input type="checkbox" checked={value} onChange={e=>onChange(e.target.checked)}/><span>{label}</span></label>}
function ImageField({label,value,onChange,onUpload}:{label:string;value:string;onChange:(v:string)=>void;onUpload?:(file:File)=>Promise<string>}){
 const [upload,setUpload]=useState(false);
 const [busy,setBusy]=useState(false);
 const file=async(e:React.ChangeEvent<HTMLInputElement>)=>{
  const f=e.target.files?.[0];
  if(!f)return;
  if(!onUpload){alert("Image upload is not configured.");return;}
  setBusy(true);
  try{const url=await onUpload(f);onChange(url);}
  catch(err){alert(err instanceof Error?err.message:"Image upload failed");}
  finally{setBusy(false);}
 };
 return (
  <div className="image-field">
   <Field label={label+" URL"} value={value} onChange={onChange} placeholder="https://... or /images/file.webp"/>
   <button type="button" className="secondary" onClick={()=>setUpload(!upload)} disabled={busy}>{upload?"Hide uploader":busy?"Uploading…":"Upload image"}</button>
   {upload&&<input className="file" type="file" accept="image/*" onChange={file} disabled={busy}/>}
   {value&&<img className="preview" src={value} alt="preview"/>}
  </div>
 );
}
function PublicSite({config}:{config:SiteConfig}){
 const a=config.app; const [expanded,setExpanded]=useState(false); const [safetyExpanded,setSafetyExpanded]=useState(false); const [sticky,setSticky]=useState(false);
 useEffect(()=>{const f=()=>setSticky(scrollY>400);addEventListener("scroll",f);return()=>removeEventListener("scroll",f)},[]);
 useEffect(()=>{document.title=config.seo.title||a.name;document.documentElement.style.setProperty("--primary",config.appearance.primary);document.documentElement.style.setProperty("--primary-hover",config.appearance.primaryHover)},[config]);
 const socials=config.social.filter(x=>x.enabled); const reviews=config.reviews.filter(x=>x.published); const safety=config.safety.filter(x=>x.enabled); const features=config.features.filter(x=>x.enabled); const similar=config.similarApps.filter(x=>x.enabled);
 return <div className="site" style={{background:config.appearance.background}}><nav className="topbar"><div className="container"><div className="brand-mark" aria-label="AppNest">◆</div><span className="brand-name">AppNest</span><span className="brand-subtitle">App Store</span></div></nav>
 <main>
 {config.sections.appInfo&&<section><div className="container header"><LazyImage src={config.logo} alt={`${a.name} logo`} className="app-logo" priority/><div className="head-copy"><h1>{a.name}</h1><p className="developer">{a.developer}</p><div className="meta"><b>{a.rating}</b> <Stars rating={a.rating}/> <span>({a.totalReviews.toLocaleString()} reviews)</span><i>•</i><span>{a.downloads} downloads</span><i>•</i><span>{a.ageRating}</span></div></div></div><div className="container pills"><span>⇩ {a.size}</span><span>▦ {a.category}</span><span>◷ v{a.version}</span></div></section>}
 {config.sections.banner&&<section><div className="container hero"><LazyImage src={config.banner} alt={`${a.name} banner`} className="banner" priority/><div className="actions">{config.buttons.download.enabled&&<a className="btn primary" href={config.buttons.download.url} target={config.buttons.download.newTab?"_blank":undefined} rel="noreferrer">⇩ {config.buttons.download.text}</a>}{config.buttons.telegram.enabled&&<a className="btn telegram" href={config.buttons.telegram.url} target={config.buttons.telegram.newTab?"_blank":undefined} rel="noreferrer">✈ {config.buttons.telegram.text}</a>}</div>{socials.length>0&&config.sections.social&&<div className="social-row">{socials.map((s,i)=><a key={i} href={s.url} target="_blank" rel="noreferrer">{s.icon} {s.text||s.platform}</a>)}</div>}</div></section>}
 {config.sections.tags&&<section><div className="container tags">{config.tags.map((t,i)=><span key={i}>{t}</span>)}</div></section>}
 {config.sections.screenshots&&<section><div className="container"><h2>Screenshots</h2><div className="screens">{config.screenshots.map((s,i)=><LazyImage key={i} src={s.src} alt={s.alt} className="shot"/>)}</div></div></section>}
 {config.sections.description&&<section><div className="container"><h2>About this app</h2><p className={`description ${expanded?"expanded":""}`}>{a.description}</p><button className="text-btn" onClick={()=>setExpanded(!expanded)}>{expanded?"Show less":"Show more"}</button>{config.sections.features&&<><h3>Features</h3><div className="features">{features.map((f,i)=><span key={i}>{f.icon} {f.text}</span>)}</div></>}<div className="info-grid"><div>Version<strong>{a.version}</strong></div><div>Size<strong>{a.size}</strong></div><div>Updated on<strong>{a.updateDate}</strong></div><div>Requires Android<strong>{a.compatibility}</strong></div></div></div></section>}
 {config.sections.ratings&&<section><div className="container"><h2>Ratings and reviews</h2><div className="rating-box"><div><strong className="big-rating">{a.rating}</strong><Stars rating={a.rating}/><small>{a.totalReviews.toLocaleString()} reviews</small></div><div className="bars">{[5,4,3,2,1].map(s=><div className="bar-row" key={s}><span>{s}</span><div><i style={{width:`${config.ratingDistribution[s as 1|2|3|4|5]}%`}}/></div><small>{config.ratingDistribution[s as 1|2|3|4|5]}%</small></div>)}</div></div>{config.sections.reviews&&<div className="reviews">{reviews.map((r,i)=><article key={i}><div className="avatar">{r.avatar}</div><div><div className="review-head"><b>{r.name}</b><small>{r.date}</small></div><Stars rating={r.rating}/><p>{r.text}</p></div></article>)}</div>}</div></section>}
 {config.sections.safety&&<section><div className="container"><h2>Data safety</h2><p className="muted">{config.safetyIntro}</p>{(safetyExpanded?safety:safety.slice(0,3)).map((x,i)=><div className="safety" key={i}><span>{x.icon}</span><div><b>{x.title}</b><p>{x.desc}</p></div></div>)}{safety.length>3&&<button className="text-btn" onClick={()=>setSafetyExpanded(!safetyExpanded)}>{safetyExpanded?"Show less":"Show more"}</button>}</div></section>}
 {config.sections.similarApps&&<section><div className="container"><h2>Similar apps</h2><div className="similar">{similar.map((x,i)=><a href={x.url} key={i}><LazyImage src={x.icon} alt={x.name}/><b>{x.name}</b><span>{x.rating} ★</span><small>{x.category}</small></a>)}</div></div></section>}
 </main><footer><div className="container"><div className="footer-grid">{config.footer.columns.split("|").map((x,i)=><span key={i}>{x}</span>)}</div><p>© 2024 {a.developer}. {config.footer.copyright}</p></div></footer>
 {config.sections.sticky&&<div className={`sticky ${sticky?"show":""}`}><div><img src={config.logo} alt=""/><b>{a.name}</b></div>{config.buttons.download.enabled&&<a className="btn primary" href={config.buttons.download.url}>Install</a>}</div>}
 </div>
}

function Admin({config,setConfig,onLogout,session}:{config:SiteConfig;setConfig:(c:SiteConfig)=>void;onLogout:()=>void;session:AuthSession}){
 const [tab,setTab]=useState("Dashboard"); const [draft,setDraft]=useState<SiteConfig>(config); const [saved,setSaved]=useState(false); const [saving,setSaving]=useState(false);
 useEffect(()=>setDraft(config),[config]); const update=(fn:(c:SiteConfig)=>void)=>setDraft(c=>{const n=structuredClone(c);fn(n);return n});
 useEffect(()=>{let cancelled=false;(async()=>{try{const remote=await fetchRemoteConfig();if(!remote&&!cancelled)await saveRemoteConfig(config,session)}catch(err){console.error("Cloud initialization failed",err)}})();return()=>{cancelled=true}},[]);
 const save=async()=>{setSaving(true);try{await saveRemoteConfig(draft,session);setConfig(draft);setSaved(true);setTimeout(()=>setSaved(false),1800)}catch(err){alert(err instanceof Error?err.message:"Save failed")}finally{setSaving(false)}};
 const upload=(file:File)=>uploadPublicImage(file,session);
 const reset=()=>{if(confirm("Reset all site settings to the original content?")){setDraft(structuredClone(DEFAULT))}};
 const exportData=()=>{const blob=new Blob([JSON.stringify(draft,null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="site-config.json";a.click();URL.revokeObjectURL(a.href)};
 const importData=(e:React.ChangeEvent<HTMLInputElement>)=>{const f=e.target.files?.[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{setDraft(JSON.parse(String(r.result)));alert("Configuration imported. Click Save All Changes.")}catch{alert("Invalid JSON file")}};r.readAsText(f)};
 const nav=["Dashboard","App Information","Images & Media","Download & Social","Description & Features","Screenshots","Reviews & Ratings","Data Safety","Similar Apps","Sections","SEO & Appearance","Footer","Admin Account"];
 const Section=({title,children}:{title:string;children:React.ReactNode})=><div className="admin-card"><h2>{title}</h2>{children}</div>;
 const add=(key:keyof SiteConfig,item:any)=>update(c=>(c[key] as any).push(item));
 return <div className="admin-shell"><aside><div className="brand">⚙️ Site Admin</div>{nav.map(n=><button key={n} className={tab===n?"active":""} onClick={()=>setTab(n)}>{n}</button>)}<button onClick={()=>window.open("/","_blank")}>↗ Preview Site</button><button onClick={exportData}>⇩ Export Config</button><label className="import-btn">⇧ Import Config<input type="file" accept="application/json" onChange={importData}/></label><button onClick={onLogout}>Logout</button></aside><div className="admin-main"><header><div><h1>{tab}</h1><p>Manage your landing page without editing code.</p></div><div className="head-actions"><button className="secondary" onClick={reset}>Reset</button><button className="save" onClick={save} disabled={saving}>{saving?"Saving to Supabase…":"✓ Save All Changes"}</button></div></header>{saved&&<div className="toast">Saved successfully</div>}
 {tab==="Dashboard"&&<><Section title="Overview"><div className="stats">{[["App name",draft.app.name],["Screenshots",draft.screenshots.length],["Features",draft.features.length],["Reviews",draft.reviews.length],["Similar apps",draft.similarApps.length],["APK URL",draft.buttons.download.url?"Configured":"Missing"]].map(([k,v])=><div className="stat" key={String(k)}><small>{k}</small><b>{v}</b></div>)}</div></Section><Section title="Quick actions"><div className="quick"><button onClick={()=>setTab("App Information")}>Edit app information</button><button onClick={()=>setTab("Images & Media")}>Manage images</button><button onClick={()=>setTab("Download & Social")}>Manage URLs & social links</button><button onClick={()=>setTab("Screenshots")}>Manage screenshots</button></div></Section></>}
 {tab==="App Information"&&<Section title="App Information"><div className="form-grid">{Object.entries(draft.app).filter(([k])=>k!=="description").map(([k,v])=><Field key={k} label={k.replace(/([A-Z])/g," $1")} value={v} type={typeof v==="number"?"number":"text"} onChange={x=>update(c=>{(c.app as any)[k]=x})}/>)}</div><TextArea label="Short description" value={draft.app.shortDescription} onChange={x=>update(c=>c.app.shortDescription=x)}/><TextArea label="Full description" value={draft.app.description} onChange={x=>update(c=>c.app.description=x)}/></Section>}
 {tab==="Images & Media"&&<><Section title="Brand images"><div className="two"><ImageField label="App logo" value={draft.logo} onChange={x=>update(c=>c.logo=x)} onUpload={upload}/><ImageField label="Banner" value={draft.banner} onChange={x=>update(c=>c.banner=x)} onUpload={upload}/></div></Section><Section title="Upload notes"><p className="muted">You can paste any public image URL or upload an image. Uploaded images are stored in Supabase Storage and the saved public URL is stored in the central Supabase configuration.</p></Section></>}
 {tab==="Download & Social"&&<><Section title="Download buttons"><div className="form-grid"><div><Toggle label="Enable download button" value={draft.buttons.download.enabled} onChange={x=>update(c=>c.buttons.download.enabled=x)}/><Field label="Button text" value={draft.buttons.download.text} onChange={x=>update(c=>c.buttons.download.text=x)}/><Field label="APK / download URL" value={draft.buttons.download.url} onChange={x=>update(c=>c.buttons.download.url=x)}/><Toggle label="Open in new tab" value={draft.buttons.download.newTab} onChange={x=>update(c=>c.buttons.download.newTab=x)}/></div><div><Toggle label="Enable Telegram button" value={draft.buttons.telegram.enabled} onChange={x=>update(c=>c.buttons.telegram.enabled=x)}/><Field label="Button text" value={draft.buttons.telegram.text} onChange={x=>update(c=>c.buttons.telegram.text=x)}/><Field label="Telegram URL" value={draft.buttons.telegram.url} onChange={x=>update(c=>c.buttons.telegram.url=x)}/><Toggle label="Open in new tab" value={draft.buttons.telegram.newTab} onChange={x=>update(c=>c.buttons.telegram.newTab=x)}/></div></div></Section><Section title="Social links"><div className="list-editor">{draft.social.map((s,i)=><div className="list-row" key={i}><Field label="Platform" value={s.platform} onChange={x=>update(c=>c.social[i].platform=x)}/><Field label="URL" value={s.url} onChange={x=>update(c=>c.social[i].url=x)}/><Field label="Icon" value={s.icon} onChange={x=>update(c=>c.social[i].icon=x)}/><Field label="Button text" value={s.text} onChange={x=>update(c=>c.social[i].text=x)}/><Toggle label="Enabled" value={s.enabled} onChange={x=>update(c=>c.social[i].enabled=x)}/><button className="danger" onClick={()=>update(c=>c.social.splice(i,1))}>Delete</button></div>)}</div><button className="secondary" onClick={()=>add("social",{platform:"Custom",url:"https://",icon:"🔗",text:"Visit",enabled:true})}>+ Add social link</button></Section></>}
 {tab==="Description & Features"&&<><Section title="Description"><TextArea label="About this app" value={draft.app.description} onChange={x=>update(c=>c.app.description=x)}/><TextArea label="Safety / extra description" value={draft.safetyIntro} onChange={x=>update(c=>c.safetyIntro=x)}/></Section><Section title="Category tags"><div className="chips-edit">{draft.tags.map((t,i)=><div key={i}><input value={t} onChange={e=>update(c=>c.tags[i]=e.target.value)}/><button onClick={()=>update(c=>c.tags.splice(i,1))}>×</button></div>)}</div><button className="secondary" onClick={()=>update(c=>c.tags.push("New Tag"))}>+ Add tag</button></Section><Section title="Features"><div className="list-editor">{draft.features.map((f,i)=><div className="list-row" key={i}><Field label="Icon" value={f.icon} onChange={x=>update(c=>c.features[i].icon=x)}/><Field label="Feature text" value={f.text} onChange={x=>update(c=>c.features[i].text=x)}/><Toggle label="Enabled" value={f.enabled} onChange={x=>update(c=>c.features[i].enabled=x)}/><button className="danger" onClick={()=>update(c=>c.features.splice(i,1))}>Delete</button></div>)}</div><button className="secondary" onClick={()=>add("features",{icon:"✨",text:"New feature",enabled:true})}>+ Add feature</button></Section></>}
 {tab==="Screenshots"&&<Section title="Screenshot manager"><div className="list-editor">{draft.screenshots.map((s,i)=><div className="list-row media-row" key={i}><ImageField label={`Screenshot ${i+1}`} value={s.src} onChange={x=>update(c=>c.screenshots[i].src=x)} onUpload={upload}/><Field label="Alt text" value={s.alt} onChange={x=>update(c=>c.screenshots[i].alt=x)}/><button className="danger" onClick={()=>update(c=>c.screenshots.splice(i,1))}>Delete</button></div>)}</div><button className="secondary" onClick={()=>add("screenshots",{src:"/images/screenshot1.webp",alt:"New screenshot"})}>+ Add screenshot</button></Section>}
 {tab==="Reviews & Ratings"&&<><Section title="Rating distribution"><div className="form-grid">{[5,4,3,2,1].map(s=><Field key={s} label={`${s}-star percentage`} value={draft.ratingDistribution[s as 1|2|3|4|5]} type="number" onChange={x=>update(c=>(c.ratingDistribution as any)[s]=x)}/>)}</div></Section><Section title="Reviews"><div className="list-editor">{draft.reviews.map((r,i)=><div className="list-row" key={i}><Field label="Name" value={r.name} onChange={x=>update(c=>c.reviews[i].name=x)}/><Field label="Avatar" value={r.avatar} onChange={x=>update(c=>c.reviews[i].avatar=x)}/><Field label="Rating" value={r.rating} type="number" onChange={x=>update(c=>c.reviews[i].rating=x)}/><Field label="Date" value={r.date} onChange={x=>update(c=>c.reviews[i].date=x)}/><TextArea label="Review" value={r.text} onChange={x=>update(c=>c.reviews[i].text=x)}/><Toggle label="Published" value={r.published} onChange={x=>update(c=>c.reviews[i].published=x)}/><button className="danger" onClick={()=>update(c=>c.reviews.splice(i,1))}>Delete</button></div>)}</div><button className="secondary" onClick={()=>add("reviews",{name:"New Reviewer",avatar:"NR",rating:5,date:new Date().toLocaleDateString(),text:"Write review here...",published:true})}>+ Add review</button></Section></>}
 {tab==="Data Safety"&&<Section title="Data safety"><TextArea label="Intro text" value={draft.safetyIntro} onChange={x=>update(c=>c.safetyIntro=x)}/><div className="list-editor">{draft.safety.map((s,i)=><div className="list-row" key={i}><Field label="Icon" value={s.icon} onChange={x=>update(c=>c.safety[i].icon=x)}/><Field label="Title" value={s.title} onChange={x=>update(c=>c.safety[i].title=x)}/><TextArea label="Description" value={s.desc} onChange={x=>update(c=>c.safety[i].desc=x)}/><Toggle label="Enabled" value={s.enabled} onChange={x=>update(c=>c.safety[i].enabled=x)}/><button className="danger" onClick={()=>update(c=>c.safety.splice(i,1))}>Delete</button></div>)}</div><button className="secondary" onClick={()=>add("safety",{icon:"🔐",title:"New safety item",desc:"Describe this practice.",enabled:true})}>+ Add safety item</button></Section>}
 {tab==="Similar Apps"&&<Section title="Similar apps"><div className="list-editor">{draft.similarApps.map((s,i)=><div className="list-row media-row" key={i}><ImageField label="Icon" value={s.icon} onChange={x=>update(c=>c.similarApps[i].icon=x)} onUpload={upload}/><Field label="Name" value={s.name} onChange={x=>update(c=>c.similarApps[i].name=x)}/><Field label="Rating" value={s.rating} type="number" onChange={x=>update(c=>c.similarApps[i].rating=x)}/><Field label="Category" value={s.category} onChange={x=>update(c=>c.similarApps[i].category=x)}/><Field label="Destination URL" value={s.url} onChange={x=>update(c=>c.similarApps[i].url=x)}/><Toggle label="Enabled" value={s.enabled} onChange={x=>update(c=>c.similarApps[i].enabled=x)}/><button className="danger" onClick={()=>update(c=>c.similarApps.splice(i,1))}>Delete</button></div>)}</div><button className="secondary" onClick={()=>add("similarApps",{name:"New App",icon:"/images/app1.webp",rating:4,category:"Entertainment",url:"#",enabled:true})}>+ Add similar app</button></Section>}
 {tab==="Sections"&&<Section title="Section visibility"><div className="section-toggles">{Object.entries(draft.sections).map(([k,v])=><Toggle key={k} label={k.replace(/([A-Z])/g," $1")} value={v} onChange={x=>update(c=>c.sections[k]=x)}/>)}</div></Section>}
 {tab==="SEO & Appearance"&&<><Section title="SEO"><div className="form-grid">{Object.entries(draft.seo).map(([k,v])=><Field key={k} label={k} value={v} onChange={x=>update(c=>(c.seo as any)[k]=x)}/>)}</div></Section><Section title="Appearance"><div className="form-grid"><Field label="Primary color" value={draft.appearance.primary} onChange={x=>update(c=>c.appearance.primary=x)}/><Field label="Primary hover" value={draft.appearance.primaryHover} onChange={x=>update(c=>c.appearance.primaryHover=x)}/><Field label="Page background" value={draft.appearance.background} onChange={x=>update(c=>c.appearance.background=x)}/></div></Section></>}
 {tab==="Footer"&&<Section title="Footer"><TextArea label="Copyright / disclaimer text" value={draft.footer.copyright} onChange={x=>update(c=>c.footer.copyright=x)}/><TextArea label="Footer items (separate with |)" value={draft.footer.columns} onChange={x=>update(c=>c.footer.columns=x)}/></Section>}
 {tab==="Admin Account"&&session&&<AdminAccount session={session} onLogout={onLogout}/>}
 </div></div>
}
function AdminAccount({session,onLogout}:{session:AuthSession;onLogout:()=>void}){const [email,setEmail]=useState(session.user.email||"");const [currentPassword,setCurrentPassword]=useState("");const [newPassword,setNewPassword]=useState("");const [busy,setBusy]=useState(false);const save=async()=>{if(!email||currentPassword.length<1||newPassword.length<8)return alert("Enter your admin email, current password, and a new password of at least 8 characters.");setBusy(true);try{await changeSupabasePassword(currentPassword,newPassword,email,session);await globalSignOut(session);setCurrentPassword("");setNewPassword("");alert("Password changed. All existing sessions have been signed out. Please log in again with the new password.");onLogout()}catch(err){alert(err instanceof Error?err.message:"Password update failed")}finally{setBusy(false)}};return <div className="admin-card"><h2>Change admin password</h2><p className="muted">This uses Supabase Auth. The old password cannot be used to sign in after the password is changed, and all active refresh sessions are signed out.</p><Field label="Admin email" value={email} onChange={setEmail} type="email"/><Field label="Current password" value={currentPassword} onChange={setCurrentPassword} type="password"/><Field label="New password" value={newPassword} onChange={setNewPassword} type="password"/><button className="save" onClick={save} disabled={busy}>{busy?"Updating…":"Update password"}</button></div>}
function Login({onLogin}:{onLogin:(s:AuthSession)=>void}){const [email,setEmail]=useState("");const [p,setP]=useState("");const [busy,setBusy]=useState(false);const submit=async(e:FormEvent)=>{e.preventDefault();if(!email||!p)return;setBusy(true);try{const session=await supabaseSignIn(email,p);if(!(await isAdminUser(session))){await globalSignOut(session);throw new Error("This account is not authorized for the admin panel.")}saveAuthSession(session);onLogin(session)}catch(err){alert(err instanceof Error?err.message:"Login failed")}finally{setBusy(false)}};return <div className="login"><form onSubmit={submit}><div className="login-logo">⚙️</div><h1>Admin Panel</h1><p>Sign in to manage your landing page.</p><input type="email" placeholder="Admin email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="username" autoFocus/><input type="password" placeholder="Admin password" value={p} onChange={e=>setP(e.target.value)} autoComplete="current-password"/><button className="save" disabled={busy}>{busy?"Signing in…":"Login"}</button><small>Admin access is protected by Supabase Authentication.</small></form></div>}

export default function App(){
 const isAdmin=location.pathname.startsWith("/admin");
 const [config,setConfigState]=useState<SiteConfig>(DEFAULT); const [loaded,setLoaded]=useState(false);
 const [session,setSession]=useState<AuthSession|null>(()=>loadAuthSession()); const [checking,setChecking]=useState(isAdmin);
 const setConfig=(c:SiteConfig)=>setConfigState(c);
 useEffect(()=>{let cancelled=false;let unsubscribe=()=>{};let poll=0;(async()=>{if(!authConfigured()){if(!cancelled){setLoaded(true);setChecking(false)}return}try{
   const remote=await fetchRemoteConfig(); if(remote&&!cancelled)setConfigState(remote);
 }catch(err){console.error(err)}finally{if(!cancelled){setLoaded(true);setChecking(false)}}
 unsubscribe=subscribeToSiteSettings((c)=>{if(!cancelled)setConfigState(c)});
 poll=window.setInterval(async()=>{try{const remote=await fetchRemoteConfig();if(remote&&!cancelled)setConfigState(remote)}catch{}},15000);
 })(); return()=>{cancelled=true;unsubscribe();if(poll)window.clearInterval(poll)};},[]);
 useEffect(()=>{if(!isAdmin)return;let cancelled=false;(async()=>{if(!authConfigured()){setChecking(false);return}let s=loadAuthSession();if(s&&s.expires_at<Math.floor(Date.now()/1000)+60){s=await refreshAuthSession(s);if(s)saveAuthSession(s)}if(s){const user=await getAuthUser(s);if(!user||!(await isAdminUser(s))){clearAuthSession();s=null}}if(!cancelled)setSession(s);setChecking(false)})();return()=>{cancelled=true}},[isAdmin]);
 if(isAdmin){if(!authConfigured())return <div className="login"><div><h1>Supabase setup required</h1><p>Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel before using the admin panel.</p></div></div>;if(checking||!loaded)return <div className="login"><div><h1>Loading admin…</h1></div></div>;if(!session)return <Login onLogin={setSession}/>;return <Admin config={config} setConfig={setConfig} onLogout={()=>{clearAuthSession();setSession(null)}} session={session}/>}
 if(!loaded)return <div className="login"><div><h1>Loading…</h1></div></div>;
 return <PublicSite config={config}/>;
}
