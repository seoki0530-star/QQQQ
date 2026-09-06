// /api/contact  — 상담 신청 접수 (Vercel 서버리스 함수, Node.js 런타임)
// 흐름: 브라우저 폼 → 이 함수 → Supabase(consultations 테이블 저장) → Resend(내 메일로 알림)
// 비밀 키는 코드에 절대 쓰지 않습니다. Vercel 프로젝트 → Settings → Environment Variables 에 넣습니다.
//
//   SUPABASE_URL          예) https://abcd1234.supabase.co
//   SUPABASE_SECRET_KEY   Supabase → Project Settings → API Keys → Secret key (sb_secret_... / 구 service_role)
//   RESEND_API_KEY        Resend → API Keys (re_...)
//   NOTIFY_TO             알림 받을 내 메일 (예: me@gmail.com)
//   NOTIFY_FROM           발신 주소. 도메인 인증 전에는 Resend 테스트 발신 주소, 인증 후 예) "상담접수 <noreply@내도메인.com>"
//
// Resend 설정이 없으면 저장만 하고 성공으로 응답합니다(메일은 선택 기능).

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'POST only' });
  }

  const body = typeof req.body === 'string' ? safeJson(req.body) : (req.body || {});
  const name = clean(body.name, 40);
  const phone = clean(body.phone, 30);
  const category = clean(body.category, 40) || '기타';
  const message = clean(body.message, 2000);

  // 스팸봇 함정 필드(website)가 채워져 있으면 조용히 성공 처리
  if (body.website) return res.status(200).json({ ok: true });
  if (!name || !phone || !message) {
    return res.status(400).json({ ok: false, error: '이름·연락처·내용은 필수입니다.' });
  }

  const ua = clean(req.headers['user-agent'], 200);
  const ip = clean((req.headers['x-forwarded-for'] || '').split(',')[0], 64);

  // 1) Supabase 저장 (필수)
  const { SUPABASE_URL, SUPABASE_SECRET_KEY } = process.env;
  if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
    return res.status(500).json({ ok: false, error: 'Supabase 환경변수가 없습니다(SUPABASE_URL / SUPABASE_SECRET_KEY).' });
  }
  const saved = await fetch(`${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/consultations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_SECRET_KEY,
      Authorization: `Bearer ${SUPABASE_SECRET_KEY}`,
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({ name, phone, category, message, ua, ip }),
  });
  if (!saved.ok) {
    const detail = await saved.text().catch(() => '');
    console.error('supabase insert failed', saved.status, detail);
    return res.status(502).json({ ok: false, error: `저장 실패(${saved.status}). 테이블·키를 확인하세요.` });
  }

  // 2) Resend 알림 메일 (선택)
  const { RESEND_API_KEY, NOTIFY_TO, NOTIFY_FROM } = process.env;
  let mailed = false;
  if (RESEND_API_KEY && NOTIFY_TO && NOTIFY_FROM) {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${RESEND_API_KEY}` },
      body: JSON.stringify({
        from: NOTIFY_FROM,
        to: [NOTIFY_TO],
        subject: `[상담신청] ${category} · ${name}`,
        html: `<h2>새 상담 신청</h2>
<table cellpadding="6" style="border-collapse:collapse;font-family:sans-serif">
<tr><td><b>이름</b></td><td>${esc(name)}</td></tr>
<tr><td><b>연락처</b></td><td>${esc(phone)}</td></tr>
<tr><td><b>분야</b></td><td>${esc(category)}</td></tr>
<tr><td><b>내용</b></td><td style="white-space:pre-wrap">${esc(message)}</td></tr>
<tr><td><b>접수시각</b></td><td>${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}</td></tr>
</table>
<p style="color:#888">Supabase consultations 테이블에도 저장되었습니다.</p>`,
      }),
    });
    mailed = r.ok;
    if (!r.ok) console.error('resend failed', r.status, await r.text().catch(() => ''));
  }

  return res.status(200).json({ ok: true, mailed });
}

function clean(v, max) {
  if (v === undefined || v === null) return '';
  // 제어문자 제거(줄바꿈·탭은 유지)
  return String(v).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').trim().slice(0, max);
}
function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function safeJson(s) {
  try { return JSON.parse(s); } catch { return {}; }
}
