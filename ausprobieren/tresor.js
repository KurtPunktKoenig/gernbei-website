/* Bildtresor im Browser (Bauvorlage Stand 123 und 124, E163).
   Jedes Buchbild wird hier mit dem Tresor-Schluessel verschluesselt (AES-GCM, Web Crypto), bevor es
   geschickt wird. Der Schluessel liegt in diesem Geraet (IndexedDB); auf dem Server nur verschlossen
   mit dem Wiederherstellungscode (PBKDF2). Gernbei und die Maschine sehen nie ein Bild.
   Genutzt von blatt.html, seite.html und foto.html. Braucht qr.js fuer die QR-Codes. */
(function(){
"use strict";
var ZEICHEN='ABCDEFGHJKLMNPQRSTUVWXYZ23456789',RUNDEN=600000,MAGIE=[75,75,84,49]; /* KKT1 */
var PRUEFTEXT='gernbei-tresor',DB='kk-tresor';
var cs=window.crypto&&window.crypto.subtle;

/* --- Hilfen --- */
function api(weg,opt){opt=opt||{};opt.credentials='same-origin';opt.headers=Object.assign({'X-Kiosk':'1'},opt.headers||{});return fetch(weg,opt);}
function b64(buf){var b=new Uint8Array(buf),s='';for(var i=0;i<b.length;i+=8192){s+=String.fromCharCode.apply(null,b.subarray(i,i+8192));}return btoa(s);}
function unb64(s){s=String(s).replace(/-/g,'+').replace(/_/g,'/');while(s.length%4){s+='=';}var t=atob(s),b=new Uint8Array(t.length);for(var i=0;i<t.length;i++){b[i]=t.charCodeAt(i);}return b;}
function b64url(buf){return b64(buf).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');}
function zufall(n){var b=new Uint8Array(n);crypto.getRandomValues(b);return b;}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function lies(k){try{return JSON.parse(localStorage.getItem(k));}catch(x){return null;}}
function schreib(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(x){}}
function istHandy(){return /iPhone|iPad|Android|Mobile/i.test(navigator.userAgent)||(navigator.maxTouchPoints>1&&/Macintosh/.test(navigator.userAgent));}
function dataUrlZuBytes(u){return unb64(u.split(',')[1]||'');}
function bytesZuDataUrl(b){return 'data:image/jpeg;base64,'+b64(b);}

/* --- Geraet: Schluessel in IndexedDB, je Pruefwert (ein Geraet kann mehrere Plaetze kennen) --- */
function db(){return new Promise(function(ok,nein){var r=indexedDB.open(DB,1);r.onupgradeneeded=function(){r.result.createObjectStore('s');};r.onsuccess=function(){ok(r.result);};r.onerror=function(){nein(r.error);};});}
async function dbHolen(k){var d=await db();return new Promise(function(ok){var t=d.transaction('s','readonly').objectStore('s').get(k);t.onsuccess=function(){ok(t.result||null);};t.onerror=function(){ok(null);};});}
async function dbSetzen(k,v){var d=await db();return new Promise(function(ok,nein){var t=d.transaction('s','readwrite');t.objectStore('s').put(v,k);t.oncomplete=function(){ok();};t.onerror=function(){nein(t.error);};});}

/* --- Krypto --- */
async function schluesselAus(roh){return cs.importKey('raw',roh,{name:'AES-GCM'},true,['encrypt','decrypt']);}
async function verschluesseln(k,daten){var iv=zufall(12),c=new Uint8Array(await cs.encrypt({name:'AES-GCM',iv:iv},k,daten));var aus=new Uint8Array(4+12+c.length);aus.set(MAGIE,0);aus.set(iv,4);aus.set(c,16);return aus;}
async function entschluesseln(k,salat){salat=new Uint8Array(salat);for(var i=0;i<4;i++){if(salat[i]!==MAGIE[i]){throw new Error('kein Datensalat');}}return new Uint8Array(await cs.decrypt({name:'AES-GCM',iv:salat.subarray(4,16)},k,salat.subarray(16)));}
function codeNormal(c){return String(c||'').toUpperCase().replace(/[^A-Z0-9]/g,'').replace(/O/g,'0').replace(/I/g,'1');}
function codeNeu(){var z=zufall(24),c='';for(var i=0;i<24;i++){c+=ZEICHEN[z[i]%32];}return c;}
function codeZeigen(c){return c.match(/.{4}/g).join(' ');}
async function codeSchluessel(code,salz){var m=await cs.importKey('raw',new TextEncoder().encode(codeNormal(code)),'PBKDF2',false,['deriveKey']);
  return cs.deriveKey({name:'PBKDF2',salt:salz,iterations:RUNDEN,hash:'SHA-256'},m,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);}
async function pruefen(k,v){try{var t=await cs.decrypt({name:'AES-GCM',iv:unb64(v.pruef_iv)},k,unb64(v.pruef));return new TextDecoder().decode(t)===PRUEFTEXT;}catch(x){return false;}}

/* --- Server --- */
async function verschlossenHolen(){var r=await api('/api/tresor/schluessel');if(r.status===401){throw new Error('anmelden');}if(!r.ok){throw new Error('kein Tresor');}return r.json();}
var SCHLUESSEL=null,PRUEF='';
/* Der Schluessel dieses Geraets, ohne zu fragen; null, wenn das Geraet ihn nicht kennt */
async function geraeteSchluessel(){
  if(SCHLUESSEL){return SCHLUESSEL;}
  var s=await verschlossenHolen();if(!s.vorhanden){return null;}
  var k=await dbHolen('k:'+s.verschlossen.pruef);
  if(k&&await pruefen(k,s.verschlossen)){SCHLUESSEL=k;PRUEF=s.verschlossen.pruef;return k;}
  return null;
}
async function einrichten(){
  var roh=zufall(32),k=await schluesselAus(roh),code=codeNeu(),salz=zufall(16),iv=zufall(12),piv=zufall(12);
  var hulle=await codeSchluessel(code,salz);
  var v={salz:b64(salz),iv:b64(iv),salat:b64(await cs.encrypt({name:'AES-GCM',iv:iv},hulle,roh)),
    pruef_iv:b64(piv),pruef:b64(await cs.encrypt({name:'AES-GCM',iv:piv},k,new TextEncoder().encode(PRUEFTEXT)))};
  var r=await api('/api/tresor/schluessel',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(v)});
  if(!r.ok){throw new Error((await r.json().catch(function(){return{};})).fehler||'Der Tresor ließ sich nicht einrichten.');}
  await dbSetzen('k:'+v.pruef,k);SCHLUESSEL=k;PRUEF=v.pruef;return code;
}
async function mitCode(code,v){
  var hulle=await codeSchluessel(code,unb64(v.salz)),roh;
  try{roh=await cs.decrypt({name:'AES-GCM',iv:unb64(v.iv)},hulle,unb64(v.salat));}catch(x){return null;}
  var k=await schluesselAus(roh);if(!await pruefen(k,v)){return null;}
  await dbSetzen('k:'+v.pruef,k);SCHLUESSEL=k;PRUEF=v.pruef;return k;
}
async function mitRohschluessel(roh,v){var k=await schluesselAus(roh);if(!await pruefen(k,v)){return null;}await dbSetzen('k:'+v.pruef,k);SCHLUESSEL=k;PRUEF=v.pruef;return k;}

/* --- Fenster --- */
var STIL='.kkt-schicht{position:fixed;inset:0;z-index:90;background:rgba(17,18,20,.6);display:flex;align-items:center;justify-content:center;padding:16px;font:16px/1.5 Inter,system-ui,-apple-system,"Segoe UI",sans-serif;color:#111214}'+
 '.kkt-kasten{background:#fff;border-radius:14px;max-width:520px;width:100%;max-height:100%;overflow:auto;padding:18px}'+
 '.kkt-kasten h2{font-size:19px;margin:0 0 8px}.kkt-kasten p{margin:0 0 10px}.kkt-klein{font-size:13.5px;color:#3A3B40}'+
 '.kkt-code{font:700 22px/1.4 ui-monospace,Menlo,Consolas,monospace;letter-spacing:.06em;background:#F3F3F1;border-radius:10px;padding:12px;text-align:center;margin:10px 0;user-select:all;-webkit-user-select:all}'+
 '.kkt-zeile{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}.kkt-k{display:inline-flex;align-items:center;justify-content:center;min-height:42px;padding:6px 14px;border:1px solid #D9D9D5;border-radius:10px;background:#fff;font:inherit;font-size:15px;cursor:pointer;color:#111214}'+
 '.kkt-k.haupt{background:#C2410C;border-color:#C2410C;color:#fff;font-weight:600}.kkt-qr{display:flex;justify-content:center;margin:8px 0}.kkt-qr svg{width:220px;height:220px}'+
 '.kkt-feld{display:grid;grid-template-columns:96px 1fr;gap:6px 10px;align-items:center;margin:6px 0}.kkt-feld label{font-size:14px;color:#3A3B40}'+
 '.kkt-feld input{min-height:40px;border:1px solid #D9D9D5;border-radius:8px;padding:4px 8px;font:inherit;width:100%;box-sizing:border-box}.kkt-fehler{color:#B42318;font-size:14px}'+
 '@media (prefers-color-scheme:dark){.kkt-kasten{background:#1E1F22;color:#F2F2F2}.kkt-code{background:#2A2B2F}.kkt-k{background:#2A2B2F;color:#F2F2F2;border-color:#3A3B40}.kkt-feld label,.kkt-klein{color:#C8C8CC}.kkt-feld input{background:#2A2B2F;color:#F2F2F2;border-color:#3A3B40}}';
function stil(){if(document.getElementById('kkt-stil')){return;}var s=document.createElement('style');s.id='kkt-stil';s.textContent=STIL;document.head.appendChild(s);}
/* Ein Fenster; knoepfe: [[text, wert, haupt]]; ergibt den Wert des Knopfs oder null beim Schliessen */
function fenster(html,knoepfe,vorher){
  stil();return new Promise(function(ok){
    var s=document.createElement('div');s.className='kkt-schicht';s.setAttribute('role','dialog');s.setAttribute('aria-modal','true');
    s.innerHTML='<div class="kkt-kasten">'+html+'<div class="kkt-zeile"></div></div>';
    var z=s.querySelector('.kkt-zeile');
    function fertig(w){document.removeEventListener('keydown',taste);s.remove();ok(w);}
    function taste(e){if(e.key==='Escape'){fertig(null);}}
    (knoepfe||[]).forEach(function(k){var b=document.createElement('button');b.type='button';b.className='kkt-k'+(k[2]?' haupt':'');b.textContent=k[0];
      b.addEventListener('click',async function(){if(typeof k[1]==='function'){var w=await k[1](s);if(w!==undefined){fertig(w);}}else{fertig(k[1]);}});z.appendChild(b);});
    document.addEventListener('keydown',taste);document.body.appendChild(s);
    if(vorher){vorher(s,fertig);}
    var f=s.querySelector('input,.kkt-k.haupt');if(f){f.focus();}
  });
}

/* Der Schluessel, wenn noetig mit Einrichten oder Verbinden an Ort und Stelle (E156). null = abgebrochen */
async function sicherstellen(){
  if(!cs){await fenster('<h2>Dieser Browser kann den Tresor nicht öffnen</h2><p>Öffnen Sie Gernbei bitte in Safari, Chrome, Edge oder Firefox.</p>',[['Verstanden',null,true]]);return null;}
  var k=await geraeteSchluessel();if(k){return k;}
  var s=await verschlossenHolen();
  if(!s.vorhanden){
    var los=await fenster('<h2>Ihr Tresor für Buchbilder</h2><p>Bilder aus Ihren Schulbüchern legt Gernbei verschlüsselt ab. Verschlüsselt wird hier auf diesem Gerät, bevor das Bild gespeichert wird. Öffnen können es nur Geräte mit Ihrem Schlüssel. Gernbei selbst sieht das Bild nie.</p><p class="kkt-klein">Sie bekommen gleich einen Code. Fotografieren Sie ihn ab. Sie brauchen ihn nur, wenn Sie ein neues Gerät ohne dieses verbinden.</p>',
      [['Tresor einrichten',true,true],['Abbrechen',null]]);
    if(!los){return null;}
    var code;try{code=await einrichten();}catch(x){await fenster('<h2>Das hat nicht geklappt</h2><p>'+esc(x.message)+'</p>',[['Schließen',null,true]]);return null;}
    await fenster('<h2>Ihr Wiederherstellungscode</h2><p>Fotografieren Sie diesen Code jetzt ab, oder schreiben Sie ihn auf.</p><div class="kkt-code">'+esc(codeZeigen(code))+'</div><p class="kkt-klein">Ein weiteres Gerät verbinden Sie später am einfachsten mit dem QR-Code von diesem Gerät: ein Arbeitsblatt öffnen, <b>Buchbild einsetzen</b>, dann <b>Neues Gerät verbinden</b>. Den Code brauchen Sie nur, wenn dieses Gerät fehlt.</p>',
      [['Ich habe den Code',true,true]]);
    return SCHLUESSEL;
  }
  return verbindenFenster(s.verschlossen);
}
async function verbindenFenster(v){
  return fenster('<h2>Dieses Gerät mit Ihrem Tresor verbinden</h2><p>Ihre Buchbilder liegen verschlüsselt. Damit dieses Gerät sie öffnen kann, braucht es Ihren Schlüssel. Zwei Wege:</p>'+
    '<p><b>Mit Ihrem anderen Gerät:</b> Öffnen Sie dort ein Arbeitsblatt, tippen Sie auf <b>Buchbild einsetzen</b> und dann auf <b>Neues Gerät verbinden</b>. Scannen Sie den QR-Code mit diesem Gerät.</p>'+
    '<p><b>Mit Ihrem Wiederherstellungscode:</b></p><div class="kkt-feld"><label for="kkt-code">Code</label><input id="kkt-code" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="ABCD EFGH …"></div><p class="kkt-fehler" id="kkt-f"></p>',
    [['Verbinden',async function(s){var f=s.querySelector('#kkt-f');var c=codeNormal(s.querySelector('#kkt-code').value);if(c.length!==24){f.textContent='Der Code hat 24 Zeichen.';return undefined;}
      f.textContent='Einen Moment …';var k=await mitCode(c,v);if(!k){f.textContent='Dieser Code passt nicht. Prüfen Sie ihn bitte noch einmal.';return undefined;}return k;},true],['Abbrechen',null]]);
}

/* QR fuer ein neues Geraet: der Schluessel steht nur hinter #, er geht nie an den Server */
async function geraetVerbinden(){
  var k=await sicherstellen();if(!k){return;}
  var roh=new Uint8Array(await cs.exportKey('raw',k)),url=location.origin+'/tresor-verbinden#'+b64url(roh);
  await fenster('<h2>Neues Gerät verbinden</h2><p>Melden Sie sich auf dem neuen Gerät zuerst bei Gernbei an. Scannen Sie dann diesen Code mit seiner Kamera.</p><div class="kkt-qr">'+window.KKQR.svg(url,{groesse:220})+'</div><p class="kkt-klein">Zeigen Sie den Code niemandem sonst, er öffnet Ihre Buchbilder. Nutzen Sie Gernbei am neuen Gerät als App vom Home-Bildschirm, geben Sie dort lieber den Wiederherstellungscode ein.</p>',[['Fertig',null,true]]);
}

/* Handyfoto am Rechner: QR mit Einmalschluessel. Das Handy verschluesselt damit, die Maschine haelt den
   Datensalat hoechstens zehn Minuten, dieses Geraet holt ihn einmal und entschluesselt ihn hier. */
async function handyFoto(titel){
  var r=await api('/api/tresor/qr-start',{method:'POST'});var d=await r.json().catch(function(){return{};});
  if(!r.ok){await fenster('<h2>Gerade nicht möglich</h2><p>'+esc(d.fehler||'Versuchen Sie es bitte gleich noch einmal.')+'</p>',[['Schließen',null,true]]);return null;}
  var roh=zufall(32),k=await schluesselAus(roh),url=location.origin+'/foto?t='+encodeURIComponent(d.marke)+'#'+b64url(roh),uhr=null;
  return fenster('<h2>Mit dem Handy fotografieren</h2><p>Scannen Sie diesen Code mit der Kamera Ihres Handys'+(titel?' und fotografieren Sie <b>'+esc(titel)+'</b>':'')+'. Das Foto kommt dann hierher.</p><div class="kkt-qr">'+window.KKQR.svg(url,{groesse:220})+'</div><p class="kkt-klein" id="kkt-st">Wartet auf das Foto … Der Code gilt zehn Minuten.</p>',
    [['Abbrechen',null]],function(s,fertig){
      var bis=Date.now()+d.sekunden*1000;
      async function schauen(){
        if(!document.body.contains(s)){return;}
        if(Date.now()>bis){s.querySelector('#kkt-st').textContent='Der Code ist abgelaufen. Schließen Sie das Fenster und versuchen Sie es noch einmal.';return;}
        try{var q=await api('/api/tresor/qr-status?t='+encodeURIComponent(d.marke));var e=await q.json();
          if(e.da){var h=await api('/api/tresor/qr-holen?t='+encodeURIComponent(d.marke));if(h.ok){var b=await entschluesseln(k,await h.arrayBuffer());fertig(bytesZuDataUrl(b));return;}}
          if(q.status===404){s.querySelector('#kkt-st').textContent='Der Code ist abgelaufen.';return;}}catch(x){}
        uhr=setTimeout(schauen,2000);
      }
      uhr=setTimeout(schauen,2000);
    });
}

/* Beschreibung: Buch, Seite, Bild aus dem Namen des Bildplatzes ("Karte M2, Terra Geographie 7, S. 42") */
function zerlegen(name){
  var t=String(name||'').split(/\s*,\s*/),aus={bild:'',buch:'',seite:''};
  t.forEach(function(x,i){if(/^(S\.?|Seite)\s*\d+/i.test(x)){aus.seite=x.replace(/^(Seite)\s*/i,'S. ');}else if(i===0){aus.bild=x;}else{aus.buch=aus.buch?aus.buch+', '+x:x;}});
  return aus;
}
/* Einmal je Buch das Erscheinungsjahr: vor 2005 erlaubt der Gesamtvertrag kein digitales Kopieren */
async function jahrFuer(buch){
  var J=lies('kkt-jahre')||{};if(!buch){return '';}if(J[buch]){return J[buch];}
  var j=await fenster('<h2>Einmal zu diesem Buch</h2><p>In welchem Jahr ist <b>'+esc(buch)+'</b> erschienen? Es steht vorn im Buch, meist auf der Rückseite des Titelblatts.</p><div class="kkt-feld"><label for="kkt-jahr">Jahr</label><input id="kkt-jahr" inputmode="numeric" maxlength="4" placeholder="2019"></div><p class="kkt-fehler" id="kkt-f"></p>',
    [['Weiter',function(s){var v=s.querySelector('#kkt-jahr').value.trim();if(!/^(19|20)\d\d$/.test(v)){s.querySelector('#kkt-f').textContent='Bitte vier Ziffern, etwa 2019.';return undefined;}return v;},true],['Abbrechen',null]]);
  if(!j){return null;}
  if(+j<2005){await fenster('<h2>Dieses Buch nicht digital</h2><p>Aus Büchern, die vor 2005 erschienen sind, erlaubt der Vertrag der Schulen keine digitalen Kopien. Nehmen Sie im Blatt lieber die eigene Zeichnung, oder kopieren Sie die Seite auf Papier.</p>',[['Verstanden',null,true]]);return null;}
  J[buch]=j;schreib('kkt-jahre',J);return j;
}

/* Ein Bild (data:-URL) verschluesselt in den Tresor; ergibt die Beschreibung mit Nummer oder null */
async function ablegen(dataUrl,besch){
  besch=Object.assign({},besch||{});
  if(besch.buch&&!besch.jahr){var j=await jahrFuer(besch.buch);if(j===null){return null;}besch.jahr=j;}
  var k=await sicherstellen();if(!k){return null;}
  var salat=await verschluesseln(k,dataUrlZuBytes(dataUrl));
  var r=await api('/api/tresor/ablegen',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({salat:b64(salat),beschreibung:besch})});
  var d=await r.json().catch(function(){return{};});
  if(!r.ok){await fenster('<h2>Nicht abgelegt</h2><p>'+esc(d.fehler||'Das hat gerade nicht geklappt.')+'</p>',[['Schließen',null,true]]);return null;}
  return d;
}
async function liste(klasse){var r=await api('/api/tresor/liste'+(klasse?'?klasse='+encodeURIComponent(klasse):''));if(!r.ok){return [];}return (await r.json()).bilder||[];}
async function bild(nr,fragen){
  var k=fragen?await sicherstellen():await geraeteSchluessel();if(!k){return null;}
  var r=await api('/api/tresor/holen?nr='+encodeURIComponent(nr));if(!r.ok){return null;}
  return bytesZuDataUrl(await entschluesseln(k,await r.arrayBuffer()));
}
async function loeschen(nr){var r=await api('/api/tresor/loeschen',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({nr:nr})});return r.ok;}
function norm(s){return String(s||'').toLowerCase().replace(/[^a-z0-9äöüß]/g,'');}
/* Das juengste passende Bild zu einem Bildplatz: gleiche Klasse, dann gleicher Name oder gleiches Buch und Seite */
function passend(bilder,klasse,platzname){
  /* Gleicher Name zaehlt vor gleicher Seite; bei Gleichstand das juengste */
  var z=zerlegen(platzname),best=null,bestWert=0;
  bilder.forEach(function(b){
    if(klasse&&b.klasse&&b.klasse!==klasse){return;}
    var wert=norm(b.bild)&&(norm(b.bild)===norm(platzname)||norm(b.bild)===norm(z.bild))?2:
      (z.seite&&norm(b.seite)===norm(z.seite)&&(!z.buch||!b.buch||norm(b.buch)===norm(z.buch))?1:0);
    if(wert&&(wert>bestWert||(wert===bestWert&&b.nr>best.nr))){best=b;bestWert=wert;}
  });
  return best;
}

