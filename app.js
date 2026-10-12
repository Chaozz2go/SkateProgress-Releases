import {findTask} from './learning-path.js';
import {applySessionLearning} from './learning-session.js';
import {BOARD_FIELDS,stanceInfo,stanceDiagram,ensureBoards,saveBoard} from './board-profile.js';
import {recordAttempt,undoAttempt,practiceKeys,boundedFocus,recordAttemptAndLearn,undoAttemptAndLearn,knownKeys,sessionSummary} from './skate-ux.js';
import {createExtras} from './extras.js';
import {ensureExtras} from './extra-state.js';
import {STANCES,DIRECTIONS,VARIANTS,clone,keyFor,decodeKey,labelVariant,emptyState,readImport,mergeImport,sessionCount,changeCount,parseName} from './model.js';
const $=s=>document.querySelector(s),app=$('#app'),modal=$('#modal');
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const btn=(action,text,cls='',extra='')=>`<button data-action="${action}" class="${cls}" ${extra}>${text}</button>`;
const back=()=>`<a class="button back" href="#home">← Startseite</a>`;
const APP_BASE=new URL('./',import.meta.url);
const asset=name=>new URL(name,APP_BASE).href;
let demo=false;
const trickSelections=new Map();
const STANCE_BUTTONS=['Regular','Fakie','Nollie','Switch'];
function selectionFor(id,direction='–'){return trickSelections.get(keyFor(id,direction))||{stance:'Regular',direction,open:true};}
function cardName(t,direction){return direction==='–'?t.name:`${direction==='FS'?'Frontside':'Backside'} ${t.name}`;}
function cardsFor(t){
 const directions=new Set();
 for(const source of catalog){const parsed=parseName(source.name);if(parsed.name.toLowerCase()===t.name.toLowerCase()&&parsed.variant.split(':')[1]!=='–')directions.add(parsed.variant.split(':')[1]);}
 for(const [v,f] of Object.entries(t.variants))if((f.canDo||f.practice)&&v.split(':')[1]!=='–')directions.add(v.split(':')[1]);
 const references=[record.state.session,...record.state.history].flatMap(r=>[...(r.selected||[]),...Object.keys(r.counts||{}),...Object.keys(r.landed||{})]).map(decodeKey).filter(k=>k&&k[0]===t.id);
 for(const [,v] of references)if(v.split(':')[1]!=='–')directions.add(v.split(':')[1]);
 if(!directions.size)return [{t,direction:'–',name:t.name}];
 const cards=['FS','BS'].map(direction=>({t,direction,name:cardName(t,direction)}));
 if(Object.entries(t.variants).some(([v,f])=>v.endsWith(':–')&&(f.canDo||f.practice))||references.some(([,v])=>v.endsWith(':–')))cards.push({t,direction:'–',name:`${t.name} (ohne Richtungsangabe)`});
 return cards;
}
function stanceButtons(t,direction='–'){
 const picked=selectionFor(t.id,direction);
 return `<div class="stance-buttons" aria-label="Stance für ${esc(cardName(t,direction))}">${STANCE_BUTTONS.map(stance=>{const f=t.variants[`${stance}:${direction}`]||{};const status=f.canDo?' ✓':f.practice?' ↗':'';return btn('select-stance',stance+status,picked.stance===stance?'active':'',`data-id="${esc(t.id)}" data-direction="${direction}" data-stance="${stance}" aria-label="${esc(cardName(t,direction))} ${stance} öffnen" aria-pressed="${picked.stance===stance}"`);}).join('')}</div>`;
}
function variantControls(t,direction='–'){
 const picked=selectionFor(t.id,direction),v=`${picked.stance}:${direction}`,flags=t.variants[v]||{};
 return `<div class="variant-controls"><strong>${esc(picked.stance)} · ${esc(cardName(t,direction))}</strong><div class="variant-actions">${btn('variant',flags.canDo?'✓ Kann ich':'Kann ich',flags.canDo?'active':'',`data-id="${esc(t.id)}" data-variant="${v}" data-field="canDo" aria-pressed="${!!flags.canDo}"`)}${btn('variant',flags.practice?'↗ Übe ich':'Übe ich',flags.practice?'active':'',`data-id="${esc(t.id)}" data-variant="${v}" data-field="practice" aria-pressed="${!!flags.practice}"`)}${btn('add-session','＋ Session','',`data-id="${esc(t.id)}" data-variant="${v}"`)}</div></div>`;
}
let user=null,csrf='',record=null,catalog=[],busy=false,syncStatus='',conflict=null,installPrompt=null,register=false,filter={search:'',category:'',status:''},saveQueue=Promise.resolve(),authRequired=false,tabLock=false;
let db;
let skateMode=false,renderedRoute='',trickScroll=0,trickReturnRoute='#tricks';
const openCategories=new Set();
function modeKey(){return `skate-mode:${APP_BASE.pathname}:${user?.id||'guest'}`;}
function captureTrickPosition(){if(renderedRoute!=='tricks')return;trickScroll=window.scrollY||0;document.querySelectorAll?.('.trick-category').forEach(el=>{if(el.open)openCategories.add(el.dataset.category);else openCategories.delete(el.dataset.category);});}
function modeButton(){return btn('toggle-skate',skateMode?'← Alle Bereiche':'Skate-Modus',skateMode?'':'primary');}
function learnedBadges(t,direction){const names=STANCE_BUTTONS.filter(stance=>t.variants[`${stance}:${direction}`]?.canDo);return names.length?`<div class="badges">${names.map(name=>`<span class="badge learned">✓ ${name}</span>`).join('')}</div>`:'';}
function practiceList(){const keys=practiceKeys(record.state.tricks,keyFor);return `<div class="panel"><div class="row between"><h2>Heute üben</h2><a href="#tricks" class="button">Tricks wählen</a></div>${keys.length?keys.map(k=>`<div class="practice-row"><span>${esc(selectedLabel(k))}</span>${btn('practice-session','＋ Session','',`data-key="${esc(k)}"`)}</div>`).join(''):'<p class="muted">Markiere Trickvarianten mit „Übe ich“, damit sie hier erscheinen.</p>'}${keys.length&&!record.state.session.active?btn('practice-start','Übeliste starten →','primary wide'):''}</div>`;}
function skateHome(){app.innerHTML=`<div class="row between"><span class="eyebrow">Skate-Modus</span>${modeButton()}</div><h1>Ab aufs Board<span class="lime">.</span></h1>${statusHTML()}<a href="#session" class="button skate-hero primary">${record.state.session.active?'▶ Session fortsetzen':'▶ Session starten'}</a>${practiceList()}<div class="grid"><a href="#tricks" class="button tile"><strong>Tricks</strong><small>Suchen und markieren</small></a><a href="#games" class="button tile"><strong>Games</strong><small>S.K.A.T.E. & Roulette</small></a></div>`;}

