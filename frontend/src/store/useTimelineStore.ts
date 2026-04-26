import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

// ============================================================================
// TYPES ENHANCED
// ============================================================================

export type TrackType = 'narrative' | 'visual' | 'technical' | 'training' | string;

export type ClipType = 'video' | 'audio' | 'text' | 'effect' | 'image';

export interface Clip {
  id: string;
  track: TrackType;
  startTime: number;
  endTime: number;
  content: string;
  videoId?: string;
  type?: ClipType;
  thumbnail?: string;
  muted?: boolean; // Para clips de audio
  locked?: boolean; // Prevenir edición accidental
}

export interface TrackConfig {
  id: TrackType;
  name: string;
  color: string;
  visible: boolean;
  collapsed: boolean;
  type: ClipType;
}

export type HistoryAction =
  | { type: 'ADD_CLIP'; clip: Clip; track: TrackType }
  | { type: 'REMOVE_CLIP'; clip: Clip; track: TrackType }
  | { type: 'UPDATE_CLIP'; clipId: string; track: TrackType; before: Clip; after: Clip }
  | { type: 'MOVE_CLIP'; clipId: string; fromTrack: TrackType; toTrack: TrackType; before: Clip; after: Clip };

export interface HistoryEntry {
  action: HistoryAction;
  timestamp: number;
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
  trackConfigs: Record<TrackType, TrackConfig>;
  isDragging: boolean;
  feasibilityScore: number;
  logs: AgentLog[];
  scale: number; // Pixels per second
  scrollX: number; // Viewport horizontal offset
  selectedClipId: string | null;
  activeAdvice: { agent: string; message: string } | null;
  snappingEnabled: boolean;
  rippleEditEnabled: boolean;

  // Undo/Redo System
  history: HistoryEntry[];
  historyIndex: number;
  maxHistorySize: number;

  // Acciones básicas
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
  updateClip: (track: TrackType, clipId: string, partial: Partial<Clip>, skipHistory?: boolean) => void;
  moveClip: (fromTrack: TrackType, toTrack: TrackType, clipId: string, newStartTime: number) => void;
  appendClipAtPlayhead: (track: TrackType, duration: number, content: string, videoId?: string) => string;

  // Undo/Redo Actions
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // Track Management
  addTrack: (trackId: string, config: Partial<TrackConfig>) => void;
  removeTrack: (trackId: string) => void;
  updateTrackConfig: (trackId: string, config: Partial<TrackConfig>) => void;
}

// ============================================================================
// CONFIG & UTILS
// ============================================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://epicdreams-epic-dreams-backend.hf.space';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY; // ⚠️ Debe estar en .env.local

const pushToHistory = (
  state: TimelineState,
  action: HistoryAction
): { history: HistoryEntry[]; historyIndex: number } => {
  const newHistory = state.history.slice(0, state.historyIndex + 1);

  // Limitar tamaño del historial
  if (newHistory.length >= state.maxHistorySize) {
    newHistory.shift();
  }

  newHistory.push({
    action,
    timestamp: Date.now()
  });

  return {
    history: newHistory,
    historyIndex: newHistory.length - 1
  };
};

