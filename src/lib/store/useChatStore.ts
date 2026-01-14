import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface ChatState {
  isOpen: boolean
  toggleChat: () => void
  sessionId: string
  setSessionId: (id: string) => void
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      isOpen: false,
      toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),
      sessionId: '', // Starts empty, but persist will fill it if saved
      setSessionId: (id) => set({ sessionId: id }),
    }),
    {
      name: 'lase-chat-storage', // unique name in LocalStorage
      storage: createJSONStorage(() => localStorage),
    }
  )
)