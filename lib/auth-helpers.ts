import { supabase } from './supabase-client'

/**
 * 현재 로그인한 사용자 정보 가져오기
 */
export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      console.error('[Auth] Error getting user:', error)
      return null
    }
    
    return user
  } catch (error) {
    console.error('[Auth] Exception getting user:', error)
    return null
  }
}

/**
 * 현재 사용자 UUID 가져오기
 */
export async function getCurrentUserId(): Promise<string | null> {
  const user = await getCurrentUser()
  return user?.id || null
}

/**
 * 사용자 프로필 정보 가져오기
 * (users 또는 profiles 테이블이 있다면)
 */
export async function getUserProfile(userId: string) {
  try {
    // profiles 테이블이 있다면
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('[Auth] Error getting profile:', error)
    return { data: null, error }
  }
}

/**
 * 로그인 여부 확인
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser()
  return user !== null
}

/**
 * 로그아웃
 */
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error('[Auth] Error signing out:', error)
    return { error }
  }
}

/**
 * 세션 확인
 */
export async function getSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    return { session, error: null }
  } catch (error) {
    console.error('[Auth] Error getting session:', error)
    return { session: null, error }
  }
}

/**
 * 인증 상태 변경 리스너
 */
export function onAuthStateChange(callback: (userId: string | null) => void) {
  return supabase.auth.onAuthStateChange((event, session) => {
    console.log('[Auth] State changed:', event, session?.user?.id)
    callback(session?.user?.id || null)
  })
}

/**
 * 개발/테스트용: 임시 UUID 생성
 */
export function generateTestUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

/**
 * 개발/테스트용: 고정 UUID 반환
 */
export function getTestUserId(role: 'influencer' | 'advertiser' = 'influencer'): string {
  // 테스트용 고정 UUID
  return role === 'influencer' 
    ? '11111111-1111-1111-1111-111111111111'
    : '22222222-2222-2222-2222-222222222222'
}

/**
 * UUID 형식 검증
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}
