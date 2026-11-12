// Szene (Baustein A und B, Entwurf 07.11.2026): der Satz tippt sich, dann drei Haken.
// Ohne Skript bleibt die erste Szene fertig stehen. Bei weniger Bewegung kein Tippen und kein Weiterblättern.
// Seit 08.11.2026 mehrere Bühnen je Seite (Startseite, Kurt: die Unterhaltungen sind der Reißer):
// jede .szene[data-szenen] holt ihre Szenen aus szenen-daten.js, data-beruf nennt ihre Berufswahl.
(function () {
  var ICON = {
    mikro: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/>',
    foto: '<path d="M4 8h3l1.5-2h7L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
    tasten: '<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M7 10h.01M11 10h.01M15 10h.01M7 14h10"/>',
    hoerer: '<path d="M6.5 3.5h3l1.5 4-2 1.5a11 11 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2 2A16 16 0 0 1 4.5 5.5a2 2 0 0 1 2-2z"/>',
    blase: '<path d="M4 5h16v11H10l-4 3.5V16H4z"/>'
  };
  var ALLE = window.SZENEN_DATEN || {};
  var ruhig = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Eine Liste: alle Szenen, Knoepfe stehen im HTML. Ein Objekt mit berufe: oben die Frage
  // "Was machen Sie?", je Beruf nur seine Szenen, die Knoepfe baut das Programm (Entwurf 07.11.2026).
  function buehne(wurzel) {
    var DATEN = ALLE[wurzel.getAttribute("data-szenen")];
    if (!DATEN) return;
    var SZENEN = Array.isArray(DATEN) ? DATEN : DATEN.szenen;
    var BERUFE = Array.isArray(DATEN) ? null : DATEN.berufe;
    var berufKnoepfe = [];
    var berufGruppe = document.getElementById(wurzel.getAttribute("data-beruf") || "");
    if (berufGruppe) berufKnoepfe = Array.prototype.slice.call(berufGruppe.querySelectorAll("button"));
    var unter = wurzel.querySelector(".bildunter");
    var art = wurzel.querySelector(".szene-art"), text = wurzel.querySelector(".szene-text");
    var zettel = wurzel.querySelector(".szene-zettel"), denkt = wurzel.querySelector(".szene-denkt");
    var liste = wurzel.querySelector(".szene-haken"), wahl = wurzel.querySelector(".szene-wahl");
    // Firmengedaechtnis (Kurt 08.11.2026: Ja, einbauen): Zeile "aus Peters Notiz -> fuer Lukas" ueber den Haken
    var weg = wurzel.querySelector(".szene-weg");
    var knoepfe = [], folge = SZENEN.map(function (s, i) { return i; });
    var jetzt = 0, uhren = [], automatisch = !ruhig, sichtbar = false, gestartet = false;

    function spaeter(f, ms) { uhren.push(setTimeout(f, ms)); }
    function anhalten() { uhren.forEach(clearTimeout); uhren = []; wurzel.classList.remove("tippt"); }

    // n zaehlt in der Folge des gewaehlten Berufs, ohne Berufe in allen Szenen
    function zeigen(n, sofort) {
      anhalten();
      jetzt = n;
      var s = SZENEN[folge[n]];
      knoepfe.forEach(function (k, i) { k.setAttribute("aria-pressed", i === n ? "true" : "false"); });
      wurzel.classList.toggle("rechner", s.geraet === "rechner");
      // echt: Bitte und Haken aus einem Lauf auf mithand-t1 (Szenen-Echtlauf-2026-11-07), gekuerzt, nichts
      // hinzugefuegt. Ohne echt bleibt die Szene Probetext und darf so nicht live gehen.
      // unter: eigene Bildunterschrift, wo kein erfundener Betrieb spricht (Chatbot auf gernbei.de, Testanruf)
      unter.textContent = s.echt ? (s.unter || "Erfundener Betrieb, echte Antwort, gekürzt.") : "Entwurf: Probetext, die echte Antwort steht aus.";
      art.querySelector("svg").innerHTML = ICON[s.icon];
      art.querySelector("span").textContent = s.art;
      zettel.hidden = !s.zettel;
      if (weg) { weg.textContent = s.weg || ""; weg.classList.toggle("zu", !sofort); }
      liste.innerHTML = s.haken.map(function (h, i) {
        return '<li class="' + (i === 2 ? "fund" : "") + (sofort ? "" : " zu") + '">' + h + "</li>";
      }).join("");
      if (sofort) { text.textContent = s.text; denkt.hidden = true; liste.classList.remove("zu"); if (weg) weg.classList.remove("zu"); return; }
      text.textContent = "";
      liste.classList.add("zu");
      wurzel.classList.add("tippt");
      var t = 500;
      for (var i = 1; i <= s.text.length; i++) {
        (function (k) { spaeter(function () { text.textContent = s.text.slice(0, k); }, t); })(i);
        t += 38;
      }
      spaeter(function () { wurzel.classList.remove("tippt"); denkt.hidden = false; }, t + 300);
      t += 1500;
      spaeter(function () { denkt.hidden = true; liste.classList.remove("zu"); if (weg) weg.classList.remove("zu"); }, t);
      liste.querySelectorAll("li").forEach(function (li, i) {
        spaeter(function () { li.classList.remove("zu"); }, t + 150 + i * 650);
      });
      // Eine einzelne Szene laeuft einmal und bleibt dann stehen
      if (automatisch && folge.length > 1) spaeter(function () { zeigen((jetzt + 1) % folge.length, false); }, t + 6500);
    }

    function knoepfeVerbinden() {
      if (!wahl) return;
      knoepfe = Array.prototype.slice.call(wahl.querySelectorAll("button"));
      knoepfe.forEach(function (k, i) {
        k.addEventListener("click", function () { automatisch = false; zeigen(i, ruhig); });
      });
    }

    function berufWaehlen(b, sofort) {
      var beruf = BERUFE[b];
      folge = beruf.szenen;
      berufKnoepfe.forEach(function (k, i) { k.setAttribute("aria-pressed", i === b ? "true" : "false"); });
      wahl.innerHTML = folge.map(function (n) {
        return '<button type="button" aria-pressed="false">' + SZENEN[n].knopf + "</button>";
      }).join("");
      knoepfeVerbinden();
      // Das Band "Gefunden werden" steht nur bei den Maklern offen (nur auf Fuer Dienstleister)
      var band = wurzel.getAttribute("data-band") && document.getElementById(wurzel.getAttribute("data-band"));
      if (band) band.hidden = !beruf.band;
      zeigen(0, sofort);
    }

    if (BERUFE) {
      berufKnoepfe.forEach(function (k, i) {
        k.addEventListener("click", function () { automatisch = !ruhig; gestartet = true; berufWaehlen(i, ruhig); });
      });
      // Vorwahl ohne Bewegung, damit Knoepfe und Band zum ersten Beruf passen
      folge = BERUFE[0].szenen;
    }
    knoepfeVerbinden();
    if (ruhig) return;
    // Erst loslaufen, wenn die Bühne zu sehen ist; aus dem Bild gescrollt steht die Szene fertig still
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (e) {
        var jetztSichtbar = e[0].isIntersecting;
        if (jetztSichtbar === sichtbar) return;
        sichtbar = jetztSichtbar;
        if (sichtbar) { gestartet = true; zeigen(jetzt, false); }
        else if (gestartet) zeigen(jetzt, true);
      }, { threshold: 0.4 }).observe(wurzel);
    } else {
      zeigen(0, false);
    }
  }

  Array.prototype.forEach.call(document.querySelectorAll(".szene[data-szenen]"), buehne);
})();
