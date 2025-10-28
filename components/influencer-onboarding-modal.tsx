"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface InfluencerOnboardingModalProps {
  isOpen: boolean
  onClose: () => void
}

export function InfluencerOnboardingModal({ isOpen, onClose }: InfluencerOnboardingModalProps) {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    if (isOpen) {
      setCurrentSlide(0)
    }
  }, [isOpen])

  const slides = [
    {
      illustration: "/3d-colorful-rocket-launching-upward-with-stars.jpg",
      title: "여러분의 능력을 마음껏 어필하세요",
      subtitle: "프로필 등록 한번으로 광고주님에게 연락이 올 수 있어요",
    },
    {
      illustration: "/3d-friendly-handshake-with-sparkles-and-hearts.jpg",
      title: "0% 수수료로 협업을 진행해요",
      subtitle: "잇다는 인플루언서님과 광고주님을 자유롭게 이어주는 커뮤니티에요",
    },
    {
      illustration: "/3d-magnifying-glass-with-glowing-target-and-stars.jpg",
      title: "기다림은 NO 이젠 적극적으로 어필해요",
      subtitle: "다양한 종류의 캠페인에 참여하고 원하는 협업을 선택할 수도 있어요",
    },
    {
      illustration: "/3d-checklist-clipboard-with-checkmarks-and-confett.jpg",
      title: "캠페인을 등록하고 지원하세요",
      subtitle: "광고주님이 모집글을 올리면, 인플루언서님이 직접 지원할 수도 있어요",
    },
  ]

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1)
    } else {
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
