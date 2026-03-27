'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Save } from 'lucide-react';

export const IdeaWorkspace: React.FC = () => {
    const [script, setScript] = useState('# Act 1\n\nINT. SPACE STATION - DAY\n\nA lonely astronaut looks through the window...');

    return (
        <div className="flex-1 flex bg-[#050505] overflow-hidden">
            {/* Left: Script Editor */}
            <div className="flex-1 flex flex-col border-r border-[#1a1a1a]">
                <div className="h-10 border-b border-[#1a1a1a] flex items-center justify-between px-4 bg-[#0a0a0a]">
                    <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">SCRIPT ENGINE / FOUNTAIN</span>
                    <button className="flex items-center space-x-1 text-red-500 hover:text-red-400 text-[10px] font-bold">
                        <Save size={12} />
                        <span>SAVE CLOUD</span>
                    </button>
                </div>
                <textarea 
                    value={script}
                    onChange={(e) => setScript(e.target.value)}
                    title="Script Content"
                    placeholder="Escribe tu guion aquí..."
                    className="flex-1 p-8 bg-transparent text-gray-300 font-mono text-sm focus:outline-none resize-none leading-relaxed"
                />
            </div>

            {/* Right: AI Brain Assistants */}
            <div className="w-96 bg-[#080808] p-6 flex flex-col space-y-6">
                <div>
                    <h2 className="text-sm font-bold tracking-wider mb-2 flex items-center">
                        <Sparkles size={16} className="text-red-500 mr-2" />
                        GROQ AI MENTOR
                    </h2>
                    <p className="text-xs text-gray-500 leading-relaxed">
                        I'm analyzing your script. Should we add more tension to the space walk scene?
                    </p>
                </div>

                <div className="flex-1 flex flex-col bg-[#050505] border border-[#1a1a1a] rounded-lg overflow-hidden">
                    <div className="flex-1 p-4 overflow-y-auto text-[11px] text-gray-400 font-mono space-y-4">
                        <div className="bg-[#111] p-3 rounded-md">
                            <span className="text-red-500 font-bold block mb-1">[AI Assistant]</span>
                            Based on your scene, I suggest using a "Close-up" for the astronaut's reaction to emphasize isolation.
                        </div>
                    </div>
                    <div className="p-2 border-t border-[#1a1a1a]">
                        <input 
                            type="text" 
                            placeholder="Ask AI to expand scene..."
                            className="w-full bg-[#0a0a0a] border border-[#222] rounded px-3 py-2 text-xs focus:outline-none focus:border-red-500"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
