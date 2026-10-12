// 🧹 بيفك الصفحات اللي اتجابت، ويوحّد شكل الوظايف، ويشيل اللي مش مناسب
const c = $('⚙️ الإعدادات').first().json;
const reqs = $('🔗 المصادر').all();
const responses = $input.all();

const ent = (s) => String(s || '')
  .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
  .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
  .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d))
  .replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const strip = (s) => ent(String(s || '').replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, (_, x) => ent(x)).replace(/<br\s*\/?>/gi, '\n').replace(/<\/(p|li|div|h\d)>/gi, '\n')
  .replace(/<[^>]+>/g, ' ')).replace(/[ \t]+/g, ' ').replace(/\n\s*\n+/g, '\n').trim();
const pick = (s, re) => { const m = String(s || '').match(re); return m ? m[1] : ''; };
const parseJSON = (t) => { try { return typeof t === 'string' ? JSON.parse(t) : t; } catch (e) { return null; } };

const jobs = [];
const errors = [];
const push = (j) => jobs.push({
  source: j.source, title: strip(j.title).slice(0, 200), company: strip(j.company).slice(0, 120),
  location: strip(j.location).slice(0, 120), url: String(j.url || '').trim(),
  posted: j.posted ? String(j.posted) : '', description: strip(j.description).slice(0, 4000),
});

