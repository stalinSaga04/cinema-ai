'use client';

import { useState } from 'react';
import { RenderSettings } from '@/lib/types';
import { startRender } from '@/lib/api';
import { Play, Settings2, Video, Languages, Loader2, BrainCircuit } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface RenderPanelProps {
    projectId: string;
    onRenderStarted: (jobId: string) => void;
}

export default function RenderPanel({ projectId, onRenderStarted }: RenderPanelProps) {
    const [settings, setSettings] = useState<RenderSettings>({
        aspectRatio: '9:16',
        subtitles: true,
        mood: 'Cinematic'
    });
    const [isProcessing, setIsProcessing] = useState(false);
    const [started, setStarted] = useState(false);

    const handleRender = async () => {
        setIsProcessing(true);
        try {
            const { job_id } = await startRender(projectId, settings);
            setStarted(true);
            onRenderStarted(job_id);
        } catch (error) {
            console.error(error);
        } finally {
            setIsProcessing(false);
        }
    };

    if (started) {
        return (
            <div className="max-w-lg mx-auto w-full text-center space-y-8">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
                    className="mx-auto w-20 h-20 border-2 border-purple-500/30 border-t-purple-500 rounded-full"
                />
                <div>
                    <h2 className="text-3xl font-black text-white mb-2">Rendering...</h2>
                    <p className="text-gray-400">Your final video is being assembled. This may take 2-3 minutes.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-lg mx-auto w-full space-y-6">
            <div className="text-center mb-8">
                <BrainCircuit className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                <h2 className="text-3xl font-black text-white mb-2">Export Settings</h2>
                <p className="text-gray-400">Choose your format before we render.</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-6">
                {/* Aspect Ratio */}
                <div className="space-y-3">
                    <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">Format</label>
                    <div className="flex gap-2">
                        {(['16:9', '9:16', '1:1'] as const).map(ratio => (
                            <button
                                key={ratio}
                                onClick={() => setSettings(s => ({ ...s, aspectRatio: ratio }))}
                                className={cn(
                                    "flex-1 py-3 rounded-xl border text-sm transition-all font-bold focus:outline-none",
                                    settings.aspectRatio === ratio 
                                        ? "bg-purple-600 text-white border-purple-400" 
                                        : "bg-black/50 text-gray-400 border-white/10 hover:border-white/20"
                                )}
                            >
                                {ratio === '16:9' ? 'YouTube' : ratio === '9:16' ? 'Reels' : 'Square'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Captions Toggle */}
                <div className="flex items-center justify-between p-4 bg-black/50 border border-white/10 rounded-xl">
                    <div>
                        <span className="block font-bold text-white text-sm">Auto Captions</span>
                        <span className="block text-xs text-gray-500">AI-generated from Whisper</span>
                    </div>
                    <button
                        onClick={() => setSettings(s => ({ ...s, subtitles: !s.subtitles }))}
                        className={cn("w-12 h-6 rounded-full transition-all relative", settings.subtitles ? "bg-purple-600" : "bg-gray-700")}
                    >
                        <div className={cn("absolute top-1 w-4 h-4 rounded-full bg-white transition-all", settings.subtitles ? "left-7" : "left-1")} />
                    </button>
                </div>
            </div>

            {/* Start Render */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/90 to-transparent z-40"
            >
                <button onClick={handleRender} disabled={isProcessing}
                    className="w-full max-w-lg mx-auto bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:shadow-[0_0_30px_rgba(147,51,234,0.4)] transition-all flex items-center justify-center disabled:opacity-50"
                >
                    {isProcessing ? (
                        <><Loader2 className="animate-spin mr-2 h-5 w-5" /> Submitting...</>
                    ) : (
                        <>Start Final Render <Play className="ml-2 h-5 w-5 fill-current" /></>
                    )}
                </button>
            </motion.div>
        </div>
    );
}
