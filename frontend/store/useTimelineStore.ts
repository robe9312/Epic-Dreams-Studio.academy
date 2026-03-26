import { create } from 'zustand';

export type TrackType = 'narrative' | 'visual' | 'technical' | 'training';

export interface Clip {
  id: string;
  track: TrackType;
  startTime: number;
  endTime: number;
  content: string;
}

export type AgentLog = {
  id: string;
  agent: string;
  message: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
};

interface TimelineState {
  playhead: number;
  tracks: Record<TrackType, Clip[]>;
  isDragging: boolean;
  feasibilityScore: number;
  logs: AgentLog[];
  scale: number; // Pixels per second
  scrollX: number; // Viewport horizontal offset

  
  // Acciones
  setPlayhead: (time: number) => void;
  setTracks: (tracks: Record<TrackType, Clip[]>) => void;
  addClip: (track: TrackType, clip: Clip) => void;
  removeClip: (track: TrackType, clipId: string) => void;
  setDragging: (dragging: boolean) => void;
  setFeasibilityScore: (score: number) => void;
  addLog: (log: Omit<AgentLog, 'id' | 'timestamp'>) => void;
  setScale: (scale: number) => void;
  setScrollX: (scrollX: number) => void;
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
  feasibilityScore: 0,
  logs: [],
  scale: 50, // 50 pixels per second default
  scrollX: 0,

  setPlayhead: (time) => set({ playhead: Math.max(0, time) }),

  setTracks: (tracks) => set({ tracks }),

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

  setFeasibilityScore: (score) => set({ feasibilityScore: score }),

  addLog: (log) => set((state) => ({
    logs: [
      {
        ...log,
        id: Math.random().toString(36).substring(7),
        timestamp: new Date().toLocaleTimeString()
      },
      ...state.logs
    ]
  })),

  setScale: (scale) => set({ scale: Math.max(5, Math.min(2000, scale)) }),
  setScrollX: (scrollX) => set({ scrollX: Math.max(0, scrollX) }),
}));
