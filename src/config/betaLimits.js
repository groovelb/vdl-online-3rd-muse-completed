/**
 * MUSE — 베타 테스트 사용량 제한 (per user)
 *
 * 변경 시 AuthPage 안내 문구도 같이 갱신할 것.
 */
export const BETA_LIMITS = {
  references: 30,
  projects: 10,
};

export const BETA_LIMIT_MESSAGES = {
  references: `베타 기간 동안 계정당 레퍼런스는 최대 ${ BETA_LIMITS.references }개까지 등록할 수 있습니다.`,
  projects: `베타 기간 동안 계정당 프로젝트는 최대 ${ BETA_LIMITS.projects }개까지 생성할 수 있습니다.`,
};

/**
 * Admin 이메일 — 베타 한도/안내 모달 모두 면제.
 * 이메일은 case-insensitive 비교.
 */
export const ADMIN_EMAILS = ['groovelb@gmail.com'];

export function isAdminUser(user) {
  const email = user?.email?.toLowerCase?.();
  if (!email) return false;
  return ADMIN_EMAILS.includes(email);
}
