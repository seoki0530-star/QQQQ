// /api/health — 환경변수가 제대로 들어갔는지 확인 (값은 절대 노출하지 않고 있음/없음만 표시)
export default function handler(req, res) {
  const e = process.env;
  res.status(200).json({
    ok: true,
    supabase_url: !!e.SUPABASE_URL,
    supabase_secret_key: !!e.SUPABASE_SECRET_KEY,
    resend_api_key: !!e.RESEND_API_KEY,
    notify_to: !!e.NOTIFY_TO,
    notify_from: !!e.NOTIFY_FROM,
    node: process.version,
    time: new Date().toISOString(),
  });
}
