export function recordAttempt(session,key,landed){
 if(!session.active||!session.selected.includes(key))return false;
 session.undo??=[];session.undo.push({key,counts:session.counts[key]||0,landed:session.landed[key]||0});if(session.undo.length>20)session.undo.shift();
 session.counts[key]=(session.counts[key]||0)+1;if(landed)session.landed[key]=(session.landed[key]||0)+1;return true;
}
export function undoAttempt(session){if(!session.active)return false;const previous=session.undo?.pop();if(!previous)return false;session.counts[previous.key]=previous.counts;session.landed[previous.key]=previous.landed;return true;}
export function practiceKeys(tricks,keyFor){return tricks.flatMap(t=>Object.entries(t.variants).filter(([,f])=>f.practice).map(([v])=>keyFor(t.id,v)));}
export function boundedFocus(session){session.focusIndex=Math.max(0,Math.min(Number.isInteger(session.focusIndex)?session.focusIndex:0,Math.max(0,session.selected.length-1)));return session.focusIndex;}
export function recordAttemptAndLearn(state,key,landed){
 if(!recordAttempt(state.session,key,landed))return false;
 let parsed;try{parsed=JSON.parse(key);}catch{return false;}
 const [id,variant]=parsed,t=state.tricks.find(t=>t.id===id);if(!t)return false;
 const flags=t.variants[variant]||{canDo:false,practice:false};
 if(landed&&(state.session.landed[key]||0)===3&&!flags.canDo&&!flags.practice){
  t.variants[variant]=flags;flags.canDo=true;state.session.newlyLearned??=[];if(!state.session.newlyLearned.includes(key))state.session.newlyLearned.push(key);state.session.undo.at(-1).promotion={id,variant,editVersion:flags.editVersion||0};return true;
 }
 return false;
}
export function undoAttemptAndLearn(state){
 const previous=state.session.undo?.at(-1);if(!undoAttempt(state.session))return false;
 if(previous.promotion){const {id,variant,editVersion}=previous.promotion,flags=state.tricks.find(t=>t.id===id)?.variants[variant];if(flags&&flags.canDo&&(flags.editVersion||0)===editVersion){flags.canDo=false;state.session.newlyLearned=(state.session.newlyLearned||[]).filter(k=>k!==previous.key);}}
 return true;
}

export function knownKeys(tricks){return tricks.flatMap(t=>Object.entries(t.variants).filter(([,f])=>f.canDo).map(([v])=>JSON.stringify([t.id,v])));}
export function sessionSummary(session,tricks){
 const selected=[...new Set([...(session.selected||[]),...Object.keys(session.counts||{})])];
 const attempts=Object.values(session.counts||{}).reduce((n,v)=>n+v,0),landings=Object.values(session.landed||{}).reduce((n,v)=>n+v,0);
 const current=new Set(knownKeys(tricks));
 const learned=(session.learnedAtStart?selected.filter(k=>current.has(k)&&!session.learnedAtStart.includes(k)):(session.newlyLearned||[]).filter(k=>current.has(k)));
 const goals=selected.filter(k=>Number(session.targets?.[k])>0).map(key=>({key,target:session.targets[key],landed:session.landed?.[key]||0}));
 const next=goals.find(g=>g.landed<g.target)?.key||selected.filter(k=>(session.counts?.[k]||0)>0&&!current.has(k)).sort((a,b)=>(session.landed?.[b]||0)-(session.landed?.[a]||0))[0]||null;
 return {attempts,landings,learned,goals,next};
}
