// ✍️ بيجهّز طلب كتابة الـ Cover Letter (أو عرض مستقل بالعربي)
//@include ai_lib
const c = $('⚙️ الإعدادات').first().json;
const r = aiRole(c, 'writer');
const system = 'You write short, honest job application texts for one candidate. Use ONLY facts from his profile. Never invent tools, numbers, companies or years. Answer ONLY with a JSON object.';
return $input.all().map((it) => {
  const j = it.json;
  const freelance = j.source === 'مستقل';
  const user = `CANDIDATE PROFILE:
${c.profile}
Contact: ${c.myEmail} | ${c.myPhone}

JOB (${j.source}): ${j.title} — ${j.company} — ${j.location}
${(j.description || '').slice(0, 3000)}

Best CV version: ${j.cv}

Return this JSON:
{"email_subject": "short email subject in English, e.g. Application for <title> – ${c.myName}",
 "cover_letter": ${freelance ? '""' : '"English cover letter, simple B1-level English the candidate can defend in an interview, 90-150 words, greeting + 2 short paragraphs linking HIS real experience to THIS job + availability + sign-off with his name, email and phone"'},
 "proposal_ar": ${freelance ? '"عرض بالعربي الفصيح البسيط لصاحب المشروع على مستقل، 70-120 كلمة: إنه فهم المطلوب، وخبرته الحقيقية المرتبطة، وخطوات التنفيذ باختصار، وسؤال واحد يوضّح بيه المطلوب. من غير سعر ومن غير مبالغة"' : '""'}}`;
  return { json: { ...j, ...aiRequest(r, system, user, 900) } };
});
