"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { ArrowLeft, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  })
  
  // ✅ 사용자 타입에 따른 회원가입 링크 상태
  const [signupLink, setSignupLink] = useState("/")
  const [signupText, setSignupText] = useState("회원가입")

  // ✅ URL 파라미터로 사용자 타입 확인
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search)
      const userType = urlParams.get("type")
      
      if (userType === "influencer") {
        setSignupLink("/signup/influencer")
        setSignupText("인플루언서 회원가입")
      } else if (userType === "advertiser") {
        setSignupLink("/signup/advertiser")
        setSignupText("광고주 회원가입")
      } else {
        // 파라미터가 없으면 타입 선택 페이지로
        setSignupLink("/select-user-type")
        setSignupText("회원가입")
      }
    }
  }, [])

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }))
    setError("") // 입력 시 에러 메시지 초기화
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!formData.username || !formData.password) {
      setError("아이디와 비밀번호를 모두 입력해주세요.")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const result = await signIn('credentials', {
        username: formData.username,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        setError(result.error)
        return
      }

      if (result?.ok) {
        // 세션 정보 가져오기
        const response = await fetch('/api/auth/session')
        const data = await response.json()
        
        // 관리자면 관리자 페이지로, 아니면 홈으로
        if (data?.user?.is_admin === true) {
          window.location.href = '/admin/pending-users'
        } else {
          window.location.href = '/'
        }
      }
    } catch (error) {
      console.error('로그인 오류:', error)
      setError('로그인 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKakaoLogin = async () => {
    try {
      const result = await signIn('kakao', { 
        callbackUrl: '/',
        redirect: true 
      })
      
      if (result?.error) {
        setError('카카오 로그인에 실패했습니다.')
      }
    } catch (error) {
      console.error('카카오 로그인 오류:', error)
      setError('카카오 로그인 중 오류가 발생했습니다.')
    }
  }

  const handleGoogleLogin = async () => {
    try {
      const result = await signIn('google', { 
        callbackUrl: '/',
        redirect: true 
      })
      
      if (result?.error) {
        setError('구글 로그인에 실패했습니다.')
      }
    } catch (error) {
      console.error('구글 로그인 오류:', error)
      setError('구글 로그인 중 오류가 발생했습니다.')
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="w-full px-4" style={{ height: "var(--gnb-height)" }}>
        <div className="max-w-md mx-auto flex items-center gap-4 h-full">
          <Link href="/" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-bold text-black">로그인</h1>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="space-y-2 mb-8">
            <h2 className="font-bold text-center text-2xl">로그인</h2>
            <p className="text-gray-500 text-center text-base">
              가장 편리하고 쉬운 협업 진행과정,
              <br />
              인플루언서와 광고주를 잇다
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="username" className="font-semibold">
                아이디
              </Label>
              <Input 
                id="username" 
                type="text" 
                placeholder="아이디를 입력하세요" 
                className="rounded-xl h-12"
                value={formData.username}
                onChange={handleInputChange("username")}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="font-semibold">
                비밀번호
              </Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="비밀번호를 입력하세요" 
                className="rounded-xl h-12"
                value={formData.password}
                onChange={handleInputChange("password")}
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-gray-300" />
                <span className="text-gray-500">로그인 상태 유지</span>
              </label>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#7b68ee] hover:bg-[#7b68ee]/90 text-white font-semibold rounded-2xl"
              size="lg"
              disabled={isLoading}
              style={{ height: "48px" }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  로그인 중...
                </>
              ) : (
                "로그인"
              )}
            </Button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">또는</span>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              type="button"
              onClick={handleKakaoLogin}
              className="w-full bg-[#FEE500] hover:bg-[#FEE500]/90 text-[#000000] font-semibold rounded-2xl"
              size="lg"
              style={{ height: "48px" }}
              disabled={isLoading}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3C6.477 3 2 6.477 2 10.5c0 2.442 1.443 4.615 3.686 6.143-.21.734-.686 2.385-.786 2.77-.12.462.17.456.358.332.142-.094 2.298-1.55 3.264-2.202.81.144 1.648.22 2.478.22 5.523 0 10-3.477 10-7.763S17.523 3 12 3z" />
              </svg>
              카카오로 로그인하기
            </Button>

            <Button
              type="button"
              onClick={handleGoogleLogin}
              variant="outline"
              className="w-full border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-2xl bg-transparent"
              size="lg"
              style={{ height: "48px" }}
              disabled={isLoading}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.43-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              구글로 로그인하기
            </Button>
          </div>

          {/* ✅ 수정된 부분: URL 파라미터에 따라 다른 회원가입 페이지로 이동 */}
          <div className="text-center text-sm mt-6">
            <p className="text-gray-500">
              아직 계정이 없으신가요?{" "}
              <Link href={signupLink} className="text-[#7b68ee] font-semibold hover:underline">
                {signupText}
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}