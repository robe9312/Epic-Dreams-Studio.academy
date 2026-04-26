'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useTimelineStore } from '../store/useTimelineStore';

export const Canvas = () => {
    const { playhead, tracks } = useTimelineStore();

    // Buscar el clip narrativo activo según el playhead
    const activeClip = tracks.narrative.find(c => playhead >= c.startTime && playhead <= c.endTime);

    return (
        <div className="flex-1 bg-[#050505] flex items-center justify-center p-8 relative overflow-hidden group">
            {/* Grid background */}
            <div className="absolute inset-0 opacity-10 pointer-events-none grid-bg" />

            {/* 16:9 Viewport */}
            <motion.div
                className="aspect-video w-full max-w-4xl bg-black border border-[#1a1a1a] shadow-2xl relative overflow-hidden"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
            >
                {/* HUD Overlay */}
                <div className="absolute top-4 left-4 flex flex-col space-y-1 text-[10px] font-mono text-white/40 uppercase tracking-widest">
                    <span>Rec. 709</span>
                    <span>24.00 fps</span>
                </div>

                <div className="absolute bottom-4 right-4 text-[10px] font-mono text-white/40 uppercase tracking-widest">
                    <span>4K | 16:9</span>
                </div>

                {/* Content Area */}
                <div className="absolute inset-0 flex items-center justify-center p-12 text-center">
                    <AnimatePresence mode="wait">
                        {activeClip ? (
                            <motion.div
                                key={activeClip.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 flex items-center justify-center p-12 text-center"
                            >
                                {activeClip.videoId ? (
                                    <div className="absolute inset-0 z-0">
                                        <iframe 
                                            width="100%" 
                                            height="100%" 
                                            src={`https://www.youtube.com/embed/${activeClip.videoId}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1`}
                                            title="YouTube video player" 
                                            frameBorder="0" 
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                                            className="pointer-events-none"
                                        />
                                        <div className="absolute inset-0 bg-black/20" /> {/* Subtle overlay */}
                                    </div>
                                ) : (
                                    <div className="relative z-10 space-y-4">
                                        <span className="text-red-500 text-[10px] font-bold uppercase tracking-widest block mb-2">
                                            Narrative Core
                                        </span>
                                        <h2 className="text-2xl font-serif italic text-white/90 leading-tight">
                                            {activeClip.content}
                                        </h2>
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            <div className="flex flex-col items-center space-y-4">
                                <div className="w-12 h-12 border-2 border-red-500 rounded-full animate-pulse flex items-center justify-center">
                                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                                </div>
                                <span className="text-white/20 font-bold tracking-tighter italic uppercase text-[10px]">
                                    {tracks.narrative.length > 0 ? 'Move Playhead to Review' : 'Waiting for Scene Data...'}
                                </span>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};