'use client';

import React, { useState } from 'react';
import { Timeline } from '@/components/Timeline';
import { Canvas } from '@/components/Canvas';
import { Inspector } from '@/components/Inspector';
import { motion, AnimatePresence } from 'framer-motion';
import { useTimelineStore } from '@/store/useTimelineStore';

interface SceneContent {
    type: string;
    text?: string;
    character?: string;
    parenthetical?: string;
}

interface Scene {
    heading: string;
    content: SceneContent[];
}

export default function StudioPage() {
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const { setTracks, addLog, setFeasibilityScore } = useTimelineStore();

    const handleGenerate = async () => {
        if (!prompt) return;
        setIsGenerating(true);
        // Clear previous logs if needed
        // setLogs([]); 
        
        try {
            const response = await fetch(`http://localhost:8000/api/v2/production/stream?prompt=${encodeURIComponent(prompt)}`);
            if (!response.body) throw new Error('No response body');

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            
                            if (data.status === 'complete') {
                                // Result event
                                setFeasibilityScore(data.data.score || 95);

                                const firstScene = data.data.parsed_script?.[0];
                                const scriptContent = firstScene 
                                    ? `${firstScene.heading}\n${firstScene.content.map((c: SceneContent) => c.text || c.character).join(' ')}` 
                                    : data.data.script;

                                const scriptClip = { id: 's1', track: 'narrative', content: scriptContent.substring(0, 150) + '...', startTime: 0, endTime: 10 };
                                const visualClip = { id: 'v1', track: 'visual', content: `Visuals for Scene: ${firstScene?.heading || 'Sequence 1'}`, startTime: 0, endTime: 10 };
                                
                                setTracks({
                                    narrative: [scriptClip],
                                    visual: [visualClip],
                                    technical: [],
                                    training: []
                                });
                            } else {
                                // Log event
                                addLog({ 
                                    agent: data.agent || 'Director Agent', 
                                    message: data.message, 
                                    type: 'info' 
                                });
                            }
                        } catch (e: any) {
                            console.error('Error parsing SSE data:', e);
                        }
                    }
                }
            }
        } catch (error: any) {
            addLog({ agent: 'Director Agent', message: 'Orchestration failed. Check backend connectivity.', type: 'error' });
            console.error('Generation failed:', error);
        } finally {
            setIsGenerating(false);
            setPrompt('');
        }
    };

    return (
        <div className="h-screen w-screen bg-[#050505] text-white flex flex-col overflow-hidden font-sans selection:bg-red-500/30">
            {/* Minimalist Top Nav */}
            <header className="h-12 border-b border-[#1a1a1a] flex items-center justify-between px-6 bg-[#080808] z-50">
                <div className="flex items-center space-x-4">
                    <div className="w-6 h-6 bg-red-500 rounded flex items-center justify-center font-bold text-[10px]">ED</div>
                    <h1 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-300">
                        Epic Dreams <span className="text-gray-600">/</span> <span className="text-white">The Last Script</span>
                    </h1>
                </div>
                
                <div className="flex items-center space-x-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    <button className="hover:text-white transition-colors">Project</button>
                    <button className="hover:text-white transition-colors">Export</button>
                    <div className="w-8 h-8 rounded-full bg-[#1a1a1a] border border-[#333] flex items-center justify-center overflow-hidden">
                        <div className="w-full h-full bg-gradient-to-tr from-red-900 to-red-500" />
                    </div>
                </div>
            </header>

            {/* Main Workbench Area */}
            <main className="flex-1 flex overflow-hidden relative">
                <Canvas />
                <Inspector />

                {/* Overlaid AI Prompt Bar */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-40">
                    <div className="bg-[#111]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-2 flex items-center shadow-2xl">
                        <input 
                            value={prompt}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPrompt(e.target.value)}
                            placeholder="Describe your cinematic vision..."
                            className="flex-1 bg-transparent px-4 py-2 text-sm focus:outline-none placeholder:text-gray-600"
                            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleGenerate()}
                        />
                        <button 
                            onClick={handleGenerate}
                            disabled={isGenerating || !prompt}
                            className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                                isGenerating ? 'bg-gray-800 text-gray-500' : 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-500/20'
                            }`}
                        >
                            {isGenerating ? 'Orchestrating...' : 'Run AI Studio'}
                        </button>
                    </div>
                </div>
            </main>

            {/* Cinematic Timeline */}
            <footer className="h-72">
                <Timeline />
            </footer>

            {/* Global Background Effects */}
            <div className="fixed inset-0 pointer-events-none z-[-1]">
               <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-500/5 blur-[120px] rounded-full" />
               <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/5 blur-[100px] rounded-full" />
            </div>
        </div>
    );
}
