// Szene im Kopf (Baustein A und B, Entwurf 07.11.2026): der Satz tippt sich, dann drei Haken.
// Ohne Skript bleibt die erste Szene fertig stehen. Bei weniger Bewegung kein Tippen und kein Weiterblättern.
(function () {
  var wurzel = document.getElementById("szene");
  if (!wurzel) return;
  var ICON = {
    mikro: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/>',
    foto: '<path d="M4 8h3l1.5-2h7L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
    tasten: '<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M7 10h.01M11 10h.01M15 10h.01M7 14h10"/>'
  };
  var SZENEN = [
    { icon: "mikro", art: "gesprochen, 16 Uhr auf der Baustelle", zettel: false,
      text: "Huber fragt, wann wir kommen. Die Heizung tropft wieder.",
      haken: ["Letzter Einsatz bei Huber: 12.09., Ventil getauscht", "Antwort an Herrn Huber entworfen", "Aufgefallen: Rückruf bis Freitag zugesagt"] },
    { icon: "foto", art: "Foto vom Zettel aus dem Handschuhfach", zettel: true,
      text: "Mach den Regiebericht für Berger draus.",
      haken: ["Regiebericht Familie Berger als Word-Datei", "6,5 Stunden und 3 Materialpositionen übernommen", "Bitte prüfen: die Stunden sind vom Foto gelesen"] },
    { icon: "tasten", art: "getippt, abends", zettel: false,
      text: "Was ist eigentlich mit dem Bad Müller?",
      haken: ["Angebot Bad Müller: seit drei Wochen ohne Antwort", "Nachfassbrief an Frau Müller entworfen", "Aufgefallen: zwei weitere Angebote ohne Antwort"] }
  ];
  var ruhig = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var art = wurzel.querySelector(".szene-art"), text = wurzel.querySelector(".szene-text");
  var zettel = wurzel.querySelector(".szene-zettel"), denkt = wurzel.querySelector(".szene-denkt");
  var liste = wurzel.querySelector(".szene-haken"), knoepfe = wurzel.querySelectorAll(".szene-wahl button");
  var jetzt = 0, uhren = [], automatisch = !ruhig;

  function spaeter(f, ms) { uhren.push(setTimeout(f, ms)); }
  function anhalten() { uhren.forEach(clearTimeout); uhren = []; wurzel.classList.remove("tippt"); }

  function zeigen(n, sofort) {
    anhalten();
    jetzt = n;
    var s = SZENEN[n];
    knoepfe.forEach(function (k, i) { k.setAttribute("aria-pressed", i === n ? "true" : "false"); });
    art.querySelector("svg").innerHTML = ICON[s.icon];
    art.querySelector("span").textContent = s.art;
    zettel.hidden = !s.zettel;
    liste.innerHTML = s.haken.map(function (h, i) {
      return '<li class="' + (i === 2 ? "fund" : "") + (sofort ? "" : " zu") + '">' + h + "</li>";
    }).join("");
    if (sofort) { text.textContent = s.text; denkt.hidden = true; liste.classList.remove("zu"); return; }
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
    spaeter(function () { denkt.hidden = true; liste.classList.remove("zu"); }, t);
    liste.querySelectorAll("li").forEach(function (li, i) {
      spaeter(function () { li.classList.remove("zu"); }, t + 150 + i * 650);
    });
    if (automatisch) spaeter(function () { zeigen((jetzt + 1) % SZENEN.length, false); }, t + 6500);
  }

  knoepfe.forEach(function (k, i) {
    k.addEventListener("click", function () { automatisch = false; zeigen(i, ruhig); });
  });
  if (ruhig) return;
  // Erst loslaufen, wenn die Szene zu sehen ist
  if ("IntersectionObserver" in window) {
    var gestartet = false;
    new IntersectionObserver(function (e, b) {
      if (e[0].isIntersecting && !gestartet) { gestartet = true; b.disconnect(); zeigen(0, false); }
    }, { threshold: 0.4 }).observe(wurzel);
  } else {
    zeigen(0, false);
  }
})();
