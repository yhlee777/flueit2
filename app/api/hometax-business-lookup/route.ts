import { NextRequest, NextResponse } from 'next/server'

/**
 * 홈택스 사업자등록번호 진위확인 API
 * 국세청 사업자등록상태 조회 서비스 사용
 */
export async function POST(request: NextRequest) {
  try {
    const { businessNumber } = await request.json()

    if (!businessNumber || businessNumber.length !== 10) {
      return NextResponse.json(
        { valid: false, message: '사업자등록번호 형식이 올바르지 않습니다.' },
        { status: 400 }
      )
    }

    // 국세청 API 호출 (실제 사용 시 서비스키 필요)
    const serviceKey = process.env.HOMETAX_SERVICE_KEY || ''
    
    if (!serviceKey) {
      // 개발 환경에서 서비스키가 없으면 테스트 모드
      console.log('홈택스 서비스키가 설정되지 않았습니다. 테스트 모드로 실행합니다.')
      
      // 테스트 모드: 간단한 유효성 검사
      const isValidFormat = /^\d{10}$/.test(businessNumber)
      
      return NextResponse.json({
        valid: isValidFormat,
        message: isValidFormat 
          ? '테스트 모드: 형식이 유효합니다.' 
          : '사업자등록번호 형식이 올바르지 않습니다.',
        testMode: true
      })
    }

    // 국세청 홈택스 사업자등록상태 조회 API
    const apiUrl = 'https://api.odcloud.kr/api/nts-businessman/v1/status'
    
    const response = await fetch(`${apiUrl}?serviceKey=${serviceKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        b_no: [businessNumber] // 사업자등록번호 배열
      })
    })

    if (!response.ok) {
      throw new Error('홈택스 API 호출 실패')
    }

    const data = await response.json()
    
    // API 응답 형식:
    // {
    //   "status_code": "OK",
    //   "data": [{
    //     "b_no": "1234567890",
    //     "b_stt": "계속사업자",
    //     "b_stt_cd": "01",
    //     "tax_type": "부가가치세 일반과세자",
    //     "tax_type_cd": "01",
    //     "end_dt": "",
    //     "utcc_yn": "N",
    //     "tax_type_change_dt": "",
    //     "invoice_apply_dt": ""
    //   }]
    // }

    const businessInfo = data.data?.[0]
    
    if (businessInfo && businessInfo.b_stt_cd === "01") {
      // 계속사업자인 경우
      return NextResponse.json({
        valid: true,
        message: '정상적인 사업자등록번호입니다.',
        businessInfo: {
          businessNumber: businessInfo.b_no,
          status: businessInfo.b_stt,
          taxType: businessInfo.tax_type
        }
      })
    } else if (businessInfo && businessInfo.b_stt_cd === "02") {
      // 휴업자
      return NextResponse.json({
        valid: false,
        message: '휴업 중인 사업자입니다.',
        businessInfo: {
          businessNumber: businessInfo.b_no,
          status: businessInfo.b_stt
        }
      })
    } else if (businessInfo && businessInfo.b_stt_cd === "03") {
      // 폐업자
      return NextResponse.json({
        valid: false,
        message: '폐업한 사업자입니다.',
        businessInfo: {
          businessNumber: businessInfo.b_no,
          status: businessInfo.b_stt,
          endDate: businessInfo.end_dt
        }
      })
    } else {
      return NextResponse.json({
        valid: false,
        message: '조회되지 않는 사업자등록번호입니다.'
      })
    }

  } catch (error) {
    console.error('사업자등록번호 조회 오류:', error)
    return NextResponse.json(
      { valid: false, message: '사업자등록번호 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}