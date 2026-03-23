'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const Inspector: React.FC = () => {
    return (
        <div className="w-80 h-full bg-[#0a0a0a] border-l border-[#1a1a1a] flex flex-col text-sm">
            {/* Tab Header */}
            <div className="h-10 border-b border-[#1a1a1a] flex items-center px-4 space-x-4 bg-[#0f0f0f]">
                <button className="text-white font-bold text-[10px] tracking-widest border-b border-red-500 h-full px-2">INSPECTOR</button>
                <button className="text-gray-500 font-bold text-[10px] tracking-widest h-full px-2">METADATA</button>
            </div>

            {/* AI Agent Status Section */}
            <div className="p-4 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
                <section>
                   <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Production Feasibility</h3>
                   <div className="h-2 w-full bg-[#1a1a1a] rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '88%' }}
                        className="h-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                      />
                   </div>
                   <p className="text-xs mt-2 text-white/60 italic font-mono">88.4% - Ready for Pre-Vis</p>
                </section>

                <hr className="border-[#1a1a1a]" />

                <section className="space-y-4">
                   <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Agent Feed</h3>
                   
                   {/* Agent Item */}
                   <div className="p-3 rounded bg-[#0f0f0f] border border-[#1a1a1a] space-y-2">
                      <div className="flex items-center justify-between">
                         <span className="text-[10px] font-bold text-red-500 uppercase">Director Agent</span>
                         <span className="text-[8px] text-gray-600">JUST NOW</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-gray-300">
                        "Script segment verified. Continuity check passed with 0 conflicts."
                      </p>
                   </div>

                   <div className="p-3 rounded bg-[#0f0f0f] border border-[#1a1a1a] opacity-50 space-y-2">
                       <div className="flex items-center justify-between">
                         <span className="text-[10px] font-bold text-blue-500 uppercase">DP Agent</span>
                         <span className="text-[8px] text-gray-600">2M AGO</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-gray-300">
                        "Shot List for Scene 1 generated. Focus on anamorphic look."
                      </p>
                   </div>
                </section>
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-[#1a1a1a] bg-[#0f0f0f]">
                <button className="w-full py-2 bg-red-500 hover:bg-red-600 text-white font-bold text-xs rounded transition-colors uppercase tracking-widest">
                    Run CCV Cycle
                </button>
            </div>
        </div>
    );
};
