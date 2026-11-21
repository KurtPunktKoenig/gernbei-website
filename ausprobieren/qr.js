/* qr.js - QR-Code-Encoder ohne Abhaengigkeiten. Byte-Modus (UTF-8), Fehlerkorrektur M, Version 1 bis 15.
   Setzt genau eine globale: window.KKQR = { svg(text, opts) }. */
(function () {
  'use strict';

  // Tabelle Stufe M: [EC-Woerter je Block, Bloecke Gruppe 1, Daten je Block G1, Bloecke G2, Daten je Block G2]
  var BLOECKE = [null,
    [10, 1, 16, 0, 0], [16, 1, 28, 0, 0], [26, 1, 44, 0, 0], [18, 2, 32, 0, 0], [24, 2, 43, 0, 0],
    [16, 4, 27, 0, 0], [18, 4, 31, 0, 0], [22, 2, 38, 2, 39], [22, 3, 36, 2, 37], [26, 4, 43, 1, 44],
    [30, 1, 50, 4, 51], [22, 6, 36, 2, 37], [22, 8, 37, 1, 38], [24, 4, 40, 5, 41], [24, 5, 41, 5, 42]];
  var AUSRICHTUNG = [null, [], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34], [6, 22, 38], [6, 24, 42],
    [6, 26, 46], [6, 28, 50], [6, 30, 54], [6, 32, 58], [6, 34, 62], [6, 26, 46, 66], [6, 26, 48, 70]];

  // ---- GF(256), Polynom 0x11d ----
  var EXP = [], LOG = [];
  (function () {
    var x = 1, i;
    for (i = 0; i < 255; i++) { EXP[i] = x; LOG[x] = i; x <<= 1; if (x & 256) x ^= 0x11d; }
    for (i = 255; i < 512; i++) EXP[i] = EXP[i - 255];
  })();
  function mul(a, b) { return (a === 0 || b === 0) ? 0 : EXP[LOG[a] + LOG[b]]; }

  function generator(n) {
    var g = [1], i, j, r;
    for (i = 0; i < n; i++) {
      r = [];
      for (j = 0; j <= g.length; j++) r[j] = 0;
      for (j = 0; j < g.length; j++) { r[j] ^= g[j]; r[j + 1] ^= mul(g[j], EXP[i]); }
      g = r;
    }
    return g;
  }
  function rsRest(daten, n) {
    var g = generator(n), rest = [], i, k, f;
    for (i = 0; i < n; i++) rest[i] = 0;
    for (k = 0; k < daten.length; k++) {
      f = daten[k] ^ rest.shift();
      rest.push(0);
      for (i = 0; i < n; i++) rest[i] ^= mul(g[i + 1], f);
    }
    return rest;
  }

  function utf8(s) {
    var out = [], i, c, d;
    for (i = 0; i < s.length; i++) {
      c = s.charCodeAt(i);
      if (c >= 0xd800 && c < 0xdc00 && i + 1 < s.length) {
        d = s.charCodeAt(i + 1);
        if (d >= 0xdc00 && d < 0xe000) { c = 0x10000 + ((c - 0xd800) << 10) + (d - 0xdc00); i++; }
      }
      if (c < 0x80) out.push(c);
      else if (c < 0x800) out.push(0xc0 | (c >> 6), 0x80 | (c & 63));
      else if (c < 0x10000) out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
      else out.push(0xf0 | (c >> 18), 0x80 | ((c >> 12) & 63), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
    }
    return out;
  }

  function datenWoerter(v) {
    var b = BLOECKE[v];
    return b[1] * b[2] + b[3] * b[4];
  }

  // Bitstrom: Modus 0100, Laenge, Daten, Abschluss, Fuellbytes EC/11
  function bitsAufbauen(bytes, v) {
    var bits = [], cap = datenWoerter(v) * 8, i;
    function put(wert, n) { for (var k = n - 1; k >= 0; k--) bits.push((wert >>> k) & 1); }
    put(4, 4);
    put(bytes.length, v < 10 ? 8 : 16);
    for (i = 0; i < bytes.length; i++) put(bytes[i], 8);
    for (i = 0; i < 4 && bits.length < cap; i++) bits.push(0);
    while (bits.length % 8) bits.push(0);
    var cw = [], pad = [0xec, 0x11];
    for (i = 0; i < bits.length; i += 8) {
      cw.push(bits[i] * 128 + bits[i + 1] * 64 + bits[i + 2] * 32 + bits[i + 3] * 16 + bits[i + 4] * 8 + bits[i + 5] * 4 + bits[i + 6] * 2 + bits[i + 7]);
    }
    for (i = 0; cw.length < cap / 8; i++) cw.push(pad[i % 2]);
    return cw;
  }

  // Bloecke bilden, EC berechnen, verschachteln
  function verschachteln(cw, v) {
    var b = BLOECKE[v], ec = b[0], blocks = [], ecs = [], pos = 0, i, j, n, out = [];
    for (i = 0; i < b[1] + b[3]; i++) {
      n = i < b[1] ? b[2] : b[4];
      blocks.push(cw.slice(pos, pos + n));
      ecs.push(rsRest(blocks[i], ec));
      pos += n;
    }
    for (j = 0; j < b[4] || j < b[2]; j++)
      for (i = 0; i < blocks.length; i++) if (j < blocks[i].length) out.push(blocks[i][j]);
    for (j = 0; j < ec; j++)
      for (i = 0; i < ecs.length; i++) out.push(ecs[i][j]);
    return out;
  }

  // ---- Matrix ----
  function leer(n, w) {
    var m = [], y, x;
    for (y = 0; y < n; y++) { m[y] = []; for (x = 0; x < n; x++) m[y][x] = w; }
    return m;
  }

  function formatBits(maske) {
    var d = maske, r = d << 10, i; // Stufe M = 00
    for (i = 14; i >= 10; i--) if ((r >>> i) & 1) r ^= 0x537 << (i - 10);
    return ((d << 10) | r) ^ 0x5412;
  }
  function versionBits(v) {
    var r = v << 12, i;
    for (i = 17; i >= 12; i--) if ((r >>> i) & 1) r ^= 0x1f25 << (i - 12);
    return (v << 12) | r;
  }

  function funktionsmuster(v) {
    var n = 17 + 4 * v, m = leer(n, false), f = leer(n, false), i, j, a, k;
    function set(x, y, d) { if (x >= 0 && y >= 0 && x < n && y < n) { m[y][x] = d; f[y][x] = true; } }
    function finder(cx, cy) {
      var dx, dy, d;
      for (dy = -4; dy <= 4; dy++) for (dx = -4; dx <= 4; dx++) {
        d = Math.max(Math.abs(dx), Math.abs(dy));
        set(cx + dx, cy + dy, d !== 4 && d !== 2);
      }
    }
    for (i = 0; i < n; i++) { set(6, i, i % 2 === 0); set(i, 6, i % 2 === 0); }
    finder(3, 3); finder(n - 4, 3); finder(3, n - 4);
    a = AUSRICHTUNG[v];
    for (i = 0; i < a.length; i++) for (j = 0; j < a.length; j++) {
      if ((i === 0 && j === 0) || (i === 0 && j === a.length - 1) || (i === a.length - 1 && j === 0)) continue;
      for (k = -2; k <= 2; k++) for (var l = -2; l <= 2; l++)
        set(a[i] + k, a[j] + l, Math.max(Math.abs(k), Math.abs(l)) !== 1);
    }
    formatSetzen(m, f, n, 0);
    if (v >= 7) {
      var vb = versionBits(v);
      for (i = 0; i < 18; i++) {
        var bit = ((vb >>> i) & 1) === 1, p = n - 11 + i % 3, q = Math.floor(i / 3);
        set(p, q, bit); set(q, p, bit);
      }
    }
    return { m: m, f: f };
  }

  function formatSetzen(m, f, n, maske) {
    var bits = formatBits(maske), i;
    function set(x, y, d) { m[y][x] = d; f[y][x] = true; }
    function b(k) { return ((bits >>> k) & 1) === 1; }
    for (i = 0; i <= 5; i++) set(8, i, b(i));
    set(8, 7, b(6)); set(8, 8, b(7)); set(7, 8, b(8));
    for (i = 9; i < 15; i++) set(14 - i, 8, b(i));
    for (i = 0; i < 8; i++) set(n - 1 - i, 8, b(i));
    for (i = 8; i < 15; i++) set(8, n - 15 + i, b(i));
    set(8, n - 8, true); // dunkles Einzelmodul
  }

  function datenSetzen(m, f, n, woerter) {
    var i = 0, total = woerter.length * 8, right, vert, j, x, y, up;
    for (right = n - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5;
      for (vert = 0; vert < n; vert++) for (j = 0; j < 2; j++) {
        x = right - j;
        up = ((right + 1) & 2) === 0;
        y = up ? n - 1 - vert : vert;
        if (!f[y][x] && i < total) {
          m[y][x] = ((woerter[i >>> 3] >>> (7 - (i & 7))) & 1) === 1;
          i++;
        }
      }
    }
  }

  function maskeAn(m, f, n, mk) {
    var x, y, t;
    for (y = 0; y < n; y++) for (x = 0; x < n; x++) {
      if (f[y][x]) continue;
      switch (mk) {
        case 0: t = (x + y) % 2 === 0; break;
        case 1: t = y % 2 === 0; break;
        case 2: t = x % 3 === 0; break;
        case 3: t = (x + y) % 3 === 0; break;
        case 4: t = (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0; break;
        case 5: t = (x * y) % 2 + (x * y) % 3 === 0; break;
        case 6: t = ((x * y) % 2 + (x * y) % 3) % 2 === 0; break;
        default: t = ((x + y) % 2 + (x * y) % 3) % 2 === 0;
      }
      if (t) m[y][x] = !m[y][x];
    }
  }

  function strafe(m, n) {
    var p = 0, x, y, i, dunkel = 0, zeile, lauf, pass, a, b, s, pat1 = '10111010000', pat2 = '00001011101';
    for (pass = 0; pass < 2; pass++) {
      for (a = 0; a < n; a++) {
        zeile = ''; lauf = 0;
        for (b = 0; b < n; b++) {
          s = pass === 0 ? m[a][b] : m[b][a];
          zeile += s ? '1' : '0';
          if (b > 0 && s === (pass === 0 ? m[a][b - 1] : m[b - 1][a])) {
            lauf++;
            if (lauf === 5) p += 3; else if (lauf > 5) p++;
          } else lauf = 1;
        }
        for (i = 0; i + 11 <= n; i++) {
          s = zeile.substr(i, 11);
          if (s === pat1 || s === pat2) p += 40;
        }
      }
    }
    for (y = 0; y < n; y++) for (x = 0; x < n; x++) {
      if (m[y][x]) dunkel++;
      if (x < n - 1 && y < n - 1 && m[y][x] === m[y][x + 1] && m[y][x] === m[y + 1][x] && m[y][x] === m[y + 1][x + 1]) p += 3;
    }
    p += 10 * (Math.ceil(Math.abs(dunkel * 20 - n * n * 10) / (n * n)) - 1);
    return p;
  }

  function matrix(text) {
    var bytes = utf8(String(text)), v, n, fp, cw, best = null, bestP = 1e9, mk, m, p, i, x, y;
    for (v = 1; v <= 15; v++) {
      // 4 Bit Modus + Laengenfeld + Daten muessen in die Datenwoerter passen
      if (4 + (v < 10 ? 8 : 16) + bytes.length * 8 <= datenWoerter(v) * 8) break;
    }
    if (v > 15) throw new Error('zu lang');
    n = 17 + 4 * v;
    cw = verschachteln(bitsAufbauen(bytes, v), v);
    fp = funktionsmuster(v);
    datenSetzen(fp.m, fp.f, n, cw);
    for (mk = 0; mk < 8; mk++) {
      m = [];
      for (y = 0; y < n; y++) m[y] = fp.m[y].slice();
      maskeAn(m, fp.f, n, mk);
      formatSetzen(m, fp.f, n, mk);
      p = strafe(m, n);
      if (p < bestP) { bestP = p; best = m; }
    }
    best.version = v;
    return best;
  }

  function svg(text, opts) {
    var m = matrix(text), n = m.length, q = 4, g = (opts && opts.groesse) || 240, d = '', x, y, len;
    for (y = 0; y < n; y++) {
      for (x = 0; x < n; x++) {
        if (!m[y][x]) continue;
        for (len = 1; x + len < n && m[y][x + len]; len++);
        d += 'M' + (x + q) + ' ' + (y + q) + 'h' + len + 'v1h-' + len + 'z';
        x += len - 1;
      }
    }
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + (n + 2 * q) + ' ' + (n + 2 * q) +
      '" width="' + g + '" height="' + g + '" shape-rendering="crispEdges">' +
      '<rect width="100%" height="100%" fill="#fff"/><path d="' + d + '" fill="#000"/></svg>';
  }

  window.KKQR = { svg: svg, _matrix: matrix };
})();
