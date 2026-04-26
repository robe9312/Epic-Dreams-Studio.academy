import { create } from 'zustand';

export type WorkspaceType = 'idea' | 'edit' | 'visual' | 'audio' | 'export';

export interface Storyboard {
  id: string;        // unique per frame
  sceneId: string;
  imageUrl: string;
  prompt: string;
}

export interface Soundtrack {
  id: string;
  audioUrl: string;
  description: string;
  type: 'music' | 'sfx';
}

interface ProjectState {
  activeWorkspace: WorkspaceType;
  storyboards: Storyboard[];
  soundtracks: Soundtrack[];
  currentProjectId: string;
  currentSceneId: string;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setWorkspace: (workspace: WorkspaceType) => void;
  addStoryboard: (storyboard: Omit<Storyboard, 'id'>) => void;
  removeStoryboard: (id: string) => void;
  addSoundtrack: (soundtrack: Soundtrack) => void;
  setError: (error: string | null) => void;
  loadInitialAssets: (projectId: string) => Promise<void>;
  setProjectIds: (projectId: string, sceneId: string) => void;
}

const API_BASE_URL = 'https://epicdreams-epic-dreams-backend.hf.space';
const API_KEY = 'epic_dreams_secret_2026';

export const useProjectStore = create<ProjectState>((set) => ({
  activeWorkspace: 'edit',
  storyboards: [],
  soundtracks: [],
  // Default placeholder UUIDs (should be updated on project load)
  currentProjectId: '00000000-0000-0000-0000-000000000000',
  currentSceneId: '00000000-0000-0000-0000-000000000000',
  isLoading: false,
  error: null,

  setWorkspace: (workspace) => set({ activeWorkspace: workspace }),
  setError: (error) => set({ error }),
  setProjectIds: (projectId, sceneId) => set({ currentProjectId: projectId, currentSceneId: sceneId }),

  // Accumulate ALL frames with a unique ID each — never overwrite
  addStoryboard: (storyboard) => set((state) => ({
    storyboards: [
      ...state.storyboards,
      { ...storyboard, id: `sb-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` }
    ],
    error: null,
  })),

  removeStoryboard: (id) => set((state) => ({
    storyboards: state.storyboards.filter(s => s.id !== id)
  })),

  addSoundtrack: (soundtrack) => set((state) => ({
    soundtracks: [...state.soundtracks, soundtrack]
  })),

  loadInitialAssets: async (projectId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/projects/${projectId}/assets`, {
        headers: { 'X-API-Key': API_KEY }
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      set({ 
        storyboards: data.storyboards || [], 
        soundtracks: data.soundtracks || [],
        isLoading: false 
      });
    } catch (err) {
      console.error("Failed to load project assets", err);
      set({ isLoading: false, error: 'Failed to load project assets' });
    }
  }
}));
