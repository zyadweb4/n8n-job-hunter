// ================================================================
//  ⚙️  الإعدادات — ده المكان الوحيد اللي محتاج تعدّل فيه
// ================================================================
const CONFIG = {
  // ---- بياناتك ----
  myName: 'Zyad Mohamed Abdelfattah',
  myEmail: 'you@example.com',               // الإيميل اللي هيوصله الملخص اليومي
  myPhone: '+20 1xx xxx xxxx',

  // ---- Google Sheet ----
  // افتح الشيت في المتصفح وانسخ اللينك كله وحطه هنا
  sheetUrl: 'PASTE_YOUR_GOOGLE_SHEET_URL_HERE',
  sheetName: 'Jobs',

  // ---- مفاتيح الذكاء الاصطناعي (حط المفتاح اللي عندك بس) ----
  keys: {
    gemini: 'PASTE_GEMINI_KEY_HERE',   // مجاني من aistudio.google.com
    openai: '',                        // اختياري (ChatGPT) من platform.openai.com
    claude: '',                        // اختياري (Claude) من console.anthropic.com
  },
  // 🧠 الفريق: واحد بيقيّم كل الوظايف، وواحد بيكتب الجوابات للوظايف الكويسة بس
  // المقيّم: Gemini Flash-Lite (مجاني وسريع، بيشتغل على كل وظيفة)
  scorer: { provider: 'gemini', model: 'gemini-2.5-flash-lite' },
  // الكاتب: Gemini Flash مجاني. لو عايز Claude أو ChatGPT يكتبوا، حط مفتاحه فوق وغيّر السطر ده لـ:
  //   { provider: 'claude', model: 'claude-sonnet-5-5' }   أو   { provider: 'openai', model: 'gpt-5-mini' }
  // (لو مفتاح الكاتب فاضي، المقيّم هو اللي هيكتب)
  writer: { provider: 'gemini', model: 'gemini-2.5-flash' },

  // ---- قواعد الفلترة ----
  minScoreToKeep: 45,      // أقل من كده مش هتتحط في الشيت
  dailyMinJobs: 10,        // الملخص اليومي فيه 10 وظايف على الأقل (لو موجودين)
  maxAiJobsPerRun: 25,     // أقصى عدد وظايف تتبعت للذكاء الاصطناعي في المرة

  // ---- التقديم بالإيميل ----
  // 0 = مفيش تقديم إلا لما تكتب «نعم» في عمود approve في الشيت
  // مثلاً 80 = قدّم لوحدك على أي وظيفة سكورها 80 أو أكتر ومعاها إيميل تقديم
  autoApplyMinScore: 0,
  maxEmailsPerRun: 5,
  // IDs ملفات السي في على Google Drive (افتح الملف ← Share ← Copy link، والـ ID هو اللي بين /d/ و /view)
  cvDriveIds: {
    qa: 'PASTE_DRIVE_FILE_ID',
    data_entry: 'PASTE_DRIVE_FILE_ID',
    wordpress: 'PASTE_DRIVE_FILE_ID',
    ai_trainer: 'PASTE_DRIVE_FILE_ID',
  },

  // ---- البحث ----
  linkedinKeywords: ['Arabic', 'data entry', 'QA tester', 'software tester', 'WordPress',
                     'AI trainer', 'annotation', 'Arabic content', 'Power BI', 'Excel'],
  linkedinLocations: ['Egypt', 'Saudi Arabia', 'United Arab Emirates'],
  mostaqlKeywords: ['ووردبريس', 'إدخال بيانات', 'اختبار تطبيق', 'اكسل', 'تفريغ'],
  baytPages: [
    'https://www.bayt.com/en/egypt/jobs/remote-jobs/',
    'https://www.bayt.com/en/saudi-arabia/jobs/remote-jobs/',
    'https://www.bayt.com/en/uae/jobs/remote-jobs/',
  ],
  remoteApiSearches: ['arabic', 'data entry', 'qa', 'wordpress', 'annotation'],

  // وظايف لازم يكون فيها كلمة من دول (في العنوان أو الوصف)
  includeRegex: 'arab|عرب|data entry|إدخال|ادخال|بيانات|qa\\b|quality|tester|testing|اختبار|wordpress|ووردبريس|woocommerce|elementor|annotat|label|rater|evaluat|ai train|transcri|تفريغ|excel|اكسل|power ?bi|gis|seo|content review|moderat|localiz',
  // وظايف تتشال على طول لو فيها كلمة من دول في العنوان
  excludeRegex: 'senior|sr\\.|lead|manager|head of|director|principal|architect|staff engineer|german|french|spanish|turkish|russian|hebrew|italian|portuguese|japanese|korean|chinese|dutch|polish|nurse|doctor|driver|sales|telesales|cold call',

  // ---- ملفك (اللي الذكاء الاصطناعي بيقارن بيه) — حقايق بس، من غير مبالغة ----
  profile: `Zyad Mohamed Abdelfattah, based in Kafr El Dawar, Beheira, Egypt. Remote only.
Languages: Arabic native (Egyptian + Modern Standard Arabic). English intermediate (working proficiency in writing; not fluent in speaking).
Experience:
- QA Tester, Findo Group, Oct 2025 – present (remote, full-time): manual testing of web and mobile apps (Flutter, iOS/Android), regression testing, bug reports in Jira with steps/expected/actual/severity/screenshots, testing AI features and evaluating AI answers, reviewing Arabic localization and right-to-left layouts. Wrote 7 structured QA reports covering 5 products and 69 issues.
- Built "QA Pro": a desktop testing tool (Electron + Playwright) with 20 automated test suites.
- Data Entry Specialist, Findo Group, about 2 years before the QA role: accurate data entry in Arabic and English, cleaning duplicates, reports in Excel, Word, PowerPoint; SQL to look up and update records.
Skills: Excel, Power BI, PowerPoint, Word, SQL, Python basics (no OOP yet), WordPress (WooCommerce stores, Elementor, security, backups, domains, hosting, SSL, SEO, publishing articles), HTML/CSS, Playwright, Jira, daily use of AI models (Claude, ChatGPT, Gemini).
Education: B.A. Geography – Surveying & GIS, Damanhur University, 2026, grade Very Good, ranked 3rd. GIS tools: ArcGIS Pro, QGIS, AutoCAD, Civil 3D.
Certificates: Claude 101 (Anthropic, 2026), AutoCAD.
Available: remote, full-time or part-time, can start immediately.
CV versions available: qa, data_entry, wordpress, ai_trainer.`,
};

// ---- متلمسش اللي تحت ده ----
let mode = 'collect';
try { if ($('⏰ الملخص اليومي').isExecuted) mode = 'digest'; } catch (e) {}
try { if ($('⏰ التقديم بالإيميل').isExecuted) mode = 'apply'; } catch (e) {}
return [{ json: { ...CONFIG, mode, runAt: new Date().toISOString() } }];
