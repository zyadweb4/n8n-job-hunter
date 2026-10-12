// ---- مكتبة صغيرة: بتبني طلب للذكاء الاصطناعي (Gemini / ChatGPT / Claude) ----
function aiRole(c, role) {
  let { provider, model } = c[role];
  if (!c.keys[provider]) { provider = c.scorer.provider; model = c.scorer.model; }
  if (!c.keys[provider]) throw new Error('حط مفتاح ' + provider + ' في ⚙️ الإعدادات');
  return { provider, model, key: c.keys[provider] };
}
function aiRequest(r, system, user, maxTokens) {
  if (r.provider === 'gemini') {
    const gen = { responseMimeType: 'application/json', temperature: 0.2, maxOutputTokens: maxTokens };
    if (/^gemini-2\.5-flash/.test(r.model)) gen.thinkingConfig = { thinkingBudget: 0 };
    return { ai_provider: r.provider,
      ai_url: `https://generativelanguage.googleapis.com/v1beta/models/${r.model}:generateContent`,
      ai_headers: { 'x-goog-api-key': r.key, 'content-type': 'application/json' },
      ai_body: { systemInstruction: { parts: [{ text: system }] }, contents: [{ role: 'user', parts: [{ text: user }] }], generationConfig: gen } };
  }
  if (r.provider === 'openai') {
    return { ai_provider: r.provider, ai_url: 'https://api.openai.com/v1/chat/completions',
      ai_headers: { Authorization: 'Bearer ' + r.key, 'content-type': 'application/json' },
      ai_body: { model: r.model, response_format: { type: 'json_object' }, max_completion_tokens: maxTokens * 3,
        messages: [{ role: 'system', content: system }, { role: 'user', content: user }] } };
  }
  if (r.provider === 'claude') {
    return { ai_provider: r.provider, ai_url: 'https://api.anthropic.com/v1/messages',
      ai_headers: { 'x-api-key': r.key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      ai_body: { model: r.model, max_tokens: maxTokens, system,
        messages: [{ role: 'user', content: user + '\n\nReply with the JSON object only.' }] } };
  }
  throw new Error('provider لازم يكون gemini أو openai أو claude');
}
function aiText(provider, res) {
  if (!res || res.error) return '';
  if (provider === 'gemini') return (((res.candidates || [])[0] || {}).content || { parts: [] }).parts.map((p) => p.text || '').join('');
  if (provider === 'openai') return (((res.choices || [])[0] || {}).message || {}).content || '';
  if (provider === 'claude') return (res.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('');
  return '';
}
function aiJSON(text) {
  const m = String(text || '').match(/\{[\s\S]*\}/);
  if (!m) return null;
  try { return JSON.parse(m[0]); } catch (e) { return null; }
}
