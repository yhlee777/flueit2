import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

// 개발 전용 - 비밀번호 테스트 API
export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    console.log('🔍 비밀번호 테스트 시작:', { username })

    // 사용자 조회
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, username, email, password, provider')
      .eq('username', username)
      .single()

    if (error || !user) {
      return NextResponse.json({
        success: false,
        error: '사용자를 찾을 수 없습니다.',
        details: error
      })
    }

    console.log('✅ 사용자 찾음:', {
      id: user.id,
      username: user.username,
      hasPassword: !!user.password,
      passwordLength: user.password?.length,
      passwordPrefix: user.password?.substring(0, 10),
      provider: user.provider
    })

    // 비밀번호가 없는 경우 (소셜 로그인)
    if (!user.password) {
      return NextResponse.json({
        success: false,
        error: '이 계정은 소셜 로그인 계정입니다.',
        provider: user.provider
      })
    }

    // 비밀번호 비교
    const isValid = await bcrypt.compare(password, user.password)

    console.log('🔐 비밀번호 검증:', {
      inputPassword: password,
      isValid,
      storedHash: user.password.substring(0, 20) + '...'
    })

    // 테스트: 새로 해시 생성
    const newHash = await bcrypt.hash(password, 10)
    console.log('🔄 새로 생성한 해시:', newHash.substring(0, 20) + '...')

    return NextResponse.json({
      success: true,
      result: {
        username: user.username,
        hasPassword: !!user.password,
        passwordValid: isValid,
        passwordHash: user.password.substring(0, 30) + '...',
        newHashSample: newHash.substring(0, 30) + '...'
      }
    })

  } catch (error) {
    console.error('❌ 테스트 오류:', error)
    return NextResponse.json({
      success: false,
      error: '테스트 중 오류 발생',
      details: error instanceof Error ? error.message : String(error)
    })
  }
}