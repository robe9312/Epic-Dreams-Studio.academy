'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Save, Send, Loader2, Workflow } from 'lucide-react';
import { useTimelineStore } from '../../../store/useTimelineStore';

export const IdeaWorkspace: React.FC = () => {
    const [script, setScript] = useState('# Act 1\n\nINT. SPACE STATION - DAY\n\nA lonely astronaut looks through the window...\n\nEXT. DEEP SPACE - CONTINUOUS\n\nThe vastness of the universe unfolds.');
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<{role: 'ai' | 'user', text: string}[]>([
        { role: 'ai', text: 'I\'m analyzing your script. OpenFang is ready to orchestrate scenes to the Timeline.' }
    ]);
    const [isStreaming, setIsStreaming] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const { setTracks, addLog } = useTimelineStore();

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async () => {
        if (!input.trim() || isStreaming) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setIsStreaming(true);
        
        setMessages(prev => [...prev, { role: 'ai', text: '' }]);
        
        setTimeout(() => {
            setMessages(prev => {
                const newMsgs = [...prev];
                newMsgs[newMsgs.length - 1].text = "I've analyzed your request. I suggest focusing on the character's internal monologue during the transition to the next scene to increase depth.";
                return newMsgs;
            });
            setIsStreaming(false);
        }, 1500);
    };

    const handleSyncTimeline = async () => {
        if (!script.trim() || isSyncing) return;
        setIsSyncing(true);
        
        // Simulating OpenFang Agent OS orchestration parsing scenes and measuring times
        setMessages(prev => [...prev, { role: 'ai', text: '[OpenFang Agent] Orchestrating script scenes... Measuring pacing and allocating timeline tracks.' }]);

        setTimeout(() => {
            // Very basic simulation of OpenFang parsing scenes (e.g. separated by \n\n)
            const blocks = script.split('\n\n').filter(b => b.trim().length > 0);
            
            const narrativeClips = [];
            let currentTime = 0;

            blocks.forEach((block, idx) => {
                // Simulated OpenFang AI measurement logic:
                // Scene headings (INT/EXT) get 3 seconds to establish.
                // Action lines get 1 second per 5 words.
                let duration = 5; // default
                if (block.startsWith('INT.') || block.startsWith('EXT.')) {
                    duration = 3;
                } else {
                    const wordCount = block.split(' ').length;
                    duration = Math.max(2, Math.ceil(wordCount / 2)); // cinematic slower pacing
                }

                narrativeClips.push({
                    id: `scene_block_${idx}_${Math.random().toString(36).substring(7)}`,
                    track: 'narrative',
                    startTime: currentTime,
                    endTime: currentTime + duration,
                    content: block.length > 50 ? block.substring(0, 47) + '...' : block,
                    type: 'text'
                });
                
                currentTime += duration;
            });

            // Update global timeline store
            setTracks({
                narrative: narrativeClips,
                visual: [],
                technical: [],
                training: []
            });

            addLog({
                agent: 'OpenFang Orchestrator',
                message: `Successfully mapped ${blocks.length} scenes to the timeline. Total duration: ${currentTime}s.`,
                type: 'success'
            });

            setMessages(prev => [...prev, { role: 'ai', text: `[OpenFang Agent] Timeline successfully orchestrated! ${blocks.length} scenes mapped. Switch to the Edit Workspace to review.` }]);
            setIsSyncing(false);
        }, 2000);
    };

    return (
        <div className="flex-1 flex bg-[#050505] overflow-hidden">
            {/* Left: Script Editor */}
            <div className="flex-1 flex flex-col border-r border-[#1a1a1a]">
                <div className="h-10 border-b border-[#1a1a1a] flex items-center justify-between px-4 bg-[#0a0a0a]">
                    <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">SCRIPT ENGINE / FOUNTAIN</span>
                    <div className="flex space-x-4">
                        <button 
                            onClick={handleSyncTimeline}
                            disabled={isSyncing}
                            className="flex items-center space-x-1 text-blue-500 hover:text-blue-400 text-[10px] font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                        >
                            {isSyncing ? <Loader2 size={12} className="animate-spin" /> : <Workflow size={12} />}
                            <span>SYNC TO TIMELINE (OPENFANG)</span>
                        </button>
                        <button className="flex items-center space-x-1 text-red-500 hover:text-red-400 text-[10px] font-bold transition-all hover:scale-105 active:scale-95">
                            <Save size={12} />
                            <span>SAVE CLOUD</span>
                        </button>
                    </div>
                </div>
                <textarea 
                    value={script}
                    onChange={(e) => setScript(e.target.value)}
                    title="Script Content"
                    placeholder="Escribe tu guion aquí..."
                    className="flex-1 p-8 bg-transparent text-gray-300 font-mono text-sm focus:outline-none resize-none leading-relaxed selection:bg-red-500/30"
                />
            </div>

            {/* Right: AI Brain Assistants */}
            <div className="w-96 bg-[#080808] p-6 flex flex-col space-y-6">
                <div>
                    <h2 className="text-sm font-bold tracking-wider mb-2 flex items-center">
                        <Sparkles size={16} className="text-red-500 mr-2" />
                        GROQ AI MENTOR
                    </h2>
                    <p className="text-[10px] text-gray-500 leading-relaxed uppercase tracking-tighter border-l-2 border-red-900 pl-2">
                        OpenFang Agent OS / Scene Orchestrator
                    </p>
                </div>

                <div className="flex-1 flex flex-col bg-[#050505] border border-[#1a1a1a] rounded-lg overflow-hidden shadow-2xl shadow-black">
                    <div 
                        ref={scrollRef}
                        className="flex-1 p-4 overflow-y-auto text-[11px] font-mono space-y-4 scrollbar-hide"
                    >
                        {messages.map((msg, i) => (
                            <motion.div 
                                initial={{ opacity: 0, x: msg.role === 'ai' ? -10 : 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                key={i} 
                                className={`${msg.role === 'ai' ? 'bg-[#111] border-l-2 border-red-500' : 'bg-[#1a1a1a] text-right'} p-3 rounded-md`}
                            >
                                <span className={`text-[9px] font-bold block mb-1 ${msg.role === 'ai' ? 'text-red-500' : 'text-gray-400'}`}>
                                    [{msg.role === 'ai' ? 'AI MENTOR' : 'DIRECTOR'}]
                                </span>
                                <span className="text-gray-300 leading-normal">
                                    {msg.text}
                                    {isStreaming && i === messages.length - 1 && msg.role === 'ai' && (
                                        <motion.span animate={{ opacity: [0, 1] }} transition={{ repeat: Infinity, duration: 0.5 }}>|</motion.span>
                                    )}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                    
                    <div className="p-3 border-t border-[#1a1a1a] bg-[#0a0a0a] flex space-x-2">
                        <input 
                            type="text" 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder="Ask AI to expand scene..."
                            className="flex-1 bg-[#050505] border border-[#222] rounded px-3 py-2 text-[11px] text-gray-300 focus:outline-none focus:border-red-500 transition-colors"
                        />
                        <button 
                            onClick={handleSendMessage}
                            disabled={isStreaming || isSyncing}
                            className="bg-red-600 hover:bg-red-500 disabled:bg-gray-800 text-white p-2 rounded transition-all active:scale-90"
                        >
                            {isStreaming ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
