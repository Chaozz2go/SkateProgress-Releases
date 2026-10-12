export const htmlEscape=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ALIASES={Board:['Skateboard','Skateboards','Boards'],Rampe:['Rampen'],Quarterpipe:['Quarterpipes'],Deck:['Brett','Bretter','Decks'],Trucks:['Achse','Achsen'],Nose:['Noses'],Tail:['Tails'],Pop:['poppen','gepoppt','Poppen'],Grind:['Grinds'],Slide:['Slides'],Rail:['Rails','Geländer'],Ledge:['Ledges'],Transition:['Transition-Flächen'],'Grip Tape':['Griptape'],'Mini Ramp':['Miniramp','Mini-Ramp'],Kugellager:['Bearings','Kugellagern'],Rollen:['Wheels']};
const regexEscape=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
export function linkWikiText(text,entries,self=''){
 const matches=new Map();for(const entry of entries){if(entry.term.toLowerCase()===self.toLowerCase())continue;for(const name of [entry.term,...(ALIASES[entry.term]||[])])if(name.trim())matches.set(name.toLowerCase(),entry.term);}
 const words=[...matches.keys()].sort((a,b)=>b.length-a.length);if(!words.length)return htmlEscape(text);
 const pattern=new RegExp(`(?<![\\p{L}\\p{N}_])(${words.map(regexEscape).join('|')})(?![\\p{L}\\p{N}_])`,'giu');
 let result='',position=0;for(const match of String(text).matchAll(pattern)){result+=htmlEscape(text.slice(position,match.index));const target=matches.get(match[0].toLowerCase());result+=`<a class="wiki-term-link" href="#wiki/${encodeURIComponent(target)}">${htmlEscape(match[0])}</a>`;position=match.index+match[0].length;}return result+htmlEscape(text.slice(position));
}
