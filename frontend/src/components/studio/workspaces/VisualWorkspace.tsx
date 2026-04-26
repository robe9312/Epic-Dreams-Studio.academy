'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Sparkles, Image as ImageIcon, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';
import { useProjectStore } from '../../../store/useProjectStore';
import { useTimelineStore } from '../../../store/useTimelineStore';

// Default duration (seconds) for a storyboard clip on the visual track
const STORYBOARD_CLIP_DURATION = 4;

export const VisualWorkspace: React.FC = () => {
    const { storyboards, addStoryboard, removeStoryboard, error, setError, currentSceneId } = useProjectStore();
    const { tracks, addClip, addLog } = useTimelineStore();

    const [prompt, setPrompt] = useState('An astronaut floating in space looking at a distant nebula, cinematic lighting, 8k');
    const [isGenerating, setIsGenerating] = useState(false);
    // Track which storyboard IDs have already been sent to the Edit timeline
    const [sentIds, setSentIds] = useState<Set<string>>(new Set());

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        setIsGenerating(true);
        setError(null);

        try {
            const response = await fetch(
                'https://epicdreams-epic-dreams-backend.hf.space/api/v1/ai/generate-storyboard',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-API-Key': 'epic_dreams_secret_2026',
                    },
                    body: JSON.stringify({
                        prompt,
                        scene_id: currentSceneId, // use valid UUID from store
                    }),
                }
            );

            if (!response.ok) {
                const errBody = await response.text();
                throw new Error(`Backend error ${response.status}: ${errBody}`);
            }

            const data = await response.json();

            // Support both "image_url" and "url" keys that backends may return
            const imageUrl = data.image_url || data.url || data.output;

            if (!imageUrl) {
                throw new Error('Backend response did not include an image URL. Response: ' + JSON.stringify(data));
            }

            addStoryboard({
                sceneId: `scene-${Date.now()}`,
                imageUrl,
                prompt,
            });
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Unknown error during generation';
            console.error('Storyboard gen failed:', msg);
            setError(msg);
        } finally {
            setIsGenerating(false);
        }
    };

    /**
     * Inserts the storyboard frame into the VISUAL track sequentially:
     * Finds the endTime of the last clip → appends immediately after.
     * No playhead dependency → zero timeline drift.
     */
    const handleUseInEdit = (frame: { id: string; imageUrl: string; prompt: string }) => {
        const visualClips = tracks['visual'] ?? [];
        const insertAt =
            visualClips.length > 0
                ? Math.max(...visualClips.map((c) => c.endTime))
                : 0;

        addClip('visual', {
            id: `storyboard-${frame.id}`,
            track: 'visual',
            startTime: insertAt,
            endTime: insertAt + STORYBOARD_CLIP_DURATION,
            content: frame.prompt,
            type: 'image',
            thumbnail: frame.imageUrl,
        });

        addLog({
            agent: 'OpenFang',
            message: `📸 Storyboard appended to Visual track @ ${insertAt.toFixed(1)}s → ${(insertAt + STORYBOARD_CLIP_DURATION).toFixed(1)}s`,
            type: 'success',
        });

        setSentIds((prev) => new Set(prev).add(frame.id));
    };

    return (
        <div className="flex-1 flex flex-col bg-[#050505] p-6 overflow-y-auto">
            {/* Header */}
            <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-xl font-bold tracking-tighter">AI STORYBOARD STAGE</h1>
                    <p className="text-gray-500 text-xs mt-1">
                        Powered by FLUX.1-schnell · Frames auto-append sequentially in the Edit track
                    </p>
                </div>

                <div className="flex items-center gap-3 bg-[#0a0a0a] border border-[#1a1a1a] p-1 rounded-lg">
                    <input
                        type="text"
                        id="storyboard-prompt"
                        value={prompt}
                        title="Storyboard Prompt"
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !isGenerating && handleGenerate()}
                        placeholder="Describe your scene visually..."
                        className="bg-transparent border-none focus:outline-none px-4 text-xs w-80 text-gray-300"
                    />
                    <button
                        id="btn-generate-frame"
                        onClick={handleGenerate}
                        disabled={isGenerating || !prompt.trim()}
                        className="bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white px-6 py-2 rounded-md text-xs font-bold transition-all flex items-center gap-2"
                    >
                        {isGenerating ? (
                            <>
                                <span className="animate-spin inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full" />
                                RENDERING...
                            </>
                        ) : (
                            <>
                                <Sparkles size={14} />
                                GENERATE FRAME
                            </>
                        )}
                    </button>
                </div>
            </header>

            {/* Error Banner */}
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 flex items-start gap-3 bg-red-950/40 border border-red-800/50 text-red-400 rounded-lg p-4 text-xs"
                >
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    <div className="flex-1">
                        <strong className="block mb-1">Generation failed</strong>
                        <span className="opacity-80">{error}</span>
                    </div>
                    <button onClick={() => setError(null)} className="text-red-600 hover:text-red-300">✕</button>
                </motion.div>
            )}

            {/* Frames Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {/* Skeleton during generation */}
                {isGenerating && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0.3, 0.7, 0.3] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="aspect-video bg-[#0f0f0f] border border-[#1a1a1a] rounded-xl flex items-center justify-center"
                    >
                        <Sparkles size={24} className="text-red-800 animate-pulse" />
                    </motion.div>
                )}

                {storyboards.map((frame) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={frame.id}
                        className="aspect-video bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl overflow-hidden group relative shadow-2xl"
                    >
                        <img
                            src={frame.imageUrl}
                            alt={frame.prompt}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="60"><rect fill="%23111"/><text x="50%" y="50%" fill="%23555" text-anchor="middle" dy=".3em" font-size="10">No image</text></svg>';
                            }}
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-between">
                            {/* Delete button */}
                            <button
                                title="Remove frame"
                                onClick={() => removeStoryboard(frame.id)}
                                className="self-end text-gray-500 hover:text-red-400 transition-colors"
                            >
                                <Trash2 size={12} />
                            </button>

                            <div>
                                <p className="text-[10px] text-gray-400 line-clamp-2 mb-2">{frame.prompt}</p>

                                {sentIds.has(frame.id) ? (
                                    <div className="text-emerald-400 font-bold text-[10px] uppercase tracking-widest flex items-center gap-1">
                                        <CheckCircle size={10} /> Added to Timeline
                                    </div>
                                ) : (
                                    <button
                                        title="Add sequentially to Edit timeline (no playhead drift)"
                                        onClick={() => handleUseInEdit(frame)}
                                        className="text-red-400 hover:text-red-300 font-bold text-[10px] uppercase tracking-widest flex items-center gap-1 transition-colors"
                                    >
                                        <Play size={10} /> Use in Edit
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}

                {/* Empty State */}
                {!isGenerating && storyboards.length === 0 && (
                    <div className="col-span-full h-64 border-2 border-dashed border-[#1a1a1a] rounded-xl flex flex-col items-center justify-center text-gray-600">
                        <ImageIcon size={48} className="mb-4 opacity-20" />
                        <p className="text-sm">Your storyboard is empty.</p>
                        <p className="text-xs mt-1 opacity-60">Describe a scene above and hit Generate Frame.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
