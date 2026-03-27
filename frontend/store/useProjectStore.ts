import { create } from 'zustand';

export type WorkspaceType = 'idea' | 'edit' | 'visual' | 'audio' | 'export';

export interface Storyboard {
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
  isLoading: boolean;
  
  // Actions
  setWorkspace: (workspace: WorkspaceType) => void;
  addStoryboard: (storyboard: Storyboard) => void;
  addSoundtrack: (soundtrack: Soundtrack) => void;
  loadInitialAssets: (projectId: string) => Promise<void>;
}

const API_BASE_URL = 'https://epicdreams-epic-dreams-backend.hf.space';
const API_KEY = 'epic_dreams_secret_2026';

export const useProjectStore = create<ProjectState>((set) => ({
  activeWorkspace: 'edit',
  storyboards: [],
  soundtracks: [],
  isLoading: false,

  setWorkspace: (workspace) => set({ activeWorkspace: workspace }),
  
  addStoryboard: (storyboard) => set((state) => ({
    storyboards: [...state.storyboards.filter(s => s.sceneId !== storyboard.sceneId), storyboard]
  })),

  addSoundtrack: (soundtrack) => set((state) => ({
    soundtracks: [...state.soundtracks, soundtrack]
  })),

  loadInitialAssets: async (projectId) => {
    set({ isLoading: true });
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/projects/${projectId}/assets`, {
        headers: { 'X-API-Key': API_KEY }
      });
      const data = await response.json();
      set({ 
        storyboards: data.storyboards || [], 
        soundtracks: data.soundtracks || [],
        isLoading: false 
      });
    } catch (err) {
      console.error("Failed to load project assets", err);
      set({ isLoading: false });
    }
  }
}));
