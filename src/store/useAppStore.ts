import { create } from 'zustand';
import { AiTarget } from '@/lib/ai/Gateway';

interface AppState {
  aiTarget: AiTarget;
  setAiTarget: (target: AiTarget) => void;
  leftPanelOpen: boolean;
  setLeftPanelOpen: (isOpen: boolean) => void;
  toggleLeftPanel: () => void;
  contextTokens: number;
  setContextTokens: (tokens: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
  aiTarget: 'cloud',
  setAiTarget: (target) => set({ aiTarget: target }),
  leftPanelOpen: true,
  setLeftPanelOpen: (isOpen) => set({ leftPanelOpen: isOpen }),
  toggleLeftPanel: () => set((state) => ({ leftPanelOpen: !state.leftPanelOpen })),
  contextTokens: 4096,
  setContextTokens: (tokens) => set({ contextTokens: tokens }),
}));
