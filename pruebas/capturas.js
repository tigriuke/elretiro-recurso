async page => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://127.0.0.1:8765/?shot=d', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: 'capturas/escritorio-1440-completa.png', fullPage: true });
  await page.screenshot({ path: 'capturas/escritorio-1440-portada.png' });
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('http://127.0.0.1:8765/?shot=m', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const ids = ['contexto', 'interpretacion', 'propuesta', 'fundamentacion', 'ruta', 'horizonte'];
  for (const [i, id] of ids.entries()) {
    await page.evaluate(id => { const el = document.getElementById(id); window.scrollTo({ top: el.offsetTop - 52, behavior: 'instant' }); }, id);
    await page.waitForTimeout(150);
    await page.screenshot({ path: `capturas/movil-375-0${i + 1}-${id}.png` });
  }
  return 'ok';
}