/* Datei waehlen; am Handy und iPad oeffnet capture die Kamera */
function dateiWaehlen(kamera){return new Promise(function(ok){var i=document.createElement('input');i.type='file';i.accept='image/*';if(kamera){i.setAttribute('capture','environment');}
  i.addEventListener('change',function(){ok(i.files&&i.files[0]||null);});i.click();});}
/* Ueber createImageBitmap: die Arbeitsflaeche erlaubt keine Bilder aus data:-Adressen (CSP), am Blatt geht beides */
async function verkleinern(datei,max){
  if(window.createImageBitmap){try{var bm=await createImageBitmap(datei),s=Math.min(1,max/Math.max(bm.width,bm.height)),c=document.createElement('canvas');
    c.width=Math.round(bm.width*s);c.height=Math.round(bm.height*s);c.getContext('2d').drawImage(bm,0,0,c.width,c.height);if(bm.close){bm.close();}return c.toDataURL('image/jpeg',0.85);}catch(x){}}
  return verkleinernAlt(datei,max);
}
function verkleinernAlt(datei,max){return new Promise(function(ok){var r=new FileReader();r.onload=function(){var img=new Image();img.onload=function(){var s=Math.min(1,max/Math.max(img.width,img.height)),c=document.createElement('canvas');c.width=Math.round(img.width*s);c.height=Math.round(img.height*s);c.getContext('2d').drawImage(img,0,0,c.width,c.height);ok(c.toDataURL('image/jpeg',0.85));};img.onerror=function(){ok(null);};img.src=r.result;};r.onerror=function(){ok(null);};r.readAsDataURL(datei);});}

