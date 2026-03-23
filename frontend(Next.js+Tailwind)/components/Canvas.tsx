'use client';

import { useTimelineStore } from '@/store/useTimelineStore';

export const Canvas: React.FC = () => {
    const { playhead, tracks } = useTimelineStore();
    
    // Simple logic to find the active narrative clip
    const activeClip = tracks.narrative.find(c => playhead >= c.startTime && playhead <= c.endTime);

    return (
        <div className="flex-1 bg-[#050505] flex items-center justify-center p-8 relative overflow-hidden group">
            {/* Grid background for "Workbench" feel */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" 
                 style={{ backgroundImage: 'radial-gradient(#333 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

            {/* 16:9 Viewport */}
            <motion.div 
                className="aspect-video w-full max-w-4xl bg-black border border-[#1a1a1a] shadow-2xl relative overflow-hidden"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
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
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-4"
                            >
                                <span className="text-red-500 text-[10px] font-bold uppercase tracking-widest block mb-2">Narrative Core</span>
                                <h2 className="text-2xl font-serif italic text-white/90 leading-tight">
                                    {activeClip.content}
                                </h2>
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
