"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AdvertiserOnboardingModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AdvertiserOnboardingModal({ isOpen, onClose }: AdvertiserOnboardingModalProps) {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    if (isOpen) {
      setCurrentSlide(0)
    }
  }, [isOpen])

  const slides = [
    {
      illustration: "/3d-animation-rocket.jpg",
      title: "기다림 없이, 원하는 사람과 바로",
      subtitle: "광고주 · 인플루언서가 한곳에서 보고 · 고르고 · 제안해요",
    },
    {
      illustration: "/3d-animation-handshake.jpg",
      title: "0% 수수료로 협업을 진행해요.",
      subtitle: "잇다는 인플루언서님과 광고주님을 자유롭게 이어줍니다.",
    },
    {
      illustration: "/3d-animation-search.jpg",
      title: "내 브랜드에 딱 맞는 인플루언서를 찾아보세요",
      subtitle: "카테고리, 팔로워 수, 참여율 등 다양한 필터로 검색할 수 있어요",
    },
    {
      illustration: "/3d-animation-checklist.jpg",
      title: "캠페인을 등록하고 지원자를 관리하세요",
      subtitle: "간편하게 캠페인을 작성하고 지원한 인플루언서를 확인할 수 있어요",
    },
  ]

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1)
    } else {
      localStorage.setItem("influencer_mode", "false")
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white font-sans">
      <button
        onClick={onClose}
        className="absolute top-6 right-6 p-1.5 hover:bg-gray-50 rounded-full transition-colors z-10"
        aria-label="닫기"
      >
        <X className="w-5 h-5 text-gray-400" />
      </button>

      <div className="w-full h-full flex flex-col items-center px-4 pt-32">
        <div className="flex-1 flex flex-col items-center justify-center pt-16">
          <div className="mb-12 animate-float">
            <img
              src={slides[currentSlide].illustration || "/placeholder.svg"}
              alt="Onboarding illustration"
              className="w-28 h-28 object-contain"
            />
          </div>

          <div key={currentSlide} className="animate-fade-in">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-3 text-center font-sans">
              {slides[currentSlide].title}
            </h2>

            <p className="text-base text-gray-600 text-center font-sans">{slides[currentSlide].subtitle}</p>
          </div>
        </div>

        <div className="w-full max-w-md flex flex-col items-center gap-6 pb-12">
          <div className="flex gap-2">
            {slides.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 rounded-full transition-all ${
                  index === currentSlide ? "w-6 bg-[#7b68ee]" : "w-1.5 bg-gray-300"
                }`}
              />
            ))}
          </div>

          <Button
            onClick={handleNext}
            className="w-full h-14 bg-[#7b68ee] hover:bg-[#7b68ee]/90 text-white font-medium text-base rounded-xl font-sans"
          >
            {currentSlide < slides.length - 1 ? "다음으로" : "시작하기"}
          </Button>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  )
}
