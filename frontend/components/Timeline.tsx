'use client';

import React, { useEffect, useRef } from 'react';
import { useTimelineStore, TrackType } from '../store/useTimelineStore';
import { motion } from 'framer-motion';

const TRACKS: TrackType[] = ['narrative', 'visual', 'technical', 'training'];

export const Timeline: React.FC = () => {
    const { playhead, tracks, setPlayhead, scale, scrollX, setScale, setScrollX } = useTimelineStore();
    const timelineRef = useRef<HTMLDivElement>(null);

    // Setup non-passive wheel event for Zooming and Panning
    useEffect(() => {
        const el = timelineRef.current;
        if (!el) return;

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();
            const store = useTimelineStore.getState();
            
            if (e.ctrlKey) {
                // Zoom
                const rect = el.getBoundingClientRect();
                const cursorX = e.clientX - rect.left;
                
                // Time under cursor should remain the same before and after zoom
                const timeAtCursor = (cursorX + store.scrollX) / store.scale;
                
                const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1; // 10% zoom steps
                const newScale = Math.max(5, Math.min(2000, store.scale * zoomFactor));
                
                const newScrollX = Math.max(0, timeAtCursor * newScale - cursorX);
                
                store.setScale(newScale);
                store.setScrollX(newScrollX);
            } else {
                // Pan horizontally
                const panDelta = e.shiftKey ? e.deltaY : (e.deltaX || e.deltaY);
                const newScrollX = store.scrollX + panDelta;
                store.setScrollX(Math.max(0, newScrollX));
            }
        };

        el.addEventListener('wheel', handleWheel, { passive: false });
        // Cleanup listener
        return () => el.removeEventListener('wheel', handleWheel);
    }, []);

    const handleTimelineClick = (e: React.MouseEvent) => {
        if (!timelineRef.current) return;
        const rect = timelineRef.current.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        
        const newTime = (clickX + scrollX) / scale;
        setPlayhead(Math.max(0, newTime));
    };

    return (
        <div className="w-full h-64 bg-[#0a0a0a] border-t border-[#1a1a1a] flex flex-col relative overflow-hidden text-xs text-gray-400 select-none">
            {/* Header / Ruler controls */}
            <div className="h-8 border-b border-[#1a1a1a] flex items-center px-4 space-x-4 bg-[#0f0f0f] z-50 relative">
                <span className="text-red-500 font-mono font-bold tracking-tighter w-20">
                    {playhead.toFixed(2)}s
                </span>
                <div className="flex-1 text-[10px] text-gray-600">
                    Ctrl + Scroll to Zoom | Scroll to Pan
                </div>
                <div className="flex space-x-2 items-center">
                    <span className="text-[10px] text-gray-600 mr-2">Zoom: {Math.round(scale)}px/s</span>
                    <button 
                        className="px-2 py-1 hover:bg-[#222] rounded transition-colors"
                        onClick={() => {
                            const newScale = Math.min(2000, scale * 1.5);
                            setScale(newScale);
                        }}
                    >
                        +
                    </button>
                    <button 
                        className="px-2 py-1 hover:bg-[#222] rounded transition-colors"
                        onClick={() => {
                            const newScale = Math.max(5, scale / 1.5);
                            setScale(newScale);
                        }}
                    >
                        -
                    </button>
                </div>
            </div>

            {/* Tracks Area Container */}
            <div className="flex-1 flex relative overflow-hidden">
                
                {/* Left Sidebar (Track Headers) */}
                <div className="w-24 bg-[#0f0f0f] border-r border-[#1a1a1a] z-40 h-full absolute left-0 flex flex-col">
                    {TRACKS.map((track) => (
                        <div key={track} className="flex-1 border-b border-[#1a1a1a] flex items-center px-2 uppercase font-bold text-[10px] tracking-widest text-gray-500 hover:text-gray-300 transition-colors bg-[#0a0a0a]">
                            {track}
                        </div>
                    ))}
                </div>

                {/* Main Scrollable Timeline */}
                <div 
                    ref={timelineRef}
                    className="flex-1 ml-24 relative overflow-hidden bg-[radial-gradient(#1a1a1a_1px,transparent_1px)] [background-size:20px_20px]"
                    style={{ backgroundPosition: `${-scrollX % 20}px 0` }} // Subtle grid moving with pan
                    onClick={handleTimelineClick}
                >
                    {/* Timeline Canvas (Panned via Transform) */}
                    <div className="h-full absolute top-0 left-0 will-change-transform" style={{ transform: `translateX(${-scrollX}px)` }}>
                        
                        {/* Playhead visualization */}
                        <motion.div 
                            className="absolute top-0 bottom-0 w-[1px] bg-red-500 z-50 pointer-events-none"
                            style={{ left: `${playhead * scale}px` }}
                            initial={false}
                            animate={{ left: `${playhead * scale}px` }}
                            transition={{ type: "spring", stiffness: 400, damping: 40 }}
                        >
                            <div className="w-3 h-3 bg-red-500 absolute -top-1.5 -left-1.5 rotate-45" />
                        </motion.div>

                        {/* Tracks */}
                        <div className="flex flex-col h-full absolute top-0 left-0 mt-[1px]">
                            {TRACKS.map((track) => (
                                <div key={track} className="h-1/4 border-b border-transparent relative w-[100000px]">
                                    {tracks[track].map((clip) => (
                                        <div 
                                            key={clip.id}
                                            className="absolute top-1 h-[calc(100%-8px)] rounded bg-[#252525] border border-[#444] flex items-center px-3 text-white truncate shadow-sm hover:border-gray-400 hover:bg-[#333] cursor-pointer transition-colors backdrop-blur-sm"
                                            style={{ 
                                                left: `${clip.startTime * scale}px`,
                                                width: `${(clip.endTime - clip.startTime) * scale}px`
                                            }}
                                        >
                                            <span className="font-medium text-[11px] truncate tracking-wide">{clip.content}</span>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                        
                    </div>
                </div>
            </div>
        </div>
    );
};
