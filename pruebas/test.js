async page => {
  const out = [];
  const ok = (name, cond, extra) => out.push((cond ? 'PASS ' : 'FAIL ') + name + (extra ? ' :: ' + extra : ''));
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('http://127.0.0.1:8765/', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  // Fuentes
  const fonts = await page.evaluate(() => ({
    serif: document.fonts.check('400 20px Fraunces'),
    sans: document.fonts.check('400 20px "Inter Tight"')
  }));
  ok('fuentes autoalojadas cargadas', fonts.serif && fonts.sans, JSON.stringify(fonts));

  // Portada: botón dentro del primer pantallazo
  const btn = await page.locator('.hero .btn').boundingBox();
  ok('botón de la portada visible en 1440x900', btn && btn.y + btn.height <= 900, 'bottom=' + (btn && Math.round(btn.y + btn.height)));
  await page.screenshot({ path: 'capturas/escritorio-1440-portada.png' });

  // Navegación fija
  await page.click('.bar__nav a[data-nav="propuesta"]');
  await page.waitForTimeout(1200);
  const navState = await page.evaluate(() => ({
    top: Math.round(document.getElementById('propuesta').getBoundingClientRect().top),
    current: document.querySelector('.bar__nav a[aria-current="true"]')?.dataset.nav,
    progress: document.getElementById('progress').style.transform
  }));
  ok('nav lleva a Propuesta y la marca activa', navState.current === 'propuesta' && navState.top < 120 && navState.top >= 0, JSON.stringify(navState));
  ok('barra de progreso avanza', /scaleX\(0\.[1-9]/.test(navState.progress), navState.progress);

  // Línea de tiempo
  await page.locator('#contexto').scrollIntoViewIfNeeded();
  for (let i = 1; i <= 5; i++) {
    await page.click('#tl-t' + i);
    await page.waitForTimeout(80);
    const vis = await page.evaluate(i => [1,2,3,4,5].filter(j => !document.getElementById('tl-p' + j).hidden), i);
    ok('línea de tiempo: acta ' + i + ' muestra solo su panel', vis.length === 1 && vis[0] === i, JSON.stringify(vis));
  }
  await page.focus('#tl-t5');
  await page.keyboard.press('ArrowRight');
  const afterKey = await page.evaluate(() => document.activeElement.id);
  ok('línea de tiempo: flecha derecha vuelve al Acta 154', afterKey === 'tl-t1', afterKey);
  await page.locator('.tl').screenshot({ path: 'capturas/escritorio-linea-de-tiempo.png' });

  // Capas de violencia
  await page.locator('#layers').scrollIntoViewIfNeeded();
  await page.waitForTimeout(900);
  const drawn = await page.evaluate(() => {
    const p = document.querySelector('.link__arrows path');
    return { cls: document.getElementById('layers').classList.contains('is-drawn'), dash: getComputedStyle(p).strokeDashoffset };
  });
  ok('flechas del diagrama trazadas al entrar', drawn.cls && parseFloat(drawn.dash) === 0, JSON.stringify(drawn));
  for (const l of ['directa', 'cultural', 'estructural']) {
    await page.click(`.layer__key[data-layer="${l}"]`);
    const s = await page.evaluate(l => ({
      layer: document.getElementById('layers').dataset.layer,
      note: [...document.querySelectorAll('.note__item')].filter(n => getComputedStyle(n).display !== 'none').map(n => n.dataset.note),
      pressed: document.querySelector(`.layer__key[data-layer="${l}"]`).getAttribute('aria-pressed')
    }), l);
    ok('capa ' + l + ' seleccionable con nota', s.layer === l && s.note.length === 1 && s.note[0] === l && s.pressed === 'true', JSON.stringify(s));
    if (l === 'cultural') await page.locator('.viol').screenshot({ path: 'capturas/escritorio-capas-cultural.png' });
  }
  await page.click('.layer__key[data-layer="estructural"]');
  const cleared = await page.evaluate(() => document.getElementById('layers').dataset.layer);
  ok('segundo clic quita la selección', cleared === '', JSON.stringify(cleared));

  // Modelos
  await page.locator('.models').scrollIntoViewIfNeeded();
  for (let i = 1; i <= 3; i++) {
    await page.click('#m-t' + i);
    await page.waitForTimeout(60);
    const vis = await page.evaluate(() => [1,2,3].filter(j => !document.getElementById('m-p' + j).hidden));
    ok('modelos: pestaña ' + i + ' muestra su panel', vis.length === 1 && vis[0] === i, JSON.stringify(vis));
  }
  await page.focus('#m-t3');
  await page.keyboard.press('Home');
  ok('modelos: tecla Inicio va a Adversarial', await page.evaluate(() => document.activeElement.id === 'm-t1' && !document.getElementById('m-p1').hidden));
  await page.click('#m-t2');
  await page.waitForTimeout(350);
  await page.locator('.models').screenshot({ path: 'capturas/escritorio-modelos-relacional.png' });

  // Gantt
  await page.locator('#gantt').scrollIntoViewIfNeeded();
  await page.waitForTimeout(1100);
  const bars = await page.evaluate(() => [...document.querySelectorAll('.g-bar')].map(b => getComputedStyle(b).transform));
  ok('barras del Gantt llenas', bars.every(t => t === 'none' || t === 'matrix(1, 0, 0, 1, 0, 0)'), JSON.stringify(bars));
  for (let s = 1; s <= 4; s++) {
    await page.click(`.gantt__stages button[data-stage="${s}"]`);
    const st = await page.evaluate(s => ({
      stage: document.getElementById('gantt').dataset.stage,
      shown: [...document.querySelectorAll('.stage-detail p')].filter(p => getComputedStyle(p).display !== 'none').map(p => p.dataset.for)
    }), s);
    ok('Gantt: etapa ' + s + ' resalta y explica', st.stage === String(s) && st.shown.length === 1 && st.shown[0] === String(s), JSON.stringify(st));
  }
  await page.click('.gantt__stages button[data-stage="2"]');
  await page.locator('#gantt').screenshot({ path: 'capturas/escritorio-gantt-etapa2.png' });

  // Revelado: todos visibles tras recorrer
  for (let y = 0; y < 16000; y += 500) { await page.evaluate(y => window.scrollTo({ top: y, behavior: 'instant' }), y); await page.waitForTimeout(120); }
  await page.waitForTimeout(700);
  const hiddenReveal = await page.evaluate(() => [...document.querySelectorAll('[data-reveal]')].filter(e => !e.classList.contains('is-in')).length);
  ok('todos los bloques se revelan al recorrer', hiddenReveal === 0, 'sin revelar=' + hiddenReveal);

  // Cero azules en colores calculados (texto, fondo, bordes, contorno, rellenos SVG)
  const blues = await page.evaluate(() => {
    const parse = c => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const [r,g,b,a] = m[1].split(/[ ,\/]+/).map(Number); return { r, g, b, a: a === undefined ? 1 : a }; };
    const isBlue = c => { const p = parse(c); return p && p.a > 0.05 && p.b > p.r + 25 && p.b > p.g + 10; };
    const props = ['color','backgroundColor','borderTopColor','borderBottomColor','borderLeftColor','borderRightColor','outlineColor','fill','stroke','textDecorationColor','caretColor'];
    const hits = [];
    document.querySelectorAll('*').forEach(el => {
      for (const pseudo of [null, '::before', '::after']) {
        const cs = getComputedStyle(el, pseudo);
        props.forEach(p => { if (isBlue(cs[p])) hits.push((el.className || el.tagName) + (pseudo || '') + ' ' + p + '=' + cs[p]); });
      }
    });
    return hits.slice(0, 10);
  });
  ok('cero azules en la interfaz', blues.length === 0, JSON.stringify(blues));

  // Foco visible con teclado
  await page.goto('http://127.0.0.1:8765/?fresh=1', { waitUntil: 'networkidle' });
  await page.keyboard.press('Tab');
  const skip = await page.evaluate(() => ({ cls: document.activeElement.className, outline: getComputedStyle(document.activeElement).transform }));
  ok('Tab lleva primero al enlace «Saltar al contenido»', skip.cls === 'skip', JSON.stringify(skip));
  await page.keyboard.press('Tab');
  const ring = await page.evaluate(() => { const cs = getComputedStyle(document.activeElement); return cs.outlineStyle + ' ' + cs.outlineColor; });
  ok('anillo de foco visible y cálido', /solid/.test(ring) && !/0, 0, 255/.test(ring), ring);

  ok('sin errores de consola', errors.length === 0, JSON.stringify(errors));
  return out.join('\n');
}
