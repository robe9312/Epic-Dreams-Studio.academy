'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Sparkles, Image as ImageIcon, CheckCircle } from 'lucide-react';
import { useProjectStore } from '../../../store/useProjectStore';
import { useTimelineStore } from '../../../store/useTimelineStore';

// Default duration (seconds) for a storyboard clip in the visual track
const STORYBOARD_CLIP_DURATION = 4;

export const VisualWorkspace: React.FC = () => {
    const { storyboards, addStoryboard } = useProjectStore();
    const { tracks, addClip, addLog } = useTimelineStore();

    const [prompt, setPrompt] = useState('An astronaut floating in space looking at a distant nebula, cinematic lighting, 8k');
    const [isGenerating, setIsGenerating] = useState(false);
    // Track which storyboard frame IDs have already been sent to the timeline
    const [sentFrames, setSentFrames] = useState<Set<number>>(new Set());

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            const response = await fetch('https://epicdreams-epic-dreams-backend.hf.space/api/v1/ai/generate-storyboard', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-API-Key': 'epic_dreams_secret_2026' },
                body: JSON.stringify({ 
                    prompt,
                    scene_id: '953839f3-7734-40ec-8d0e-15032c00183c'
                })
            });
            const data = await response.json();
            if (data.image_url) {
                addStoryboard({
                    sceneId: '953839f3-7734-40ec-8d0e-15032c00183c',
                    imageUrl: data.image_url,
                    prompt
                });
            }
        } catch (err) {
            console.error("Storyboard gen failed", err);
        } finally {
            setIsGenerating(false);
        }
    };

    /**
     * Inserts the storyboard frame into the VISUAL track sequentially:
     * - Finds the endTime of the last clip in the 'visual' track.
     * - Appends the new clip immediately after — no playhead dependency.
     * This prevents any timeline drift or desynchronization.
     */
    const handleUseInEdit = (frame: { imageUrl: string; prompt: string }, frameIdx: number) => {
        const visualClips = tracks['visual'] ?? [];

        // Calculate the insertion point: end of last clip, or 0 if track is empty
        const insertAt = visualClips.length > 0
            ? Math.max(...visualClips.map(c => c.endTime))
            : 0;

        const newClip = {
            id: `storyboard-${Date.now()}-${frameIdx}`,
            track: 'visual' as const,
            startTime: insertAt,
            endTime: insertAt + STORYBOARD_CLIP_DURATION,
            content: frame.prompt,
            type: 'image' as const,
            thumbnail: frame.imageUrl,
        };

        addClip('visual', newClip);

        // Log to the OpenFang agent logs in the Timeline store
        addLog({
            agent: 'OpenFang',
            message: `📸 Storyboard frame appended to Visual track @ ${insertAt.toFixed(1)}s → ${(insertAt + STORYBOARD_CLIP_DURATION).toFixed(1)}s`,
            type: 'success',
        });

        // Mark this frame as sent
        setSentFrames(prev => new Set(prev).add(frameIdx));
    };

    return (
        <div className="flex-1 flex flex-col bg-[#050505] p-6 overflow-y-auto">
            <header className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold tracking-tighter">AI STORYBOARD STAGE</h1>
                    <p className="text-gray-500 text-xs">Generating visual frames with FLUX.1-schnell · Frames auto-append sequentially in the Edit track</p>
                </div>
                
                <div className="flex items-center space-x-3 bg-[#0a0a0a] border border-[#1a1a1a] p-1 rounded-lg">
                    <input 
                        type="text" 
                        value={prompt}
                        title="Storyboard Prompt"
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Describe your scene visually..."
                        className="bg-transparent border-none focus:outline-none px-4 text-xs w-96 text-gray-300"
                    />
                    <button 
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-6 py-2 rounded-md text-xs font-bold transition-all flex items-center"
                    >
                        {isGenerating ? 'RENDERING...' : <><Sparkles size={14} className="mr-2" /> GENERATE FRAME</>}
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {/* Generated Frames */}
                {storyboards.map((frame, idx) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={idx} 
                        className="aspect-video bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl overflow-hidden group relative shadow-2xl"
                    >
                        <img src={frame.imageUrl} alt={frame.prompt} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                            <p className="text-[10px] text-gray-400 line-clamp-2">{frame.prompt}</p>
                            
                            {sentFrames.has(idx) ? (
                                // Already sent — show confirmation state
                                <div className="mt-2 text-emerald-400 font-bold text-[10px] uppercase tracking-widest flex items-center">
                                    <CheckCircle size={10} className="mr-1" /> Added to Timeline
                                </div>
                            ) : (
                                <button
                                    title="Use this frame sequentially in the Edit timeline"
                                    onClick={() => handleUseInEdit(frame, idx)}
                                    className="mt-2 text-red-400 hover:text-red-300 font-bold text-[10px] uppercase tracking-widest flex items-center transition-colors"
                                >
                                    <Play size={10} className="mr-1" /> Use in Edit
                                </button>
                            )}
                        </div>
                    </motion.div>
                ))}

                {/* Empty State */}
                {!isGenerating && storyboards.length === 0 && (
                    <div className="col-span-full h-64 border-2 border-dashed border-[#1a1a1a] rounded-xl flex flex-col items-center justify-center text-gray-600">
                        <ImageIcon size={48} className="mb-4 opacity-20" />
                        <p className="text-sm">Your storyboard is empty. Describe a scene and generate your first frame.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
