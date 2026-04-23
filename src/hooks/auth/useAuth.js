/**
 * useAuth — AuthProvider Context 를 읽는 훅
 *
 * 내부 상태 없음. 모든 구독은 <AuthProvider> 한 곳에서.
 */

import { useAuthContext } from './AuthProvider';

export function useAuth() {
  return useAuthContext();
}
