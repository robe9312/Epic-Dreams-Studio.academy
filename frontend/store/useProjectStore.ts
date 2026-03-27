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
  
  // Actions
  setWorkspace: (workspace: WorkspaceType) => void;
  addStoryboard: (storyboard: Storyboard) => void;
  addSoundtrack: (soundtrack: Soundtrack) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  activeWorkspace: 'edit', // Default to edit to show existing work
  storyboards: [],
  soundtracks: [],

  setWorkspace: (workspace) => set({ activeWorkspace: workspace }),
  
  addStoryboard: (storyboard) => set((state) => ({
    storyboards: [...state.storyboards.filter(s => s.sceneId !== storyboard.sceneId), storyboard]
  })),

  addSoundtrack: (soundtrack) => set((state) => ({
    soundtracks: [...state.soundtracks, soundtrack]
  })),
}));
