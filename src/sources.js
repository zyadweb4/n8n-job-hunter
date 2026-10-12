// 🔗 بيجهّز لينكات كل المصادر (كل لينك = طلب واحد)
const c = $('⚙️ الإعدادات').first().json;
const out = [];
const add = (source, kind, url) => out.push({ json: { source, kind, url } });
const enc = encodeURIComponent;

// LinkedIn (صفحات الزوار العامة، من غير تسجيل دخول) — ريموت، آخر 24 ساعة
for (const loc of c.linkedinLocations) {
  for (const kw of c.linkedinKeywords) {
    add('LinkedIn', 'linkedin',
      `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=${enc(kw)}&location=${enc(loc)}&f_WT=2&f_TPR=r86400&start=0`);
  }
}

// مستقل: آخر المشاريع + بحث بكلمات
add('مستقل', 'mostaql_rss', 'https://mostaql.com/rss');
for (const kw of c.mostaqlKeywords) {
  add('مستقل', 'mostaql_html', `https://mostaql.com/projects?keyword=${enc(kw)}&sort=latest`);
}

// Bayt (مصر والسعودية والإمارات — ريموت)
for (const u of c.baytPages) add('Bayt', 'bayt', u);

// مواقع الريموت العالمية (APIs مجانية). Remotive بيطلب 4 مرات في اليوم بالكتير
const hour = $now.hour;
for (const q of c.remoteApiSearches) {
  add('Himalayas', 'himalayas', `https://himalayas.app/jobs/api/search?q=${enc(q)}&worldwide=true&sort=recent`);
}
if (hour % 6 < 3) add('Remotive', 'remotive', 'https://remotive.com/api/remote-jobs?limit=150');
add('Jobicy', 'jobicy', 'https://jobicy.com/api/v2/remote-jobs?count=100&geo=emea');

return out;
