'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTimelineStore } from '../store/useTimelineStore';

export const TimeRuler: React.FC = () => {
    const { scale, scrollX } = useTimelineStore();
    
    return (
        <div className="h-6 w-full bg-[#0f0f0f] border-b border-[#1a1a1a] relative overflow-hidden select-none pointer-events-none">
            <motion.div 
                className="absolute top-0 left-0 h-full flex items-end pb-1"
                animate={{ x: -scrollX }}
                transition={{ duration: 0 }}
            >
                {Array.from({ length: 1000 }).map((_, i) => {
                    const isMajor = i % 5 === 0;
                    const isSecond = i % 1 === 0;
                    
                    if (!isSecond) return null;

                    return (
                        <motion.div 
                            key={i} 
                            className="absolute bottom-0 flex flex-col items-center"
                            animate={{ x: i * scale }}
                            transition={{ duration: 0 }}
                        >
                            {isMajor ? (
                                <>
                                    <span className="text-[8px] text-gray-500 mb-1 font-mono">{i}s</span>
                                    <div className="w-[1px] h-3 bg-gray-600" />
                                </>
                            ) : (
                                <div className="w-[1px] h-1.5 bg-gray-800" />
                            )}
                        </motion.div>
                    );
                })}
            </motion.div>
        </div>
    );
};
