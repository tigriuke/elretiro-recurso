async page => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('http://127.0.0.1:8765/?a11y=1', { waitUntil: 'networkidle' });
  // Mostrar todos los paneles para medirlos
  await page.evaluate(() => document.querySelectorAll('[hidden]').forEach(e => e.hidden = false));
  const res = await page.evaluate(() => {
    const lin = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
    const L = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
    const parse = s => { const m = s.match(/rgba?\(([^)]+)\)/); const p = m[1].split(/[ ,\/]+/).map(Number); return { c: p.slice(0, 3), a: p[3] === undefined ? 1 : p[3] }; };
    const bgOf = el => {
      let stack = []; let e = el;
      while (e) { const b = parse(getComputedStyle(e).backgroundColor); if (b.a > 0) { stack.push(b); if (b.a >= 1) break; } e = e.parentElement; }
      let base = [255, 255, 255];
      for (let i = stack.length - 1; i >= 0; i--) { const { c, a } = stack[i]; base = base.map((v, k) => v * (1 - a) + c[k] * a); }
      return base;
    };
    const fails = []; let checked = 0;
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const seen = new Set();
    while (walker.nextNode()) {
      const t = walker.currentNode; if (!t.textContent.trim()) continue;
      const el = t.parentElement; if (seen.has(el)) continue; seen.add(el);
      if (el.closest('.ghost,[aria-hidden="true"],.sr-only,.skip')) continue;
      const cs = getComputedStyle(el); if (cs.visibility === 'hidden' || cs.display === 'none') continue;
      const fg = parse(cs.color); const bg = bgOf(el);
      const f = fg.c.map((v, k) => v * fg.a + bg[k] * (1 - fg.a));
      const l1 = L(f), l2 = L(bg); const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
      const size = parseFloat(cs.fontSize), bold = parseInt(cs.fontWeight) >= 700;
      const large = size >= 24 || (bold && size >= 18.66);
      const need = large ? 3 : 4.5; checked++;
      if (ratio < need) fails.push(el.tagName + '.' + el.className + ' "' + t.textContent.trim().slice(0, 30) + '" ' + ratio.toFixed(2) + '<' + need);
    }
    const res = performance.getEntriesByType('resource').reduce((s, r) => s + (r.transferSize || r.encodedBodySize || 0), 0);
    return { checked, fails: fails.slice(0, 12), totalFails: fails.length, kb: Math.round(res / 1024) };
  });
  // CLS durante la carga
  const cls = await page.evaluate(() => new Promise(r => { let v = 0; new PerformanceObserver(l => l.getEntries().forEach(e => { if (!e.hadRecentInput) v += e.value; })).observe({ type: 'layout-shift', buffered: true }); setTimeout(() => r(v), 500); }));
  const nav = await page.evaluate(() => { const n = performance.getEntriesByType('navigation')[0]; const p = performance.getEntriesByType('paint').find(x => x.name === 'first-contentful-paint'); return { dcl: Math.round(n.domContentLoadedEventEnd), fcp: p && Math.round(p.startTime) }; });
  return JSON.stringify({ ...res, cls: +cls.toFixed(3), ...nav });
}
