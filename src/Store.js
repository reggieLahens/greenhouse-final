import { create } from 'zustand'

export const useStore = create((set) => ({
  isOnboardingComplete: false,
  setOnboardingComplete: (complete) => set({ isOnboardingComplete: complete }),
  insideDancefloor: false,
  setInsideDancefloor: (inside) => set({ insideDancefloor: inside }),
  tshirtColor: 'white',
  setTshirtColor: (color) => set({ tshirtColor: color }),
  spotifyToken: null,
  setSpotifyToken: (token) => set({ spotifyToken: token }),
  isRecordCrateOpen: false,
  setRecordCrateOpen: (isOpen) => set({ isRecordCrateOpen: isOpen }),
  isNearBooth: false,
  setIsNearBooth: (near) => {
    window.isNearBooth = near;
    set({ isNearBooth: near });
  },
  currentTrack: null,
  setCurrentTrack: (track) => set({ currentTrack: track }),
  isPlaying: false,
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  deviceId: null,
  setDeviceId: (id) => set({ deviceId: id }),
}))
