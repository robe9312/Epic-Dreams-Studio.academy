'use client';

import React, { useEffect, useState } from 'react';
import { useTimelineStore, TrackType, Clip } from '../store/useTimelineStore';

export const ClipEditor: React.FC = () => {
    const { tracks, selectedClipId, updateClipContent, setSelectedClip } = useTimelineStore();
    const [localContent, setLocalContent] = useState('');

    // Encontrar el clip seleccionado
    let activeClip: Clip | null = null;
    let activeTrack: TrackType | null = null;

    if (selectedClipId) {
        for (const [trackName, trackClips] of Object.entries(tracks)) {
            const found = (trackClips as Clip[]).find(c => c.id === selectedClipId);
            if (found) {
                activeClip = found;
                activeTrack = trackName as TrackType;
                break;
            }
        }
    }

    useEffect(() => {
        if (activeClip) {
            setLocalContent(activeClip.content);
        }
    }, [selectedClipId, activeClip?.id]);

    const handleSave = () => {
        if (activeClip && activeTrack) {
            updateClipContent(activeTrack, activeClip.id, localContent);
        }
    };

    if (!selectedClipId || !activeClip) {
        return null;
    }

    return (
        <div className="w-full bg-[#111] border border-[#222] rounded-lg p-4 mt-4 shadow-xl">
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-white font-bold text-sm tracking-widest uppercase">
                    Editor de Bloque <span className="text-red-500 ml-2">[{activeTrack}]</span>
                </h3>
                <button 
                    onClick={() => setSelectedClip(null)}
                    className="text-gray-500 hover:text-white font-bold transition-colors w-6 h-6 flex items-center justify-center rounded bg-[#222] hover:bg-red-600"
                >
                    ✕
                </button>
            </div>
            
            <textarea
                value={localContent}
                onChange={(e) => setLocalContent(e.target.value)}
                onBlur={handleSave}
                className="w-full h-32 bg-[#0a0a0a] border border-[#333] rounded p-3 text-sm text-gray-300 focus:outline-none focus:border-red-500 hover:border-gray-600 resize-none font-mono transition-colors"
                placeholder="Escribe la idea, el detalle visual o técnico aquí..."
            />
            
            <div className="flex justify-between items-center mt-3">
                <div className="text-xs text-gray-500 font-mono">
                    ID: {activeClip.id} | Duración: {(activeClip.endTime - activeClip.startTime).toFixed(2)}s
                </div>
                <button 
                    onClick={handleSave}
                    className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded transition-colors shadow-lg"
                >
                    Guardar Cambios
                </button>
            </div>
        </div>
    );
};
