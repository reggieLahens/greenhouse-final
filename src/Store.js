import { create } from 'zustand'

export const useStore = create((set) => ({
  tshirtColor: 'white',
  setTshirtColor: (color) => set({ tshirtColor: color }),
}))