/* Beschreibung erfragen, vorbelegt; ergibt {klasse,buch,seite,bild} oder null */
function beschreibungFenster(v){
  v=v||{};
  return fenster('<h2>Buchbild in den Tresor</h2><p class="kkt-klein">So findet Gernbei das Bild später am Bildplatz des Blatts. Gernbei sieht nur diese Angaben, nie das Bild.</p>'+
    '<div class="kkt-feld"><label for="kkt-klasse">Klasse</label><input id="kkt-klasse" maxlength="20" placeholder="7b" value="'+esc(v.klasse)+'"></div>'+
    '<div class="kkt-feld"><label for="kkt-buch">Buch</label><input id="kkt-buch" maxlength="120" placeholder="Terra Geographie 7" value="'+esc(v.buch)+'"></div>'+
    '<div class="kkt-feld"><label for="kkt-seite">Seite</label><input id="kkt-seite" maxlength="20" placeholder="S. 42" value="'+esc(v.seite)+'"></div>'+
    '<div class="kkt-feld"><label for="kkt-bild">Bild</label><input id="kkt-bild" maxlength="120" placeholder="Karte M2" value="'+esc(v.bild)+'"></div><p class="kkt-fehler" id="kkt-f"></p>',
    [['In den Tresor',function(s){var g=function(id){return s.querySelector('#kkt-'+id).value.trim();};var d={klasse:g('klasse'),buch:g('buch'),seite:g('seite'),bild:g('bild')};
      if(!d.bild&&!d.seite){s.querySelector('#kkt-f').textContent='Bitte Bild oder Seite nennen.';return undefined;}
      if(d.klasse&&!/^[0-9A-Za-zÄÖÜäöüß][0-9A-Za-zÄÖÜäöüß ._-]{0,19}$/.test(d.klasse)){s.querySelector('#kkt-f').textContent='Die Klasse bitte kurz, etwa 7b.';return undefined;}
      return d;},true],['Abbrechen',null]]);
}
/* Aufnehmen fuer die Arbeitsflaeche: Foto (Kamera, Handy-QR am Rechner, Datei), Beschreibung, Tresor */
async function aufnehmen(vorschlag,datei){
  var src=null;
  if(datei){src=await verkleinern(datei,1600);}
  else if(istHandy()){var f=await dateiWaehlen(true);if(!f){return null;}src=await verkleinern(f,1600);}
  else{
    var weg=await fenster('<h2>Buchbild fotografieren</h2><p>Wie kommt das Bild aus dem Buch herein?</p>',[['Mit dem Handy','handy',true],['Datei wählen','datei'],['Abbrechen',null]]);
    if(!weg){return null;}
    if(weg==='handy'){src=await handyFoto(vorschlag&&vorschlag.bild);}else{var f2=await dateiWaehlen(false);if(f2){src=await verkleinern(f2,1600);}}
  }
  if(!src){await fenster('<h2>Dieses Bild lässt sich nicht öffnen</h2><p>Nehmen Sie bitte ein Foto als JPEG oder PNG, oder fotografieren Sie noch einmal.</p>',[['Schließen',null,true]]);return null;}
  var d=await beschreibungFenster(vorschlag);if(!d){return null;}
  return ablegen(src,d);
}
/* Weiche an der Bueroklammer: bei einem Bild erst fragen, ob es aus einem Schulbuch ist.
   'tresor' = erledigt, nichts wird hochgeladen; 'normal' = wie bisher hochladen */
