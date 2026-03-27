'use client';

import React, { useEffect, useState } from 'react';
import YouTube, { YouTubePlayer } from 'react-youtube';
import { useTimelineStore } from '../store/useTimelineStore';

export const Monitor: React.FC = () => {
    const { playhead, tracks } = useTimelineStore();
    const [player, setPlayer] = useState<YouTubePlayer | null>(null);
    const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
    
    // Engine de sincronización IFrame <-> Playhead
    useEffect(() => {
        // Priorizar la pista 'visual' para el monitor
        const visualClips = tracks['visual'] || [];
        const activeClip = visualClips.find(
            c => playhead >= c.startTime && playhead < c.endTime
        );

        if (activeClip && activeClip.videoId) {
            // Cargar el reproductor si cambió el video
            if (activeClip.videoId !== currentVideoId) {
                setCurrentVideoId(activeClip.videoId);
            }
            
            // Sincronización en tiempo real
            if (player) {
                const internalTime = playhead - activeClip.startTime;
                
                if (typeof player.getCurrentTime === 'function') {
                    const playerTime = player.getCurrentTime();
                    const timeDiff = Math.abs(playerTime - internalTime);
                    
                    // Si el playhead se alejó más de 0.5s del video (porque el usuario hizo scrub), forzamos actualización
                    if (timeDiff > 0.5) {
                        player.seekTo(internalTime, true);
                        const state = player.getPlayerState();
                        // Asegurar que siga en play si estaba reproduciendo
                        if (state !== 1) player.playVideo();
                    }
                }
            }
        } else {
            // Fuera de rango de cualquier clip válido
            setCurrentVideoId(null);
            if (player && typeof player.pauseVideo === 'function') {
                player.pauseVideo();
            }
        }
    }, [playhead, tracks, currentVideoId, player]);

    return (
        <div className="w-full aspect-video bg-[#050505] flex items-center justify-center border border-[#1a1a1a] rounded-lg overflow-hidden shadow-2xl relative">
            {currentVideoId ? (
                <div className="w-full h-full pointer-events-none">
                    {/* El pointer-events-none previene que el usuario detenga el video dando clic directamente al iframe, obligándolo a usar el Timeline */}
                    <YouTube
                        videoId={currentVideoId}
                        opts={{
                            width: '100%',
                            height: '100%',
                            playerVars: {
                                autoplay: 1,
                                controls: 0,
                                disablekb: 1,
                                modestbranding: 1,
                                rel: 0,
                                showinfo: 0,
                                iv_load_policy: 3
                            },
                        }}
                        onReady={(event: any) => setPlayer(event.target)}
                        className="w-full h-full"
                        iframeClassName="w-full h-full object-cover"
                    />
                </div>
            ) : (
                <div className="text-gray-500 font-mono text-sm flex flex-col items-center opacity-50 select-none">
                    <span className="text-red-900 mb-2">●</span>
                    <span className="tracking-widest">MONITOR APAGADO</span>
                    <span className="text-[10px] text-gray-700 mt-2">Mueve el Playhead a un clip de video válido</span>
                </div>
            )}
        </div>
    );
};
