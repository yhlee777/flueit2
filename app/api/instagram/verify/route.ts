import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { supabaseAdmin } from '@/lib/supabase'

// Instagram Graph API 설정
const INSTAGRAM_BUSINESS_ACCOUNT_ID = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID
const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const { instagramUsername } = await request.json()

    if (!instagramUsername) {
      return NextResponse.json(
        { error: '인스타그램 아이디를 입력해주세요.' },
        { status: 400 }
      )
    }

    // @ 제거
    const cleanUsername = instagramUsername.replace('@', '')

    console.log('🔍 인스타그램 인증 시도:', { userId: session.user.id, username: cleanUsername })

    // Instagram Business Discovery API 호출
    const apiUrl = `https://graph.facebook.com/v18.0/${INSTAGRAM_BUSINESS_ACCOUNT_ID}`
    const params = new URLSearchParams({
      fields: `business_discovery.username(${cleanUsername}){username,name,profile_picture_url,followers_count,follows_count,media_count,biography}`,
      access_token: FACEBOOK_ACCESS_TOKEN || '',
    })

    const response = await fetch(`${apiUrl}?${params.toString()}`)
    const data = await response.json()

    if (data.error) {
      console.error('Instagram API Error:', data.error)
      
      // 계정을 찾을 수 없는 경우
      if (data.error.code === 100 || data.error.message.includes('username')) {
        return NextResponse.json(
          { 
            error: '해당 인스타그램 계정을 찾을 수 없습니다. 비즈니스 계정인지 확인해주세요.',
            code: 'NOT_FOUND'
          },
          { status: 404 }
        )
      }

      return NextResponse.json(
        { error: data.error.message || '인스타그램 정보를 가져오는데 실패했습니다.' },
        { status: 500 }
      )
    }

    // Business Discovery 데이터 추출
    const businessDiscovery = data.business_discovery

    if (!businessDiscovery) {
      return NextResponse.json(
        { error: '인스타그램 비즈니스 계정 정보를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 참여율 계산 (간단한 예시)
    const engagementRate = businessDiscovery.followers_count > 0
      ? ((businessDiscovery.media_count / businessDiscovery.followers_count) * 100).toFixed(2)
      : '0.00'

    // ✅ Instagram 데이터 저장
    const instagramData = {
      username: businessDiscovery.username,
      name: businessDiscovery.name,
      profilePicture: businessDiscovery.profile_picture_url,
      followersCount: businessDiscovery.followers_count,
      followsCount: businessDiscovery.follows_count,
      mediaCount: businessDiscovery.media_count,
      biography: businessDiscovery.biography,
      engagementRate: engagementRate,
      verifiedAt: new Date().toISOString(),
    }

    // ✅ DB 업데이트 - pending 상태로 설정
    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        instagram_username: businessDiscovery.username,
        instagram_data: instagramData,
        instagram_verification_status: 'pending',
        instagram_verification_requested_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', session.user.id)
      .select()
      .single()

    if (updateError) {
      console.error('❌ DB 업데이트 오류:', updateError)
      return NextResponse.json(
        { error: 'DB 저장 중 오류가 발생했습니다.', details: updateError.message },
        { status: 500 }
      )
    }

    console.log('✅ 인스타그램 인증 요청 저장 성공:', updatedUser.id)

    // 응답 데이터 구성
    const responseData = {
      success: true,
      data: instagramData,
      verificationStatus: 'pending', // 관리자 승인 대기
      message: '인스타그램 계정 정보를 확인했습니다. 관리자 승인을 기다려주세요.',
    }

    return NextResponse.json(responseData)

  } catch (error) {
    console.error('❌ 인스타그램 인증 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}