async page => {
  const out = [];
  const ok = (n, c, e) => out.push((c ? 'PASS ' : 'FAIL ') + n + (e ? ' :: ' + e : ''));
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  const overflow = () => page.evaluate(() => {
    const W = document.documentElement.clientWidth;
    const bad = [...document.querySelectorAll('body *')].filter(e => {
      const r = e.getBoundingClientRect();
      return r.width > 0 && (r.right > W + 1 || r.left < -1) && !e.closest('.ghost,.pitch,.arc,.hub__pitch,.bar__nav');
    }).slice(0, 6).map(e => e.tagName + '.' + e.className);
    return { sw: document.documentElement.scrollWidth, W, bad };
  });
  // Texto cortado: elementos de texto cuyo contenido desborda su caja
  const clipped = () => page.evaluate(() => [...document.querySelectorAll('h1,h2,h3,h4,p,li,dd,dt,button,a,span')].filter(e => {
    const cs = getComputedStyle(e);
    return (cs.overflow === 'hidden' || cs.textOverflow === 'ellipsis') && (e.scrollWidth > e.clientWidth + 1) && !e.closest('.sr-only,.ghost');
  }).slice(0, 6).map(e => e.tagName + '.' + e.className + ' ' + e.textContent.trim().slice(0, 30)));

  await page.emulateMedia({ reducedMotion: 'no-preference' });
  for (const [w, h] of [[375, 812], [320, 640], [768, 1024]]) {
    await page.setViewportSize({ width: w, height: h });
    await page.goto('http://127.0.0.1:8765/?w=' + w, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    for (let y = 0; y < 22000; y += 500) { await page.evaluate(y => window.scrollTo({ top: y, behavior: 'instant' }), y); await page.waitForTimeout(80); }
    await page.waitForTimeout(500);
    const o = await overflow();
    ok(w + 'px: sin desborde horizontal', o.sw === o.W && o.bad.length === 0, JSON.stringify(o));
    const c = await clipped();
    ok(w + 'px: sin texto cortado', c.length === 0, JSON.stringify(c));
    // Tamaño táctil de controles
    const small = await page.evaluate(() => [...document.querySelectorAll('button, .bar__nav a, .tour__steps a, .btn')].filter(e => {
      const r = e.getBoundingClientRect(); return r.width > 0 && r.height < 40;
    }).map(e => e.tagName + '.' + e.className + ' ' + Math.round(e.getBoundingClientRect().height)).slice(0, 6));
    ok(w + 'px: controles táctiles ≥ 40px de alto', small.length === 0, JSON.stringify(small));
  }

  // Interacciones en 375
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('http://127.0.0.1:8765/?m=1', { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'capturas/movil-375-portada.png' });
  await page.click('.bar__nav a[data-nav="ruta"]');
  await page.waitForTimeout(1300);
  const navm = await page.evaluate(() => {
    const a = document.querySelector('.bar__nav a[aria-current="true"]');
    const nav = document.querySelector('.bar__nav').getBoundingClientRect(); const r = a && a.getBoundingClientRect();
    return { cur: a && a.dataset.nav, inView: r && r.left >= nav.left - 1 && r.right <= nav.right + 1, top: Math.round(document.getElementById('ruta').getBoundingClientRect().top) };
  });
  ok('375px: nav desplazable lleva a Ruta y deja visible el activo', navm.cur === 'ruta' && navm.inView && navm.top < 120, JSON.stringify(navm));
  await page.click('.gantt__stages button[data-stage="3"]');
  await page.waitForTimeout(700);
  await page.locator('#gantt').screenshot({ path: 'capturas/movil-375-gantt-etapa3.png' });
  await page.locator('.tl').scrollIntoViewIfNeeded();
  await page.click('#tl-t3');
  await page.waitForTimeout(400);
  ok('375px: línea de tiempo vertical funciona', await page.evaluate(() => !document.getElementById('tl-p3').hidden && document.getElementById('tl-p1').hidden));
  await page.locator('.tl').screenshot({ path: 'capturas/movil-375-linea-de-tiempo.png' });
  await page.locator('#layers').scrollIntoViewIfNeeded();
  await page.click('.layer__key[data-layer="estructural"]');
  await page.waitForTimeout(400);
  await page.locator('.viol').screenshot({ path: 'capturas/movil-375-capas.png' });
  await page.locator('#hub').scrollIntoViewIfNeeded(); await page.waitForTimeout(600);
  await page.locator('#hub').screenshot({ path: 'capturas/movil-375-propuesta.png' });
  await page.locator('.models').scrollIntoViewIfNeeded(); await page.click('#m-t3'); await page.waitForTimeout(400);
  await page.locator('.models').screenshot({ path: 'capturas/movil-375-modelos.png' });
  await page.locator('#horizonte').scrollIntoViewIfNeeded(); await page.waitForTimeout(700);
  await page.screenshot({ path: 'capturas/movil-375-horizonte.png' });

  // Movimiento reducido: todo visible sin desplazarse, sin animaciones
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('http://127.0.0.1:8765/?rm=1', { waitUntil: 'networkidle' });
  const rm = await page.evaluate(() => {
    const r = [...document.querySelectorAll('[data-reveal]')].filter(e => getComputedStyle(e).opacity !== '1').length;
    const bar = getComputedStyle(document.querySelector('.g-bar')).transform;
    const dash = getComputedStyle(document.querySelector('.link__arrows path')).strokeDashoffset;
    return { hiddenBlocks: r, bar, dash };
  });
  ok('reduced-motion: nada oculto ni a medio animar', rm.hiddenBlocks === 0 && rm.bar === 'none' && parseFloat(rm.dash || 0) === 0, JSON.stringify(rm));
  ok('sin errores de consola', errors.length === 0, JSON.stringify(errors));
  return out.join('\n');
}