function openDB(){return new Promise((resolve,reject)=>{const request=indexedDB.open('skateprogress-web',1);request.onupgradeneeded=()=>request.result.createObjectStore('accounts');request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});}
function dbRead(id){return new Promise((resolve,reject)=>{const request=db.transaction('accounts').objectStore('accounts').get(id);request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});}
function dbWrite(id,value){return new Promise((resolve,reject)=>{const tx=db.transaction('accounts','readwrite');tx.objectStore('accounts').put(value,id);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});}
function dbDelete(id){return new Promise((resolve,reject)=>{const tx=db.transaction('accounts','readwrite');tx.objectStore('accounts').delete(id);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});}
function toast(message){$('#toast').textContent=message;$('#toast').style.display='block';clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('#toast').style.display='none',4500);}
async function api(path,method='GET',body){if(demo)throw Error('Die Demo verwendet keinen Server und keinen Login.');const response=await fetch(asset(`api/${path}`),{method,credentials:'same-origin',headers:body?{'Content-Type':'application/json','X-CSRF-Token':csrf}:{},body:body?JSON.stringify(body):undefined});const result=await response.json();if(!response.ok){const error=Error(result.error||'Anfrage fehlgeschlagen.');error.status=response.status;throw error;}return result;}
function statusHTML(){return `<span class="status ${!demo&&(record?.dirty||!navigator.onLine||authRequired)?'warn':''}" id="sync-status">${esc(syncStatus||(demo?'Demo · Nur auf diesem Gerät':!navigator.onLine?'Offline · Änderungen bleiben auf diesem Gerät':record?.dirty?'Änderungen auf diesem Gerät gespeichert':'Synchronisiert'))}</span>`;}
function updateStatus(){const el=$('#sync-status');if(el){el.textContent=syncStatus||(demo?'Demo · Nur auf diesem Gerät':!navigator.onLine?'Offline · Änderungen bleiben auf diesem Gerät':record?.dirty?'Änderungen auf diesem Gerät gespeichert':'Synchronisiert');el.classList.toggle('warn',!!!demo&&(record?.dirty||!navigator.onLine||authRequired));}}
function persist(){const snapshot=clone(record),id=user.id;saveQueue=saveQueue.then(()=>dbWrite(id,snapshot));return saveQueue;}
async function mutate(action,redraw=true){
 if(tabLock)throw Error('Diese App ist bereits in einem anderen Tab geöffnet.');
 const previous=clone(record);ensureExtras(record.state);action(record.state);if(JSON.stringify(record.state).length>10_000_000){record=previous;throw Error('Daten zu groß (10 MB). Bitte weniger Parkfotos speichern.');}record.dirty=true;record.edit=(record.edit||0)+1;syncStatus='';
 try{await persist();}catch(error){record=previous;throw Error('Lokaler Speicher voll oder nicht verfügbar. Änderung wurde nicht gespeichert. Bitte Backup exportieren.');}
 if(redraw)render();else updateStatus();scheduleSync();
}
function scheduleSync(){if(demo){syncStatus='Demo · Auf diesem Gerät gespeichert';updateStatus();return;}clearTimeout(scheduleSync.timer);scheduleSync.timer=setTimeout(()=>sync(),900);}
async function sync(){
 if(demo||!user||!record||busy||conflict||tabLock||!navigator.onLine)return;
 busy=true;syncStatus='Synchronisiere …';updateStatus();
 try{
  const remote=await api('state');authRequired=false;
  if(record.dirty){
   if(remote.revision!==record.revision){conflict=remote;syncStatus='Konflikt · Beide Datenstände bleiben erhalten';showConflict();return;}
   const snapshot=clone(record.state),edit=record.edit;
   const result=await api('state','PUT',{state:snapshot,revision:record.revision});record.revision=result.revision;
   if(record.edit===edit)record.dirty=false;
  }else if(remote.revision!==record.revision){
   // A local edit may occur while the GET was in flight.
   if(record.dirty){conflict=remote;showConflict();return;}
   record.state=Object.keys(remote.state).length?remote.state:emptyState(catalog);record.revision=remote.revision;render();
  }
  await persist();syncStatus=record.dirty?'Weitere Änderungen warten auf Synchronisierung':'Synchronisiert';
 }catch(error){
  if(error.status===409){conflict=await api('state').catch(()=>null);syncStatus='Synchronisierungskonflikt';if(conflict)showConflict();}
  else if(error.status===401){authRequired=true;syncStatus='Login abgelaufen · lokal weiter nutzbar';}
  else syncStatus=`Lokal gespeichert · ${error.status?error.message:'Server nicht erreichbar'}`;
 }finally{busy=false;updateStatus();if(record?.dirty&&!conflict&&!authRequired&&navigator.onLine&&syncStatus==='Weitere Änderungen warten auf Synchronisierung')scheduleSync();}
}
function exportJSON(state,name='SkateProgress-Web'){const blob=new Blob([JSON.stringify({format:'skateprogress-web',schemaVersion:1,exportedAt:new Date().toISOString(),state},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`${name}-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);}
function showDialog(html){modal.innerHTML=html;if(!modal.open)modal.showModal();}
function showConflict(){showDialog(`<h2>Zwei Datenstände</h2><p>Ein anderes Gerät hat Änderungen gespeichert. Dein lokaler Stand wurde nicht überschrieben.</p><p class="note">Exportiere beide Backups. Du kannst sie später über den Import zusammenführen. Beim Zusammenführen bleiben gesetzte Können-/Üben-Markierungen erhalten.</p><div class="row">${btn('export-local','Lokales Backup')}${btn('export-remote','Server-Backup')}</div><p>Welchen Stand möchtest du jetzt weiterverwenden?</p><div class="row">${btn('use-remote','Serverstand übernehmen')}${btn('use-local','Lokalen Stand hochladen','danger')}${btn('close','Später')}</div>`);}
function authView(){
 app.innerHTML=`<section class="auth"><span class="eyebrow">Dein nächster Trick wartet</span><h1>Mach jeden<br><span class="lime">Versuch sichtbar.</span></h1><p class="muted">Deine Tricks, deine Sessions, dein Fortschritt.<br>Auch offline am Spot.</p><form id="auth-form" class="panel"><h2>${register?'Account erstellen':'Willkommen zurück'}</h2><label>E-Mail<input name="email" type="email" autocomplete="username" required maxlength="254"></label><label>Passwort<input name="password" type="password" autocomplete="${register?'new-password':'current-password'}" minlength="12" maxlength="256" required placeholder="Mindestens 12 Zeichen"></label><p id="auth-error" class="error" role="alert"></p><button class="primary wide" type="submit">${register?'Registrieren':'Anmelden'} →</button><p class="muted">${register?'Schon einen Account?':'Zum ersten Mal hier?'}</p>${btn('toggle-auth',register?'Zur Anmeldung':'Account erstellen','wide')}<p><small>Der erste Login benötigt Internet. Danach bleibt dein Account auf diesem Gerät offline nutzbar. E-Mail dient hier als Loginname; Passwort-Reset per E-Mail ist in dieser Alpha noch nicht enthalten.</small></p></form></section>`;
}
const known=t=>Object.values(t.variants).filter(v=>v.canDo).length;
const practiced=t=>Object.values(t.variants).some(v=>v.practice);
function selectedLabel(k){const parts=decodeKey(k);if(!parts)return 'Unbekannter Trick';const t=record.state.tricks.find(t=>t.id===parts[0]);return t?`${cardName(t,parts[1].split(':')[1])} · ${parts[1].split(':')[0]}`:'Unbekannter Trick';}
function homeView(){
 if(skateMode){skateHome();return;}
 const s=record.state,landed=s.tricks.reduce((n,t)=>n+known(t),0),attempts=s.history.reduce((n,r)=>n+sessionCount(r),0);
 app.innerHTML=`<div class="row between"><span class="eyebrow">${demo?'Demomodus · Ohne Anmeldung':'Dein Skateboard. Dein Tempo.'}</span>${statusHTML()}</div><h1>Hey ${esc(s.profile.nickname||'Skater')}<span class="lime">.</span><br>Was geht heute?</h1><div class="row"><p class="muted">Ein neuer Trick beginnt mit dem nächsten Versuch.</p>${modeButton()}</div><a href="#session" class="button skate-hero primary">${s.session.active?'▶ Session fortsetzen':'▶ Session starten'}</a>${practiceList()}<div class="stats"><div class="stat"><b>${landed}</b><small>Tricks, die du kannst</small></div><div class="stat"><b>${s.history.length}</b><small>Sessions</small></div><div class="stat"><b>${attempts}</b><small>Versuche im Verlauf</small></div></div><div class="grid"><a href="#tricks" class="button tile"><span class="symbol">✦</span><strong>Trickliste</strong><small>${s.tricks.length} Tricks · Alle deine Varianten</small></a><a href="#history" class="button tile"><span class="symbol">◷</span><strong>Deine Sessions</strong><small>Jeder Versuch zählt.</small></a><a href="#profile" class="button tile"><span class="symbol">◎</span><strong>Dein Profil</strong><small>Stance, Setup und Fortschritt</small></a>${[['games','✦','Games','S.K.A.T.E. & Trick Roulette'],['wiki','?','Skate-Wiki','Begriffe und eigene Einträge'],['parks','⌖','Parks & Spots','Fotos, Notizen und Standort'],['plans','☷','Trainingspläne','Reihenfolge und Ziele'],['learning','★','Lernpfad','Schritt für Schritt aufs Board'],['stats','↗','Fortschritt','Versuche, Landungen, Dauer']].map(([route,icon,title,subtitle])=>`<a href="#${route}" class="button tile"><span class="symbol">${icon}</span><strong>${title}</strong><small>${subtitle}</small></a>`).join('')}</div><p><small>SKATEPROGRESS WEB · ALPHA 0.10 · ${demo?'DEMO · Nur auf diesem Gerät':navigator.onLine?'Online':'Offline'}</small></p>`;
}
function trickRows(){
 const cards=record.state.tricks.flatMap(cardsFor).filter(({t,direction,name})=>name.toLowerCase().includes(filter.search.toLowerCase())&&(!filter.category||t.category===filter.category)&&(!filter.status||(filter.status==='favorite'?t.favorite:Object.entries(t.variants).some(([v,f])=>v.endsWith(`:${direction}`)&&(filter.status==='known'?f.canDo:f.practice)))));
 const categories=[...new Set(cards.map(c=>c.t.category))];
 return `<p class="muted">${cards.length} Tricks</p>`+(categories.map(category=>`<details class="trick-category" data-category="${esc(category)}" ${openCategories.has(category)||filter.search||filter.category||filter.status?'open':''}><summary><strong>${esc(category)}</strong><span>${cards.filter(c=>c.t.category===category).length} Tricks</span></summary>${cards.filter(c=>c.t.category===category).map(({t,direction,name})=>`<article class="trick trick-card"><div class="row between"><a class="trick-title" href="#trick/${encodeURIComponent(t.id)}/${encodeURIComponent(direction)}"><h3>${esc(name)}</h3>${learnedBadges(t,direction)}</a>${btn('favorite',t.favorite?'★':'☆',t.favorite?'icon active':'icon',`data-id="${esc(t.id)}" aria-label="${t.favorite?'Favorit entfernen':'Als Favorit markieren'}"`)}</div></article>`).join('')}</details>`).join('')||'<div class="empty">Kein Treffer. Suche kürzer oder lege deinen eigenen Trick an.</div>');
}
function tricksView(){app.innerHTML=`${back()}<div class="row between"><h1>Deine Tricks<span class="lime">.</span></h1>${btn('add-trick','＋ Eigener Trick','primary')}</div><div class="filters"><label>Nach Namen suchen<input id="search" type="search" value="${esc(filter.search)}" placeholder="Ollie, Noseslide, Kickflip …"></label><label>Kategorie<select id="category"><option value="">Alle Kategorien</option>${[...new Set(record.state.tricks.map(t=>t.category))].map(c=>`<option ${filter.category===c?'selected':''}>${esc(c)}</option>`).join('')}</select></label><label>Anzeigen<select id="filter"><option value="">Alle Tricks</option>${[['known','Kann ich'],['practice','Übe ich'],['favorite','Favoriten']].map(([v,n])=>`<option value="${v}" ${v===filter.status?'selected':''}>${n}</option>`).join('')}</select></label></div><div id="trick-list">${trickRows()}</div>`;}
function trickView(id,direction='–'){
 const t=record.state.tricks.find(x=>x.id===id);if(!t){location.hash='#tricks';return;}
 if(!DIRECTIONS.includes(direction))direction='–';
 const video=safeVideo(t.youtube);
 app.innerHTML=`<a class="button back" href="${esc(trickReturnRoute)}">${trickReturnRoute.startsWith('#learning')?'← Lernweg':'← Trickliste'}</a><span class="eyebrow">${esc(t.category)}</span><h1>${esc(cardName(t,direction))}<span class="lime">.</span></h1><div class="row">${btn('favorite',t.favorite?'★ Favorit':'☆ Favorit','',`data-id="${esc(id)}"`)}${btn('warmup',t.warmup?'✓ Aufwärmtrick':'Als Aufwärmtrick markieren','',`data-id="${esc(id)}"`)}${video?`<a class="button" href="${esc(video)}" target="_blank" rel="noopener noreferrer">▶ Tutorial</a>`:''}</div><div class="panel"><h2>Deine Variante</h2>${stanceButtons(t,direction)}${variantControls(t,direction)}<p class="muted">Können und Üben werden für jede Stance einzeln gespeichert.</p></div>`;
}
function safeVideo(url){try{const u=new URL(url);return u.protocol==='https:'&&['www.youtube.com','youtube.com','youtu.be'].includes(u.hostname)?u.href:'';}catch{return '';}}
function sessionCard(s,k){const attempts=s.counts[k]||0,landed=s.landed[k]||0,target=s.targets?.[k];return `<article class="session-row"><h2>${esc(selectedLabel(k))}</h2><div class="attempt-summary"><span><b>${attempts}</b> Versuche</span><span><b>${landed}</b> gelandet</span></div>${target?`<p class="muted">Ziel: ${target} Landungen ${landed>=target?'✓ geschafft':''}</p><progress max="${target}" value="${Math.min(target,landed)}"></progress>`:''}<div class="attempt-buttons">${btn('attempt','＋ Fehlversuch','',`data-key="${esc(k)}"`)}${btn('attempt','✓ Gelandet','primary',`data-key="${esc(k)}" data-success="true"`)}</div></article>`;}
function sessionView(){
 const s=record.state.session;
 if(!s.active){app.innerHTML=`${back()}<span class="eyebrow">Ab an den Spot</span><h1>Deine Session<span class="lime">.</span></h1><p class="muted">Wähle deine Tricks und leg los.</p><div class="panel"><div class="row between"><h2>${esc(s.planName||'Auf dem Plan')}</h2>${btn('session-picker','＋ Tricks auswählen')}</div>${s.selected.length?s.selected.map(k=>`<div class="trick"><div>${esc(selectedLabel(k))}</div>${btn('remove-session','Entfernen','',`data-key="${esc(k)}"`)}</div>`).join(''):'<p class="muted">Noch keine Tricks ausgewählt. Du kannst auch frei starten.</p>'}${btn('start-session','Session starten →','primary wide')}</div>`;return;}
 const index=boundedFocus(s),focus=s.focus??skateMode,keys=focus?s.selected.slice(index,index+1):s.selected;
 app.innerHTML=`${back()}<div class="row between"><span class="eyebrow">${focus?'Fokusmodus':'Session läuft'}</span>${statusHTML()}</div><div class="row between"><div class="timer" id="timer">${duration(Date.now()-s.started)}</div>${btn('toggle-focus',focus?'Alle Tricks':'Ein Trick im Fokus')}</div><p class="muted">${s.boardName?`${esc(s.boardName)} · `:''}${sessionCount(s)} Versuche · ${Object.values(s.landed||{}).reduce((a,b)=>a+b,0)} Landungen</p>${focus&&s.selected.length?`<div class="focus-nav">${btn('focus-prev','← Vorheriger','',index===0?'disabled':'')}<span>${index+1} / ${s.selected.length}</span>${btn('focus-next','Nächster →','',index===s.selected.length-1?'disabled':'')}</div>`:''}${s.learningTasks&&Object.keys(s.learningTasks).length?`<div class="panel"><h2>Lernziele dieser Session</h2>${Object.entries(s.learningTasks).filter(([k])=>s.selected.includes(k)).map(([k,id])=>{const task=findTask(id)?.task;return task?`<p><strong>${esc(task.title)}</strong>: ${esc(task.goal)}</p>`:'';}).join('')}<small>Nur passende Landungen bestätigen. Ziele werden beim Speichern ausgewertet; weitere Anforderungen bestätigst du selbst im Lernpfad.</small></div>`:''}${keys.map(k=>sessionCard(s,k)).join('')}${!s.selected.length?'<p class="empty">Füge deinen ersten Trick hinzu, um Versuche zu zählen.</p>':''}<div class="row subnav">${btn('undo-attempt','↶ Letzte Eingabe rückgängig','',s.undo?.length?'':'disabled')}${btn('session-picker','＋ Trick hinzufügen')}</div><details class="panel"><summary>Notiz zur Session</summary><textarea id="session-note" maxlength="2000" placeholder="Was hat heute geklappt?">${esc(s.note||'')}</textarea></details><div class="session-finish"><div class="row">${btn('finish-session','Session speichern','primary')}${btn('cancel-session','Abbrechen','danger')}</div></div>`;
}

function duration(ms){const seconds=Math.max(0,Math.floor(ms/1000));return `${String(Math.floor(seconds/3600)).padStart(2,'0')}:${String(Math.floor(seconds/60)%60).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;}
function sessionResultView(id){
 const r=record.state.history.find(r=>r.id===id);if(!r){app.innerHTML=`${back()}<p>Diese Session wurde nicht gefunden.</p>`;return;}
 const summary=sessionSummary(r,record.state.tricks),learned=r.learned||summary.learned;
 app.innerHTML=`${back()}<span class="eyebrow">Session gespeichert · ${esc(new Date(r.ended).toLocaleDateString('de-DE'))}</span><h1>Das hast du geschafft<span class="lime">.</span></h1><div class="stats"><div class="stat"><b>${summary.attempts}</b><small>Versuche</small></div><div class="stat"><b>${summary.landings}</b><small>Landungen</small></div><div class="stat"><b>${duration(r.ended-r.started)}</b><small>Auf dem Board</small></div></div>${r.boardName?`<p class="muted">Board: ${esc(r.boardName)}</p>`:''}<div class="panel"><h2>Neu gelernt</h2>${learned.length?learned.map(k=>`<p class="lime">✓ ${esc(selectedLabel(k))}</p>`).join(''):'<p>Heute kein neuer „Kann ich“-Trick. Deine Versuche und Landungen zählen trotzdem.</p>'}</div>${r.learningResult?`<div class="panel"><h2>Dein Lernpfad · +${r.learningResult.xp} XP</h2>${r.learningResult.changes.length?r.learningResult.changes.map(c=>`<p class="${c.complete?'lime':''}">${c.complete?'✓':'↗'} ${esc(c.title)} · ${c.count} / ${c.target}${c.mode==='session'?' in einer Session':''}</p>`).join(''):'<p>Keine neue Challenge bestätigt. Grundlagen und Übungen mit zusätzlichen Anforderungen bestätigst du im Lernpfad selbst.</p>'}${r.learningResult.badges.map(b=>`<p class="badge medal">★ Neu: ${esc(b)}</p>`).join('')}<p><a class="button" href="#learning${r.learningLevel?'/'+encodeURIComponent(r.learningLevel):''}">Zum Lernpfad</a></p></div>`:''}${summary.goals.length?`<div class="panel"><h2>Deine Sessionziele</h2>${summary.goals.map(g=>`<div class="history row between"><span>${esc(selectedLabel(g.key))}</span><strong class="${g.landed>=g.target?'lime':''}">${g.landed>=g.target?'✓ Erreicht':'Noch offen'} · ${g.landed} / ${g.target}</strong></div>`).join('')}</div>`:''}<div class="panel"><h2>Nächstes Mal</h2>${summary.next?`<p>${esc(selectedLabel(summary.next))}: ${summary.goals.some(g=>g.key===summary.next&&g.landed<g.target)?'Dein Ziel ist noch offen. Nimm diesen Trick wieder mit.':'Hier hast du schon Versuche gesammelt. Übe ihn beim nächsten Mal weiter.'}</p>${btn('result-practice','Für nächste Session vormerken','primary',`data-key="${esc(summary.next)}"`)}`:'<p>Wähle dein nächstes Ziel im Lernpfad oder wiederhole deine heutigen Tricks.</p><a href="#learning" class="button primary">Zum Lernpfad</a>'}</div>${r.note?`<div class="panel"><h2>Deine Notiz</h2><p class="note">${esc(r.note)}</p></div>`:''}<a href="#history" class="button">Alle Sessions ansehen</a>`;
}
function historyView(){const history=[...record.state.history].sort((a,b)=>b.started-a.started);app.innerHTML=`${back()}<span class="eyebrow">Dein Fortschritt bleibt</span><h1>Sessionverlauf<span class="lime">.</span></h1>${history.length?history.map(r=>`<article class="panel"><div class="row between"><h2>${esc(new Date(r.started).toLocaleDateString('de-DE',{day:'2-digit',month:'long',year:'numeric'}))}</h2><span class="badge">${duration(r.ended-r.started)}</span></div><p>${r.boardName?`${esc(r.boardName)} · `:''}${r.planName?`${esc(r.planName)} · `:''}${sessionCount(r)} Versuche · ${Object.values(r.landed||{}).reduce((a,b)=>a+b,0)} gelandet</p>${r.selected.map(k=>`<div class="history row between"><span>${esc(selectedLabel(k))}</span><strong>${r.counts[k]||0} Versuche · ${r.landed?.[k]||0} ✓</strong></div>`).join('')}<p><a class="button" href="#session-result/${esc(r.id)}">Session-Abschluss ansehen</a></p>${r.note?`<p class="note">${esc(r.note)}</p>`:''}</article>`).join(''):'<div class="empty">Deine erste gespeicherte Session erscheint hier.</div>'}`;}
function boardEditor(id){const p=ensureBoards(record.state.profile),board=p.boards.find(b=>b.id===id)||{id:'',name:'',setup:{}};showDialog(`<h2>${id?'Board bearbeiten':'Neues Board'}</h2><form id="board-form"><input type="hidden" name="id" value="${esc(board.id)}"><label>Name des Boards<input name="name" required maxlength="160" value="${esc(board.name)}" placeholder="Street-Setup, Cruiser …"></label><div class="formgrid">${BOARD_FIELDS.map(([key,label])=>`<label>${label}<input name="${key}" value="${esc(board.setup[key])}" maxlength="100"></label>`).join('')}</div><label class="check"><input name="active" type="checkbox" ${!p.boards.length||p.activeBoardId===id?'checked':''}> Als aktives Board verwenden</label><div class="row"><button class="primary" type="submit">Board speichern</button>${btn('close','Abbrechen')}</div></form>`);}
function profileView(){
 const p=ensureBoards(record.state.profile),info=stanceInfo(p.frontFoot,p.pushFoot);
 app.innerHTML=`${back()}<span class="eyebrow">Das bist du auf dem Board</span><h1>Dein Profil<span class="lime">.</span></h1>${btn('share-profile','Profilkarte teilen','primary')}<div class="panel"><div class="row between"><div><h2>${esc(p.nickname||'Skater')}</h2><p id="stance-description" class="lime">${info.stance} · ${info.pushStyle}</p></div><span class="badge">${record.state.tricks.reduce((a,t)=>a+known(t),0)} Tricks, die du kannst</span></div><div id="profile-diagram">${stanceDiagram(p.frontFoot,p.pushFoot)}</div></div><form id="profile-form" class="panel"><h2>Dein Stand</h2><label>Nickname<input name="nickname" value="${esc(p.nickname)}" maxlength="60"></label><div class="formgrid">${[['frontFoot','Vorderer Fuß'],['pushFoot','Fuß zum Pushen']].map(([field,label])=>`<label>${label}<select id="profile-${field}" name="${field}">${['Links','Rechts'].map(v=>`<option ${p[field]===v?'selected':''}>${v}</option>`).join('')}</select></label>`).join('')}</div><p><button type="submit" class="primary">Profil speichern</button></p></form><div class="panel"><div class="row between"><h2>Meine Boards</h2>${btn('board-add','＋ Neues Board','primary')}</div>${p.boards.length?p.boards.map(board=>`<details class="board-card"><summary><strong>${esc(board.name)}</strong>${p.activeBoardId===board.id?' <span class="badge">Aktiv</span>':''}</summary><dl>${BOARD_FIELDS.filter(([key])=>board.setup[key]).map(([key,label])=>`<dt>${label}</dt><dd>${esc(board.setup[key])}</dd>`).join('')||'<p class="muted">Noch keine Komponenten eingetragen.</p>'}</dl><div class="row">${p.activeBoardId!==board.id?btn('board-active','Dieses Board verwenden','primary',`data-id="${esc(board.id)}"`):''}${btn('board-edit','Bearbeiten','',`data-id="${esc(board.id)}"`)}${btn('board-delete','Löschen','danger',`data-id="${esc(board.id)}"`)}</div></details>`).join(''):'<p class="muted">Füge ein Board hinzu, wenn du dein Setup festhalten möchtest.</p>'}</div>`;
}

function settingsView(){app.innerHTML=`${back()}<h1>Einstellungen<span class="lime">.</span></h1>${demo?`<div class="panel"><h2>Lokale Testversion</h2><p>Du testest ohne Account. Tricks, Profil und Sessions bleiben ausschließlich im Browser auf diesem Gerät. Es werden keine Daten hochgeladen oder zwischen Geräten synchronisiert.</p><p class="note">Exportiere ein Backup, bevor du den Browser-Speicher löschst oder später auf deine selbst gehostete Version wechselst.</p>${btn('reset-demo','Demodaten zurücksetzen','danger')}</div>`:`<div class="panel"><h2>Dein Account</h2><p>${esc(user.email)}</p>${statusHTML()}<div class="row subnav">${btn('sync','Jetzt synchronisieren')}${authRequired?btn('reauth','Erneut anmelden'):''}${btn('logout','Abmelden','danger')}</div><p class="muted">Beim Abmelden wird der lokale Account-Speicher auf diesem Gerät entfernt. Nicht synchronisierte Daten vorher exportieren.</p></div>`}<div class="panel"><h2>Wie eine App installieren</h2><p>Android / Chrome: Browsermenü → „App installieren“ oder „Zum Startbildschirm hinzufügen“.<br>iPhone / Safari: Teilen → „Zum Home-Bildschirm“.</p>${installPrompt?btn('install','SkateProgress installieren','primary'):''}<p><small>Installation und Offlinebetrieb benötigen HTTPS oder localhost. Nach dem ersten Laden sind Trickliste, Profil und Sessions offline verfügbar. Browser können lokale Daten bei Speicherknappheit entfernen; exportiere wichtige Backups.</small></p></div><div class="panel"><h2>Import & Backup</h2><p>Web-Backup oder Android-Backup importieren. Trickmarkierungen und Verlauf werden ergänzt; das importierte Profil wird übernommen. Eine laufende lokale Session bleibt erhalten.</p><div class="row">${btn('export','Backup exportieren')}<label class="button">JSON importieren<input id="import-file" type="file" accept="application/json,.json" hidden></label></div><p><small>In der Android-App den vollständigen Backup-Export verwenden. Der reine Inhalte-Export enthält keinen Fortschritt. Parks mit Fotos, eigene Wiki-Begriffe, S.K.A.T.E.-Spieler, Trainingspläne und Lernpfad werden ebenfalls übernommen. Große Parkfotos vor dem Import verkleinern.</small></p></div>${demo?'':`<form class="panel" id="password-form"><h2>Passwort ändern</h2><label>Aktuelles Passwort<input name="old" type="password" autocomplete="current-password" required maxlength="256"></label><label>Neues Passwort<input name="new" type="password" autocomplete="new-password" required minlength="12" maxlength="256"></label><button type="submit">Passwort ändern</button></form>`}<p><small>WEB ALPHA 0.10 · ${demo?'Lokale Demo':'Individuelle Accounts'} · Kein Tracking</small></p>`;}
function render(){
 captureTrickPosition();
 $('#settings').hidden=!user;
 if(tabLock){app.innerHTML='<div class="panel"><h2>SkateProgress ist bereits geöffnet</h2><p>Nutze den anderen Tab oder schließe ihn und lade diesen Tab neu. So bleiben deine Änderungen konsistent.</p></div>';return;}
 if(!user||!record){authView();return;}
 ensureExtras(record.state);
 const route=location.hash.slice(1)||'home';
 if(skateMode&&!['home','tricks','session','games'].includes(route)&&!route.startsWith('trick/')){skateMode=false;localStorage.setItem(modeKey(),'false');}
 const previousRoute=renderedRoute;if(route.startsWith('trick/')&&!previousRoute.startsWith('trick/'))trickReturnRoute=previousRoute.startsWith('learning')?`#${previousRoute}`:'#tricks';renderedRoute=route;
 if(route==='tricks')tricksView();else if(route.startsWith('trick/')){try{const [rawId,rawDirection]=route.slice(6).split('/');trickView(decodeURIComponent(rawId),rawDirection?decodeURIComponent(rawDirection):'–');}catch{location.hash='#tricks';}}
 else if(route.startsWith('session-result/'))sessionResultView(route.slice(15));else if(route==='session')sessionView();else if(route==='profile')profileView();else if(route==='history')historyView();else if(route==='settings')settingsView();else if(!extras.render(route))homeView();
 if(route==='tricks')setTimeout(()=>window.scrollTo(0,trickScroll),0);else if(previousRoute!==route)window.scrollTo(0,0);
}
function seedSelection(s){for(const t of s.tricks)for(const [v,f] of Object.entries(t.variants))if(f.practice||t.favorite&&(f.canDo||f.practice)||t.warmup&&f.canDo){const k=keyFor(t.id,v);if(!s.session.selected.includes(k))s.session.selected.push(k);}}
function sessionOptions(search=''){return record.state.tricks.flatMap(cardsFor).filter(c=>c.name.toLowerCase().includes(search.toLowerCase())).sort((a,b)=>a.name.localeCompare(b.name)).map(({t,direction,name})=>`<option value="${esc(keyFor(t.id,direction))}">${esc(name)}</option>`).join('');}
function sessionPicker(){const cards=record.state.tricks.flatMap(cardsFor).sort((a,b)=>a.name.localeCompare(b.name));showDialog(`<h2>Trick hinzufügen</h2><form id="picker-form"><label>Trick suchen<input id="session-picker-search" type="search" placeholder="Ollie, Noseslide …"></label><label>Trick<select id="session-card" name="card" required>${sessionOptions()}</select></label><label>Stance<select name="stance">${STANCE_BUTTONS.map(v=>`<option>${v}</option>`).join('')}</select></label><div class="row"><button type="submit" class="primary">Hinzufügen</button>${btn('close','Schließen')}</div></form>`);}

const extras=createExtras({navigate:route=>{location.hash=route;},getState:()=>record.state,mutate,esc,btn,back,showDialog,toast,selectedLabel,getChoices:()=>record.state.tricks.flatMap(cardsFor).flatMap(({t,direction,name})=>STANCE_BUTTONS.map(stance=>({key:keyFor(t.id,`${stance}:${direction}`),name:`${name} · ${stance}`}))),keyFor,app,modal});
document.addEventListener('click',async event=>{
 const button=event.target.closest('[data-action]');if(!button)return;
 const {action,id,variant,field,key,delta,landed}=button.dataset;
 try{
  if(await extras.click(action,button.dataset))return;
  if(action==='toggle-skate'){skateMode=!skateMode;localStorage.setItem(modeKey(),String(skateMode));if(skateMode&&record.state.session.active){await mutate(s=>s.session.focus=true,false);}location.hash='#home';render();return;}
  if(action==='practice-session'){await mutate(s=>{if(!s.session.selected.includes(key))s.session.selected.push(key);},false);toast('Für die Session hinzugefügt');return;}
  if(action==='practice-start'){if(record.state.session.active)throw Error('Eine Session läuft bereits.');await mutate(s=>{s.session.learningTasks={};delete s.session.learningLevel;s.session.selected=practiceKeys(s.tricks,keyFor);s.session.active=true;s.session.learnedAtStart=knownKeys(s.tricks);s.session.newlyLearned=[];s.session.started=Date.now();s.session.counts={};s.session.landed={};s.session.undo=[];s.session.targets={};s.session.planName='';s.session.note='';s.session.focus=true;s.session.focusIndex=0;const board=s.profile.boards?.find(b=>b.id===s.profile.activeBoardId);s.session.boardId=board?.id||'';s.session.boardName=board?.name||'';});location.hash='#session';return;}
  if(action==='toggle-focus'){await mutate(s=>{s.session.focus=!(s.session.focus??skateMode);});return;}
  if(action==='focus-prev'||action==='focus-next'){await mutate(s=>{s.session.focusIndex=boundedFocus(s.session)+(action==='focus-next'?1:-1);boundedFocus(s.session);});return;}
  if(action==='attempt'){let learned=false;await mutate(s=>{learned=recordAttemptAndLearn(s,key,button.dataset.success==='true');});if(learned)toast(`✓ ${selectedLabel(key)} · dreimal gelandet, jetzt „Kann ich“`);return;}
  if(action==='undo-attempt'){await mutate(s=>undoAttemptAndLearn(s));toast('Letzte Eingabe rückgängig');return;}
  if(action==='reset-demo'){if(!demo)return;exportJSON(record.state);if(!confirm('Demodaten auf diesem Gerät zurücksetzen? Vorher das angebotene Backup speichern.'))return;await saveQueue;record={state:emptyState(catalog),revision:0,dirty:false,edit:0};await persist();render();toast('Demo zurückgesetzt');return;}
  if(action==='close'){modal.close();return;}
  if(action==='toggle-auth'){register=!register;authView();return;}
  if(action==='sync'){await sync();if(conflict)showConflict();return;}
  if(action==='export'){exportJSON(record.state);return;}
  if(action==='export-local'){exportJSON(record.state,'SkateProgress-Lokal');return;}
  if(action==='export-remote'){exportJSON(conflict.state,'SkateProgress-Server');return;}
  if(action==='use-remote'){
   if(!confirm('Lokalen Stand durch den Serverstand ersetzen? Nicht synchronisierte Änderungen zuerst exportieren.'))return;
   record.state=Object.keys(conflict.state).length?conflict.state:emptyState(catalog);record.revision=conflict.revision;record.dirty=false;record.edit++;await persist();conflict=null;modal.close();render();await sync();return;
  }
  if(action==='use-local'){
   if(!confirm('Serverstand mit deinem lokalen Stand ersetzen? Server-Backup vorher exportieren.'))return;
   record.revision=conflict.revision;record.dirty=true;await persist();conflict=null;modal.close();await sync();return;
  }
  if(action==='install'){await installPrompt.prompt();installPrompt=null;render();return;}
  if(action==='reauth'){showDialog(`<h2>Erneut anmelden</h2><form id="reauth-form"><p>${esc(user.email)}</p><label>Passwort<input name="password" type="password" autocomplete="current-password" required minlength="12" maxlength="256"></label><div class="row"><button class="primary" type="submit">Anmelden</button>${btn('close','Schließen')}</div></form>`);return;}
  if(action==='logout'){
   if(busy)throw Error('Synchronisierung läuft noch. Bitte kurz warten und erneut abmelden.');
   if(!navigator.onLine)throw Error('Zum vollständigen Abmelden bitte online gehen. Dein lokaler Stand bleibt bis dahin erhalten.');
   if(record.dirty){exportJSON(record.state);if(!confirm('Nicht synchronisierte Daten wurden als Backup angeboten. Trotzdem abmelden und lokalen Speicher entfernen?'))return;}
   await saveQueue;await api('logout','POST',{});await dbDelete(user.id);localStorage.removeItem('skate-user');user=null;record=null;csrf='';conflict=null;modal.close();location.hash='#home';render();return;
  }
  if(action==='board-add'||action==='board-edit'){boardEditor(id);return;}
  if(action==='board-active'){await mutate(s=>{s.profile.activeBoardId=id;ensureBoards(s.profile);});toast('Aktives Board gewechselt');return;}
  if(action==='board-delete'){if(confirm('Dieses Board löschen? Gespeicherte Sessions bleiben erhalten.'))await mutate(s=>{s.profile.boards=s.profile.boards.filter(b=>b.id!==id);ensureBoards(s.profile);});return;}
  if(action==='select-stance'){const direction=button.dataset.direction||'–';trickSelections.set(keyFor(id,direction),{stance:button.dataset.stance,direction,open:true});const route=`#trick/${encodeURIComponent(id)}/${encodeURIComponent(direction)}`;if(location.hash===route)render();else location.hash=route;return;}
  if(action==='favorite'||action==='warmup'){await mutate(s=>{const t=s.tricks.find(t=>t.id===id);const f=action==='favorite'?'favorite':'warmup';t[f]=!t[f];});return;}
  if(action==='variant'){await mutate(s=>{const t=s.tricks.find(t=>t.id===id);t.variants[variant]??={canDo:false,practice:false};t.variants[variant][field]=!t.variants[variant][field];t.variants[variant].editVersion=(t.variants[variant].editVersion||0)+1;});return;}
  if(action==='add-trick'){showDialog(`<h2>Dein eigener Trick</h2><form id="trick-form"><label>Name<input name="name" required maxlength="120" placeholder="Trickname ohne Stance-Präfix"></label><label>Kategorie<select name="category">${['Basics','Flatground','Grinds & Slides','Transition','Freestyle'].map(v=>`<option>${v}</option>`).join('')}</select></label><label>YouTube-Link (optional)<input name="youtube" type="url" maxlength="500"></label><div class="row"><button class="primary" type="submit">Trick anlegen</button>${btn('close','Abbrechen')}</div></form>`);return;}
  if(action==='add-session'){await mutate(s=>{const k=keyFor(id,variant);if(!s.session.selected.includes(k))s.session.selected.push(k);},false);toast('Für deine Session hinzugefügt');return;}
  if(action==='result-practice'){await mutate(s=>{const [id,v]=decodeKey(key)||[];const t=s.tricks.find(t=>t.id===id);if(!t)throw Error('Dieser Trick ist nicht mehr vorhanden.');t.variants[v]??={canDo:false,practice:false};t.variants[v].practice=true;t.variants[v].editVersion=(t.variants[v].editVersion||0)+1;if(!s.session.active&&!s.session.selected.includes(key))s.session.selected.push(key);});toast('Für die nächste Session vorgemerkt');return;}
  if(action==='session-picker'){sessionPicker();return;}
  if(action==='remove-session'){await mutate(s=>{s.session.selected=s.session.selected.filter(x=>x!==key);});return;}
  if(action==='start-session'){await mutate(s=>{s.session.active=true;s.session.learnedAtStart=knownKeys(s.tricks);s.session.newlyLearned=[];s.session.started=Date.now();s.session.counts={};s.session.landed={};s.session.note='';s.session.undo=[];s.session.focus=skateMode;s.session.focusIndex=0;const board=s.profile.boards?.find(b=>b.id===s.profile.activeBoardId);s.session.boardId=board?.id||'';s.session.boardName=board?.name||'';});return;}
  if(action==='count'){await mutate(s=>changeCount(s.session,key,landed==='true',Number(delta)));return;}
  if(action==='finish-session'){
   if(!record.state.session.active)return;
   const note=$('#session-note')?.value??record.state.session.note??'';const resultId=crypto.randomUUID();
   await mutate(s=>{applySessionLearning(s);s.history.push({...clone(s.session),id:resultId,ended:Date.now(),note,learned:sessionSummary(s.session,s.tricks).learned});s.session={active:false,started:0,selected:[],counts:{},landed:{},note:''};seedSelection(s);});location.hash=`#session-result/${resultId}`;toast('Session gespeichert');return;
  }
  if(action==='cancel-session'){showDialog(`<h2>Session abbrechen?</h2><p>Die Versuche dieser Session werden verworfen. Deine Trickmarkierungen bleiben erhalten.</p><div class="row">${btn('confirm-cancel','Session verwerfen','danger')}${btn('close','Weiter skaten','primary')}</div>`);return;}
  if(action==='confirm-cancel'){await mutate(s=>{s.session={active:false,started:0,selected:[],counts:{},landed:{},note:''};seedSelection(s);});modal.close();toast('Session verworfen');return;}
  if(action==='confirm-import'){await mutate(s=>Object.assign(s,mergeImport(s,window.pendingImport)));window.pendingImport=null;modal.close();toast('Import ergänzt');return;}
 }catch(error){toast(error.message);}
});
document.addEventListener('submit',async event=>{
 event.preventDefault();const form=event.target,values=Object.fromEntries(new FormData(form)),submit=form.querySelector('[type=submit]');submit.disabled=true;
 try{
  if(await extras.submit(form,values))return;
  if(form.id==='auth-form'){
   const result=await api(register?'register':'login','POST',values);user=result.user;csrf=result.csrf;authRequired=false;
   await loadAccount();location.hash='#home';render();await sync();
  }else if(form.id==='reauth-form'){
   const result=await api('login','POST',{email:user.email,password:values.password});csrf=result.csrf;authRequired=false;modal.close();await sync();
  }else if(form.id==='profile-form'){
   await mutate(s=>{s.profile={...s.profile,nickname:values.nickname.trim(),frontFoot:values.frontFoot,pushFoot:values.pushFoot,setup:s.profile.setup};});toast('Profil gespeichert');
  }else if(form.id==='board-form'){
   if(record.state.profile.boards.length>=30&&!values.id)throw Error('Maximal 30 Boards.');const board={id:values.id||crypto.randomUUID(),name:values.name.trim(),setup:Object.fromEntries(BOARD_FIELDS.map(([key])=>[key,values[key]||'']))};if(!board.name)throw Error('Bitte einen Namen eingeben.');await mutate(s=>saveBoard(s.profile,board,!!values.active));modal.close();toast('Board gespeichert');
  }else if(form.id==='picker-form'){
   await mutate(s=>{const [id,direction]=JSON.parse(values.card);const k=keyFor(id,`${values.stance}:${direction}`);if(!s.session.selected.includes(k))s.session.selected.push(k);});modal.close();toast('Trick hinzugefügt');
  }else if(form.id==='trick-form'){
   const name=values.name.trim();if(!name)throw Error('Bitte einen Namen eingeben.');if(record.state.tricks.some(t=>t.name.toLowerCase()===name.toLowerCase()))throw Error('Dieser Trick ist schon vorhanden.');
   if(values.youtube&&!safeVideo(values.youtube))throw Error('Bitte einen HTTPS-Link zu YouTube verwenden.');
   const id=`custom-${crypto.randomUUID()}`;await mutate(s=>{s.tricks.push({id,name,category:values.category,youtube:values.youtube,custom:true,favorite:false,warmup:false,variants:{}});});modal.close();location.hash=`#trick/${encodeURIComponent(id)}`;
  }else if(form.id==='password-form'){await api('password','POST',values);form.reset();toast('Passwort geändert. Andere Geräte wurden abgemeldet.');}
 }catch(error){if(form.id==='auth-form')$('#auth-error').textContent=error.message;else toast(error.message);}finally{submit.disabled=false;}
});
document.addEventListener('input',async event=>{
 extras.input(event.target);
 if(event.target.id==='session-picker-search')$('#session-card').innerHTML=sessionOptions(event.target.value);
 if(event.target.id==='search'){captureTrickPosition();filter.search=event.target.value;$('#trick-list').innerHTML=trickRows();}
 if(event.target.id==='session-note'){try{await mutate(s=>{s.session.note=event.target.value;},false);}catch(error){toast(error.message);}}
});
document.addEventListener('change',async event=>{
 if(event.target.id==='profile-frontFoot'||event.target.id==='profile-pushFoot'){const front=$('#profile-frontFoot').value,push=$('#profile-pushFoot').value,info=stanceInfo(front,push);$('#profile-diagram').innerHTML=stanceDiagram(front,push);$('#stance-description').textContent=`${info.stance} · ${info.pushStyle} (noch nicht gespeichert)`;}
 if(event.target.id==='category'){captureTrickPosition();filter.category=event.target.value;$('#trick-list').innerHTML=trickRows();}
 if(event.target.id==='filter'){captureTrickPosition();filter.status=event.target.value;$('#trick-list').innerHTML=trickRows();}
 if(event.target.id==='import-file'){
  try{const file=event.target.files[0];if(!file)return;if(file.size>80_000_000)throw Error('Datei zu groß (maximal 80 MB).');
   const data=readImport(JSON.parse(await file.text()));window.pendingImport=data;
   showDialog(`<h2>Import prüfen</h2><p>${data.tricks.length} Tricks · ${data.history.length} Sessions · ${data.extras?.parks.length||0} Parks · ${data.extras?.plans.length||0} Pläne · ${data.extras?.wiki.length||0} eigene Wiki-Begriffe${data.profile?' · Profil':''}${data.session?' · laufende Session':''}</p><p>Markierungen werden ergänzt und Sessions anhand ihrer IDs zusammengeführt. Das importierte Profil ersetzt deine Profilangaben.</p>${data.warning?`<p class="note">${esc(data.warning)}</p>`:''}<div class="row">${btn('confirm-import','Import ergänzen','primary')}${btn('close','Abbrechen')}</div>`);
  }catch(error){toast(error.message);}finally{event.target.value='';}
 }
});
document.addEventListener('toggle',event=>{const el=event.target;if(el.classList?.contains('trick-category')&&el.dataset.category){if(el.open)openCategories.add(el.dataset.category);else openCategories.delete(el.dataset.category);}},true);
$('#settings').addEventListener('click',()=>location.hash='#settings');
window.addEventListener('hashchange',async()=>{if(user&&record&&location.hash==='#session'&&!record.state.session.active&&!record.state.session.selected.length){try{await mutate(seedSelection,false);}catch(e){toast(e.message);}}render();});
window.addEventListener('online',()=>{syncStatus='';updateStatus();sync();});window.addEventListener('offline',()=>{syncStatus='Offline · Änderungen bleiben auf diesem Gerät';updateStatus();});
window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();installPrompt=event;if(location.hash==='#settings')render();});
window.addEventListener('appinstalled',()=>{installPrompt=null;toast('SkateProgress ist installiert');});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')sync();});
setInterval(()=>{const timer=$('#timer');if(timer&&record?.state.session.active)timer.textContent=duration(Date.now()-record.state.session.started);},1000);
async function loadAccount(){
 skateMode=localStorage.getItem(modeKey())==='true';
 record=await dbRead(user.id);
 if(!record){const remote=await api('state');record={state:Object.keys(remote.state).length?remote.state:emptyState(catalog),revision:remote.revision,dirty:!Object.keys(remote.state).length,edit:0};await persist();}
 localStorage.setItem('skate-user',JSON.stringify(user));
 navigator.storage?.persist?.().catch(()=>{});
}
async function start(){
 try{
  // A single active tab protects IndexedDB from stale tab writes.
  if(navigator.locks){let resolve;const ready=new Promise(r=>resolve=r);navigator.locks.request(`skateprogress-active-tab:${APP_BASE.pathname}`,{ifAvailable:true},async lock=>{tabLock=!lock;resolve();if(lock)await new Promise(()=>{});});await ready;if(tabLock){render();return;}}
  db=await openDB();demo=(await fetch(asset('config.json')).then(r=>{if(!r.ok)throw Error('App-Konfiguration fehlt.');return r.json();})).mode==='demo';catalog=await fetch(asset('tricks.json')).then(r=>r.json());
  if('serviceWorker' in navigator)navigator.serviceWorker.register(asset('sw.js'),{scope:APP_BASE.pathname}).then(reg=>{reg.addEventListener('updatefound',()=>{const worker=reg.installing;worker?.addEventListener('statechange',()=>{if(worker.state==='installed'&&navigator.serviceWorker.controller)toast('Update bereit. App vollständig schließen und neu öffnen.');});});}).catch(()=>{});
  if(demo){user={id:`demo:${APP_BASE.pathname}`,email:''};record=await dbRead(user.id);skateMode=localStorage.getItem(modeKey())==='true';if(!record){record={state:emptyState(catalog),revision:0,dirty:false,edit:0};await persist();}syncStatus='Demo · Nur auf diesem Gerät';navigator.storage?.persist?.().catch(()=>{});render();return;}
  const remembered=localStorage.getItem('skate-user');if(remembered){try{user=JSON.parse(remembered);record=await dbRead(user.id);skateMode=localStorage.getItem(modeKey())==='true';}catch{user=null;}}
  try{const result=await api('me');csrf=result.csrf;if(user?.id!==result.user.id){user=result.user;await loadAccount();}else{user=result.user;if(!record)await loadAccount();}}
  catch(error){if(user&&record){authRequired=error.status===401;syncStatus=authRequired?'Login abgelaufen · lokal weiter nutzbar':'Offline · lokal weiter nutzbar';}else{user=null;record=null;}}
  render();await sync();
 }catch(error){app.innerHTML=`<div class="panel"><h2>Start nicht möglich</h2><p class="error">${esc(error.message)}</p><p>Bitte einen aktuellen Browser mit aktiviertem lokalen Speicher verwenden und die Seite neu laden.</p></div>`;}
}
start();
