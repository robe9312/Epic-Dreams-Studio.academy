'use client';

import React from 'react';
import { Share2, Youtube, Download, CheckCircle } from 'lucide-react';

export const ExportWorkspace: React.FC = () => {
    return (
        <div className="flex-1 flex flex-col bg-[#050505] p-12 items-center justify-center overflow-y-auto">
            <div className="max-w-3xl w-full text-center">
                <div className="w-20 h-20 bg-red-600 rounded-3xl mx-auto mb-8 flex items-center justify-center shadow-2xl shadow-red-600/20 rotate-12">
                    <Share2 size={32} className="text-white" />
                </div>
                <h1 className="text-4xl font-black tracking-tighter mb-4">READY FOR DELIVERY?</h1>
                <p className="text-gray-500 mb-12">Epic Dreams Studio will compile your project and publish it to your connected platforms.</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <button className="bg-[#111] border border-[#1a1a1a] hover:border-red-600 p-8 rounded-2xl transition-all group">
                        <Youtube size={32} className="mx-auto mb-4 text-gray-600 group-hover:text-red-600" />
                        <span className="text-xs font-bold tracking-widest block uppercase">Publish to YouTube</span>
                    </button>
                    <button className="bg-[#111] border border-[#1a1a1a] hover:border-blue-600 p-8 rounded-2xl transition-all group">
                        <Download size={32} className="mx-auto mb-4 text-gray-600 group-hover:text-blue-600" />
                        <span className="text-xs font-bold tracking-widest block uppercase">Download Master</span>
                    </button>
                    <button className="bg-[#111] border border-[#1a1a1a] hover:border-green-600 p-8 rounded-2xl transition-all group">
                        <Share2 size={32} className="mx-auto mb-4 text-gray-600 group-hover:text-green-600" />
                        <span className="text-xs font-bold tracking-widest block uppercase">Copy Review Link</span>
                    </button>
                </div>

                <div className="mt-12 p-6 bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl text-left">
                    <h3 className="text-[10px] font-bold text-gray-500 mb-4 uppercase">Project Metadata</h3>
                    <div className="space-y-4">
                        <div className="flex flex-col">
                            <label className="text-[10px] text-gray-600 mb-1">PROJECT TITLE</label>
                            <input type="text" defaultValue="THE LAST SCRIPT - EPISODE 1" className="bg-transparent border-b border-[#1a1a1a] py-2 text-sm focus:outline-none focus:border-red-500" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
