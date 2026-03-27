'use client';

import React from 'react';
import { useTimelineStore } from '../store/useTimelineStore';
import { motion, AnimatePresence } from 'framer-motion';

export const MentorPanel: React.FC = () => {
    const { activeAdvice, setAdvice } = useTimelineStore();

    if (!activeAdvice) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.9 }}
                className="fixed bottom-32 right-8 w-80 z-50"
            >
                <div className="relative p-6 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden">
                    {/* Glossy Effect */}
                    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-purple-600 flex items-center justify-center shadow-lg flex-shrink-0">
                            <span className="text-white text-xs font-bold">{activeAdvice.agent[0]}</span>
                        </div>
                        
                        <div className="flex-1">
                            <h4 className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mb-1">
                                {activeAdvice.agent} Advice
                            </h4>
                            <p className="text-sm text-gray-200 leading-relaxed font-medium italic">
                                "{activeAdvice.message}"
                            </p>
                        </div>
                        
                        <button 
                            onClick={() => setAdvice(null)}
                            className="text-gray-500 hover:text-white transition-colors"
                            title="Close Advice"
                            aria-label="Close Advice"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Footer decoration */}
                    <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center text-[9px] text-gray-400 tracking-wider">
                        <span>LIVE CRITIQUE</span>
                        <span className="flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />
                            SYNCED
                        </span>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
