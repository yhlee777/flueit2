import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, username, password, userType } = body

    console.log('🔍 회원가입 시도:', { email, username, userType })

    if (!email || !username || !password) {
      return NextResponse.json(
        { error: '이메일, 아이디, 비밀번호는 필수입니다.' },
        { status: 400 }
      )
    }

    // 이메일 중복 체크
    const { data: existingEmail, error: emailError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    console.log('🔍 이메일 중복 체크:', { exists: !!existingEmail, emailError })

    if (existingEmail) {
      return NextResponse.json(
        { error: '이미 사용 중인 이메일입니다.' },
        { status: 400 }
      )
    }

    // 아이디 중복 체크
    const { data: existingUsername, error: usernameError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('username', username)
      .single()

    console.log('🔍 아이디 중복 체크:', { exists: !!existingUsername, usernameError })

    if (existingUsername) {
      return NextResponse.json(
        { error: '이미 사용 중인 아이디입니다.' },
        { status: 400 }
      )
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10)

    // 사용자 생성
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .insert({
        email,
        username,
        password: hashedPassword,
        user_type: userType || null,
        provider: null,
      })
      .select('id, email, username, user_type, created_at')
      .single()

    console.log('🔍 사용자 생성 결과:', { user: !!user, error })

    if (error) {
      console.error('❌ Supabase 삽입 오류:', error)
      return NextResponse.json(
        { error: '회원가입 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    console.log('✅ 회원가입 성공:', user)

    return NextResponse.json(
      { 
        success: true, 
        message: '회원가입이 완료되었습니다.',
        user 
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('❌ 회원가입 오류:', error)
    return NextResponse.json(
      { error: '회원가입 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}