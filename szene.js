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
  // Jede Szene steht in Faehigkeiten-Produkte (Zeile in Klammern). echt: Bitte und Haken aus dem Lauf
  // auf mithand-t1 vom 07.11.2026, gekuerzt, nichts hinzugefuegt (Szenen-Echtlauf-2026-11-07).
  // Ohne echt bleibt die Szene Probetext und darf so nicht live gehen.
  var SZENEN = [
    { echt: true, geraet: "handy", icon: "foto", art: "am Handy, Foto vom Zettel", zettel: true,  // 2, 3, 7
      text: "Ich hab dir das Foto vom Regiezettel hingelegt. Mach den Regiebericht für Berger draus.",
      haken: ["Regiebericht R001 für Berger liegt unter Dokumente", "Peter 3,5 Stunden, Jonas 3 Stunden, Material übernommen", "Bitte prüfen: die Zahlen sind vom Zettel gelesen"] },
    { echt: true, geraet: "rechner", icon: "tasten", art: "am Rechner, getippt", zettel: false,  // 1, 10, 46
      text: "Angebot für Familie Wolf, Bad: 8 m² Fliesen, Duschwanne tauschen. Wie beim Bad Schmitt.",
      haken: ["Angebot 2026-001 als Entwurf angelegt", "Zum Vergleich Bad Schmitt: 7,5 m² für 8.950 € brutto", "Es fehlen noch: Adresse, Aufmaß und Einzelpreise"] },
    { echt: true, geraet: "handy", icon: "mikro", art: "am Handy, gesprochen", zettel: false,  // 30
      text: "Mach einen Beitrag fürs Google-Unternehmensprofil zum Bad Schmitt.",
      haken: ["Beitrag fürs Google-Profil entworfen, ohne Kundennamen", "Den Namen nur mit Einverständnis der Schmitts", "Erst posten, wenn Handwerkskammer und Handwerksrolle im Impressum stehen"] },
    { echt: true, geraet: "rechner", icon: "tasten", art: "am Rechner, abends", zettel: false,  // 6, 10, 32
      text: "Was ist eigentlich mit dem Angebot Bad Müller?",
      haken: ["9.480 € brutto, seit dem 17.10. bei Frau Müller", "Das Nachfassschreiben liegt fertig im Entwurf", "Aufgefallen: die Postleitzahl von Frau Müller fehlt noch"] },
    { echt: false, geraet: "handy", icon: "mikro", art: "am Handy, gesprochen, 16 Uhr", zettel: false,  // 4, 5, 6
      text: "Huber fragt, wann wir kommen. Die Heizung tropft wieder.",
      haken: ["Letzter Einsatz bei Huber: 12.09., Ventil getauscht", "Antwort an Herrn Huber entworfen", "Aufgefallen: Rückruf bis Freitag zugesagt"] },
    { echt: false, geraet: "rechner", icon: "tasten", art: "am Rechner, mit Microsoft 365", zettel: false,  // 44
      text: "Beantworte die Mail von Frau Berger.",
      haken: ["Mail in Outlook gelesen", "Antwort liegt in Ihren Entwürfen, abschicken tun Sie", "Aufgefallen: sie fragt auch nach dem Wartungsvertrag"] },
    { echt: false, geraet: "handy", icon: "mikro", art: "am Handy, morgens im Transporter", zettel: false,  // 11, 6
      text: "Was steht heute an?",
      haken: ["Wartung bei Berger, für heute zugesagt", "Zwei Rückrufe bis Freitag versprochen", "Aufgefallen: Angebot Müller seit drei Wochen offen"] },
    { echt: false, geraet: "rechner", icon: "tasten", art: "am Rechner, Kalkulation im OneDrive", zettel: false,  // 44
      text: "Was hat das Bad Müller bisher gekostet?",
      haken: ["Kalkulation im OneDrive gefunden", "Bisher 4.860 Euro für Material und Stunden", "Aufgefallen: die Stunden von Dienstag fehlen noch"] }
  ];
  var unter = wurzel.querySelector(".bildunter");
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
    wurzel.classList.toggle("rechner", s.geraet === "rechner");
    unter.textContent = s.echt ? "Erfundener Betrieb, echte Antwort." : "Entwurf: Probetext, die echte Antwort steht aus.";
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
