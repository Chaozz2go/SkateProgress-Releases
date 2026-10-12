const BASE=new URL('./',self.location.href);
const PREFIX=`skateprogress-shell:${BASE.pathname}:`;
const CACHE=PREFIX+'v8';
const SHELL=['./','index.html','style.css','app.js','model.js','skate-ux.js','extras.js','extra-state.js','wiki-data.js','tricks.json','config.json','manifest.webmanifest','icon.svg','icon-192.png','icon-512.png'];
const URLS=SHELL.map(name=>new URL(name,BASE).href);
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(URLS))));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith(PREFIX)&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);
 if(event.request.method!=='GET'||url.origin!==BASE.origin||!url.pathname.startsWith(BASE.pathname)||url.pathname.startsWith(new URL('api/',BASE).pathname))return;
 const match=name=>caches.open(CACHE).then(cache=>cache.match(name));
 if(event.request.mode==='navigate'){event.respondWith(fetch(event.request).then(response=>response.ok?response:match(new URL('index.html',BASE).href)).catch(()=>match(new URL('index.html',BASE).href)));return;}
 if(URLS.includes(url.href))event.respondWith(match(event.request).then(hit=>hit||fetch(event.request)));
});
