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
  activeAdvice: { agent: string; message: string } | null;
  snappingEnabled: boolean;
  rippleEditEnabled: boolean;

  
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
  setAdvice: (advice: { agent: string; message: string } | null) => void;
  toggleSnapping: () => void;
  toggleRippleEdit: () => void;
  updateClipContent: (track: TrackType, clipId: string, content: string) => void;
  updateClip: (track: TrackType, clipId: string, partial: Partial<Clip>) => void;
  moveClip: (fromTrack: TrackType, toTrack: TrackType, clipId: string, newStartTime: number) => void;
  appendClipAtPlayhead: (track: TrackType, duration: number, content: string, videoId?: string) => string;
}

const API_BASE_URL = 'https://robe9312-epic-dreams-backend.hf.space';
const API_KEY = 'epic_dreams_secret_2026';

const syncClipWithCloud = async (clipId: string, partial: Partial<Clip>) => {
  try {
    await fetch(`${API_BASE_URL}/api/v2/production/clips/${clipId}?api_key=${API_KEY}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(partial),
    });
  } catch (err) {
    console.error("Failed to sync clip with cloud:", err);
  }
};

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
  activeAdvice: null,
  snappingEnabled: true,
  rippleEditEnabled: false,

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
  setAdvice: (advice) => set({ activeAdvice: advice }),
  toggleSnapping: () => set((state) => ({ snappingEnabled: !state.snappingEnabled })),
  toggleRippleEdit: () => set((state) => ({ rippleEditEnabled: !state.rippleEditEnabled })),

  updateClipContent: (track, clipId, content) => set((state) => ({
    tracks: {
      ...state.tracks,
      [track]: state.tracks[track].map(c => c.id === clipId ? { ...c, content } : c)
    }
  })),

  updateClip: (track, clipId, partial) => set((state) => {
    const updatedClips = state.tracks[track].map(c => {
        if (c.id === clipId) {
          const updated = { ...c, ...partial };
          if (updated.endTime < updated.startTime) updated.endTime = updated.startTime + 0.1;
          
          // Sync with cloud (async, don't await)
          syncClipWithCloud(clipId, partial);
          
          return updated;
        }
        return c;
      });

    return {
      tracks: {
        ...state.tracks,
        [track]: updatedClips.sort((a, b) => a.startTime - b.startTime)
      }
    };
  }),

  moveClip: (fromTrack, toTrack, clipId, newStartTime) => set((state) => {
    const clip = state.tracks[fromTrack].find(c => c.id === clipId);
    if (!clip) return state;

    const duration = clip.endTime - clip.startTime;
    const movedClip: Clip = {
      ...clip,
      track: toTrack,
      startTime: Math.max(0, newStartTime),
      endTime: Math.max(0, newStartTime) + duration
    };

    // Quitar de pista origen
    const sourceCleanup = state.tracks[fromTrack].filter(c => c.id !== clipId);
    
    // Si es la misma pista, solo actualizamos el array filtrado
    if (fromTrack === toTrack) {
        return {
            tracks: {
                ...state.tracks,
                [toTrack]: [...sourceCleanup, movedClip].sort((a, b) => a.startTime - b.startTime)
            }
        };
    }

    // Si es distinta pista
    const finalUpdate = {
      tracks: {
        ...state.tracks,
        [fromTrack]: sourceCleanup,
        [toTrack]: [...state.tracks[toTrack], movedClip].sort((a, b) => a.startTime - b.startTime)
      }
    };

    // Sync with cloud (incluyendo cambio de track)
    syncClipWithCloud(clipId, { 
        startTime: movedClip.startTime, 
        endTime: movedClip.endTime, 
        track: toTrack 
    });

    return finalUpdate;
  }),

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
