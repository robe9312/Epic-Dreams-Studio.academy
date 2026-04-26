'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTimelineStore } from '../store/useTimelineStore';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE_URL = 'https://epicdreams-epic-dreams-backend.hf.space';

export const AIWorkbench: React.FC = () => {
    const [idea, setIdea] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    
    // Del store traemos los logs y la función de añadir al timeline
    const { logs, addLog, appendClipAtPlayhead, setAdvice } = useTimelineStore();
    
    // Auto-scroll para los logs
    const logsEndRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    const handleGenerate = () => {
        if (!idea.trim() || isGenerating) return;
        
        setIsGenerating(true);
        addLog({ agent: 'System', message: `📡 Iniciando conexión con FastAPI para: "${idea.substring(0, 30)}..."`, type: 'info' });

        // EventSource URL
        const apiKey = 'epic_dreams_secret_2026'; // Match the default or env
        const url = `${API_BASE_URL}/api/v2/production/stream?prompt=${encodeURIComponent(idea)}&api_key=${apiKey}`;
        const eventSource = new EventSource(url);

        // Escuchar eventos log
        eventSource.addEventListener('log', (e: MessageEvent) => {
            try {
                const data = JSON.parse(e.data);
                addLog({ agent: data.agent, message: data.message, type: 'info' });
                
                // Si es el Critic, lo mostramos elegantemente en el Mentor Panel
                if (data.agent === 'Critic Agent') {
                    setAdvice({ agent: 'Critic', message: data.message });
                }
            } catch (err) {
                console.error("Error parsing SSE log", err);
            }
        });

        // Escuchar resultado final
        eventSource.addEventListener('result', (e: MessageEvent) => {
            try {
                const parsed = JSON.parse(e.data);
                if (parsed.status === 'complete') {
                    const resultData = parsed.data;
                    
                    addLog({ agent: 'System', message: `✅ Renderizado Completo. Score: ${resultData.score}/100`, type: 'success' });
                    
                    // Inyectar en el Timeline
                    const clipDuration = 5.0; // Duración base placeholder
                    
                    // 1. Inyectar Guion
                    if (resultData.script) {
                        appendClipAtPlayhead('narrative', clipDuration, resultData.script);
                    }
                    
                    // 2. Inyectar Shotlist (Cámaras)
                    if (resultData.shotlist) {
                        appendClipAtPlayhead('visual', clipDuration, resultData.shotlist);
                    }
                    
                    setIdea('');
                    eventSource.close();
                    setIsGenerating(false);
                }
            } catch (err) {
                console.error("Error parsing SSE result", err);
                addLog({ agent: 'Error', message: 'Fallo al parsear resultado de IA.', type: 'error' });
                eventSource.close();
                setIsGenerating(false);
            }
        });

        // Manejar errores de red
        eventSource.onerror = (e) => {
            console.error("EventSource failed:", e);
            eventSource.close();
            setIsGenerating(false);
            addLog({ agent: 'Director Agent', message: '❌ Se perdió la conexión con Hugging Face. Reintenta.', type: 'error' });
        };
    };

    return (
        <div className="w-full max-w-sm h-full max-h-[600px] flex flex-col bg-[#0f0f0f] border border-[#222] rounded-xl overflow-hidden shadow-2xl">
            {/* Cabecera */}
            <div className="p-4 border-b border-[#222] bg-[#1a1a1a]">
                <h2 className="text-white font-bold text-sm tracking-widest uppercase flex items-center">
                    <span className="w-2 h-2 rounded-full bg-red-500 mr-2 animate-pulse"></span>
                    Director AI <span className="text-gray-500 ml-1 text-xs">V2</span>
                </h2>
                <p className="text-gray-400 text-xs mt-1">
                    Describe tu escena y langGraph orquestará el guion y el rodaje.
                </p>
            </div>

            {/* Input Área */}
            <div className="p-4">
                <textarea
                    value={idea}
                    onChange={(e) => setIdea(e.target.value)}
                    placeholder="Ej: Un cyberpunk hackeando un terminal bajo la lluvia de neo-tokyo..."
                    className="w-full h-24 bg-[#0a0a0a] border border-[#333] rounded p-3 text-sm text-gray-300 focus:outline-none focus:border-red-500 resize-none transition-colors"
                />
                <button
                    onClick={handleGenerate}
                    disabled={isGenerating || !idea.trim()}
                    className={`w-full mt-3 py-2 rounded text-xs font-bold tracking-wider transition-all shadow-lg flex items-center justify-center
                        ${isGenerating ? 'bg-[#333] text-gray-500 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 text-white'}
                    `}
                >
                    {isGenerating ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            DIRIGIENDO...
                        </>
                    ) : '🎬 GENERAR ESCENA'}
                </button>
            </div>

            {/* Consola de Agentes (Logs) */}
            <div className="flex-1 overflow-y-auto p-4 bg-[#0a0a0a] border-t border-[#222]">
                <h3 className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-3">Live Agent Feed</h3>
                <div className="space-y-2">
                    <AnimatePresence>
                        {logs.slice(0).reverse().map((log) => (
                            <motion.div 
                                key={log.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="text-xs font-mono p-2 rounded bg-[#111] border border-[#222] break-words"
                            >
                                <span className="text-[9px] text-gray-600 mr-2">{log.timestamp}</span>
                                <span className={`font-bold mr-2
                                    ${log.type === 'error' ? 'text-red-500' : 
                                      log.type === 'success' ? 'text-green-500' : 
                                      'text-blue-400'}
                                `}>
                                    [{log.agent}]
                                </span>
                                <span className="text-gray-300 leading-tight block mt-1">{log.message}</span>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    <div ref={logsEndRef} />
                </div>
            </div>
        </div>
    );
};
