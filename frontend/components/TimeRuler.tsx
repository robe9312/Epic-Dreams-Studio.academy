'use client';

import React from 'react';
import { useTimelineStore } from '../store/useTimelineStore';

export const TimeRuler: React.FC = () => {
    const { scale, scrollX } = useTimelineStore();
    
    // Calcular cuántos segundos mostrar en base al ancho aproximado (digamos 20000px de buffer)
    const seconds = Array.from({ length: 200 }, (_, i) => i * 5); // Cada 5 segundos para no saturar

    return (
        <div className="h-6 w-full bg-[#0f0f0f] border-b border-[#1a1a1a] relative overflow-hidden select-none pointer-events-none">
            <div 
                className="absolute top-0 left-0 h-full flex items-end pb-1"
                style={{ transform: `translateX(${-scrollX}px)` }}
            >
                {Array.from({ length: 1000 }).map((_, i) => {
                    const isMajor = i % 5 === 0;
                    const isSecond = i % 1 === 0;
                    
                    if (!isSecond) return null;

                    return (
                        <div 
                            key={i} 
                            className="absolute bottom-0 flex flex-col items-center"
                            style={{ left: `${i * scale}px` }}
                        >
                            {isMajor ? (
                                <>
                                    <span className="text-[8px] text-gray-500 mb-1 font-mono">{i}s</span>
                                    <div className="w-[1px] h-3 bg-gray-600" />
                                </>
                            ) : (
                                <div className="w-[1px] h-1.5 bg-gray-800" />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
