'use client';

import { useProjectStore } from '../../../store/useProjectStore';

export const AudioWorkspace: React.FC = () => {
    const { soundtracks, addSoundtrack } = useProjectStore();
    const [prompt, setPrompt] = useState('Epic orchestral music with heavy drums and space synth');
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            const response = await fetch('https://epicdreams-epic-dreams-backend.hf.space/api/v1/ai/generate-music', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'api_key': 'epic_dreams_secret_2026' },
                body: JSON.stringify({ 
                    prompt,
                    project_id: 'fad5716c-4545-49a8-9309-2b17f8de188b'
                })
            });
            const data = await response.json();
            if (data.audio_url) {
                addSoundtrack({
                    id: `st_${Date.now()}`,
                    audioUrl: data.audio_url,
                    description: data.description,
                    type: 'music'
                });
            }
        } catch (err) {
            console.error("Audio gen failed", err);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col bg-[#050505] overflow-hidden">
            {/* Top: Mixer Tools */}
            <div className="h-48 border-b border-[#111] grid grid-cols-4 gap-4 p-6 bg-[#080808]">
                {['Master', 'Dialogue', 'Music', 'SFX'].map(track => (
                    <div key={track} className="bg-[#050505] border border-[#1a1a1a] rounded-lg p-4 flex flex-col items-center">
                        <span className="text-[10px] font-bold text-gray-500 mb-4">{track.toUpperCase()}</span>
                        <div className="flex-1 w-2 bg-[#111] rounded-full relative">
                            <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-red-600 rounded-full" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Bottom: MusicGen Panel */}
            <div className="flex-1 flex">
                <div className="flex-1 p-8 border-r border-[#1a1a1a]">
                    <h2 className="text-xl font-bold mb-4 flex items-center">
                        <Sparkles className="text-red-500 mr-3" />
                        MUSICGEN ORCHESTRATOR
                    </h2>
                    <div className="max-w-xl">
                        <textarea 
                            value={prompt}
                            title="Music Prompt"
                            onChange={(e) => setPrompt(e.target.value)}
                            className="w-full h-32 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-4 text-sm text-gray-300 focus:outline-none focus:border-red-500 resize-none transition-all"
                            placeholder="e.g., Lo-fi hip hop for a raining neon street scene..."
                        />
                        <button 
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl text-sm transition-all shadow-xl shadow-red-900/20"
                        >
                            {isGenerating ? 'COMPOSING...' : 'GENERATE SOUNDTRACK'}
                        </button>
                    </div>
                </div>

                {/* Library */}
                <div className="w-96 bg-[#0a0a0a] p-6 overflow-y-auto">
                    <h3 className="text-[10px] font-bold text-gray-500 mb-4 uppercase tracking-[0.2em]">Generated Audio</h3>
                    <div className="space-y-2">
                        {soundtracks.map((st, idx) => (
                            <div key={idx} className="bg-[#111] border border-[#1a1a1a] p-3 rounded-lg flex items-center justify-between group">
                                <div className="flex items-center space-x-3 overflow-hidden">
                                    <div className="p-2 bg-red-900/20 rounded">
                                        <Music size={14} className="text-red-500" />
                                    </div>
                                    <span className="text-[10px] text-gray-400 truncate">{st.description}</span>
                                </div>
                                <button title="Play audio" className="p-1 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Play size={14} /></button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
