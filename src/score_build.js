// 🤖 بيجهّز طلب تقييم لكل وظيفة
//@include ai_lib
const c = $('⚙️ الإعدادات').first().json;
const r = aiRole(c, 'scorer');
const system = 'You screen job posts for ONE candidate and answer ONLY with a JSON object. Be strict and realistic, never optimistic.';
return $input.all().map((it) => {
  const j = it.json;
  const user = `CANDIDATE PROFILE:
${c.profile}

JOB POST (source: ${j.source}):
Title: ${j.title}
Company: ${j.company}
Location: ${j.location}
URL: ${j.url}
Description:
${(j.description || '(no description, judge from title/company/location)').slice(0, 3500)}

Return this JSON:
{"score": 0-100 (realistic chance this candidate gets an interview/acceptance),
 "cv": one of "qa" | "data_entry" | "wordpress" | "ai_trainer" (best CV version to send),
 "why_ar": "سبب مختصر بالعامية المصرية ليه مناسبة أو لأ (25 كلمة بالكتير)",
 "missing_ar": "أهم حاجة ناقصاه للوظيفة دي بالعامية المصرية (15 كلمة بالكتير) أو فاضي",
 "red_flags_ar": "علامات نصب أو شروط مستحيلة بالعامية المصرية أو فاضي",
 "apply_email": "the email address the post asks applicants to send CVs to, or empty string"}

Scoring rules:
- Restricted to residents of countries other than Egypt (e.g. US only, UK only, Saudi residents only), on-site, or hybrid: score 15 or less.
- Needs fluent/C1/native English or lots of English calls: score 30 or less.
- Needs clearly more experience than he has (he has ~1 year QA, ~2 years data entry): score 40 or less.
- Arabic-language AI work (AI training, rating, annotation, localization, Arabic review) at entry or junior level, open to Egypt: score high.
- Freelance projects (source مستقل): score by whether he can deliver this exact project with his stated skills.
- Scam signs (asks for any fee, contact only via Telegram/WhatsApp, unrealistic pay, vague company): score 10 or less and explain in red_flags_ar.`;
  return { json: { ...j, ...aiRequest(r, system, user, 700) } };
});
