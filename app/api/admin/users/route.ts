// app/api/admin/users/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    // 관리자 권한 확인
    const { data: adminUser } = await supabaseAdmin
      .from('users')
      .select('is_admin')
      .eq('id', session.user.id)
      .single()

    if (!adminUser?.is_admin) {
      return NextResponse.json(
        { error: '관리자 권한이 없습니다.' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const userType = searchParams.get('user_type')
    const instagramStatus = searchParams.get('instagram_status') // pending, verified, all

    console.log('🔍 사용자 조회:', { userType, instagramStatus })

    // 쿼리 구성
    let query = supabaseAdmin
      .from('users')
      .select('id, email, name, username, user_type, instagram_username, instagram_verification_status, created_at, image')
      .order('created_at', { ascending: false })

    // 회원 유형 필터
    if (userType && userType !== 'all') {
      query = query.eq('user_type', userType)
    }

    // 인스타그램 인증 상태 필터
    if (instagramStatus && instagramStatus !== 'all') {
      query = query.eq('instagram_verification_status', instagramStatus)
    }

    const { data: users, error } = await query

    if (error) {
      console.error('❌ 사용자 조회 오류:', error)
      return NextResponse.json(
        { error: '사용자 조회 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    console.log(`✅ 사용자 ${users?.length || 0}명 조회 성공`)

    return NextResponse.json({
      success: true,
      users: users || [],
    })

  } catch (error) {
    console.error('❌ API 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}