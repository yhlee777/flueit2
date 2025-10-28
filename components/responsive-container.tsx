"use client"

import type { ReactNode } from "react"

interface ResponsiveContainerProps {
  children: ReactNode
  aspectRatio?: string // default: "9/16"
  backgroundColor?: string // letterbox background color
  className?: string
}

export function ResponsiveContainer({
  children,
  aspectRatio = "9/16",
  backgroundColor = "#000000",
  className = "",
}: ResponsiveContainerProps) {
  return (
    <div
      className="responsive-container-wrapper"
      style={{
        backgroundColor,
        // @ts-ignore - CSS custom properties
        "--aspect-ratio": aspectRatio,
      }}
    >
      <div className={`responsive-container-content ${className}`}>{children}</div>

      <style jsx>{`
        .responsive-container-wrapper {
          /* Full viewport height with fallbacks */
          height: 100vh;
          height: -webkit-fill-available; /* iOS Safari fallback */
          height: 100dvh; /* Modern dynamic viewport height */
          
          width: 100vw;
          width: 100dvw;
          
          /* Center content */
          display: flex;
          align-items: center;
          justify-content: center;
          
          /* Safe area padding */
          padding-top: env(safe-area-inset-top);
          padding-bottom: env(safe-area-inset-bottom);
          padding-left: env(safe-area-inset-left);
          padding-right: env(safe-area-inset-right);
          
          /* Prevent overflow */
          overflow: hidden;
          
          /* Fixed positioning to ensure full screen */
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
        }

        .responsive-container-content {
          /* Maintain aspect ratio */
          aspect-ratio: var(--aspect-ratio);
          
          /* Fit content without distortion */
          width: 100%;
          height: 100%;
          max-width: 100%;
          max-height: 100%;
          
          /* Scale to fit while maintaining aspect ratio */
          object-fit: contain;
          
          /* Center if smaller than container */
          margin: auto;
          
          /* Ensure content respects aspect ratio */
          display: flex;
          flex-direction: column;
          
          /* Calculate actual dimensions based on available space */
          container-type: size;
        }

        /* Ensure content scales properly on different screen sizes */
        @media (max-aspect-ratio: 9/16) {
          .responsive-container-content {
            width: 100%;
            height: auto;
          }
        }

        @media (min-aspect-ratio: 9/16) {
          .responsive-container-content {
            width: auto;
            height: 100%;
          }
        }

        /* iOS specific fixes */
        @supports (-webkit-touch-callout: none) {
          .responsive-container-wrapper {
            /* iOS Safari specific height fix */
            min-height: -webkit-fill-available;
          }
        }
      `}</style>
    </div>
  )
}
