// ✂️ بياخد أحسن الوظايف الجديدة (بعد شيل اللي اتشاف قبل كده) عشان ما نصرفش على الـ AI
//    وبيجهّز لينك تفاصيل وظايف LinkedIn (عشان الوصف الكامل)
const c = $('⚙️ الإعدادات').first().json;
const items = $input.all().map((i) => i.json).filter((j) => j.title);
items.sort((a, b) => b.rel - a.rel);
return items.slice(0, c.maxAiJobsPerRun).map((j) => {
  const id = j.source === 'LinkedIn' ? (j.url.match(/\/view\/(\d+)/) || [])[1] : '';
  return { json: { ...j, detail_url: id ? `https://www.linkedin.com/jobs-guest/jobs/api/jobPosting/${id}` : '' } };
});
