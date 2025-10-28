"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface Application {
  id: number
  campaignId: number
  applicationStatus: string
  campaignStatus: string
  campaignStatusColor: string
  title: string
  advertiser: string
  appliedTime: string
  proposalText: string
}

interface ApplicationStore {
  applications: Application[]
  addApplication: (application: Omit<Application, "id">) => number
  removeApplication: (id: number) => void
  getApplications: () => Application[]
}

export const useApplicationStore = create<ApplicationStore>()(
  persist(
    (set, get) => ({
      applications: [],
      addApplication: (application) => {
        const newId = Date.now()
        const newApplication = {
          ...application,
          id: newId,
        }
        set((state) => ({
          applications: [newApplication, ...state.applications],
        }))
        return newId
      },
      removeApplication: (id) => {
        set((state) => ({
          applications: state.applications.filter((app) => app.id !== id),
        }))
      },
      getApplications: () => get().applications,
    }),
    {
      name: "application-storage",
    },
  ),
)