const syncClipWithCloud = async (clipId: string, partial: Partial<Clip>) => {
  if (!API_KEY) {
    console.warn('API_KEY no configurada. Skipping cloud sync.');
    return;
  }

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

export const useTimelineStore = create<TimelineState>()(
  (set, get) => ({
  // Estado inicial
  playhead: 0,
  isDragging: false,
  tracks: {
    narrative: [],
    visual: [],
    technical: [],
    training: [],
  },
  trackConfigs: {
    narrative: { id: 'narrative', name: 'Narrativa', color: '#ef4444', visible: true, collapsed: false, type: 'video' },
    visual: { id: 'visual', name: 'Visual', color: '#3b82f6', visible: true, collapsed: false, type: 'video' },
    technical: { id: 'technical', name: 'Técnico', color: '#10b981', visible: true, collapsed: false, type: 'text' },
    training: { id: 'training', name: 'Entrenamiento', color: '#f59e0b', visible: true, collapsed: false, type: 'effect' },
  },
  feasibilityScore: 0,
  logs: [],
  scale: 50, // 50 pixels per second default
  scrollX: 0,
  selectedClipId: null,
  activeAdvice: null,
  snappingEnabled: true,
  rippleEditEnabled: false,

  // Undo/Redo inicial
  history: [],
  historyIndex: -1,
  maxHistorySize: 50,

  // Acciones básicas
  setPlayhead: (time: number) => set({ playhead: Math.max(0, time) }),

  setTracks: (tracks: Record<string, Clip[]>) => set({ tracks }),

  addClip: (track: string, clip: Clip) => {
    const state = get();
    const historyUpdate = pushToHistory(state, { type: 'ADD_CLIP', clip, track });

    set((state) => ({
      tracks: {
        ...state.tracks,
        [track]: [...state.tracks[track], clip].sort((a, b) => a.startTime - b.startTime),
      },
      ...historyUpdate
    }));
  },

  removeClip: (track: string, clipId: string) => {
    const state = get();
    const clipToRemove = state.tracks[track].find(c => c.id === clipId);
    if (!clipToRemove) return;

    const historyUpdate = pushToHistory(state, { type: 'REMOVE_CLIP', clip: clipToRemove, track });

    set((state) => ({
      tracks: {
        ...state.tracks,
        [track]: state.tracks[track].filter((c) => c.id !== clipId),
      },
      ...historyUpdate
    }));
  },

  setDragging: (dragging: boolean) => set({ isDragging: dragging }),

  setFeasibilityScore: (score: number) => set({ feasibilityScore: score }),

  addLog: (log: Omit<AgentLog, 'id' | 'timestamp'>) => set((state) => ({
    logs: [
      {
        ...log,
        id: Math.random().toString(36).substring(7),
        timestamp: new Date().toLocaleTimeString()
      },
      ...state.logs
    ]
  })),

  setScale: (scale: number) => set({ scale: Math.max(5, Math.min(2000, scale)) }),
  setScrollX: (scrollX: number) => set({ scrollX: Math.max(0, scrollX) }),

  setSelectedClip: (id: string | null) => set({ selectedClipId: id }),
  setAdvice: (advice: { agent: string; message: string } | null) => set({ activeAdvice: advice }),
  toggleSnapping: () => set((state) => ({ snappingEnabled: !state.snappingEnabled })),
  toggleRippleEdit: () => set((state) => ({ rippleEditEnabled: !state.rippleEditEnabled })),

  updateClipContent: (track: TrackType, clipId: string, content: string) => {
    const state = get();
    const clip = state.tracks[track].find(c => c.id === clipId);
    if (!clip) return;

    const historyUpdate = pushToHistory(state, {
      type: 'UPDATE_CLIP',
      clipId,
      track,
      before: { ...clip },
      after: { ...clip, content }
    });

    set((state) => ({
      tracks: {
        ...state.tracks,
        [track]: state.tracks[track].map(c => c.id === clipId ? { ...c, content } : c)
      },
      ...historyUpdate
    }));
  },

  updateClip: (track: TrackType, clipId: string, partial: Partial<Clip>, skipHistory: boolean = false) => {
    const state = get();
    const clip = state.tracks[track].find(c => c.id === clipId);

    if (!clip) return;

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

    let historyUpdate = {};
    if (!skipHistory && clip) {
      const finalClip = updatedClips.find(c => c.id === clipId);
      if (finalClip) {
        historyUpdate = pushToHistory(state, {
          type: 'UPDATE_CLIP',
          clipId,
          track,
          before: { ...clip },
          after: finalClip
        });
      }
    }

    set((state) => ({
      tracks: {
        ...state.tracks,
        [track]: updatedClips.sort((a, b) => a.startTime - b.startTime)
      },
      ...historyUpdate
    }));
  },

  moveClip: (fromTrack: TrackType, toTrack: TrackType, clipId: string, newStartTime: number) => {
    const state = get();
    const clip = state.tracks[fromTrack].find(c => c.id === clipId);
    if (!clip) return;

    const duration = clip.endTime - clip.startTime;
    const movedClip: Clip = {
      ...clip,
      track: toTrack,
      startTime: Math.max(0, newStartTime),
      endTime: Math.max(0, newStartTime) + duration
    };

    // Quitar de pista origen
    const sourceCleanup = state.tracks[fromTrack].filter(c => c.id !== clipId);

    let finalUpdate;

    // Si es la misma pista, solo actualizamos el array filtrado
    if (fromTrack === toTrack) {
      finalUpdate = {
        tracks: {
          ...state.tracks,
          [toTrack]: [...sourceCleanup, movedClip].sort((a, b) => a.startTime - b.startTime)
        }
      };
    } else {
      // Si es distinta pista
      finalUpdate = {
        tracks: {
          ...state.tracks,
          [fromTrack]: sourceCleanup,
          [toTrack]: [...state.tracks[toTrack], movedClip].sort((a, b) => a.startTime - b.startTime)
        }
      };
    }

    // Push to history
    const historyUpdate = pushToHistory(state, {
      type: 'MOVE_CLIP',
      clipId,
      fromTrack,
      toTrack,
      before: { ...clip },
      after: movedClip
    });

    // Sync with cloud (incluyendo cambio de track)
    syncClipWithCloud(clipId, {
      startTime: movedClip.startTime,
      endTime: movedClip.endTime,
      track: toTrack
    });

    set(() => ({
      ...finalUpdate,
      ...historyUpdate
    }));
  },

  appendClipAtPlayhead: (track: TrackType, duration: number, content: string, videoId?: string) => {
    const newId = Math.random().toString(36).substring(7);
    const state = get();

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

    const historyUpdate = pushToHistory(state, { type: 'ADD_CLIP', clip: newClip, track });

    set((state) => ({
      tracks: {
        ...state.tracks,
        [track]: [...state.tracks[track], newClip].sort((a, b) => a.startTime - b.startTime),
      },
      ...historyUpdate
    }));
    return newId;
  },

  // ============================================================================
  // UNDO / REDO SYSTEM
  // ============================================================================

  undo: () => {
    const state = get();
    if (state.historyIndex < 0) return;

    const entry = state.history[state.historyIndex];
    if (!entry) return;

    switch (entry.action.type) {
      case 'ADD_CLIP': {
        // Deshacer añadir = eliminar el clip
        set((s) => ({
          tracks: {
            ...s.tracks,
            [entry.action.track]: s.tracks[entry.action.track].filter(c => c.id !== entry.action.clip.id)
          },
          historyIndex: state.historyIndex - 1
        }));
        break;
      }

      case 'REMOVE_CLIP': {
        // Deshacer eliminar = volver a añadir el clip
        set((s) => ({
          tracks: {
            ...s.tracks,
            [entry.action.track]: [...s.tracks[entry.action.track], entry.action.clip].sort((a, b) => a.startTime - b.startTime)
          },
          historyIndex: state.historyIndex - 1
        }));
        break;
      }

      case 'UPDATE_CLIP': {
        // Deshacer actualización = restaurar estado anterior
        const { clipId, track, before } = entry.action;
        set((s) => ({
          tracks: {
            ...s.tracks,
            [track]: s.tracks[track].map(c => c.id === clipId ? before : c).sort((a, b) => a.startTime - b.startTime)
          },
          historyIndex: state.historyIndex - 1
        }));
        break;
      }

      case 'MOVE_CLIP': {
        // Deshacer movimiento = volver a la posición original
        const { clipId, fromTrack, toTrack, before } = entry.action;
        const clipInToTrack = state.tracks[toTrack].find(c => c.id === clipId);
        if (!clipInToTrack) break;

        set((s) => ({
          tracks: {
            ...s.tracks,
            [toTrack]: s.tracks[toTrack].filter(c => c.id !== clipId),
            [fromTrack]: [...s.tracks[fromTrack], before].sort((a, b) => a.startTime - b.startTime)
          },
          historyIndex: state.historyIndex - 1
        }));
        break;
      }
    }
  },

  redo: () => {
    const state = get();
    if (state.historyIndex >= state.history.length - 1) return;

    const nextEntry = state.history[state.historyIndex + 1];
    if (!nextEntry) return;

    switch (nextEntry.action.type) {
      case 'ADD_CLIP': {
        // Rehacer añadir = volver a añadir el clip
        set((s) => ({
          tracks: {
            ...s.tracks,
            [nextEntry.action.track]: [...s.tracks[nextEntry.action.track], nextEntry.action.clip].sort((a, b) => a.startTime - b.startTime)
          },
          historyIndex: state.historyIndex + 1
        }));
        break;
      }

      case 'REMOVE_CLIP': {
        // Rehacer eliminar = volver a eliminar el clip
        set((s) => ({
          tracks: {
            ...s.tracks,
            [nextEntry.action.track]: s.tracks[nextEntry.action.track].filter(c => c.id !== nextEntry.action.clip.id)
          },
          historyIndex: state.historyIndex + 1
        }));
        break;
      }

      case 'UPDATE_CLIP': {
        // Rehacer actualización = aplicar estado posterior
        const { clipId, track, after } = nextEntry.action;
        set((s) => ({
          tracks: {
            ...s.tracks,
            [track]: s.tracks[track].map(c => c.id === clipId ? after : c).sort((a, b) => a.startTime - b.startTime)
          },
          historyIndex: state.historyIndex + 1
        }));
        break;
      }

      case 'MOVE_CLIP': {
        // Rehacer movimiento = volver a mover a la posición destino
        const { clipId, fromTrack, toTrack, after } = nextEntry.action;
        const clipInFromTrack = state.tracks[fromTrack].find(c => c.id === clipId);
        if (!clipInFromTrack) break;

        set((s) => ({
          tracks: {
            ...s.tracks,
            [fromTrack]: s.tracks[fromTrack].filter(c => c.id !== clipId),
            [toTrack]: [...s.tracks[toTrack], after].sort((a, b) => a.startTime - b.startTime)
          },
          historyIndex: state.historyIndex + 1
        }));
        break;
      }
    }
  },

  canUndo: () => {
    const state = get();
    return state.historyIndex >= 0;
  },

  canRedo: () => {
    const state = get();
    return state.historyIndex < state.history.length - 1;
  },

  // ============================================================================
  // TRACK MANAGEMENT
  // ============================================================================

  addTrack: (trackId: string, config: Partial<TrackConfig>) => {
    const state = get();

    if (state.tracks[trackId]) {
      console.warn(`Track ${trackId} already exists`);
      return;
    }

    const defaultConfig: TrackConfig = {
      id: trackId,
      name: trackId.charAt(0).toUpperCase() + trackId.slice(1),
      color: '#6b7280',
      visible: true,
      collapsed: false,
      type: 'video'
    };

    set((s) => ({
      tracks: {
        ...s.tracks,
        [trackId]: []
      },
      trackConfigs: {
        ...s.trackConfigs,
        [trackId]: { ...defaultConfig, ...config }
      }
    }));
  },

  removeTrack: (trackId: string) => {
    const state = get();

    if (!state.tracks[trackId]) {
      console.warn(`Track ${trackId} does not exist`);
      return;
    }

    // No permitir eliminar las 4 pistas base
    const baseTracks = ['narrative', 'visual', 'technical', 'training'];
    if (baseTracks.includes(trackId)) {
      console.warn('Cannot remove base tracks');
      return;
    }

    set((s) => {
      const { [trackId]: _, ...remainingTracks } = s.tracks;
      const { [trackId]: __, ...remainingConfigs } = s.trackConfigs;

      return {
        tracks: remainingTracks,
        trackConfigs: remainingConfigs
      };
    });
  },

  updateTrackConfig: (trackId: string, config: Partial<TrackConfig>) => {
    set((s) => ({
      trackConfigs: {
        ...s.trackConfigs,
        [trackId]: { ...s.trackConfigs[trackId], ...config }
      }
    }));
  },
}) as any);