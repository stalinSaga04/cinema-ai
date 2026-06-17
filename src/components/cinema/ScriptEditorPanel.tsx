'use client';

import { useState } from 'react';
import { Scene } from '@/lib/types';
import { ArrowRight, Edit3, Image as ImageIcon, Layout, Type } from 'lucide-react';

interface ScriptEditorPanelProps {
    initialScript: string;
    storyboard: Scene[];
    onSave: (script: string) => void;
}

export default function ScriptEditorPanel({ initialScript, storyboard, onSave }: ScriptEditorPanelProps) {
    const [script, setScript] = useState(initialScript);

    return (
        <div className="flex flex-col lg:flex-row h-full gap-6">
            <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold flex items-center">
                        <Type className="mr-2 h-5 w-5 text-primary" /> Edit Script
                    </h3>
                    <button
                        onClick={() => onSave(script)}
                        className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold hover:shadow-[0_0_20px_rgba(0,255,148,0.3)] transition-all flex items-center group active:scale-[0.98]"
                    >
                        Save & Continue
                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
                <textarea
                    value={script}
                    onChange={(e) => setScript(e.target.value)}
                    className="w-full h-[500px] lg:h-[600px] bg-muted/20 border rounded-2xl p-6 font-mono text-sm leading-relaxed focus:ring-2 focus:ring-primary outline-none transition-all resize-none"
                    placeholder="Start writing or editing your script here..."
                />
            </div>

            <div className="w-full lg:w-80 space-y-4">
                <h3 className="text-xl font-bold flex items-center">
                    <Layout className="mr-2 h-5 w-5 text-primary" /> Storyboard
                </h3>
                <div className="space-y-4 h-[500px] lg:h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                    {storyboard.map((scene, idx) => (
                        <div key={scene.id} className="group relative bg-muted/30 rounded-xl overflow-hidden border transition-all hover:border-primary/50">
                            <div className="aspect-video bg-muted flex items-center justify-center relative">
                                {scene.thumbnail ? (
                                    <img src={scene.thumbnail} alt={`Scene ${idx + 1}`} className="w-full h-full object-cover" />
                                ) : (
                                    <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
                                )}
                                <div className="absolute top-2 left-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm">
                                    Scene {idx + 1}
                                </div>
                            </div>
                            <div className="p-3">
                                <p className="text-xs text-muted-foreground line-clamp-2">{scene.description}</p>
                            </div>
                            <button className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Edit3 className="h-6 w-6 text-primary" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
