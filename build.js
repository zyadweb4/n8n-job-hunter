// Builds Zyad_Job_Hunter.json (n8n workflow) from src/*.js
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const SRC = path.join(__dirname, 'src');
const lib = fs.readFileSync(path.join(SRC, 'ai_lib.js'), 'utf8');
const code = (f) => fs.readFileSync(path.join(SRC, f), 'utf8').replace('//@include ai_lib', lib.trim());

const nodes = [];
const connections = {};
let y0 = 0;
function node(name, type, typeVersion, position, parameters, extra = {}) {
  nodes.push({ parameters, id: crypto.randomUUID(), name, type: 'n8n-nodes-base.' + type, typeVersion, position, ...extra });
  return name;
}
function link(from, to, outIndex = 0) {
  connections[from] = connections[from] || { main: [] };
  while (connections[from].main.length <= outIndex) connections[from].main.push([]);
  connections[from].main[outIndex].push({ node: to, type: 'main', index: 0 });
}
const CFG = "$('⚙️ الإعدادات').first().json";
const codeNode = (name, file, pos, extra) => node(name, 'code', 2, pos, { jsCode: code(file) }, extra);
const httpText = (name, pos, urlExpr, interval, timeout) => node(name, 'httpRequest', 4.2, pos, {
  url: urlExpr,
  sendHeaders: true, specifyHeaders: 'json',
  jsonHeaders: JSON.stringify({ 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Safari/537.36', 'Accept-Language': 'en-US,en;q=0.9,ar;q=0.8' }),
  options: { batching: { batch: { batchSize: 1, batchInterval: interval } }, response: { response: { neverError: true, responseFormat: 'text', outputPropertyName: 'data' } }, timeout },
}, { onError: 'continueRegularOutput' });
const httpAI = (name, pos, interval) => node(name, 'httpRequest', 4.2, pos, {
  method: 'POST', url: '={{ $json.ai_url }}',
  sendHeaders: true, specifyHeaders: 'json', jsonHeaders: '={{ JSON.stringify($json.ai_headers) }}',
  sendBody: true, specifyBody: 'json', jsonBody: '={{ JSON.stringify($json.ai_body) }}',
  options: { batching: { batch: { batchSize: 1, batchInterval: interval } }, response: { response: { neverError: true, responseFormat: 'json' } }, timeout: 90000 },
}, { onError: 'continueRegularOutput' });
const docRL = { __rl: true, mode: 'url', value: `={{ ${CFG}.sheetUrl }}` };
const sheetRL = { __rl: true, mode: 'name', value: `={{ ${CFG}.sheetName }}` };
const readSheet = (name, pos) => node(name, 'googleSheets', 4.7, pos, {
  documentId: docRL, sheetName: sheetRL, options: {},
}, { alwaysOutputData: true, executeOnce: true });
const sticky = (content, pos, w, h, color) => node('📝 ' + crypto.randomUUID().slice(0, 4), 'stickyNote', 1, pos, { content, width: w, height: h, color });

// ---------- Triggers ----------
const tManual = node('▶️ تجربة يدوية', 'manualTrigger', 1, [0, -200], {});
const tCollect = node('⏰ جمع الوظايف', 'scheduleTrigger', 1.2, [0, 0], { rule: { interval: [{ field: 'cronExpression', expression: '0 7-22/3 * * *' }] } });
const tDigest = node('⏰ الملخص اليومي', 'scheduleTrigger', 1.2, [0, 200], { rule: { interval: [{ field: 'days', triggerAtHour: 21, triggerAtMinute: 0 }] } });
const tApply = node('⏰ التقديم بالإيميل', 'scheduleTrigger', 1.2, [0, 400], { rule: { interval: [{ field: 'hours', hoursInterval: 1, triggerAtMinute: 20 }] } });
const cfg = codeNode('⚙️ الإعدادات', 'config.js', [260, 100]);
[tManual, tCollect, tDigest, tApply].forEach((t) => link(t, cfg));

const rule = (key) => ({
  conditions: { options: { caseSensitive: true, leftValue: '', typeValidation: 'strict', version: 2 },
    conditions: [{ id: crypto.randomUUID(), leftValue: '={{ $json.mode }}', rightValue: key, operator: { type: 'string', operation: 'equals' } }],
    combinator: 'and' },
  renameOutput: true, outputKey: key,
});
const sw = node('🔀 إيه المطلوب؟', 'switch', 3.2, [500, 100], { rules: { values: [rule('collect'), rule('digest'), rule('apply')] }, options: {} });
link(cfg, sw);

// ---------- Collect branch ----------
let x = 760; const yc = -200; const step = 240;
const chain = (names) => names.reduce((a, b) => { link(a, b); return b; });
const s1 = codeNode('🔗 المصادر', 'sources.js', [x, yc]);
const s2 = httpText('🌐 هات الصفحات', [x += step, yc], '={{ $json.url }}', 2500, 25000);
const s3 = codeNode('🧹 فك ونضّف', 'parse.js', [x += step, yc]);
const s4 = node('🚫 شيل اللي اتشاف قبل كده', 'removeDuplicates', 2, [x += step, yc], {
  operation: 'removeItemsSeenInPreviousExecutions', dedupeValue: '={{ $json.job_key }}', options: { scope: 'workflow' } });
const s5 = codeNode('✂️ أحسن الوظايف', 'cap.js', [x += step, yc]);
const s6 = httpText('📄 هات تفاصيل LinkedIn', [x += step, yc], '={{ $json.detail_url }}', 1500, 20000);
const s7 = codeNode('🧩 ضيف الوصف', 'detail_merge.js', [x += step, yc]);
x = 760; const yc2 = 0;
const s8 = codeNode('🤖 جهّز التقييم', 'score_build.js', [x, yc2]);
const s9 = httpAI('🤖 قيّم بالـ AI', [x += step, yc2], 7000);
const s10 = codeNode('📊 اقرا التقييم', 'score_read.js', [x += step, yc2]);
const s11 = codeNode('✍️ جهّز الجواب', 'write_build.js', [x += step, yc2]);
const s12 = httpAI('✍️ اكتب بالـ AI', [x += step, yc2], 4000);
const s13 = codeNode('📝 جهّز الصف', 'row.js', [x += step, yc2]);
const s14 = node('📄 ضيف للشيت', 'googleSheets', 4.7, [x += step, yc2], {
  operation: 'append', documentId: docRL, sheetName: sheetRL,
  columns: { mappingMode: 'autoMapInputData', value: {}, matchingColumns: [], schema: [], attemptToConvertTypes: false, convertFieldsToString: false },
  options: { cellFormat: 'RAW' } });
link(sw, s1, 0);
chain([s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13, s14]);

// ---------- Digest branch ----------
x = 760; const yd = 260;
const d1 = readSheet('📄 اقرا الشيت (ملخص)', [x, yd]);
const d2 = codeNode('📋 اختار وظايف الملخص', 'digest_select.js', [x += step, yd]);
const d3 = node('📎 اعمل ملف إكسل', 'convertToFile', 1.1, [x += step, yd], {
  operation: 'xlsx', binaryPropertyName: 'data', options: { fileName: "={{ 'Zyad_Jobs_' + $now.toFormat('yyyy-MM-dd') + '.xlsx' }}", sheetName: 'Jobs', headerRow: true } });
const d4 = codeNode('📧 اكتب الإيميل', 'digest_mail.js', [x += step, yd]);
const d5 = node('📨 ابعتلي الملخص', 'gmail', 2.1, [x += step, yd], {
  sendTo: `={{ ${CFG}.myEmail }}`, subject: '={{ $json.subject }}', emailType: 'html', message: '={{ $json.html }}',
  options: { appendAttribution: false, attachmentsUi: { attachmentsBinary: [{ property: 'data' }] } } }, { webhookId: crypto.randomUUID() });
link(sw, d1, 1);
chain([d1, d2, d3, d4, d5]);

// ---------- Apply branch ----------
x = 760; const ya = 460;
const SEL = "$('✅ مين يتقدّم').item.json";
const a1 = readSheet('📄 اقرا الشيت (تقديم)', [x, ya]);
const a2 = codeNode('✅ مين يتقدّم', 'apply_select.js', [x += step, ya]);
const a3 = node('📥 هات السي في', 'googleDrive', 3, [x += step, ya], {
  operation: 'download', fileId: { __rl: true, mode: 'id', value: '={{ $json.cvFileId }}' }, options: { binaryPropertyName: 'data' } });
const a4 = node('📤 ابعت الطلب', 'gmail', 2.1, [x += step, ya], {
  sendTo: `={{ ${SEL}.to }}`, subject: `={{ ${SEL}.subject }}`, emailType: 'text', message: `={{ ${SEL}.body }}`,
  options: { appendAttribution: false, senderName: `={{ ${CFG}.myName }}`, attachmentsUi: { attachmentsBinary: [{ property: 'data' }] } } },
  { webhookId: crypto.randomUUID() });
const col = (id) => ({ id, displayName: id, required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true });
const a5 = node('✔️ علّم إنه اتبعت', 'googleSheets', 4.7, [x += step, ya], {
  operation: 'update', documentId: docRL, sheetName: sheetRL,
  columns: { mappingMode: 'defineBelow',
    value: { url: `={{ ${SEL}.url }}`, status: 'اتبعت', applied_at: "={{ $now.toFormat('yyyy-MM-dd HH:mm') }}" },
    matchingColumns: ['url'], schema: [col('url'), col('status'), col('applied_at')], attemptToConvertTypes: false, convertFieldsToString: false },
  options: { cellFormat: 'RAW' } });
link(sw, a1, 2);
chain([a1, a2, a3, a4, a5]);

// ---------- Notes ----------
sticky(`## Zyad Job Hunter 🔎
**1)** عدّل **⚙️ الإعدادات** بس (لينك الشيت، مفتاح Gemini، IDs السي في).
**2)** اختار حساب جوجل في نودز الشيت والجيميل والدرايف.
**3)** دوس **Execute workflow** للتجربة، وبعدين **Active**.`, [-40, -460], 520, 200, 5);
sticky(`### جمع وتقييم الوظايف (كل 3 ساعات من 7 الصبح لـ 10 بالليل)
المصادر ← تنضيف ← شيل المكرر ← الوصف الكامل ← الـ AI المقيّم ← الـ AI الكاتب (Cover Letter) ← الشيت`, [740, -330], 1700, 100, 4);
sticky(`### الملخص اليومي — الساعة 9 بالليل
غيّر الساعة من نود **⏰ الملخص اليومي**`, [740, 200], 1000, 60, 6);
sticky(`### التقديم بالإيميل — كل ساعة
بيبعت بس للوظايف اللي كتبت فيها **نعم** في عمود approve`, [740, 400], 1000, 60, 3);

const wf = {
  name: 'Zyad Job Hunter 🔎', nodes, connections, pinData: {}, active: false,
  settings: { executionOrder: 'v1', timezone: 'Africa/Cairo', saveManualExecutions: true, callerPolicy: 'workflowsFromSameOwner' },
  meta: { templateCredsSetupCompleted: false }, tags: [],
};
const out = path.join(__dirname, 'workflow', 'job-hunter.json');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(wf, null, 2));
console.log('nodes:', nodes.length, '->', out);
