async page => {
  await page.reload({ waitUntil: 'networkidle' });
  return await page.evaluate(() => {
    const q = s => document.querySelector(s);
    const hs = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map(h => h.tagName + ' ' + h.textContent.trim().replace(/\s+/g,' ').slice(0,60));
    let prev = 0, skips = [];
    document.querySelectorAll('h1,h2,h3,h4,h5,h6').forEach(h => { const l = +h.tagName[1]; if (l > prev + 1) skips.push(h.tagName + ' ' + h.textContent.trim().slice(0,40)); prev = l; });
    const links = [...document.querySelectorAll('a[href^="#"]')].map(a => a.getAttribute('href')).filter(h => h.length > 1 && !document.getElementById(h.slice(1)));
    return {
      lang: document.documentElement.lang,
      title: document.title, titleLen: document.title.length,
      desc: q('meta[name=description]').content.length,
      og: [...document.querySelectorAll('meta[property^="og:"]')].map(m => m.getAttribute('property')),
      h1: document.querySelectorAll('h1').length, skips, brokenAnchors: links,
      svgsNoAria: [...document.querySelectorAll('svg')].filter(s => !s.getAttribute('aria-hidden') && !s.getAttribute('role')).length,
      ids: (() => { const c = {}; document.querySelectorAll('[id]').forEach(e => c[e.id] = (c[e.id]||0)+1); return Object.keys(c).filter(k => c[k] > 1); })(),
      hs
    };
  });
}
