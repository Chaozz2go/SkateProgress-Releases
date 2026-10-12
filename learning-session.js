import {LEVELS,findTask,levelUnlocked,learningSummary} from './learning-path.js';
import {parseName,keyFor} from './model.js';
// Only discrete repetitions with an explicit trick context can use session landings.
const AUTO=new Set(['manual','hippie','body_varial','caveman','boneless','no_comply','style_body','ollie_still','ollie_roll','ollie_line','shove','popshove','fs_popshove','fs180','bs180','fakie','half_cab','kickflip','heelflip','bigspin','dropin','rock_fakie','axle_stall','rock_roll','5050','boardslide','noseslide','fs_boardslide','switch_ollie','nollie','nollie_shove','fakie_shove']);
export function taskReference(state,task){
 if(!task.trick)return null;const p=parseName(task.trick),t=state.tricks.find(t=>t.name.toLowerCase()===p.name.toLowerCase());
 return t?{t,variant:p.variant,direction:p.variant.split(':')[1],key:keyFor(t.id,p.variant)}:null;
}
export function taskSessionMode(task){return AUTO.has(task.id)?task.id==='ollie_line'?'session':'total':null;}
export function bindLearningTask(state,id){
 const found=findTask(id);if(!found||!levelUnlocked(found.level,state.quests))throw Error('Voraussetzungen fehlen.');
 const ref=taskReference(state,found.task);if(!ref)return false;
 state.session.learningTaskIds??=[];if(!state.session.learningTaskIds.includes(id))state.session.learningTaskIds.push(id);state.session.learningTasks??={};
 // One landing never completes several different exercises for the same trick.
 state.session.learningTasks[ref.key]=id;
 if(!state.session.selected.includes(ref.key))state.session.selected.push(ref.key);
 return true;
}
export function prepareLearningLevel(state,id){
 const l=LEVELS.find(l=>l.id===id);if(!l||!levelUnlocked(l,state.quests))throw Error('Voraussetzungen fehlen.');
 if(state.session.active)throw Error('Speichere oder beende zuerst deine laufende Session.');
 state.session={active:false,started:0,selected:[],counts:{},landed:{},note:'',targets:{},learningTasks:{}};state.session.learningTaskIds=l.tasks.map(t=>t.id);state.session.learningChecks={};state.session.learningLevel=id;state.session.planName=`Lernpfad · ${l.title}`;
 for(const task of l.tasks){if(state.quests.includes(task.id))continue;const ref=taskReference(state,task);if(!ref||state.session.learningTasks[ref.key])continue;
  bindLearningTask(state,task.id);if(taskSessionMode(task))state.session.targets[ref.key]=taskSessionMode(task)==='session'?task.target:Math.max(1,task.target-(state.learning?.counts?.[task.id]||0));
 }
 return l;
}
export function applySessionLearning(state){
 const session=state.session;if(session.learningApplied)return session.learningResult||{changes:[],xp:0,badges:[]};
 const before=learningSummary(state.quests),questsAtStart=[...state.quests],changes=[];state.learning??={counts:{}};state.learning.counts??={};
 for(const row of sessionLearningRows(state)){
  const {task,level,key,mode}=row,id=task.id;if(!levelUnlocked(level,questsAtStart)||state.quests.includes(id))continue;
  const previous=Math.min(task.target,state.learning.counts[id]||0),count=row.count;
  if(count<=previous)continue;state.learning.counts[id]=count;if(count>=task.target)state.quests.push(id);
  changes.push({id,title:task.title,count,target:task.target,complete:count>=task.target,mode});
 }

 const after=learningSummary(state.quests),result={changes,xp:after.xp-before.xp,badges:after.badges.filter(b=>!before.badges.includes(b))};
 session.learningApplied=true;session.learningResult=result;return result;
}

export function sessionLearningRows(state){
 const session=state.session,ids=[...new Set([...(LEVELS.find(l=>l.id===session.learningLevel)?.tasks.map(t=>t.id)||session.learningTaskIds||[]),...Object.values(session.learningTasks||{})])];
 return ids.map(id=>{
  const found=findTask(id);if(!found)return null;const {task,level}=found,mode=taskSessionMode(task),ref=taskReference(state,task),key=ref?.key;
  const prior=mode==='session'?0:Math.min(task.target,state.learning?.counts?.[id]||0),done=state.quests.includes(id);
  const raw=key&&session.selected.includes(key)&&session.learningTasks?.[key]===id&&mode?session.landed?.[key]||0:0;
  const landings=Number.isInteger(raw)&&raw>0?raw:0,manual=session.learningChecks?.[id]||{},reps=Number.isInteger(manual.count)&&manual.count>0?manual.count:0;
  const count=done||manual.complete?task.target:Math.min(task.target,prior+Math.max(landings,reps));
  return {task,level,key,mode,count,done,confirmed:!!manual.complete,open:levelUnlocked(level,state.quests)};
 }).filter(Boolean);
}
export function checkSessionTask(state,id,action){
 if(!state.session.active)return false;const row=sessionLearningRows(state).find(r=>r.task.id===id);if(!row||!row.open||row.done)return false;
 state.session.learningChecks??={};const entry=state.session.learningChecks[id]??={count:0,complete:false};
 if(action==='toggle')entry.complete=!entry.complete;
 else if(action==='plus')entry.count=Math.min(row.task.target,(entry.count||0)+1);
 else if(action==='minus')entry.count=Math.max(0,(entry.count||0)-1);
 return true;
}
