-- Supabase → SQL Editor 에 통째로 붙여 넣고 Run 을 누르세요.
-- 상담 신청 저장 테이블
create table if not exists public.consultations (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  name        text not null,
  phone       text not null,
  category    text,
  message     text not null,
  ua          text,
  ip          text,
  status      text not null default '신규'   -- 신규 / 연락완료 / 수임 / 종결
);

-- 행 수준 보안(RLS) ON: 정책을 하나도 만들지 않으면 공개 키(anon/publishable)로는 읽기·쓰기 모두 불가.
-- 우리 서버 함수는 비밀 키(sb_secret / service_role)로 쓰기 때문에 RLS를 우회합니다. 즉, 바깥에서는 아무도 못 봅니다.
alter table public.consultations enable row level security;

-- 최근 접수부터 보기 편하게 인덱스
create index if not exists consultations_created_at_idx on public.consultations (created_at desc);
