'use client';

import React from 'react';
import { useTimelineStore, TrackType } from '../store/useTimelineStore';
import { motion } from 'framer-motion';

const TRACKS: TrackType[] = ['narrative', 'visual', 'technical', 'training'];

export const Timeline: React.FC = () => {
    const { playhead, tracks, setPlayhead } = useTimelineStore();
    const timelineRef = React.useRef<HTMLDivElement>(null);

    const handleTimelineClick = (e: React.MouseEvent) => {
        if (!timelineRef.current) return;
        const rect = timelineRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const totalWidth = rect.width;
        // Supongamos un zoom donde el ancho total son 60 segundos por ahora
        const newTime = (x / totalWidth) * 60;
        setPlayhead(newTime);
    };

    return (
        <div className="w-full h-64 bg-[#0a0a0a] border-t border-[#1a1a1a] flex flex-col relative overflow-hidden text-xs text-gray-400">
            {/* Playhead visualization */}
            <motion.div 
                className="absolute top-0 bottom-0 w-[2px] bg-red-500 z-50 pointer-events-none"
                style={{ left: `${(playhead / 60) * 100}%` }}
                initial={false}
                animate={{ left: `${(playhead / 60) * 100}%` }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />

            {/* Header / Ruler */}
            <div className="h-8 border-b border-[#1a1a1a] flex items-center px-4 space-x-4 bg-[#0f0f0f]">
                <span className="text-red-500 font-mono font-bold tracking-tighter">
                    {playhead.toFixed(2)}s
                </span>
                <div className="flex-1" />
                <div className="flex space-x-2">
                    <button className="px-2 py-1 hover:bg-[#222] rounded">ZOOM IN</button>
                    <button className="px-2 py-1 hover:bg-[#222] rounded">ZOOM OUT</button>
                </div>
            </div>

            {/* Tracks Area */}
            <div 
                ref={timelineRef}
                className="flex-1 flex flex-col relative"
                onClick={handleTimelineClick}
            >
                {TRACKS.map((track) => (
                    <div key={track} className="flex-1 border-b border-[#1a1a1a] flex relative group">
                        <div className="w-24 bg-[#0f0f0f] border-r border-[#1a1a1a] flex items-center px-2 uppercase font-bold text-[10px] tracking-widest text-gray-500 group-hover:text-gray-300">
                            {track}
                        </div>
                        <div className="flex-1 relative overflow-hidden h-full">
                            {tracks[track].map((clip) => (
                                <div 
                                    key={clip.id}
                                    className="absolute top-1 h-[calc(100%-8px)] rounded bg-[#1e1e1e] border border-[#333] flex items-center px-2 text-white truncate"
                                    style={{ 
                                        left: `${(clip.startTime / 60) * 100}%`,
                                        width: `${((clip.endTime - clip.startTime) / 60) * 100}%`
                                    }}
                                >
                                    {clip.content}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
