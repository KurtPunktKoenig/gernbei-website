// Szenen aller Bühnen, einmal für alle Seiten (08.11.2026, Startseite und Produktseiten zeigen dieselben).
// echt: Bitte und Haken aus einem Lauf auf mithand-t1 (Szenen-Echtlauf-2026-11-07), gekuerzt, nichts hinzugefuegt;
// am 08.11.2026 positiv gefasst, gleicher Sinn (Kurt: keine Verneinungen).
window.SZENEN_DATEN = {
 "handwerk": [
  {
   "echt": true,
   "geraet": "handy",
   "icon": "foto",
   "art": "am Handy, Foto vom Zettel",
   "zettel": true,
   "text": "Ich hab dir das Foto vom Regiezettel hingelegt. Mach den Regiebericht für Berger draus.",
   "haken": [
    "Regiebericht R001 für Berger liegt unter Dokumente",
    "Peter 3,5 Stunden, Jonas 3 Stunden, Material übernommen",
    "Bitte prüfen: die Zahlen sind vom Zettel gelesen"
   ]
  },
  {
   "echt": true,
   "geraet": "rechner",
   "icon": "tasten",
   "art": "am Rechner, getippt",
   "zettel": false,
   "text": "Angebot für Familie Wolf, Bad: 8 m² Fliesen, Duschwanne tauschen. Wie beim Bad Schmitt.",
   "haken": [
    "Angebot 2026-001 als Entwurf angelegt",
    "Zum Vergleich Bad Schmitt: 7,5 m² für 8.950 € brutto",
    "Es fehlen noch: Adresse, Aufmaß und Einzelpreise"
   ]
  },
  {
   "echt": true,
   "geraet": "handy",
   "icon": "mikro",
   "art": "am Handy, gesprochen",
   "zettel": false,
   "text": "Mach einen Beitrag fürs Google-Unternehmensprofil zum Bad Schmitt.",
   "haken": [
    "Beitrag fürs Google-Profil entworfen, Kundenname weggelassen",
    "Den Namen nur mit Einverständnis der Schmitts",
    "Erst posten, wenn Handwerkskammer und Handwerksrolle im Impressum stehen"
   ]
  },
  {
   "echt": true,
   "geraet": "rechner",
   "icon": "tasten",
   "art": "am Rechner, abends",
   "zettel": false,
   "text": "Was ist eigentlich mit dem Angebot Bad Müller?",
   "haken": [
    "9.480 € brutto, seit dem 17.10. bei Frau Müller",
    "Das Nachfassschreiben liegt fertig im Entwurf",
    "Aufgefallen: die Postleitzahl von Frau Müller fehlt noch"
   ]
  },
  {
   "echt": true,
   "geraet": "handy",
   "icon": "mikro",
   "art": "am Handy, gesprochen, 16 Uhr",
   "zettel": false,
   "text": "Huber hat angerufen, wann wir kommen. Die Heizung tropft wieder.",
   "haken": [
    "Anruf von Herrn Huber festgehalten",
    "Letzter Einsatz bei Huber: 12.09., Ventil getauscht",
    "Aufgefallen: der Rückruf war bis gestern zugesagt"
   ]
  },
  {
   "echt": true,
   "geraet": "handy",
   "icon": "mikro",
   "art": "am Handy, morgens im Transporter",
   "zettel": false,
   "text": "Was steht heute an?",
   "haken": [
    "Herr Huber: ihm heute einen Termin zum Nachsehen nennen",
    "Frau Berger: Wartung der Gastherme, für heute zugesagt",
    "Bis 14.11.: bei Müller nachfassen, Angebot für Wolf"
   ]
  }
 ],
 "dienstleister": {
  "berufe": [
   {
    "name": "Beratung",
    "szenen": [
     0,
     1
    ]
   },
   {
    "name": "Projektleitung",
    "szenen": [
     2,
     3
    ]
   },
   {
    "name": "Immobilien",
    "szenen": [
     4,
     5
    ],
    "band": true
   },
   {
    "name": "Versicherung",
    "szenen": [
     6,
     7
    ],
    "band": true
   },
   {
    "name": "Gutachten",
    "szenen": [
     8,
     9
    ]
   },
   {
    "name": "Freelance",
    "szenen": [
     10
    ]
   }
  ],
  "szenen": [
   {
    "echt": true,
    "geraet": "rechner",
    "icon": "tasten",
    "art": "am Rechner, Sonntagabend",
    "zettel": false,
    "text": "Angebot für Familie Wolf, Wertermittlung Einfamilienhaus in Gerbrunn, wie für Schmitt im März.",
    "haken": [
     "Angebot 2026-001 für Familie Wolf als Entwurf",
     "Aufbau: Besichtigung, Wertermittlung, klare Abgrenzung",
     "Für Sie offen: Preise und Anschrift, die setzen Sie ein"
    ],
    "knopf": "Angebot wie das letzte"
   },
   {
    "echt": true,
    "geraet": "rechner",
    "icon": "tasten",
    "art": "am Rechner, Montagmorgen",
    "zettel": false,
    "text": "Was habe ich diese Woche wem versprochen?",
    "haken": [
     "Herr Albers: Exposé Sanderstraße 8, bis 11.11.",
     "Frau Kraus: Bericht zum Hausverkauf, jeden Freitag",
     "Der nächste Bericht ist Freitag, 13.11., fällig"
    ],
    "knopf": "Zusagen der Woche"
   },
   {
    "echt": true,
    "geraet": "rechner",
    "icon": "tasten",
    "art": "am Rechner, vor dem Lenkungskreis",
    "zettel": false,
    "text": "Statusbericht für den Lenkungskreis am 16.11. aus meinen Notizen: Design abgenommen, Shop-Anbindung zwei Wochen später, 21.400 Euro verbraucht, Texte vom Kunden fehlen.",
    "haken": [
     "Statusbericht als Word-Datei, Gesamtampel Gelb",
     "Für den Lenkungskreis: Texte bis 1.12. zusagen, Schnittstelle klären",
     "Nachgerechnet: 45 Prozent Budget bei 31 Prozent Laufzeit"
    ],
    "knopf": "Statusbericht aus Notizen"
   },
   {
    "echt": true,
    "geraet": "rechner",
    "icon": "tasten",
    "art": "am Rechner, Projektstart",
    "zettel": false,
    "text": "Mach mir einen Projektstrukturplan für den Relaunch: Konzept, Design, Shop mit Warenwirtschaft, Texte und Bilder, Test, Go-live mit Schulung.",
    "haken": [
     "Projektstrukturplan als Excel-Tabelle, 30 Arbeitspakete",
     "Ergänzt: Projektleitung und Rechtstexte für den Shop",
     "Kritisch: Schnittstelle und Produkttexte, beide liegen außerhalb der Agentur"
    ],
    "knopf": "Projektstrukturplan"
   },
   {
    "echt": true,
    "geraet": "handy",
    "icon": "mikro",
    "art": "am Handy, zwischen zwei Terminen",
    "zettel": false,
    "text": "Wo steht die Sache Albers?",
    "haken": [
     "Wohnung Sanderstraße 8, Interessent Herr Albers",
     "Besichtigung Donnerstag, 12.11., 17 Uhr",
     "Offen: Exposé bis Mittwoch, steht noch aus"
    ],
    "knopf": "Stand zwischen zwei Terminen"
   },
   {
    "echt": true,
    "geraet": "rechner",
    "icon": "tasten",
    "art": "am Rechner, getippt",
    "zettel": false,
    "text": "Mach einen LinkedIn-Beitrag zur verkauften Wohnung im Frauenland.",
    "haken": [
     "Fragt zuerst, was der Beitrag erzählen soll",
     "Rät: Straße, Preis und Namen weglassen, Einverständnis der Verkäufer einholen",
     "Hinweis: Zeigt der Beitrag die Wohnung, gehören die Energieangaben hinein"
    ],
    "knopf": "LinkedIn-Beitrag"
   },
   {
    "echt": true,
    "geraet": "rechner",
    "icon": "tasten",
    "art": "am Rechner, neuer Kunde",
    "zettel": false,
    "text": "Herr Krämer wechselt mit drei Verträgen zu mir: Hausrat und Privathaftpflicht bei der Mainland Versicherung, Wohngebäude bei der Frankenland.",
    "haken": [
     "Vier Blätter für den Wechsel als Entwurf, drei Verträge erfasst",
     "Jetzt hinaus: das Anschreiben an Herrn Krämer, der Rest wartet auf die Vollmacht",
     "Fehlt noch: die Policen, Vertragsnummern kommen allein aus Ihren Unterlagen"
    ],
    "knopf": "Bestandswechsel"
   },
   {
    "echt": true,
    "geraet": "handy",
    "icon": "mikro",
    "art": "am Handy, gesprochen",
    "zettel": false,
    "text": "Schadenmeldung: Wasserschaden bei Familie Ott, in der Küche ist am 5.11. eine Leitung unter der Spüle geplatzt.",
    "haken": [
     "Schadenmeldung als Word-Datei, Entwurf",
     "Hergang wie geschildert, Ursache und Schuldfrage bleiben bei Ihnen",
     "Fehlt noch: Vertragsnummer, Anschrift, beschädigte Gegenstände"
    ],
    "knopf": "Schadenmeldung"
   },
   {
    "echt": true,
    "geraet": "handy",
    "icon": "mikro",
    "art": "am Handy, nach dem Ortstermin",
    "zettel": false,
    "text": "Meine Notizen vom Ortstermin in Höchberg, erfasse den Befund: Kellerwand Nord, waagrechter Riss, etwa 1,80 m lang, bis 0,5 mm breit, Ausblühungen darunter, Feuchte 6,8, 7,1 und 4,2 Prozent.",
    "haken": [
     "Befund vom Ortstermin als Word-Datei, Entwurf",
     "Riss, Ausblühungen, drei Messwerte und Anwesende erfasst",
     "Ursache und Bewertung bleiben leer, die gehören Ihnen"
    ],
    "knopf": "Befund vom Ortstermin"
   },
   {
    "echt": true,
    "geraet": "rechner",
    "icon": "tasten",
    "art": "am Rechner, Gerichtsauftrag",
    "zettel": false,
    "text": "Kostenschätzung nach § 407a für das Landgericht im Fall Weber gegen Hofmann. 14 Stunden Gutachten, dazu Ortstermin mit Fahrt 4 Stunden.",
    "haken": [
     "Kostenschätzung als Entwurf, 18 Stunden zusammengerechnet",
     "Mit Hinweis an das Gericht und Freigabevermerk für Sie",
     "Fehlt noch: Ihr Stundensatz nach JVEG, den Betrag setzen Sie ein"
    ],
    "knopf": "Kostenschätzung fürs Gericht"
   },
   {
    "echt": true,
    "geraet": "rechner",
    "icon": "tasten",
    "art": "am Rechner, Projekt vom Portal",
    "zettel": false,
    "text": "Hier ist ein Projekt von einem Portal, passt das zu mir? UX Designer für ein B2B-Kundenportal, Start 04.01.2027, 3 bis 4 Tage pro Woche, Nürnberg, bis 85 Euro die Stunde.",
    "haken": [
     "Einstufung: passt, mit einer Lücke",
     "Passt: Figma, Usability-Tests, Start im Januar, Nürnberg",
     "Satz bis 85 Euro: rund 100 Euro am Tag unter Ihrem"
    ],
    "knopf": "Projekt vom Portal"
   }
  ]
 },
 "chatbot": [
  {
   "echt": true,
   "unter": "Echte Antwort des Chatbots auf gernbei.de, 07.11.2026.",
   "geraet": "handy",
   "icon": "blase",
   "art": "Besucherin, am Handy",
   "zettel": false,
   "text": "Muss ich dafür etwas installieren?",
   "haken": [
    "Läuft im Browser, am Rechner oder am Handy",
    "Quelle: Häufige Fragen und Startseite",
    "Wörtlich belegt aus den Häufigen Fragen"
   ]
  },
  {
   "echt": true,
   "unter": "Echte Antwort des Chatbots auf gernbei.de, 07.11.2026.",
   "geraet": "rechner",
   "icon": "blase",
   "art": "Besucher, am Rechner",
   "zettel": false,
   "text": "Was kostet Gernbei fürs Handwerk?",
   "haken": [
    "Den Preis nennt Kurt König im Gespräch, passend zum Betrieb",
    "Quelle: Gernbei fürs Handwerk und Häufige Fragen",
    "Jede Angabe steht so auf der Website"
   ]
  },
  {
   "echt": true,
   "unter": "Echte Antwort des Chatbots auf gernbei.de, 07.11.2026.",
   "geraet": "handy",
   "icon": "blase",
   "art": "Besucherin, am Handy",
   "zettel": false,
   "text": "Kann ich bei Ihnen am Samstag vorbeikommen?",
   "haken": [
    "Sagt offen, dass ihm dazu eine Auskunft fehlt",
    "Termin direkt: Mail und Telefon des Betriebs genannt",
    "Auf Wunsch ein Anliegen hinterlassen, für den Betrieb abgelegt"
   ]
  }
 ],
 "telefon": [
  {
   "echt": true,
   "unter": "Testanruf vom 07.11.2026, so gespeichert. Der Satz des Anrufers steht wie auf seinem Testzettel. Gespeichert wird allein der Rückrufwunsch.",
   "geraet": "handy",
   "icon": "hoerer",
   "art": "Anrufer, am Telefon",
   "zettel": false,
   "text": "Rufen Sie mich bitte zurück. Aber erst ab 16 Uhr.",
   "haken": [
    "Nummer Ziffer für Ziffer vorgelesen, vom Anrufer bestätigt",
    "Erst nach seinem Ja als bestätigt gespeichert",
    "Wunschzeit festgehalten: ab 16 Uhr"
   ]
  },
  {
   "echt": true,
   "unter": "Testanruf vom 07.11.2026, so gespeichert. Der Satz des Anrufers steht wie auf seinem Testzettel. Gespeichert wird allein der Rückrufwunsch.",
   "geraet": "handy",
   "icon": "hoerer",
   "art": "Anrufer, am Telefon",
   "zettel": false,
   "text": "Ich möchte ein Angebot.",
   "haken": [
    "Anliegen: Angebot angefragt, Rückruf gewünscht",
    "Nummer bestätigt, nach Name und Wunschzeit gefragt",
    "Steht beim Betrieb als offener Rückruf"
   ]
  },
  {
   "echt": true,
   "unter": "Testanruf vom 07.11.2026, so gespeichert. Der Satz des Anrufers steht wie auf seinem Testzettel. Gespeichert wird allein der Rückrufwunsch.",
   "geraet": "handy",
   "icon": "hoerer",
   "art": "Anrufer, legt vor dem Ja auf",
   "zettel": false,
   "text": "Rufen Sie mich zurück, ich möchte ein Angebot …",
   "haken": [
    "Anrufer legt vor der Bestätigung auf",
    "Anliegen und Nummer trotzdem gespeichert",
    "Steht als unvollständig da, zum Nachfassen"
   ]
  },
  {
   "echt": true,
   "unter": "Testanrufe vom 07.11.2026, so gemeldet. Nummern hier weggelassen.",
   "geraet": "rechner",
   "icon": "tasten",
   "art": "beim Betrieb, am Rechner",
   "zettel": false,
   "text": "Rückrufe offen: 3",
   "haken": [
    "13:28, bestätigt: Angebot angefragt, Rückruf gewünscht",
    "13:25, bestätigt: Wunsch ab 16 Uhr",
    "13:26, unvollständig: Er möchte ein Angebot haben"
   ]
  }
 ],
 "gedaechtnis": [
  {
   "echt": true,
   "geraet": "rechner",
   "icon": "tasten",
   "art": "am Rechner, im Team",
   "zettel": false,
   "text": "Warum haben wir beim Sonnenhof damals Variante B genommen?",
   "haken": [
    "Entschieden am 17.03. für Variante B",
    "Rund 18 Prozent günstiger, die Statik ist freigegeben",
    "Quelle: Protokoll Baubesprechung Sonnenhof, Punkt 4"
   ]
  }
 ]
};
