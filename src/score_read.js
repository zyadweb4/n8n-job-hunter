// 📊 بيقرا رد التقييم ويسيب الوظايف الكويسة بس
//@include ai_lib
const c = $('⚙️ الإعدادات').first().json;
const reqs = $('🤖 جهّز التقييم').all();
const out = [];
$input.all().forEach((res, i) => {
  const j = { ...(reqs[i] || {}).json };
  const provider = j.ai_provider;
  delete j.ai_url; delete j.ai_headers; delete j.ai_body; delete j.ai_provider;
  const a = aiJSON(aiText(provider, res.json));
  if (!a) {
    // التقييم فشل (مثلاً الحد المجاني خلص): نسيبها بس من غير سكور عشان ما تضيعش
    if (j.rel >= 6) out.push({ json: { ...j, score: '', cv: 'ai_trainer', why_ar: 'ما اتقيّمتش (الذكاء الاصطناعي ما ردّش)', missing_ar: '', red_flags_ar: '' } });
    return;
  }
  const score = Math.max(0, Math.min(100, Math.round(Number(a.score) || 0)));
  if (score < c.minScoreToKeep) return;
  const cv = ['qa', 'data_entry', 'wordpress', 'ai_trainer'].includes(a.cv) ? a.cv : 'ai_trainer';
  const email = /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(a.apply_email || '') ? a.apply_email : j.apply_email;
  out.push({ json: { ...j, score, cv, why_ar: a.why_ar || '', missing_ar: a.missing_ar || '', red_flags_ar: a.red_flags_ar || '', apply_email: email || '' } });
});
return out;
