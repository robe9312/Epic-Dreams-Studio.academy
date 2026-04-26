'use client';

import React from 'react';
import { useProjectStore, WorkspaceType } from '../../store/useProjectStore';
import { motion, AnimatePresence } from 'framer-motion';

// Workspaces
import { IdeaWorkspace } from '../../components/studio/workspaces/IdeaWorkspace';
import { EditWorkspace } from '../../components/studio/workspaces/EditWorkspace';
import { VisualWorkspace } from '../../components/studio/workspaces/VisualWorkspace';
import { AudioWorkspace } from '../../components/studio/workspaces/AudioWorkspace';
import { ExportWorkspace } from '../../components/studio/workspaces/ExportWorkspace';

// Icons (Lucide)
import { Book, Film, Image as ImageIcon, Music, Share2 } from 'lucide-react';
import { MentorPanel } from '../../components/MentorPanel';

export default function StudioPage() {
    const { activeWorkspace, setWorkspace, loadInitialAssets } = useProjectStore();

    React.useEffect(() => {
        // Load assets for the default project on mount
        loadInitialAssets('fad5716c-4545-49a8-9309-2b17f8de188b');
    }, [loadInitialAssets]);

    const renderWorkspace = () => {
        switch (activeWorkspace) {
            case 'idea': return <IdeaWorkspace />;
            case 'visual': return <VisualWorkspace />;
            case 'audio': return <AudioWorkspace />;
            case 'export': return <ExportWorkspace />;
            default: return <EditWorkspace />;
        }
    };

    const NAV_ITEMS: { id: WorkspaceType; label: string; icon: React.ReactNode }[] = [
        { id: 'idea', label: 'IDEA', icon: <Book size={14} /> },
        { id: 'edit', label: 'EDIT', icon: <Film size={14} /> },
        { id: 'visual', label: 'VISUAL', icon: <ImageIcon size={14} /> },
        { id: 'audio', label: 'AUDIO', icon: <Music size={14} /> },
        { id: 'export', label: 'EXPORT', icon: <Share2 size={14} /> },
    ];

    return (
        <div className="flex flex-col h-screen bg-[#050505] text-white overflow-hidden font-sans">
            {/* Main Workspace Area */}
            <main className="flex-1 relative overflow-hidden flex flex-col">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeWorkspace}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.02 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="flex-1 flex flex-col overflow-hidden"
                    >
                        {renderWorkspace()}
                    </motion.div>
                </AnimatePresence>

                {/* Mentor / Critic Panel (Floating) */}
                <MentorPanel />
            </main>

            {/* DaVinci Style Bottom Bar */}
            <nav className="h-12 bg-[#0a0a0a] border-t border-[#1a1a1a] flex items-center justify-center px-4 space-x-1 z-[100]">
                {NAV_ITEMS.map((item) => {
                    const isActive = activeWorkspace === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setWorkspace(item.id)}
                            className={`flex flex-col items-center justify-center px-6 h-full transition-all group relative
                                ${isActive ? 'text-white' : 'text-gray-500 hover:text-gray-300'}
                            `}
                        >
                            <span className={`transition-transform duration-200 ${isActive ? 'scale-110 mb-0.5' : 'group-hover:scale-105 mb-0.5'}`}>
                                {item.icon}
                            </span>
                            <span className={`text-[8px] font-bold tracking-[0.2em] transition-opacity ${isActive ? 'opacity-100' : 'opacity-40 group-hover:opacity-70'}`}>
                                {item.label}
                            </span>
                            
                            {/* Active Indicator Line */}
                            {isActive && (
                                <motion.div 
                                    layoutId="activeTab"
                                    className="absolute top-0 left-0 right-0 h-[2px] bg-red-600"
                                />
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* Global Background Effects - Optimized */}
            <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-500/5 blur-[100px] rounded-full transform-gpu" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/3 blur-[80px] rounded-full transform-gpu" />
            </div>
        </div>
    );
}