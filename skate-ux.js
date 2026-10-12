export function recordAttempt(session,key,landed){
 if(!session.active||!session.selected.includes(key))return false;
 session.undo??=[];session.undo.push({key,counts:session.counts[key]||0,landed:session.landed[key]||0});if(session.undo.length>20)session.undo.shift();
 session.counts[key]=(session.counts[key]||0)+1;if(landed)session.landed[key]=(session.landed[key]||0)+1;return true;
}
export function undoAttempt(session){if(!session.active)return false;const previous=session.undo?.pop();if(!previous)return false;session.counts[previous.key]=previous.counts;session.landed[previous.key]=previous.landed;return true;}
export function practiceKeys(tricks,keyFor){return tricks.flatMap(t=>Object.entries(t.variants).filter(([,f])=>f.practice).map(([v])=>keyFor(t.id,v)));}
export function boundedFocus(session){session.focusIndex=Math.max(0,Math.min(Number.isInteger(session.focusIndex)?session.focusIndex:0,Math.max(0,session.selected.length-1)));return session.focusIndex;}
