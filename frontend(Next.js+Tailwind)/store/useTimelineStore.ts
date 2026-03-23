import { create } from 'zustand';

export type TrackType = 'narrative' | 'visual' | 'technical' | 'training';

export interface Clip {
  id: string;
  track: TrackType;
  startTime: number;
  endTime: number;
  content: string;
}

interface TimelineState {
  playhead: number;
  tracks: Record<TrackType, Clip[]>;
  isDragging: boolean;
  
  // Acciones
  setPlayhead: (time: number) => void;
  addClip: (track: TrackType, clip: Clip) => void;
  removeClip: (track: TrackType, clipId: string) => void;
  setDragging: (dragging: boolean) => void;
}

export const useTimelineStore = create<TimelineState>((set) => ({
  playhead: 0,
  isDragging: false,
  tracks: {
    narrative: [],
    visual: [],
    technical: [],
    training: [],
  },

  setPlayhead: (time) => set({ playhead: Math.max(0, time) }),

  addClip: (track, clip) => set((state) => ({
    tracks: {
      ...state.tracks,
      [track]: [...state.tracks[track], clip].sort((a, b) => a.startTime - b.startTime),
    }
  })),

  removeClip: (track, clipId) => set((state) => ({
    tracks: {
      ...state.tracks,
      [track]: state.tracks[track].filter((c) => c.id !== clipId),
    }
  })),

  setDragging: (dragging) => set({ isDragging: dragging }),
}));
