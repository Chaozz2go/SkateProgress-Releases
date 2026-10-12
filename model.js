import {parseExtras,mergeExtras} from './extra-state.js';
export const STANCES=['Regular','Switch','Nollie','Fakie'];
export const DIRECTIONS=['–','BS','FS'];
export const VARIANTS=STANCES.flatMap(s=>DIRECTIONS.map(d=>`${s}:${d}`));
export const clone=value=>JSON.parse(JSON.stringify(value));
export const keyFor=(id,variant)=>JSON.stringify([id,variant]);
export function decodeKey(key){try{const a=JSON.parse(key);return Array.isArray(a)&&a.length===2?a:null;}catch{return null;}}
export function labelVariant(v){const [s,d]=v.split(':');return `${s}${d==='–'?'':` · ${d}`}`;}
export function parseName(name){
 let stance='Regular',direction='–',base=name;
 const prefix=/^(Fakie|Switch|Nollie)\s+/i.exec(base);
 if(prefix){stance=STANCES.find(s=>s.toLowerCase()===prefix[1].toLowerCase());base=base.slice(prefix[0].length);}
 else if(base==='Nollie'){stance='Nollie';base='Ollie';}
 const turn=/^(Frontside|Backside)\s+/i.exec(base);
 if(turn){direction=turn[1].toLowerCase()==='frontside'?'FS':'BS';base=base.slice(turn[0].length);}
 if(base==='50-50')base='50-50 Grind';
 return {name:base,variant:`${stance}:${direction}`};
}
function assert(condition,message){if(!condition)throw Error(message);}
function boundedText(v,max=120){assert(typeof v==='string'&&v.trim().length>0&&v.length<=max,'Ungültiger oder zu langer Text.');return v.trim();}
function countMap(raw={}){assert(raw&&typeof raw==='object'&&!Array.isArray(raw),'Ungültige Zähler.');for(const n of Object.values(raw))assert(Number.isInteger(n)&&n>=0&&n<=1000000,'Ungültiger Zähler.');return raw;}
export function normalizeTricks(raw){
 assert(Array.isArray(raw)&&raw.length<=5000,'Ungültige Trickliste (maximal 5000).');
 const result=[],byName=new Map(),mapping=new Map();
 for(const source of raw){
  assert(source&&typeof source==='object','Ungültiger Trick.');
  const originalName=boundedText(source.name),category=boundedText(source.category,80);
  const parsed=parseName(originalName),match=parsed.name.toLowerCase();
  const id=source.id?boundedText(source.id,200):`custom-${crypto.randomUUID()}`;
  let trick=byName.get(match);
  if(!trick){trick={id,name:parsed.name,category:['Fakie','Nollie','Switch'].includes(category)?'Flatground':category,youtube:typeof source.youtube==='string'?source.youtube.slice(0,500):'',favorite:false,warmup:false,variants:{},custom:!!source.custom};result.push(trick);byName.set(match,trick);}
  trick.favorite ||= !!source.favorite;trick.warmup ||= !!source.warmup;
  if(!trick.youtube&&source.youtube)trick.youtube=String(source.youtube).slice(0,500);
  if(source.variants!==undefined){
   assert(source.variants&&typeof source.variants==='object'&&!Array.isArray(source.variants),'Ungültige Varianten.');
   for(const [v,flags] of Object.entries(source.variants)){
    assert(VARIANTS.includes(v)&&flags&&typeof flags==='object','Ungültige Variante.');
    assert(['canDo','practice'].every(k=>flags[k]===undefined||typeof flags[k]==='boolean'),'Ungültiger Variantenstatus.');
    const prior=trick.variants[v]||{};trick.variants[v]={canDo:!!flags.canDo||!!prior.canDo,practice:!!flags.practice||!!prior.practice};
   }
  }
  const prior=trick.variants[parsed.variant]||{};
  trick.variants[parsed.variant]={canDo:!!source.canDo||!!prior.canDo,practice:!!source.practice||!!source.nextSession||!!prior.practice};
  mapping.set(id,{id:trick.id,variant:parsed.variant});
 }
 assert(new Set(result.map(t=>t.id)).size===result.length,'Doppelte Trick-IDs.');
 return {tricks:result,mapping};
}
export function emptyState(catalog){return {schemaVersion:1,tricks:normalizeTricks(catalog).tricks,profile:{nickname:'',frontFoot:'Links',pushFoot:'Rechts',setup:{}},session:{active:false,started:0,selected:[],counts:{},landed:{},note:''},history:[]};}
function parsedField(data,key,fallback){const v=data[key];return v===undefined?fallback:typeof v==='string'?JSON.parse(v):v;}
export function readImport(root){
 assert(root&&typeof root==='object'&&root.schemaVersion===1,'Kein unterstütztes SkateProgress-Backup.');
 let data,android=false;
 if(root.format==='skateprogress-backup'){data=root.data;android=true;}
 else if(root.format==='skateprogress-web'){data=root.state;}
 else if(root.format==='skateprogress-content'){data={tricks:root.tricks};android=true;}
 else throw Error('Unbekanntes Exportformat.');
 assert(data&&typeof data==='object','Daten fehlen.');
 const normalized=normalizeTricks(parsedField(data,'tricks',[]));
 const convertKey=k=>{if(!android){assert(decodeKey(k),'Ungültiger Variantenbezug.');return k;}const mapped=normalized.mapping.get(k);assert(mapped,'Session verweist auf einen unbekannten Trick.');return keyFor(mapped.id,mapped.variant);};
 const convertCounts=raw=>{const out={};for(const [k,v] of Object.entries(countMap(raw))) {const next=convertKey(k);out[next]=(out[next]||0)+v;}return out;};
 const convertRecord=(r,active=false)=>{
  assert(r&&typeof r==='object'&&Number.isFinite(r.started)&&r.started>=0,'Ungültiger Sessionbeginn.');
  const counts=convertCounts(r.counts||{}),selected=[...new Set((r.selected||Object.keys(r.counts||{})).map(convertKey))];
  assert(selected.length<=5000,'Zu viele Sessiontricks.');
  const out={...r,...(r.undo?{undo:[]}:{}),counts,selected,...(r.targets?{targets:convertCounts(r.targets)}:{}),landed:android?{}:convertCounts(r.landed||{}),note:String(r.note||'').slice(0,2000)};
  if(active)out.active=!!r.active;
  else{assert(Number.isFinite(r.ended)&&r.ended>=r.started,'Ungültiges Sessionende.');out.id=r.id||`android-${r.started}-${r.ended}`;}
  return out;
 };
 const history=parsedField(data,'history',[]);assert(Array.isArray(history)&&history.length<=10000,'Ungültiger Verlauf.');
 const profile=parsedField(data,'profile',null);assert(profile===null||(typeof profile==='object'&&!Array.isArray(profile)),'Ungültiges Profil.');
 if(profile){
  assert(typeof (profile.nickname||'')==='string'&&(profile.nickname||'').length<=60,'Nickname zu lang oder ungültig.');
  if(profile.frontFoot===undefined)profile.frontFoot=profile.stance==='Goofy'?'Rechts':'Links';
  if(profile.pushFoot===undefined)profile.pushFoot=profile.frontFoot==='Links'?'Rechts':'Links';
  assert(['Links','Rechts'].includes(profile.frontFoot)&&['Links','Rechts'].includes(profile.pushFoot),'Ungültige Fußangaben.');
  assert(profile.setup===undefined||(profile.setup&&typeof profile.setup==='object'&&!Array.isArray(profile.setup)&&Object.values(profile.setup).every(v=>typeof v==='string'&&v.length<=100)),'Ungültiges Board-Setup.');
 }
 const session=parsedField(data,'session',null);
 return {extras:parseExtras(data,root,convertKey,android),tricks:normalized.tricks,profile,history:history.map(r=>convertRecord(r)),session:session?.active?convertRecord(session,true):null,
  warning:android?'Android-Zähler bleiben als Versuche erhalten; Landungen wurden dort nicht getrennt gespeichert. Bestehende Parks, Pläne und Begriffe werden ergänzt, gleichnamige bzw. identische Einträge bleiben erhalten.':''};
}
export function mergeImport(state,imported){
 const next=clone(state),idMap=new Map();
 for(const t of imported.tricks){
  let target=next.tricks.find(x=>x.id===t.id)||next.tricks.find(x=>x.name.toLowerCase()===t.name.toLowerCase());
  if(!target){next.tricks.push(clone(t));target=next.tricks.at(-1);}
  else{
   target.favorite ||= t.favorite;target.warmup ||= t.warmup;if(!target.youtube)target.youtube=t.youtube;
   for(const [v,f] of Object.entries(t.variants)){const old=target.variants[v]||{};target.variants[v]={canDo:!!old.canDo||f.canDo,practice:!!old.practice||f.practice};}
  }
  idMap.set(t.id,target.id);
 }
 const remap=k=>{const [id,v]=decodeKey(k);assert(idMap.has(id),'Unbekannter Sessiontrick.');return keyFor(idMap.get(id),v);};
 const remapRecord=r=>({...r,...(r.targets?{targets:Object.fromEntries(Object.entries(r.targets).map(([k,v])=>[remap(k),v]))}:{}),selected:r.selected.map(remap),counts:Object.fromEntries(Object.entries(r.counts).map(([k,v])=>[remap(k),v])),landed:Object.fromEntries(Object.entries(r.landed).map(([k,v])=>[remap(k),v]))});
 for(const r of imported.history)if(!next.history.some(x=>x.id===r.id))next.history.push(remapRecord(r));
 if(imported.profile)next.profile={...next.profile,...imported.profile,setup:{...next.profile.setup,...imported.profile.setup}};
 if(imported.session&&!next.session.active)next.session=remapRecord(imported.session);
 mergeExtras(next,imported,remap);
 assert(next.tricks.length<=5000&&next.history.length<=10000,'Import würde die Größenlimits überschreiten.');
 return next;
}
export function sessionCount(session){return Object.values(session.counts||{}).reduce((a,b)=>a+b,0);}
export function changeCount(session,key,landed,delta){
 const counts=session.counts[key]||0,success=session.landed[key]||0;
 if(landed){const next=Math.max(0,success+delta);session.landed[key]=next;if(next>counts)session.counts[key]=next;}
 else {session.counts[key]=Math.max(success,counts+delta);}
}
