/* Auskunft: das Fenster des Website-Chatbots. Prototyp, 04.11.2026.
   Eingebunden mit einer Zeile; alle Einstellungen stehen als data-Attribute am Skript.
   Läuft im eigenen Schatten-DOM, damit es sich mit keiner fremden Website beißt (Weg 1).
   Setzt keine Cookies und lädt nichts von Dritten (A5). Spezifikation: Website-Chatbot-Spezifikation.md */
(function () {
  "use strict";
  var skript = document.currentScript;
  var d = skript ? skript.dataset : {};
  var cfg = {
    dienst: (d.dienst || "").replace(/\/$/, ""),
    name: d.name || "Auskunft",
    untertitel: d.untertitel || "Digitaler Assistent, eine KI",
    telefon: d.telefon || "",
    mail: d.mail || "",
    zeiten: d.zeiten || "",
    // Kopfleiste nach dem Vergleich mit HeyKurt (Kurt 05.11.2026): eigene Figur je Website,
    // Satz zur Antwortzeit nur, wenn der Betrieb ihn setzt
    figur: d.figur || "",
    antwortzeit: d.antwortzeit || "",
    themen: (d.themen || "").split("|").filter(Boolean),
    farbe: d.farbe || "#111214",
    akzent: d.akzent || "#D23A26",
    wartezeit: 10000 // A3
  };

  var sitzung = null;
  try { sitzung = sessionStorage.getItem("auskunft-sitzung"); } catch (e) {}

  var MASSBLASE = '<path d="M3 9v12M3 15h4M29 9v12M29 15h-4"/><path d="M10 8h12a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3h-5l-4 4v-4h-3a3 3 0 0 1-3-3v-6a3 3 0 0 1 3-3z"/><path d="M12.5 14h.01M16 14h.01M19.5 14h.01" stroke-width="2.6"/>';

  // Die Figur: ein Bild der eigenen Website, sonst eine eingebettete Strichfigur (nichts von Dritten)
  function figurHtml() {
    if (cfg.figur) return '<span class="figur"><img src="' + esc(cfg.figur) + '" alt=""></span>';
    // Massblase: Sprechblase zwischen den Massstrichen des Zeichens Gernbei (Kurt 07.11.2026: 1, Massblase)
    return '<span class="figur" aria-hidden="true"><svg viewBox="0 0 32 32">' + MASSBLASE + '</svg></span>';
  }

  // Zeichen Gernbei wie in der Signatur, nur im Kopf; im Fliesstext schlicht Gernbei (Kurt 07.11.2026: Ja, alle vier)
  function marke(text) {
    return esc(text).replace(/Gernbei/g, '<span class="gb">Gern<b>bei</b></span>');
  }

  var wirt = document.createElement("div");
  wirt.id = "auskunft-fenster";
  document.body.appendChild(wirt);
  var w = wirt.attachShadow({ mode: "open" });

  w.innerHTML =
    '<style>' +
    ':host{all:initial}' +
    '*{box-sizing:border-box;font-family:Inter,system-ui,-apple-system,"Segoe UI",sans-serif}' +
    '.start{position:fixed;right:20px;bottom:20px;z-index:2147483000;display:flex;align-items:center;gap:8px;background:' + cfg.farbe + ';color:#fff;border:0;border-radius:999px;padding:13px 20px;font-size:15px;font-weight:500;cursor:pointer;box-shadow:0 6px 24px rgba(0,0,0,.18)}' +
    '.start:focus-visible,button:focus-visible,textarea:focus-visible,input:focus-visible{outline:2px solid ' + cfg.akzent + ';outline-offset:2px}' +
    '.start svg{width:22px;height:22px;stroke:currentColor;fill:none;stroke-width:2}' +
    '.panel{position:fixed;right:20px;bottom:20px;z-index:2147483001;width:380px;max-width:calc(100vw - 32px);height:600px;max-height:calc(100vh - 40px);background:#fff;color:#111214;border-radius:18px;box-shadow:0 12px 48px rgba(0,0,0,.22);display:none;flex-direction:column;overflow:hidden;font-size:15px;line-height:1.5}' +
    '.panel.offen{display:flex}' +
    '.panel.gross{width:min(760px,calc(100vw - 32px));height:calc(100vh - 40px)}' +
    '@media(max-width:520px){.panel{right:0;bottom:0;width:100vw;max-width:100vw;height:100%;max-height:100%;border-radius:0}.start{right:16px;bottom:16px}.kopf .gross-knopf{display:none}}' +
    '.figur{flex:none;width:30px;height:30px;display:grid;place-items:center}.figur svg,.figur img{width:30px;height:30px}.figur svg{stroke:currentColor;fill:none;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}' +
    '.gruss{display:flex;gap:10px;align-items:flex-start}.gruss .figur{color:' + cfg.farbe + ';margin-top:4px}' +
    '.antwortzeit{margin-top:3px;color:#6E6E73}' +
    '.gb{font-weight:700;white-space:nowrap}.gb b,.kopf .gb b{display:inline;font-size:inherit;color:' + cfg.akzent + ';font-weight:inherit}' +
    '.gb:before,.gb:after{content:"";display:inline-block;width:.3em;height:.7em;vertical-align:-.02em;background:linear-gradient(#A1A1A6,#A1A1A6) center/100% .08em no-repeat}' +
    '.gb:before{border-left:.08em solid #A1A1A6;margin-right:.18em}.gb:after{border-right:.08em solid #A1A1A6;margin-left:.18em}' +
    '.kopf{display:flex;align-items:center;gap:6px;padding:12px 12px 12px 14px;background:' + cfg.farbe + ';color:#fff}' +
    '.kopf .figur{margin-right:4px}' +
    '.kopf .titel{flex:1;min-width:0}.kopf b{display:block;font-size:16px;font-weight:600}.kopf small{font-size:12.5px;opacity:.8}' +
    '.kopf button{background:transparent;border:1px solid rgba(255,255,255,.35);color:#fff;border-radius:999px;width:30px;height:30px;flex:none;cursor:pointer;display:grid;place-items:center}' +
    '.kopf button svg{width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:2}' +
    '.verlauf{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px;background:#F5F5F7}' +
    '.blase{max-width:88%;padding:11px 14px;border-radius:14px;background:#fff;border:1px solid #E8E8EA;white-space:normal;word-wrap:break-word}' +
    '.blase.ich{align-self:flex-end;background:' + cfg.farbe + ';color:#fff;border-color:' + cfg.farbe + '}' +
    '.blase p{margin:0 0 6px}.blase p:last-child{margin:0}.blase ul{margin:4px 0 6px 18px;padding:0}.blase li{margin:2px 0}' +
    '.hinweis{font-size:12.5px;color:#6E6E73;margin-top:8px}' +
    '.quellen{margin-top:8px;font-size:13px}.quellen a{color:#111214}' +
    '.stufe{display:inline-block;margin-top:8px;font-size:12px;color:#3A3B40;background:#F5F5F7;border-radius:6px;padding:2px 8px}' +
    '.daumen{display:flex;gap:6px;margin-top:8px;align-items:center;flex-wrap:wrap}' +
    '.daumen button,.chip{background:#fff;border:1px solid #D2D2D7;border-radius:999px;padding:5px 11px;font-size:13px;cursor:pointer;color:#111214}' +
    '.daumen button[aria-pressed=true]{background:#111214;color:#fff;border-color:#111214}' +
    '.chips{display:flex;flex-wrap:wrap;gap:6px}' +
    '.mensch{padding:9px 16px;font-size:12.5px;color:#3A3B40;border-top:1px solid #E8E8EA;background:#fff}' +
    '.mensch a,.mensch button{color:#111214;font-size:12.5px}.mensch button{background:none;border:0;padding:0;text-decoration:underline;cursor:pointer}' +
    '.eingabe{display:flex;gap:8px;padding:12px;border-top:1px solid #E8E8EA;background:#fff}' +
    '.eingabe textarea{flex:1;resize:none;border:1px solid #D2D2D7;border-radius:12px;padding:10px 12px;font-size:15px;height:46px;max-height:120px;color:#111214}' +
    '.eingabe button{background:' + cfg.farbe + ';color:#fff;border:0;border-radius:12px;width:46px;cursor:pointer;display:grid;place-items:center}' +
    '.eingabe button svg{width:18px;height:18px;stroke:currentColor;fill:none;stroke-width:2}' +
    '.eingabe button:disabled{opacity:.5;cursor:default}' +
    '.formular{display:flex;flex-direction:column;gap:8px}.formular textarea,.formular input{border:1px solid #D2D2D7;border-radius:10px;padding:8px 10px;font-size:14px;width:100%}' +
    '.formular button{align-self:flex-start;background:' + cfg.farbe + ';color:#fff;border:0;border-radius:999px;padding:7px 16px;cursor:pointer;font-size:14px}' +
    '.tippt{color:#6E6E73;font-size:13.5px}' +
    '.unsichtbar{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}' +
    '</style>' +
    '<button class="start" type="button" aria-haspopup="dialog"><svg viewBox="0 0 32 32" stroke-linecap="round" stroke-linejoin="round">' + MASSBLASE + '</svg>Fragen?</button>' +
    '<div class="panel" role="dialog" aria-label="' + esc(cfg.name) + '">' +
    '  <div class="kopf">' + figurHtml() + '<div class="titel"><b>' + marke(cfg.name) + '</b><small>' + esc(cfg.untertitel) + '</small></div>' +
    '    <button type="button" class="brief" title="Anliegen per Nachricht" aria-label="Anliegen per Nachricht"><svg viewBox="0 0 24 24"><path d="M3 6h18v12H3zM3 6l9 7 9-7"/></svg></button>' +
    '    <button type="button" class="gross-knopf" title="Vergrößern" aria-label="Vergrößern" aria-pressed="false"><svg viewBox="0 0 24 24"><path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7"/></svg></button>' +
    '    <button type="button" class="neu" title="Neu beginnen" aria-label="Neu beginnen"><svg viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5"/></svg></button>' +
    '    <button type="button" class="zu" title="Schließen" aria-label="Schließen"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>' +
    '  <div class="verlauf" aria-live="polite"></div>' +
    '  <div class="mensch"></div>' +
    '  <form class="eingabe"><label class="unsichtbar" for="frage">Ihre Frage</label>' +
    '    <textarea id="frage" maxlength="500" placeholder="Ihre Frage …" rows="1"></textarea>' +
    '    <button type="submit" aria-label="Senden"><svg viewBox="0 0 24 24"><path d="M4 12h15M13 6l6 6-6 6"/></svg></button></form>' +
    '</div>';

  var start = w.querySelector(".start"), panel = w.querySelector(".panel"), verlauf = w.querySelector(".verlauf");
  var form = w.querySelector(".eingabe"), feld = w.querySelector("textarea"), senden = form.querySelector("button");
  var mensch = w.querySelector(".mensch");

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; });
  }
  function datum(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || "");
    return m ? m[3] + "." + m[2] + "." + m[1] : iso;
  }
  function kontaktText() {
    var t = [];
    if (cfg.telefon) t.push('<a href="tel:' + esc(cfg.telefon.replace(/\s/g, "")) + '">' + esc(cfg.telefon) + "</a>");
    if (cfg.mail) t.push('<a href="mailto:' + esc(cfg.mail) + '">' + esc(cfg.mail) + "</a>");
    return t.join(" · ");
  }
  // B8: der Weg zum Menschen ist immer sichtbar
  mensch.innerHTML = "Lieber mit einem Menschen? " + kontaktText() + (cfg.zeiten ? ", " + esc(cfg.zeiten) : "") +
    ' · <button type="button" class="anliegen-knopf">Anliegen hinterlassen</button>' +
    (cfg.antwortzeit ? '<div class="antwortzeit">' + esc(cfg.antwortzeit) + "</div>" : "");

  // Antworttext: Absätze und Zeilen mit "- " als Liste, alles andere als Text
  function textHtml(s) {
    var zeilen = String(s).split(/\n+/), out = "", liste = false;
    zeilen.forEach(function (z) {
      z = z.trim(); if (!z) return;
      if (/^[-•]\s+/.test(z)) {
        if (!liste) { out += "<ul>"; liste = true; }
        out += "<li>" + esc(z.replace(/^[-•]\s+/, "")) + "</li>";
      } else {
        if (liste) { out += "</ul>"; liste = false; }
        out += "<p>" + esc(z) + "</p>";
      }
    });
    if (liste) out += "</ul>";
    return out;
  }

  function blase(html, ich) {
    var b = document.createElement("div");
    b.className = "blase" + (ich ? " ich" : "");
    b.innerHTML = html;
    verlauf.appendChild(b);
    verlauf.scrollTop = verlauf.scrollHeight;
    return b;
  }

  // A1, B2, B3: Begrüßung mit KI-Hinweis, Einstiegsthemen
  function begruessen() {
    verlauf.innerHTML = "";
    var b = blase('<div class="gruss">' + figurHtml() + "<div><p>Guten Tag. Ich bin der digitale Assistent von Gernbei, eine KI. Ich antworte aus den veröffentlichten Seiten dieser Website.</p>" +
      '<p class="hinweis">Antworten können ungenau sein; verbindlich sind die verlinkten Seiten und Ihr Angebot. Bitte geben Sie hier keine persönlichen Daten ein.</p></div></div>');
    if (cfg.themen.length) {
      var c = document.createElement("div");
      c.className = "chips";
      cfg.themen.forEach(function (t) {
        var k = document.createElement("button");
        k.type = "button"; k.className = "chip"; k.textContent = t;
        k.addEventListener("click", function () { fragen(t); });
        c.appendChild(k);
      });
      b.appendChild(c);
    }
  }

  // B5, B6, B7: Antwort mit Stufe, Quellen als Ziffern, Daumen mit Grund
  function antwortZeigen(r) {
    var html = textHtml(r.antwort);
    if (r.status === "ok" && r.quellen && r.quellen.length) {
      html += '<span class="stufe">' + (r.stufe === "wortlaut"
        ? "Geprüfte Antwort aus den Häufigen Fragen, Stand " + esc(datum(r.stand))
        : "Aus freigegebenen Seiten zusammengestellt, Stand " + esc(datum(r.stand))) + "</span>";
      html += '<div class="quellen">Quellen: ' + r.quellen.map(function (q, i) {
        return '<a href="' + esc(q.link) + '" target="_blank" rel="noopener">' + (i + 1) + " " + esc(q.titel) + "</a>";
      }).join(" · ") + "</div>";
    }
    if (r.status === "unbekannt" || r.status === "weitergeben") {
      html += '<p class="hinweis">Direkt erreichen Sie uns: ' + kontaktText() + "</p>";
    }
    var b = blase(html);
    if (r.nr && (r.status === "ok" || r.status === "unbekannt")) daumen(b, r.nr);
  }

  function daumen(b, nr) {
    var leiste = document.createElement("div");
    leiste.className = "daumen";
    leiste.innerHTML = '<button type="button" aria-pressed="false" data-wert="hoch" aria-label="Hilfreich">👍</button>' +
      '<button type="button" aria-pressed="false" data-wert="runter" aria-label="Nicht hilfreich">👎</button>';
    b.appendChild(leiste);
    leiste.addEventListener("click", function (e) {
      var k = e.target.closest("button"); if (!k) return;
      if (k.dataset.wert === "hoch") {
        post("/auskunft/bewertung", { sitzung: sitzung, nr: nr, wert: "hoch" });
        leiste.innerHTML = '<span class="hinweis">Danke für Ihre Rückmeldung.</span>';
      } else if (k.dataset.wert === "runter") {
        leiste.innerHTML = '<span class="hinweis">Was stimmte nicht?</span>';
        ["falsch", "veraltet", "nicht verstanden", "zu lang"].forEach(function (g) {
          var x = document.createElement("button"); x.type = "button"; x.textContent = g; x.dataset.grund = g;
          leiste.appendChild(x);
        });
      } else if (k.dataset.grund) {
        post("/auskunft/bewertung", { sitzung: sitzung, nr: nr, wert: "runter", grund: k.dataset.grund });
        leiste.innerHTML = '<span class="hinweis">Danke, das sehen wir uns an.</span>';
      }
    });
  }

  function post(pfad, daten, ms) {
    var ctrl = window.AbortController ? new AbortController() : null;
    var uhr = ctrl && ms ? setTimeout(function () { ctrl.abort(); }, ms) : null;
    return fetch(cfg.dienst + pfad, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(daten), signal: ctrl ? ctrl.signal : undefined, credentials: "omit"
    }).then(function (r) { if (uhr) clearTimeout(uhr); if (!r.ok) throw new Error(r.status); return r.json(); });
  }

  // A3: kommt nichts binnen der Wartezeit, steht der Kontaktweg da, ohne Server
  function rueckfall() {
    blase("<p>Ich bin gerade nicht erreichbar.</p><p>Sie erreichen uns direkt: " + kontaktText() + (cfg.zeiten ? ", " + esc(cfg.zeiten) : "") + ".</p>");
  }

  function fragen(text) {
    text = String(text || "").trim().slice(0, 500);
    if (!text || senden.disabled) return;
    blase(textHtml(text), true);
    feld.value = "";
    senden.disabled = true;
    var tippt = blase('<span class="tippt">Einen Moment …</span>');
    post("/auskunft/frage", { sitzung: sitzung, text: text }, cfg.wartezeit).then(function (r) {
      tippt.remove();
      if (r.sitzung) { sitzung = r.sitzung; try { sessionStorage.setItem("auskunft-sitzung", sitzung); } catch (e) {} }
      if (r.status === "gestoert" || r.status === "aus" || r.status === "grenze") return rueckfall();
      antwortZeigen(r);
    }).catch(function () { tippt.remove(); rueckfall(); })
      .then(function () { senden.disabled = false; feld.focus(); });
  }

  // B9: Anliegen hinterlassen, mit Hinweis, was gespeichert wird
  function anliegenFormular() {
    var b = blase('<p>Schreiben Sie kurz Ihr Anliegen und wie wir Sie erreichen. Gespeichert wird nur, was Sie hier eingeben; lesen wird es Kurt König, um Ihnen zu antworten.</p>' +
      '<form class="formular"><label class="unsichtbar" for="anl">Anliegen</label><textarea id="anl" rows="3" maxlength="1500" placeholder="Ihr Anliegen"></textarea>' +
      '<label class="unsichtbar" for="rw">Rückweg</label><input id="rw" maxlength="200" placeholder="Mail oder Telefon für die Antwort">' +
      '<button type="submit">Absenden</button></form>');
    var f = b.querySelector("form");
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      post("/auskunft/anliegen", { sitzung: sitzung, anliegen: f.querySelector("textarea").value, rueckweg: f.querySelector("input").value }, cfg.wartezeit)
        .then(function (r) { if (r.ok) b.innerHTML = "<p>" + esc(r.text) + "</p>"; else blase("<p>" + esc(r.text) + "</p>"); })
        .catch(rueckfall);
    });
    f.querySelector("textarea").focus();
  }

  start.addEventListener("click", function () {
    panel.classList.add("offen"); start.style.display = "none";
    if (!verlauf.children.length) begruessen();
    feld.focus();
  });
  w.querySelector(".zu").addEventListener("click", function () { panel.classList.remove("offen"); start.style.display = ""; start.focus(); });
  w.querySelector(".neu").addEventListener("click", function () {
    sitzung = null; try { sessionStorage.removeItem("auskunft-sitzung"); } catch (e) {}
    begruessen(); feld.focus();
  });
  mensch.querySelector(".anliegen-knopf").addEventListener("click", anliegenFormular);
  w.querySelector(".brief").addEventListener("click", anliegenFormular);
  var grossKnopf = w.querySelector(".gross-knopf");
  grossKnopf.addEventListener("click", function () {
    var an = panel.classList.toggle("gross");
    grossKnopf.setAttribute("aria-pressed", an ? "true" : "false");
    grossKnopf.title = an ? "Verkleinern" : "Vergrößern";
    grossKnopf.setAttribute("aria-label", grossKnopf.title);
  });
  form.addEventListener("submit", function (e) { e.preventDefault(); fragen(feld.value); });
  feld.addEventListener("keydown", function (e) { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); fragen(feld.value); } });
  panel.addEventListener("keydown", function (e) { if (e.key === "Escape") w.querySelector(".zu").click(); });
})();
