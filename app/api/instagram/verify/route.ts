import { NextRequest, NextResponse } from 'next/server';

// Instagram Graph API 설정
const INSTAGRAM_BUSINESS_ACCOUNT_ID = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;

export async function POST(request: NextRequest) {
  try {
    const { instagramUsername } = await request.json();

    if (!instagramUsername) {
      return NextResponse.json(
        { error: '인스타그램 아이디를 입력해주세요.' },
        { status: 400 }
      );
    }

    // @ 제거
    const cleanUsername = instagramUsername.replace('@', '');

    // Instagram Business Discovery API 호출
    const apiUrl = `https://graph.facebook.com/v18.0/${INSTAGRAM_BUSINESS_ACCOUNT_ID}`;
    const params = new URLSearchParams({
      fields: `business_discovery.username(${cleanUsername}){username,name,profile_picture_url,followers_count,follows_count,media_count,biography}`,
      access_token: FACEBOOK_ACCESS_TOKEN || '',
    });

    const response = await fetch(`${apiUrl}?${params.toString()}`);
    const data = await response.json();

    if (data.error) {
      console.error('Instagram API Error:', data.error);
      
      // 계정을 찾을 수 없는 경우
      if (data.error.code === 100 || data.error.message.includes('username')) {
        return NextResponse.json(
          { 
            error: '해당 인스타그램 계정을 찾을 수 없습니다. 비즈니스 계정인지 확인해주세요.',
            code: 'NOT_FOUND'
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { error: data.error.message || '인스타그램 정보를 가져오는데 실패했습니다.' },
        { status: 500 }
      );
    }

    // Business Discovery 데이터 추출
    const businessDiscovery = data.business_discovery;

    if (!businessDiscovery) {
      return NextResponse.json(
        { error: '인스타그램 비즈니스 계정 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 참여율 계산 (간단한 예시)
    const engagementRate = businessDiscovery.followers_count > 0
      ? ((businessDiscovery.media_count / businessDiscovery.followers_count) * 100).toFixed(2)
      : '0.00';

    // 응답 데이터 구성
    const responseData = {
      success: true,
      data: {
        username: businessDiscovery.username,
        name: businessDiscovery.name,
        profilePicture: businessDiscovery.profile_picture_url,
        followersCount: businessDiscovery.followers_count,
        followsCount: businessDiscovery.follows_count,
        mediaCount: businessDiscovery.media_count,
        biography: businessDiscovery.biography,
        engagementRate: engagementRate,
      },
      verificationStatus: 'pending', // 관리자 승인 대기
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Instagram verification error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}