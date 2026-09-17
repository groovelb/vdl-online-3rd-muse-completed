import { createContext } from 'react';

/**
 * 로그인 상태를 담는 Context.
 *
 * 컴포넌트 파일과 떼어 둔다. 스토리북은 `AuthProvider` 대신 이 Context 에 고정 값을 넣어
 * 네트워크 없이 로그인 상태를 흉내 낸다.
 */
export const AuthContext = createContext({
  session: null,
  user: null,
  loading: true,
  isAuthenticated: false,
  isAdmin: false,
});