function parseLinkedIn(html, source) {
  for (const block of String(html).split(/<li[\s>]/).slice(1)) {
    const id = pick(block, /urn:li:jobPosting:(\d+)/);
    if (!id) continue;
    push({ source, url: `https://www.linkedin.com/jobs/view/${id}/`,
      title: pick(block, /base-search-card__title[^>]*>([\s\S]*?)<\/h3>/),
      company: pick(block, /base-search-card__subtitle[^>]*>([\s\S]*?)<\/h4>/),
      location: pick(block, /job-search-card__location[^>]*>([\s\S]*?)<\/span>/),
      posted: pick(block, /<time[^>]*datetime="([^"]+)"/), description: '' });
  }
}
function parseMostaqlRss(xml, source) {
  for (const it of String(xml).split(/<item>/).slice(1)) {
    push({ source, title: pick(it, /<title>([\s\S]*?)<\/title>/), url: ent(pick(it, /<link>([\s\S]*?)<\/link>/)),
      description: pick(it, /<description>([\s\S]*?)<\/description>/), posted: pick(it, /<pubDate>([\s\S]*?)<\/pubDate>/),
      company: 'مشروع فري لانس', location: 'عن بعد' });
  }
}
function parseMostaqlHtml(html, source) {
  for (const row of String(html).split(/class="project-row/).slice(1)) {
    const m = row.match(/<a href="(https:\/\/mostaql\.com\/project\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/);
    if (!m) continue;
    push({ source, url: m[1], title: m[2], posted: pick(row, /datetime="([^"]+)"/),
      description: pick(row, /class="[^"]*project__brief[^"]*"[^>]*>([\s\S]*?)<\/(?:p|div)>/),
      company: 'مشروع فري لانس', location: 'عن بعد' });
  }
}
function parseBayt(html, source) {
  for (const b of String(html).split(/data-js-job/).slice(1)) {
    const m = b.match(/<h2[^>]*>\s*<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/);
    if (!m) continue;
    const wrap = pick(b, /job-company-location-wrapper[^>]*>([\s\S]*?)<\/div>\s*<\/div>/) || b;
    const links = [...wrap.matchAll(/<a[^>]*>([\s\S]*?)<\/a>/g)].map((x) => strip(x[1])).filter(Boolean);
    push({ source, url: m[1].startsWith('http') ? m[1] : 'https://www.bayt.com' + m[1], title: m[2],
      company: links[0] || '', location: links.slice(1).join(', ') || 'Remote',
      description: pick(b, /class="jb-descr[^"]*"[^>]*>([\s\S]*?)<\/div>/) });
  }
}
const okLoc = (l) => !l || /worldwide|anywhere|emea|egypt|mena|middle east|africa|global|arab|saudi|uae|gulf/i.test(l);
function parseRemotive(t, source) {
  for (const j of (parseJSON(t) || {}).jobs || []) {
    if (!okLoc(j.candidate_required_location)) continue;
    push({ source, url: j.url, title: j.title, company: j.company_name, location: j.candidate_required_location,
      posted: j.publication_date, description: j.description });
  }
}
function parseHimalayas(t, source) {
  for (const j of (parseJSON(t) || {}).jobs || []) {
    const loc = (j.locationRestrictions || []).map((x) => (typeof x === 'string' ? x : x.name || x.alpha2 || '')).join(', ');
    if (!okLoc(loc)) continue;
    push({ source, url: (String(j.guid || '').startsWith('http') ? j.guid : j.applicationLink), title: j.title,
      company: j.companyName, location: loc || 'Worldwide',
      posted: j.pubDate ? new Date(+j.pubDate * (j.pubDate < 1e12 ? 1000 : 1)).toISOString() : '',
      description: j.description || j.excerpt });
  }
}
function parseJobicy(t, source) {
  for (const j of (parseJSON(t) || {}).jobs || []) {
    const loc = Array.isArray(j.jobGeo) ? j.jobGeo.join(', ') : j.jobGeo;
    if (!okLoc(loc)) continue;
    push({ source, url: j.url, title: j.jobTitle, company: j.companyName, location: loc,
      posted: j.pubDate, description: j.jobDescription || j.jobExcerpt });
  }
}
const P = { linkedin: parseLinkedIn, mostaql_rss: parseMostaqlRss, mostaql_html: parseMostaqlHtml, bayt: parseBayt,
  remotive: parseRemotive, himalayas: parseHimalayas, jobicy: parseJobicy };

responses.forEach((r, i) => {
  const req = (reqs[i] || {}).json || {};
  const body = r.json.data !== undefined ? r.json.data : r.json;
  if (r.json.error || body === undefined) { errors.push(req.source + ': ' + JSON.stringify(r.json.error || 'empty').slice(0, 120)); return; }
  try { P[req.kind](body, req.source); } catch (e) { errors.push(req.source + ': ' + e.message); }
});

// فلترة + شيل المكرر جوه نفس المرة
const inc = new RegExp(c.includeRegex, 'i');
const exc = new RegExp(c.excludeRegex, 'i');
const seen = new Set();
const out = [];
for (const j of jobs) {
  if (!j.title || !/^https?:\/\//.test(j.url)) continue;
  j.url = j.url.replace(/[?#].*$/, '');
  const key = j.url.toLowerCase();
  const key2 = (j.title + '|' + j.company).toLowerCase();
  if (seen.has(key) || seen.has(key2)) continue;
  seen.add(key); seen.add(key2);
  if (exc.test(j.title)) continue;
  const hay = j.title + ' ' + j.description.slice(0, 1500);
  // لازم كلمة من includeRegex تكون في العنوان أو الوصف
  // (LinkedIn مستثناة لأن وصفها بيتجاب بعدين، والبحث نفسه بالكلمة)
  if (j.source !== 'LinkedIn' && !inc.test(hay)) continue;
  const emails = (j.description.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g) || [])
    .filter((e) => !/example|noreply|no-reply|sentry|wixpress/i.test(e));
  const rel = (j.title.match(new RegExp(c.includeRegex, 'gi')) || []).length * 3
    + (hay.match(new RegExp(c.includeRegex, 'gi')) || []).length
    + (/arab|عرب|egypt|مصر/i.test(hay) ? 4 : 0);
  out.push({ ...j, apply_email: emails[0] || '', rel, job_key: key });
}

// لو مفيش ولا وظيفة، الفرع بيقف هنا (والأخطاء بتبان في الـ Executions)
if (errors.length) console.log('مصادر فشلت:', errors.slice(0, 15));
return out.map((j) => ({ json: j }));
