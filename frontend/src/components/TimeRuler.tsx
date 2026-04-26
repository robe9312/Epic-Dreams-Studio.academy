'use client';

import React, { useEffect, useRef } from 'react';
import { useTimelineStore } from '../store/useTimelineStore';

export const TimeRuler: React.FC = () => {
    const { scale, scrollX } = useTimelineStore();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const rect = container.getBoundingClientRect();
        
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        
        ctx.scale(dpr, dpr);
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;

        ctx.clearRect(0, 0, rect.width, rect.height);

        ctx.strokeStyle = '#4b5563'; 
        ctx.fillStyle = '#6b7280'; 
        ctx.font = '9px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        const startSec = scrollX / scale;
        const endSec = (scrollX + rect.width) / scale;

        const firstTick = Math.floor(startSec);
        const lastTick = Math.ceil(endSec);

        for (let i = firstTick; i <= lastTick; i++) {
            const x = (i * scale) - scrollX;
            
            if (x < -20 || x > rect.width + 20) continue;

            const isMajor = i % 5 === 0;

            ctx.beginPath();
            if (isMajor) {
                ctx.moveTo(x, rect.height - 12);
                ctx.lineTo(x, rect.height);
                ctx.fillText(`${i}s`, x, 2);
            } else {
                ctx.moveTo(x, rect.height - 6);
                ctx.lineTo(x, rect.height);
            }
            ctx.stroke();
        }
    }, [scale, scrollX]);

    useEffect(() => {
        const handleResize = () => {
            // Force re-evaluation of bounds
            window.dispatchEvent(new Event('timeline-resize'));
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div ref={containerRef} className="h-6 w-full bg-[#0f0f0f] border-b border-[#1a1a1a] relative overflow-hidden select-none pointer-events-none">
            <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
        </div>
    );
};
