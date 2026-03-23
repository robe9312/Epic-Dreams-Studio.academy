'use client';

import React from 'react';
import { motion } from 'framer-motion';

export const Canvas: React.FC = () => {
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

                {/* Placeholder for Cinematic content */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex flex-col items-center space-y-4">
                        <div className="w-12 h-12 border-2 border-red-500 rounded-full animate-pulse flex items-center justify-center">
                           <div className="w-2 h-2 bg-red-500 rounded-full" />
                        </div>
                        <span className="text-white/20 font-bold tracking-tighter italic">WAITING FOR SCENE DATA...</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
