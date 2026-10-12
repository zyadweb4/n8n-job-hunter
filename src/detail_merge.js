// 🧩 بيحط الوصف الكامل لوظايف LinkedIn (لو اتجاب)
const reqs = $('✂️ أحسن الوظايف').all();
const strip = (s) => String(s || '').replace(/<br\s*\/?>/gi, '\n').replace(/<\/(p|li|div|h\d)>/gi, '\n').replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/[ \t]+/g, ' ').replace(/\n\s*\n+/g, '\n').trim();
return $input.all().map((res, i) => {
  const j = { ...(reqs[i] || {}).json };
  const html = typeof res.json.data === 'string' ? res.json.data : '';
  if (j.detail_url && html) {
    const m = html.match(/show-more-less-html__markup[^>]*>([\s\S]*?)<\/div>/);
    if (m) j.description = strip(m[1]).slice(0, 4000);
    const crit = [...html.matchAll(/description__job-criteria-text[^>]*>([\s\S]*?)<\/span>/g)].map((x) => strip(x[1])).join(' / ');
    if (crit) j.description = (j.description + '\nCriteria: ' + crit).trim();
    const em = (j.description.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/) || [])[0];
    if (em && !j.apply_email) j.apply_email = em;
  }
  delete j.detail_url;
  return { json: j };
});
