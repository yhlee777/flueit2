"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface ViewedProfile {
  id: number
  name: string
  followers: string
  followersDisplay: string
  engagement: string
  category: string
  region: string
  avatar: string
  verified: boolean
  hashtags: string[]
  viewedAt: number // timestamp
}

export interface ViewedCampaign {
  id: number
  title: string
  location: string
  reward: string
  thumbnail: string
  category: string
  company?: string
  visitType?: "visit" | "non-visit"
  viewedAt: number // timestamp
}

interface ViewHistoryState {
  viewedProfiles: ViewedProfile[]
  viewedCampaigns: ViewedCampaign[] // Added viewedCampaigns array
  addViewedProfile: (profile: Omit<ViewedProfile, "viewedAt">) => void
  addViewedCampaign: (campaign: Omit<ViewedCampaign, "viewedAt">) => void // Added function to track campaign views
  clearHistory: () => void
  clearCampaignHistory: () => void // Added function to clear campaign history
  getRecentProfiles: () => ViewedProfile[]
  getRecentCampaigns: () => ViewedCampaign[] // Added function to get recent campaigns
}

export const useViewHistory = create<ViewHistoryState>()(
  persist(
    (set, get) => ({
      viewedProfiles: [],
      viewedCampaigns: [], // Initialize empty campaigns array

      addViewedProfile: (profile) => {
        set((state) => {
          // Remove existing entry if profile was viewed before
          const filtered = state.viewedProfiles.filter((p) => p.id !== profile.id)

          // Add new entry at the beginning with current timestamp
          const newProfile: ViewedProfile = {
            ...profile,
            viewedAt: Date.now(),
          }

          // Keep only last 100 viewed profiles
          const updated = [newProfile, ...filtered].slice(0, 100)

          return { viewedProfiles: updated }
        })
      },

      addViewedCampaign: (campaign) => {
        set((state) => {
          // Remove existing entry if campaign was viewed before
          const filtered = state.viewedCampaigns.filter((c) => c.id !== campaign.id)

          // Add new entry at the beginning with current timestamp
          const newCampaign: ViewedCampaign = {
            ...campaign,
            viewedAt: Date.now(),
          }

          const updated = [newCampaign, ...filtered].slice(0, 20)

          return { viewedCampaigns: updated }
        })
      },

      clearHistory: () => {
        set({ viewedProfiles: [] })
      },

      clearCampaignHistory: () => {
        set({ viewedCampaigns: [] })
      },

      getRecentProfiles: () => {
        return get().viewedProfiles.sort((a, b) => b.viewedAt - a.viewedAt)
      },

      getRecentCampaigns: () => {
        return get().viewedCampaigns.sort((a, b) => b.viewedAt - a.viewedAt)
      },
    }),
    {
      name: "view-history-storage",
    },
  ),
)
