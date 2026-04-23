/**
 * Supabase 에러 메시지 한국어 정규화
 */

const MAP = {
  'Invalid login credentials': '이메일 또는 비밀번호가 올바르지 않습니다.',
  'Email not confirmed': '이메일 인증이 필요합니다. 메일함을 확인해주세요.',
  'User already registered': '이미 가입된 이메일입니다.',
  'Password should be at least 6 characters': '비밀번호는 6자 이상이어야 합니다.',
  'signup requires a valid password': '비밀번호를 입력해주세요.',
  'new row violates row-level security policy': '접근 권한이 없습니다 (RLS).',
};

export function normalizeSupabaseError(err) {
  if (!err) return null;
  const msg = err.message || String(err);
  for (const key of Object.keys(MAP)) {
    if (msg.includes(key)) return MAP[key];
  }
  return msg;
}
