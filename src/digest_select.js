// 📋 بيختار وظايف الملخص: الجديد في آخر 24 ساعة، ولو أقل من 10 بيكمّل من الأقدم اللي لسه «جديد»
const c = $('⚙️ الإعدادات').first().json;
const rows = $input.all().map((i) => i.json).filter((r) => r.title && r.url);
const since = $now.minus({ hours: 24 });
const num = (s) => (s === '' || s === undefined ? -1 : Number(s));
const parseAt = (v) => {
  if (typeof v === 'number') return DateTime.fromMillis(Math.round((v - 25569) * 864e5), { zone: 'utc' }).setZone($now.zoneName, { keepLocalTime: true });
  const s = String(v || '').trim();
  for (const f of ['yyyy-MM-dd HH:mm', 'yyyy-MM-dd HH:mm:ss', 'd/M/yyyy HH:mm:ss', 'M/d/yyyy HH:mm:ss']) {
    const d = DateTime.fromFormat(s, f, { zone: $now.zoneName }); if (d.isValid) return d;
  }
  return DateTime.fromISO(s, { zone: $now.zoneName });
};
const ts = (r) => { const d = parseAt(r.found_at); return d.isValid ? d : null; };
const fresh = rows.filter((r) => { const d = ts(r); return d && d >= since; });
fresh.sort((a, b) => num(b.score) - num(a.score));
let picked = [...fresh];
if (picked.length < c.dailyMinJobs) {
  const older = rows.filter((r) => !fresh.includes(r) && String(r.status || '').trim() === 'جديد')
    .sort((a, b) => num(b.score) - num(a.score));
  picked = picked.concat(older.slice(0, c.dailyMinJobs - picked.length));
}
const items = picked.map((r) => ({ json: {
  'السكور': r.score === '' ? '—' : Number(r.score), 'الوظيفة': r.title, 'الشركة': r.company, 'المصدر': r.source,
  'المكان': r.location, 'السي في': r.cv, 'ليه مناسبة': r.why_ar, 'ناقصك إيه': r.missing_ar, 'تحذيرات': r.red_flags_ar,
  'اللينك': r.url, 'إيميل التقديم': r.apply_email, 'الحالة': r.status,
  'جديدة؟': fresh.includes(r) ? 'جديدة' : 'من قبل كده',
} }));
return items.length ? items : [{ json: { 'الوظيفة': 'مفيش وظايف جديدة النهارده' } }];