async function weiche(datei){
  if(!datei||!/^image\//.test(datei.type)){return 'normal';}
  var nein=lies('kkt-nein')||0;if(nein>=3){return 'normal';}
  var w=await fenster('<h2>Ist das ein Bild aus einem Schulbuch?</h2><p>Dann kommt es verschlüsselt in Ihren Tresor, und Gernbei sieht es nicht. Sonst geht es wie jede Datei an Gernbei.</p>',
    [['Ja, aus einem Schulbuch','ja',true],['Nein, an Gernbei','nein']]);
  if(w==='nein'){schreib('kkt-nein',nein+1);return 'normal';}
  if(w!=='ja'){return 'abbruch';}
  schreib('kkt-nein',0);
  var m=await aufnehmen({},datei);return m?{tresor:m}:'abbruch';
}
/* Satz fuer das Gespraech: Gernbei bekommt nur die Beschreibung */
function satz(m){return 'Buchbild „'+(m.bild||m.seite||'Bild')+'“'+(m.buch?' ('+m.buch+(m.seite?', '+m.seite:'')+')':'')+' liegt im Tresor'+(m.klasse?' der '+m.klasse:'')+'.';}

window.KKTRESOR={sicherstellen:sicherstellen,geraeteSchluessel:geraeteSchluessel,geraetVerbinden:geraetVerbinden,handyFoto:handyFoto,
  ablegen:ablegen,liste:liste,bild:bild,loeschen:loeschen,passend:passend,zerlegen:zerlegen,aufnehmen:aufnehmen,weiche:weiche,satz:satz,
  istHandy:istHandy,fenster:fenster,
  _intern:{verschluesseln:verschluesseln,entschluesseln:entschluesseln,schluesselAus:schluesselAus,mitRohschluessel:mitRohschluessel,verschlossenHolen:verschlossenHolen,unb64:unb64,b64:b64,zufall:zufall}};
})();
