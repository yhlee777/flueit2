import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/admin/pending-users - 승인 대기 중인 사용자 목록
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    // ✅ 관리자 권한 확인
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
    const status = searchParams.get('status') || 'pending'
    const userType = searchParams.get('user_type')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    console.log('🔍 가입 대기자 조회:', { status, userType })

    // ✅ 승인 대기 중인 사용자 조회
    let query = supabaseAdmin
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // 필터 적용
    if (status) {
      query = query.eq('approval_status', status)
    }
    if (userType) {
      query = query.eq('user_type', userType)
    }

    const { data: users, error, count } = await query

    if (error) {
      console.error('❌ 사용자 조회 오류:', error)
      return NextResponse.json(
        { error: '사용자 조회 중 오류가 발생했습니다.', details: error.message },
        { status: 500 }
      )
    }

    console.log(`✅ 사용자 ${users?.length || 0}명 조회 성공`)

    return NextResponse.json({
      success: true,
      users: users || [],
      total: count || users?.length || 0,
    })

  } catch (error) {
    console.error('❌ 사용자 조회 오류:', error)
    return NextResponse.json(
      { error: '사용자 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}