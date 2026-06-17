'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, CheckCircle, Loader2, ImagePlus, Check } from 'lucide-react';
import { uploadClip } from '@/lib/api';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface UploadPanelProps {
    projectId: string;
    onUploadComplete: (filename: string) => void;
}

export default function UploadPanel({ projectId, onUploadComplete }: UploadPanelProps) {
    const [uploads, setUploads] = useState<{ file: File; progress: number; status: 'uploading' | 'done' | 'error' }[]>([]);

    const onDrop = async (acceptedFiles: File[]) => {
        // Enforce max 3 limit roughly
        const toUpload = acceptedFiles.slice(0, 3);
        const newUploads = toUpload.map(file => ({ file, progress: 0, status: 'uploading' as const }));
        setUploads(prev => [...prev, ...newUploads]);

        for (const file of toUpload) {
            try {
                const result = await uploadClip(projectId, file, (progress) => {
                    setUploads(prev => prev.map(u => u.file === file ? { ...u, progress } : u));
                });
                setUploads(prev => prev.map(u => u.file === file ? { ...u, status: 'done', progress: 100 } : u));
                onUploadComplete(result.filename);
            } catch (error) {
                setUploads(prev => prev.map(u => u.file === file ? { ...u, status: 'error' } : u));
            }
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'video/*': ['.mp4', '.mov', '.avi'] },
        maxFiles: 3,
    });

    return (
        <div className="space-y-6">
            <div
                {...getRootProps()}
                className={cn(
                    "border-2 border-dashed rounded-[2rem] p-10 text-center transition-colors cursor-pointer active:scale-[0.98]",
                    isDragActive ? "border-purple-500 bg-purple-500/10" : "border-white/10 hover:border-purple-500/50 bg-white/5"
                )}
            >
                <input {...getInputProps()} />
                <div className="mx-auto h-16 w-16 bg-black/50 rounded-2xl flex items-center justify-center mb-4 border border-white/5 shadow-xl">
                   <ImagePlus className="h-8 w-8 text-purple-400" />
                </div>
                <p className="text-xl font-bold text-white mb-2">Tap to Select Videos</p>
                <p className="text-sm text-gray-500">Max 3 clips (Free Tier). MP4/MOV up to 500MB.</p>
                <div className="mt-6 flex justify-center">
                    <span className="bg-purple-900/40 text-purple-300 text-xs px-3 py-1 rounded-full border border-purple-500/30">
                        Top Tip: Include both talking and b-roll clips!
                    </span>
                </div>
            </div>

            {uploads.length > 0 && (
                <div className="space-y-4">
                    <h3 className="font-bold text-lg text-white">Uploading ({uploads.length}/3)</h3>
                    {uploads.map((u, i) => (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={i} 
                            className="flex items-center p-4 bg-white/5 rounded-2xl border border-white/10"
                        >
                            <div className="flex-1 min-w-0 mr-4">
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm font-bold truncate text-white">{u.file.name}</span>
                                    <span className="text-xs font-mono text-purple-400">{Math.round(u.progress)}%</span>
                                </div>
                                <div className="w-full bg-black/50 rounded-full h-2 overflow-hidden border border-white/5">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${u.progress}%` }}
                                        className={cn(
                                            "h-full rounded-full transition-all duration-300",
                                            u.status === 'error' ? "bg-red-500" : "bg-gradient-to-r from-purple-500 to-blue-500"
                                        )}
                                    />
                                </div>
                            </div>
                            <div className="shrink-0 h-10 w-10 flex items-center justify-center bg-black/50 rounded-xl border border-white/5">
                                {u.status === 'uploading' && <Loader2 className="h-5 w-5 animate-spin text-purple-500" />}
                                {u.status === 'done' && <Check className="h-5 w-5 text-green-400" />}
                                {u.status === 'error' && <X className="h-5 w-5 text-red-500" />}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
