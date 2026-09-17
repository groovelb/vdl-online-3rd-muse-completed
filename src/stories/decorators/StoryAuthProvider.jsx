import { AuthContext } from '../../hooks/auth/authContext.js';

/** 로그인한 것처럼 보이게 하는 가짜 세션 */
const SIGNED_IN_USER = {
  id: 'story-user',
  email: 'designer@muse.example',
  user_metadata: { nickname: 'MUSE Designer' },
  app_metadata: { role: 'user' },
};

/**
 * StoryAuthProvider 컴포넌트
 *
 * 실제 앱은 `<AuthProvider>` 가 supabase 세션을 구독하지만 스토리는 네트워크가 없다.
 * 같은 Context 에 고정된 값을 넣어 로그인 상태를 흉내 낸다.
 *
 * Props:
 * @param {node} children - 감쌀 내용 [Required]
 * @param {boolean} isAuthenticated - 로그인 상태 [Optional, 기본값: true]
 * @param {boolean} isAdmin - 관리자 여부 [Optional, 기본값: false]
 *
 * Example usage:
 * <StoryAuthProvider isAdmin>{ children }</StoryAuthProvider>
 */
export function StoryAuthProvider({ children, isAuthenticated = true, isAdmin = false }) {
  const user = isAuthenticated
    ? { ...SIGNED_IN_USER, app_metadata: { role: isAdmin ? 'admin' : 'user' } }
    : null;
  const value = {
    session: user ? { user } : null,
    user,
    loading: false,
    isAuthenticated: !!user,
    isAdmin,
  };
  return <AuthContext.Provider value={ value }>{ children }</AuthContext.Provider>;
}
