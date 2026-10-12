import {XP_RATINGS} from './xp-ratings.js';
export function landingXP(difficulty,number){if(number<1||number>20)return 0;const base=Math.max(1,Math.min(5,difficulty))*5;return number===1?base*3:number<=5?base:number<=10?Math.ceil(base/2):Math.ceil(base/4);}
export function trickXP(state,ratings=XP_RATINGS){
 const counts={},variants={},sessions={},seen=new Set();let total=0;
 for(const session of [...(state.history||[])].sort((a,b)=>a.started-b.started)){
  if(seen.has(session.id))continue;seen.add(session.id);let earned=0;
  for(const [key,landings] of Object.entries(session.landed||{})){
   let id,variant;try{[id,variant]=JSON.parse(key);}catch{continue;}
   const rating=ratings[id];if((session.xpEligible?!session.xpEligible.includes(id):!XP_RATINGS[id])||!rating||(rating.directions&&!rating.directions.includes(variant.split(':')[1]))||state.tricks.find(t=>t.id===id)?.custom)continue;
   const stance=variant.split(':')[0],difficulty=Math.min(5,rating.difficulty+(['Switch','Nollie'].includes(stance)?1:0)),before=counts[key]||0;
   const available=Math.max(0,Math.min(20-before,Number.isInteger(landings)?landings:0));let amount=0;
   for(let i=1;i<=available;i++)amount+=landingXP(difficulty,before+i);
   counts[key]=before+available;earned+=amount;total+=amount;variants[key]={landings:counts[key],xp:(variants[key]?.xp||0)+amount,difficulty};
  }
  sessions[session.id]=earned;
 }
 return {total,variants,sessions};
}
export function playerLevel(xp){const level=Math.floor(Math.sqrt(Math.max(0,xp)/100))+1;return {level,start:100*(level-1)**2,next:100*level**2};}
