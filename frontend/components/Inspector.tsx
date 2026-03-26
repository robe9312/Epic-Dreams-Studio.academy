'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useTimelineStore } from '@/store/useTimelineStore';

export const Inspector = () => {
    const { logs, feasibilityScore } = useTimelineStore();

    return (
        <div className="w-80 h-full bg-[#0a0a0a] border-l border-[#1a1a1a] flex flex-col text-sm">
            {/* Tab Header */}
            <div className="h-10 border-b border-[#1a1a1a] flex items-center px-4 space-x-4 bg-[#0f0f0f]">
                <button className="text-white font-bold text-[10px] tracking-widest border-b border-red-500 h-full px-2">
                    INSPECTOR
                </button>
                <button className="text-gray-500 font-bold text-[10px] tracking-widest h-full px-2">
                    METADATA
                </button>
            </div>

            {/* AI Agent Status Section */}
            <div className="p-4 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
                <section>
                    <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                        Production Feasibility
                    </h3>
                    <div className="h-2 w-full bg-[#1a1a1a] rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${feasibilityScore}%` }}
                            className="h-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)] transition-all duration-500"
                        />
                    </div>
                    <p className="text-xs mt-2 text-white/60 italic font-mono">
                        {feasibilityScore.toFixed(1)}% - {feasibilityScore > 80 ? 'Ready' : 'Analyzing...'}
                    </p>
                </section>

                <hr className="border-[#1a1a1a]" />

                <section className="space-y-4">
                    <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                        Agent Feed
                    </h3>

                    <AnimatePresence>
                        {logs.map((log, index) => (
                            <motion.div
                                key={index} // Usamos el índice como key (alternativa si no hay id único)
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="p-3 rounded bg-[#0f0f0f] border border-[#1a1a1a] space-y-2"
                            >
                                <div className="flex items-center justify-between">
                                    <span
                                        className={`text-[10px] font-bold uppercase ${
                                            log.agent.includes('Director')
                                                ? 'text-red-500'
                                                : 'text-blue-500'
                                        }`}
                                    >
                                        {log.agent}
                                    </span>
                                    <span className="text-[8px] text-gray-600 uppercase">
                                        {log.timestamp || 'just now'}
                                    </span>
                                </div>
                                <p className="text-[11px] leading-relaxed text-gray-300">
                                    "{log.message}"
                                </p>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {logs.length === 0 && (
                        <div className="text-center py-8 text-gray-600 italic text-[10px]">
                            No active orchestrations...
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};