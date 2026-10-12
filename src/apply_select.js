// ✅ بيختار الوظايف اللي هتتقدّم بالإيميل: إنت كاتب «نعم» في approve
//    (أو السكور أعلى من autoApplyMinScore لو مشغّل التقديم الأوتوماتيك)
const c = $('⚙️ الإعدادات').first().json;
const yes = (v) => /^(نعم|ايوه|أيوه|اه|آه|yes|y|ok|✔|✅)$/i.test(String(v || '').trim());
const out = [];
for (const it of $input.all()) {
  const r = it.json;
  if (!r.url || !r.apply_email) continue;
  if (['اتبعت', 'sent', 'مرفوض', 'لأ', 'لا'].includes(String(r.status || '').trim())) continue;
  const auto = c.autoApplyMinScore > 0 && Number(r.score) >= c.autoApplyMinScore && !r.red_flags_ar;
  if (!yes(r.approve) && !auto) continue;
  const cvId = c.cvDriveIds[r.cv] || c.cvDriveIds.ai_trainer;
  if (!cvId || /PASTE/.test(cvId)) continue;
  const body = (r.cover_letter && r.cover_letter.trim())
    || `Dear Hiring Team,\n\nI would like to apply for the ${r.title} role. Please find my CV attached.\n\nBest regards,\n${c.myName}\n${c.myEmail} | ${c.myPhone}`;
  out.push({ json: { url: r.url, to: r.apply_email.trim(), subject: r.email_subject || `Application for ${r.title} – ${c.myName}`,
    body, cvFileId: cvId, title: r.title } });
  if (out.length >= c.maxEmailsPerRun) break;
}
return out;
