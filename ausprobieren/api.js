// Geraetebuehne: beantwortet die Fragen der echten Gernbei-Seite im Browser, ohne Maschine und ohne Modell.
// Daten aus daten.js (bauen.py). Erfundener Betrieb: Elektro Haberkorn GmbH, Vorfuehrstand Handwerk-Elektro.
(function(){
  // Auf der Website immer hell, wie auf den Bildern der Seite (die echte Seite folgt sonst dem Geraet)
  document.documentElement.setAttribute("data-ansicht", "hell");
  try { localStorage.setItem("ansicht", "hell"); } catch (x) {}
  var D = window.BUEHNE_DATEN || {};
  var Q = new URLSearchParams(location.search);
  var PROD = Q.get("p") || "handwerk";
  var NAMEN = {handwerk:"Gernbei fürs Handwerk", dienstleister:"Gernbei für Dienstleister", firmengedaechtnis:"Gernbei Firmengedächtnis"};
  var P = (D.produkte || {})[PROD] || {};
  var FG = PROD === "firmengedaechtnis", DL = PROD === "dienstleister";
  var E = (FG ? D.architektur : DL ? D.freelancer : D.elektro) || {projekte:[], dokumente:[], notizen:[]};
  if (DL) D.antworten = D.antworten_dl || [];
  // Firmengedaechtnis: jede Person hat ihren eigenen Platz (Vorfuehrstand Architektur, Haldenmeyer & Sorg)
  var LEUTE = {rainer:{vorname:"Rainer", name:"Rainer Sorg"}, katrin:{vorname:"Katrin", name:"Katrin Ziegler"},
               lukas:{vorname:"Lukas", name:"Lukas Seidel"}, renate:{vorname:"Renate", name:"Renate Pfaff"}};
  var WER = FG ? (LEUTE[Q.get("wer")] ? Q.get("wer") : "rainer") : "stefan";
  if (DL) WER = "jonas";
  var VORNAME = FG ? LEUTE[WER].vorname : DL ? "Jonas" : "Stefan";
  if (FG) D.antworten = D.antworten_fg || [];
  var jetzt = Math.floor(Date.now()/1000);
  var S = {verlauf:[], titel:"", sitzung:"", projekt:null};

  // Antworten aus echten Laeufen auf t1 (Vorfuehrstand Elektro, Kern 110), je Bitte wortgleich
  var ANTW = {};
  (D.antworten || []).forEach(function(a){ ANTW[norm(a.bitte)] = a; });
  function norm(t){ return String(t || "").toLowerCase().replace(/[^a-z0-9äöüß]+/g, " ").trim(); }
  function finde(t){ return ANTW[norm(t)] || null; }
  function lauf(name){ return (D.antworten || []).filter(function(a){ return a.name === name; })[0]; }
  // Letzte Gespraeche: die Bitten der echten Laeufe, beim Oeffnen mit ihrer echten Antwort
  var FRUEHER = [
    {sitzung:"r1-brunner", titel:"Zählerwechsel Brunner: 24. oder 26.11.?", kurz:"BR", projekt:"Brunner", pfad:"02 - Aufträge/BRUNNER", zuletzt:jetzt-3*3600},
    {sitzung:"r3-doerfler", titel:"Materialliste Wallbox Dörfler prüfen", kurz:"DO", projekt:"Dörfler", pfad:"02 - Aufträge/DOERFLER", zuletzt:jetzt-26*3600},
    {sitzung:"h3-reichart", titel:"Prüfprotokoll DGUV V3 Bäckerei Reichart", kurz:"RE", projekt:"Reichart", pfad:"02 - Aufträge/REICHART", zuletzt:jetzt-50*3600},
    {sitzung:"h1-heute", titel:"Was steht heute an?", kurz:"", projekt:"", pfad:"", zuletzt:jetzt-74*3600}
  ];
  if (DL) {   // Dienstleister: die Laeufe mit Jonas Wiedemer, ohne Einrichtung und Einraeumen
    FRUEHER = (D.antworten || []).filter(function(a){ return /^d\d/.test(a.name); }).map(function(a, i){
      return {sitzung:a.name, titel:a.bitte.length > 60 ? a.bitte.slice(0, 57) + " …" : a.bitte, kurz:"", projekt:"", pfad:"", zuletzt:jetzt - (i + 1) * 18 * 3600};
    });
  }
  if (FG) {   // eigene Gespraeche der Person: die Laeufe, die ihren Namen tragen (f1-lukas-plan ...)
    FRUEHER = (D.antworten || []).filter(function(a){ return a.name.split("-")[1] === WER; }).map(function(a, i){
      return {sitzung:a.name, titel:a.bitte.length > 60 ? a.bitte.slice(0, 57) + " …" : a.bitte, kurz:"", projekt:"", pfad:"", zuletzt:jetzt - (i + 1) * 20 * 3600};
    });
  }
  var PROJEKTE = E.projekte.map(function(p){ return {pfad:p.pfad, name:p.name, kurz:p.kurz, status:"laufend"}; });

  function ich(){
    return {platz:WER, vorname:VORNAME, appname:NAMEN[PROD], verlauf:S.verlauf, wechsel:false, film:false,
      erstes_stueck:false, titel:S.titel, sitzung:S.sitzung, zweifaktor:{eingerichtet:true, pflicht:false},
      diktat:true, seite_neu:true, fuehrung:"", projekt:S.projekt, berufsbild:FG ? "Planung" : DL ? "Allgemein" : "Handwerk",
      frueher:FRUEHER.filter(function(x){ return x.sitzung !== S.sitzung; })};
  }
  function json(o, status){ return new Response(JSON.stringify(o), {status:status||200, headers:{"Content-Type":"application/json"}}); }
  // Antwort in Stuecken, wie aus der Maschine: erst ein Status, dann der Text nach und nach
  function strom(text, status){
    var enc = new TextEncoder();
    var teile = [];
    if (status) teile.push({art:"status", t:status, warte:1600});
    var stuecke = text.match(/[\s\S]{1,28}(\s|$)/g) || [text];
    stuecke.forEach(function(s){ teile.push({art:"text", t:s, warte:45}); });
    teile.push({art:"fertig", erstes:1.2, gesamt:4.0, warte:0});
    var body = new ReadableStream({start:function(c){
      var i = 0;
      (function weiter(){ if (i >= teile.length) { c.close(); return; } var e = teile[i++], w = e.warte; delete e.warte;
        c.enqueue(enc.encode("data: " + JSON.stringify(e) + "\n\n")); setTimeout(weiter, w); })();
    }});
    return new Response(body, {status:200, headers:{"Content-Type":"text/event-stream; charset=utf-8"}});
  }
  var VORFUEHRUNG = "Hier läuft eine Vorführung mit einem erfundenen Betrieb. In Ihrem eigenen Gernbei bekommen Sie an dieser Stelle die echte Antwort.\n<<antippen: Gespräch vereinbaren>>";

  function antwort(weg, daten){
    var w = weg.split("?")[0], q = new URLSearchParams(weg.split("?")[1] || "");
    switch (w) {
      case "/api/ich": return json(ich());
      case "/api/projekte": return json({links:PROJEKTE, alle:PROJEKTE});
      case "/api/dokumente": return json(E.dokumente.map(function(d){ var x = Object.assign({}, d); return x; }));
      case "/api/notizen": return json(E.notizen.map(function(n){ return {id:n.id, bereich:n.bereich, ordner:n.ordner, name:n.name, geaendert:n.geaendert}; }));
      case "/api/notiz":
        var id = q.get("id"), n = E.notizen.filter(function(x){ return x.id === id; })[0];
        return n ? json({text:n.text}) : json({fehler:"nicht gefunden"}, 404);
      case "/api/faehigkeiten": return json(P.faehigkeiten || {gruppen:[]});
      case "/api/schaufenster": return json(q.get("koennen") ? (P.koennen || {}) : (P.schaufenster || {reihen:[]}));
      case "/api/fuehrungen": return json(P.fuehrungen || {});
      case "/api/hilfe": return json(D.produkte && D.produkte.hilfe || {text:""});
      case "/api/hilfefrage/start": return json((P.hilfestart || {})[q.get("seite")] || (P.hilfestart || {}).gespraech || {});
      case "/api/geltung": return json({festlegungen:[], profil:[], projekt:S.projekt ? {pfad:S.projekt.pfad, name:S.projekt.name, regeln:[]} : null, vorlagen:[]});
      case "/api/neuerungen": return json({eintraege:[], auch:false});
      case "/api/oeffnen":
        var f = FRUEHER.filter(function(x){ return x.sitzung === (daten || {}).sitzung; })[0];
        if (f) { var l = lauf(f.sitzung); S.sitzung = f.sitzung; S.titel = f.titel;
          S.verlauf = [{wer:"ich", text:l ? l.bitte : f.titel}, {wer:"sie", text:l ? l.antwort : VORFUEHRUNG, ende:""}];
          S.projekt = f.pfad ? {pfad:f.pfad, name:f.projekt, kurz:f.kurz} : null; }
        return json({});
      case "/api/neu":
        S.verlauf = []; S.titel = ""; S.sitzung = "";
        var pf = (daten || {}).projekt;
        var pj = PROJEKTE.filter(function(x){ return x.pfad === pf; })[0];
        S.projekt = pj ? {pfad:pj.pfad, name:pj.name, kurz:pj.kurz} : null;
        return json({});
      // Kurt 16.11.2026: der Knopf darf da sein, aber keine Datei wird angenommen. Die Datei verlaesst den Browser nie:
      // diese Antwort kommt, bevor irgendetwas gelesen oder gesendet wird.
      case "/api/hochladen":
      case "/api/bewertungscode":
        return json({fehler:"In dieser Vorführung bleibt Ihre Datei bei Ihnen. In Ihrem eigenen Gernbei legen Sie Fotos und Dateien genau hier ab."}, 403);
      case "/api/nachricht":
        var t = (daten || {}).text || "", a = finde(t), aw = a ? a.antwort : VORFUEHRUNG;
        S.verlauf.push({wer:"ich", text:t}, {wer:"sie", text:aw, ende:""});
        if (!S.titel) {
          var fr = a && FRUEHER.filter(function(x){ return x.sitzung === a.name; })[0];
          S.titel = fr ? fr.titel : t.slice(0, 60); S.sitzung = a ? a.name : "jetzt";
        }
        return strom(aw, a ? "Gernbei sieht in Ihren Unterlagen nach …" : "");
      default: return json({});
    }
  }

  var echt = window.fetch.bind(window);
  window.fetch = function(weg, opt){
    var u = typeof weg === "string" ? weg : weg.url;
    if (u === "/manifest.json") return Promise.resolve(json({name:NAMEN[PROD]}));
    if (u.indexOf("/api/") === 0) {
      var daten; try { daten = opt && opt.body ? JSON.parse(opt.body) : undefined; } catch (x) {}
      return Promise.resolve(antwort(u, daten));
    }
    return echt(weg, opt);
  };
  window.BUEHNE = {S:S, antwort:antwort};
})();
