'use client';

import React, { useEffect, useRef } from 'react';
import { useTimelineStore, TrackType, Clip } from '../store/useTimelineStore';
import { motion } from 'framer-motion';
import { TimeRuler } from './TimeRuler';

const TRACKS: TrackType[] = ['narrative', 'visual', 'technical', 'training'];

export const Timeline: React.FC = () => {
    const { playhead, tracks, setPlayhead, scale, scrollX, setScale, setScrollX, selectedClipId, setSelectedClip, updateClip, moveClip } = useTimelineStore();
    const timelineRef = useRef<HTMLDivElement>(null);
    const [dragState, setDragState] = React.useState<{ clip: Clip; initialX: number; type: 'drag' | 'trim-left' | 'trim-right' } | null>(null);

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
        setSelectedClip(null); // Deseleccionar al hacer click fuera de un clip
    };

    return (
        <div className="w-full h-72 bg-[#0a0a0a] border-t border-[#1a1a1a] flex flex-col relative overflow-hidden text-xs text-gray-400 select-none">
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

            <TimeRuler />

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
                                    {tracks[track].map((clip) => {
                                        const isSelected = clip.id === selectedClipId;
                                        
                                        const handleMouseDown = (e: React.MouseEvent) => {
                                            e.stopPropagation();
                                            setSelectedClip(clip.id);
                                            
                                            const rect = e.currentTarget.getBoundingClientRect();
                                            const localX = e.clientX - rect.left;
                                            const edgeThreshold = 10;
                                            
                                            let type: 'drag' | 'trim-left' | 'trim-right' = 'drag';
                                            if (localX < edgeThreshold) type = 'trim-left';
                                            else if (localX > rect.width - edgeThreshold) type = 'trim-right';
                                            
                                            setDragState({ clip, initialX: e.clientX, type });
                                            
                                            const handleMouseMove = (moveEvent: MouseEvent) => {
                                                const deltaX = (moveEvent.clientX - e.clientX) / scale;
                                                
                                                if (type === 'drag') {
                                                    // Detectar cambio de pista vertical
                                                    if (timelineRef.current) {
                                                        const timelineRect = timelineRef.current.getBoundingClientRect();
                                                        const y = moveEvent.clientY - (timelineRect.top + 32 + 24); // Offset header + ruler
                                                        const trackHeight = (timelineRect.height - 32 - 24) / TRACKS.length;
                                                        const targetTrackIndex = Math.floor(y / trackHeight);
                                                        const targetTrack = TRACKS[Math.max(0, Math.min(TRACKS.length - 1, targetTrackIndex))];
                                                        
                                                        if (targetTrack !== track) {
                                                            moveClip(track, targetTrack, clip.id, clip.startTime + deltaX);
                                                            // Al cambiar de pista, detenemos este listener y el usuario deberá soltar/clicar de nuevo
                                                            // O mejor: actualizamos la referencia de la pista actual
                                                            window.removeEventListener('mousemove', handleMouseMove);
                                                            window.removeEventListener('mouseup', handleMouseUp);
                                                            setDragState(null);
                                                            return;
                                                        }
                                                    }

                                                    updateClip(track, clip.id, { 
                                                        startTime: Math.max(0, clip.startTime + deltaX),
                                                        endTime: Math.max(0.1, clip.endTime + deltaX) 
                                                    });
                                                } else if (type === 'trim-left') {
                                                    const newStart = Math.max(0, clip.startTime + deltaX);
                                                    if (newStart < clip.endTime) {
                                                        updateClip(track, clip.id, { startTime: newStart });
                                                    }
                                                } else if (type === 'trim-right') {
                                                    const newEnd = Math.max(clip.startTime + 0.1, clip.endTime + deltaX);
                                                    updateClip(track, clip.id, { endTime: newEnd });
                                                }
                                            };
                                            
                                            const handleMouseUp = () => {
                                                window.removeEventListener('mousemove', handleMouseMove);
                                                window.removeEventListener('mouseup', handleMouseUp);
                                                setDragState(null);
                                            };
                                            
                                            window.addEventListener('mousemove', handleMouseMove);
                                            window.addEventListener('mouseup', handleMouseUp);
                                        };

                                        return (
                                            <div 
                                                key={clip.id}
                                                onMouseDown={handleMouseDown}
                                                className={`absolute top-1 h-[calc(100%-8px)] rounded flex items-center px-3 text-white truncate shadow-sm cursor-pointer transition-colors backdrop-blur-sm group
                                                    ${isSelected ? 'border-2 border-red-500 bg-[#444] z-10' : 'bg-[#252525] border border-[#444] hover:border-gray-400 hover:bg-[#333] z-0'}`}
                                                style={{ 
                                                    left: `${clip.startTime * scale}px`,
                                                    width: `${(clip.endTime - clip.startTime) * scale}px`
                                                }}
                                            >
                                                {/* Trim Handles Visual */}
                                                <div className="absolute left-0 top-0 bottom-0 w-1.5 cursor-col-resize opacity-0 group-hover:opacity-100 bg-red-500/30" />
                                                <div className="absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize opacity-0 group-hover:opacity-100 bg-red-500/30" />
                                                
                                                <span className="font-medium text-[11px] truncate tracking-wide pointer-events-none">{clip.content}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                        
                    </div>
                </div>
            </div>
        </div>
    );
};
