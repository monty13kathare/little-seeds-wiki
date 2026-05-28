import { create } from 'zustand';

interface ZenStore {
  isZenMode: boolean;
  setZenMode: (isZenMode: boolean) => void;
  toggleZenMode: () => void;
}

export const useZenStore = create<ZenStore>((set) => ({
  isZenMode: false,
  setZenMode: (isZenMode) => set({ isZenMode }),
  toggleZenMode: () => set((state) => ({ isZenMode: !state.isZenMode })),
}));
