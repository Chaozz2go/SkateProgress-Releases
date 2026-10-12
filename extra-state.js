import {ensureBoards} from './board-profile.js';
import {findTask} from './learning-path.js';
export function ensureExtras(s){if(s.profile)ensureBoards(s.profile);s.wiki??=[];s.parks??=[];s.plans??=[];s.game??={word:'SKATE',players:[]};s.quests??=[];s.learning??={counts:{}};s.learning.counts??={};return s;}
const requireValue=(ok,message)=>{if(!ok)throw Error(message);};
const text=(v,max=160)=>{requireValue(typeof v==='string'&&v.length<=max,'Ungültiger Text im Import.');return v.trim();};
export function safePhoto(value){return typeof value==='string'&&value.length<=3_000_000&&/^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/]+=*$/.test(value);}
export function parseExtras(data,root,convertKey,android){
 const field=(k,fallback)=>data[k]===undefined?fallback:typeof data[k]==='string'?JSON.parse(data[k]):data[k];
 const array=(v)=>{requireValue(Array.isArray(v)&&v.length<=1000,'Zu viele oder ungültige Zusatzdaten.');return v;};
 const wiki=array(field(android?'custom_wiki':'wiki',root.format==='skateprogress-content'?root.wiki||[]:[])).map(w=>({term:text(w.term),group:text(w.group||w.category||'Sonstiges',80),meaning:text(w.meaning,3000),custom:true}));
 const parks=array(field('parks',[])).map(p=>{const lat=p.lat??null,lon=p.lon??null;requireValue((lat===null&&lon===null)||(Number.isFinite(lat)&&Math.abs(lat)<=90&&Number.isFinite(lon)&&Math.abs(lon)<=180),'Ungültige Parkkoordinaten.');return {id:text(p.id,200),name:text(p.name),description:text(p.description||'',3000),lat,lon,photos:array(p.photos||[]).map(photo=>{if(android){const bytes=root.photos?.[photo];requireValue(typeof bytes==='string','Parkfoto fehlt. Vollständiges Android-Backup verwenden.');const mime=bytes.startsWith('/9j/')?'jpeg':bytes.startsWith('iVBOR')?'png':bytes.startsWith('UklGR')?'webp':bytes.startsWith('R0lGOD')?'gif':null;requireValue(mime,'Parkfoto hat kein unterstütztes Bildformat.');photo=`data:image/${mime};base64,${bytes}`;}requireValue(safePhoto(photo),'Parkfoto zu groß oder ungültig (maximal etwa 2 MB pro Foto).');return photo;})};});
 const plans=array(field(android?'training_plans':'plans',[])).map(p=>{const selected=array(p.selected||p.trickIds||[]).map(convertKey);const targets={};for(const [k,v] of Object.entries(p.targets||{})){requireValue(Number.isInteger(v)&&v>=1&&v<=999,'Ungültiges Trainingsziel.');targets[convertKey(k)]=v;}return {id:text(p.id,200),name:text(p.name),selected:[...new Set(selected)],targets};});
 const game=android?{word:data.skate_word||'SKATE',players:field('skate_players',[])}:field('game',{word:'SKATE',players:[]});requireValue(game&&typeof game==='object','Ungültige Spieldaten.');game.word=text(game.word,20).replace(/[^A-Za-z]/g,'').toUpperCase()||'SKATE';game.players=array(game.players).map(p=>({id:p.id||crypto.randomUUID(),name:text(p.name,60),letters:Math.min(game.word.length,Math.max(0,Number.isInteger(p.letters)?p.letters:0))}));
 const quests=array(field(android?'beginner_quests_v1':'quests',[]));requireValue(quests.every(q=>typeof q==='string'),'Ungültige Lernpfad-Daten.');
 const learning=android?{counts:{}}:field('learning',{counts:{}});requireValue(learning&&typeof learning==='object'&&!Array.isArray(learning)&&learning.counts&&typeof learning.counts==='object'&&!Array.isArray(learning.counts),'Ungültiger Lernfortschritt.');
 const counts={};requireValue(Object.keys(learning.counts).length<=1000,'Zu viele Lernaufgaben.');for(const [id,value] of Object.entries(learning.counts)){requireValue(Number.isInteger(value)&&value>=0&&value<=1000,'Ungültiger Challenge-Zähler.');const found=findTask(id);if(found)counts[id]=Math.min(found.task.target,value);}
 return {wiki,parks,plans,game,quests,learning:{counts}};
}
export function mergeExtras(next,imported,remap){
 ensureExtras(next);const extra=imported.extras;if(!extra)return next;
 for(const w of extra.wiki)if(!next.wiki.some(x=>x.term.toLowerCase()===w.term.toLowerCase()))next.wiki.push(w);
 for(const p of extra.parks)if(!next.parks.some(x=>x.id===p.id))next.parks.push(p);
 for(const p of extra.plans)if(!next.plans.some(x=>x.id===p.id))next.plans.push({...p,selected:p.selected.map(remap),targets:Object.fromEntries(Object.entries(p.targets).map(([k,v])=>[remap(k),v]))});
 if(extra.game.players.length&&next.game.players.length===0)next.game=extra.game;
 for(const [id,count] of Object.entries(extra.learning?.counts||{}))next.learning.counts[id]=Math.max(next.learning.counts[id]||0,count);
 next.quests=[...new Set([...next.quests,...extra.quests])];return next;
}
export function changeLetter(game,id,delta){const player=game.players.find(p=>p.id===id);if(player)player.letters=Math.max(0,Math.min(game.word.length,player.letters+delta));}
export function reorderPlan(plan,index,delta){const target=index+delta;if(index>=0&&target>=0&&index<plan.selected.length&&target<plan.selected.length)[plan.selected[index],plan.selected[target]]=[plan.selected[target],plan.selected[index]];}
