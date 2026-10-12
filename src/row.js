// 📝 بيحوّل كل وظيفة لصف في الشيت
//@include ai_lib
const reqs = $('✍️ جهّز الجواب').all();
return $input.all().map((res, i) => {
  const j = (reqs[i] || {}).json || {};
  const a = aiJSON(aiText(j.ai_provider, res.json)) || {};
  return { json: {
    found_at: $now.toFormat('yyyy-MM-dd HH:mm'),
    source: j.source, title: j.title, company: j.company, location: j.location,
    score: j.score, cv: j.cv, why_ar: j.why_ar, missing_ar: j.missing_ar, red_flags_ar: j.red_flags_ar,
    url: j.url, apply_email: j.apply_email || '',
    email_subject: a.email_subject || `Application for ${j.title}`,
    cover_letter: a.cover_letter || '', proposal_ar: a.proposal_ar || '',
    approve: '', status: 'جديد', applied_at: '',
  } };
});
