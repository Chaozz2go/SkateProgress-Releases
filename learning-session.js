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
 state.session.learningTasks??={};
 // One landing never completes several different exercises for the same trick.
 state.session.learningTasks[ref.key]=id;
 if(!state.session.selected.includes(ref.key))state.session.selected.push(ref.key);
 return true;
}
export function prepareLearningLevel(state,id){
 const l=LEVELS.find(l=>l.id===id);if(!l||!levelUnlocked(l,state.quests))throw Error('Voraussetzungen fehlen.');
 if(state.session.active)throw Error('Speichere oder beende zuerst deine laufende Session.');
 state.session={active:false,started:0,selected:[],counts:{},landed:{},note:'',targets:{},learningTasks:{}};state.session.learningLevel=id;state.session.planName=`Lernpfad · ${l.title}`;
 for(const task of l.tasks){if(state.quests.includes(task.id))continue;const ref=taskReference(state,task);if(!ref||state.session.learningTasks[ref.key])continue;
  bindLearningTask(state,task.id);if(taskSessionMode(task))state.session.targets[ref.key]=taskSessionMode(task)==='session'?task.target:Math.max(1,task.target-(state.learning?.counts?.[task.id]||0));
 }
 return l;
}
export function applySessionLearning(state){
 const session=state.session;if(session.learningApplied)return session.learningResult||{changes:[],xp:0,badges:[]};
 const before=learningSummary(state.quests),questsAtStart=[...state.quests],changes=[];state.learning??={counts:{}};state.learning.counts??={};
 for(const [key,id] of Object.entries(session.learningTasks||{})){
  if(!session.selected.includes(key))continue;const found=findTask(id);if(!found||!levelUnlocked(found.level,questsAtStart)||state.quests.includes(id))continue;
  const ref=taskReference(state,found.task),mode=taskSessionMode(found.task);if(!mode||ref?.key!==key)continue;
  const landings=session.landed?.[key]||0;if(!Number.isInteger(landings)||landings<=0)continue;
  const previous=Math.min(found.task.target,state.learning.counts[id]||0);
  const count=Math.min(found.task.target,mode==='session'?Math.max(previous,landings):previous+landings);
  state.learning.counts[id]=count;if(count>=found.task.target)state.quests.push(id);
  if(count>previous)changes.push({id,title:found.task.title,count,target:found.task.target,complete:count>=found.task.target,mode});
 }
 const after=learningSummary(state.quests),result={changes,xp:after.xp-before.xp,badges:after.badges.filter(b=>!before.badges.includes(b))};
 session.learningApplied=true;session.learningResult=result;return result;
}
