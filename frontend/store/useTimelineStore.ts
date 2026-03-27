import { create } from 'zustand';

export type TrackType = 'narrative' | 'visual' | 'technical' | 'training';

export interface Clip {
  id: string;
  track: TrackType;
  startTime: number;
  endTime: number;
  content: string;
  videoId?: string;
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
  selectedClipId: string | null;

  
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
  setSelectedClip: (id: string | null) => void;
  updateClipContent: (track: TrackType, clipId: string, content: string) => void;
  appendClipAtPlayhead: (track: TrackType, duration: number, content: string, videoId?: string) => string;
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
  selectedClipId: null,

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

  setSelectedClip: (id) => set({ selectedClipId: id }),

  updateClipContent: (track, clipId, content) => set((state) => ({
    tracks: {
      ...state.tracks,
      [track]: state.tracks[track].map(c => c.id === clipId ? { ...c, content } : c)
    }
  })),

  appendClipAtPlayhead: (track, duration, content, videoId) => {
    const newId = Math.random().toString(36).substring(7);
    set((state) => {
      const trackClips = state.tracks[track];
      // Filter clips that end after or exactly at playhead
      const overlappingClips = trackClips.filter(c => c.endTime >= state.playhead);
      
      let startTime = state.playhead;
      if (overlappingClips.length > 0) {
        const maxEndTime = Math.max(...overlappingClips.map(c => c.endTime));
        startTime = Math.max(state.playhead, maxEndTime);
      }

      const newClip: Clip = {
        id: newId,
        track,
        startTime,
        endTime: startTime + duration,
        content,
        videoId
      };

      return {
        tracks: {
          ...state.tracks,
          [track]: [...state.tracks[track], newClip].sort((a, b) => a.startTime - b.startTime),
        }
      };
    });
    return newId;
  },
}));
