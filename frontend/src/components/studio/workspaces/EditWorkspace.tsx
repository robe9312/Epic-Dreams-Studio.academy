'use client';

import React from 'react';
import { Canvas } from '../../Canvas';
import { Timeline } from '../../Timeline';
import { AIWorkbench } from '../../AIWorkbench';
import { ClipEditor } from '../../ClipEditor';

export const EditWorkspace: React.FC = () => {
    return (
        <div className="flex-1 flex overflow-hidden relative">
            {/* Visual Monitor Canvas */}
            <Canvas />
            
            {/* Right Side Panels: AI Orchestrator & Properties */}
            <div className="w-96 flex flex-col border-l border-[#1a1a1a] bg-[#0a0a0a] z-40 p-2 space-y-2">
                <div className="flex-1">
                    <AIWorkbench />
                </div>
                <div className="h-auto">
                    <ClipEditor />
                </div>
            </div>

            {/* Cinematic Timeline (Fixed to bottom in this workspace) */}
            <div className="absolute bottom-0 left-0 right-0 h-[300px] border-t border-[#1a1a1a] bg-[#050505] z-50">
                <Timeline />
            </div>
        </div>
    );
};
