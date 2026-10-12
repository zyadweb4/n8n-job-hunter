// 📧 بيكتب إيميل الملخص (HTML) ويرفق معاه ملف الإكسل
const c = $('⚙️ الإعدادات').first().json;
const rows = $('📋 اختار وظايف الملخص').all().map((i) => i.json);
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const all = $('📄 اقرا الشيت (ملخص)').all().map((i) => i.json).filter((r) => r.title && r.url);
const since = $now.minus({ hours: 24 });
const parseAt = (v) => {
  if (typeof v === 'number') return DateTime.fromMillis(Math.round((v - 25569) * 864e5), { zone: 'utc' }).setZone($now.zoneName, { keepLocalTime: true });
  const s = String(v || '').trim();
  for (const f of ['yyyy-MM-dd HH:mm', 'yyyy-MM-dd HH:mm:ss', 'd/M/yyyy HH:mm:ss', 'M/d/yyyy HH:mm:ss']) {
    const d = DateTime.fromFormat(s, f, { zone: $now.zoneName }); if (d.isValid) return d;
  }
  return DateTime.fromISO(s, { zone: $now.zoneName });
};
const at = parseAt;
const first = {
  _fresh: all.filter((r) => at(r.found_at).isValid && at(r.found_at) >= since).length,
  _sent24: all.filter((r) => String(r.status || '').trim() === 'اتبعت' && at(r.applied_at).isValid && at(r.applied_at) >= since).length,
  _total: all.length,
};
const real = rows.filter((r) => r['اللينك']);
const color = (s) => (s === '—' ? '#888' : s >= 70 ? '#0a7a3d' : s >= 55 ? '#b26a00' : '#666');
const bySource = {};
real.forEach((r) => { bySource[r['المصدر']] = (bySource[r['المصدر']] || 0) + 1; });

const trs = real.map((r, i) => `<tr style="background:${i % 2 ? '#f7f8fa' : '#fff'}">
<td style="padding:8px;font-weight:bold;color:${color(r['السكور'])};font-size:16px">${esc(r['السكور'])}</td>
<td style="padding:8px"><a href="${esc(r['اللينك'])}" style="color:#1a4fd6;font-weight:bold;text-decoration:none">${esc(r['الوظيفة'])}</a><br>
<span style="color:#555">${esc(r['الشركة'])} · ${esc(r['المصدر'])} · ${esc(r['المكان'])}</span>${r['جديدة؟'] === 'جديدة' ? '' : ' <span style="color:#999">(من قبل كده)</span>'}</td>
<td style="padding:8px">${esc(r['ليه مناسبة'])}${r['ناقصك إيه'] ? `<br><span style="color:#8a5a00">ناقصك: ${esc(r['ناقصك إيه'])}</span>` : ''}${r['تحذيرات'] ? `<br><span style="color:#b00020">⚠️ ${esc(r['تحذيرات'])}</span>` : ''}</td>
<td style="padding:8px">${esc(r['السي في'])}${r['إيميل التقديم'] ? '<br>📧 تقديم بالإيميل' : ''}</td></tr>`).join('');

const html = `<div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;font-size:14px;color:#222;max-width:900px">
<h2 style="margin:0 0 6px">أهلاً يا زياد 👋</h2>
<p style="margin:0 0 12px">النهارده لقيت <b>${first._fresh || 0}</b> وظيفة جديدة مناسبة، واتبعت <b>${first._sent24 || 0}</b> طلب بالإيميل في آخر 24 ساعة. في الشيت كله ${first._total || 0} وظيفة.</p>
${Object.keys(bySource).length ? `<p style="margin:0 0 12px;color:#555">المصادر: ${Object.entries(bySource).map(([k, v]) => esc(k) + ' ' + v).join(' · ')}</p>` : ''}
${real.length ? `<table cellspacing="0" style="border-collapse:collapse;width:100%;border:1px solid #e3e5ea">
<tr style="background:#1f2a44;color:#fff"><th style="padding:8px">السكور</th><th style="padding:8px;text-align:right">الوظيفة</th><th style="padding:8px;text-align:right">ليه</th><th style="padding:8px">السي في</th></tr>${trs}</table>` : '<p>مفيش وظايف جديدة النهارده، هدوّر تاني بكره.</p>'}
<h3 style="margin:18px 0 6px">تعمل إيه دلوقتي؟</h3>
<ol style="margin:0;padding-right:18px;line-height:1.8">
<li>افتح <a href="${esc(c.sheetUrl)}">الشيت</a>.</li>
<li>الوظايف اللي فيها <b>📧 تقديم بالإيميل</b>: اكتب <b>نعم</b> في عمود <b>approve</b> وأنا هبعت الإيميل بالسي في المناسب خلال ساعة.</li>
<li>الباقي: افتح اللينك وقدّم بنفسك، وانسخ الـ Cover Letter (أو العرض العربي لمستقل) من الشيت. بعد ما تقدّم غيّر <b>status</b> لـ <b>اتبعت</b>.</li>
</ol>
<p style="color:#888;font-size:12px;margin-top:16px">الملف المرفق فيه نفس الوظايف. اتبعت أوتوماتيك من Zyad Job Hunter.</p></div>`;

return [{ json: { subject: `🔎 ${first._fresh || 0} وظيفة جديدة — ${$now.toFormat('dd/MM')}`, html }, binary: $input.first().binary }];
