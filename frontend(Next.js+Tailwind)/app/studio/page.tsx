'use client';

import React from 'react';
import { Timeline } from '@/components/Timeline';
import { Canvas } from '@/components/Canvas';
import { Inspector } from '@/components/Inspector';
import { motion } from 'framer-motion';

export default function StudioPage() {
    return (
        <div className="h-screen w-screen bg-[#050505] text-white flex flex-col overflow-hidden font-sans selection:bg-red-500/30">
            {/* Minimalist Top Nav */}
            <header className="h-12 border-b border-[#1a1a1a] flex items-center justify-between px-6 bg-[#080808]">
                <div className="flex items-center space-x-4">
                    <div className="w-6 h-6 bg-red-500 rounded flex items-center justify-center font-bold text-[10px]">ED</div>
                    <h1 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-300">
                        Epic Dreams <span className="text-gray-600">/</span> <span className="text-white">The Last Script</span>
                    </h1>
                </div>
                
                <div className="flex items-center space-x-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    <button className="hover:text-white transition-colors">Project</button>
                    <button className="hover:text-white transition-colors">Export</button>
                    <div className="w-8 h-8 rounded-full bg-[#1a1a1a] border border-[#333] flex items-center justify-center overflow-hidden">
                        <div className="w-full h-full bg-gradient-to-tr from-red-900 to-red-500" />
                    </div>
                </div>
            </header>

            {/* Main Workbench Area */}
            <main className="flex-1 flex overflow-hidden">
                <Canvas />
                <Inspector />
            </main>

            {/* Cinematic Timeline */}
            <footer className="h-72">
                <Timeline />
            </footer>

            {/* Global Background Effects */}
            <div className="fixed inset-0 pointer-events-none z-[-1]">
               <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-500/5 blur-[120px] rounded-full" />
               <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/5 blur-[100px] rounded-full" />
            </div>
        </div>
    );
}
