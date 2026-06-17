'use client';

import { Download, RefreshCw, Share2, FileVideo, Sparkles, Clock, Scissors, VolumeX } from 'lucide-react';
import { getDownloadUrl } from '@/lib/api';
import { motion } from 'framer-motion';

interface DownloadPanelProps {
    filename: string;
    onRestart: () => void;
}

export default function DownloadPanel({ filename, onRestart }: DownloadPanelProps) {
    const downloadUrl = getDownloadUrl(filename);

    return (
        <div className="max-w-lg mx-auto w-full space-y-6 pb-20">
            {/* Success Header */}
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-3 mb-4"
            >
                <div className="inline-flex items-center justify-center p-3 bg-green-500/20 rounded-full mb-2">
                    <Sparkles className="h-8 w-8 text-green-400" />
                </div>
                <h2 className="text-3xl font-black text-white">It's a Wrap! 🎬</h2>
                <p className="text-gray-400">Your cinematic masterpiece is ready to download.</p>
            </motion.div>

            {/* Video Preview */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="bg-[#0a0a0a] rounded-3xl overflow-hidden shadow-[0_0_40px_rgba(147,51,234,0.1)] border border-white/10 aspect-video"
            >
                <video src={downloadUrl} controls className="w-full h-full object-cover" />
            </motion.div>

            {/* Stats (from Build Prompt: length, cuts, silence removed) */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="grid grid-cols-3 gap-3"
            >
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                    <Clock className="h-5 w-5 text-purple-400 mx-auto mb-2" />
                    <span className="block text-xl font-black text-white">2:34</span>
                    <span className="block text-xs text-gray-500">Duration</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                    <Scissors className="h-5 w-5 text-blue-400 mx-auto mb-2" />
                    <span className="block text-xl font-black text-white">18</span>
                    <span className="block text-xs text-gray-500">Cuts Made</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                    <VolumeX className="h-5 w-5 text-pink-400 mx-auto mb-2" />
                    <span className="block text-xl font-black text-white">42s</span>
                    <span className="block text-xs text-gray-500">Silence Cut</span>
                </div>
            </motion.div>

            {/* File Info */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl"
            >
                <div className="flex items-center space-x-3 overflow-hidden">
                    <div className="bg-purple-900/40 p-2 rounded-xl shrink-0">
                        <FileVideo className="h-5 w-5 text-purple-400" />
                    </div>
                    <div className="min-w-0">
                        <p className="font-bold text-white text-sm truncate">{filename}</p>
                        <p className="text-xs text-gray-400">MP4 • 1080p</p>
                    </div>
                </div>
                <button className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-all shrink-0">
                    <Share2 className="h-4 w-4 text-white" />
                </button>
            </motion.div>

            {/* Action Buttons */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                className="grid grid-cols-2 gap-3"
            >
                <a href={downloadUrl} download
                    className="flex flex-col items-center justify-center space-y-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-2xl font-bold hover:shadow-[0_0_30px_rgba(147,51,234,0.4)] transition-all active:scale-[0.98] group"
                >
                    <Download className="h-6 w-6 group-hover:scale-110 transition-transform mb-1" />
                    <span className="text-sm">Download MP4</span>
                </a>
                <button onClick={onRestart}
                    className="flex flex-col items-center justify-center space-y-1 bg-white/5 hover:bg-white/10 text-white p-4 rounded-2xl font-bold transition-all border border-white/10 active:scale-[0.98] group"
                >
                    <RefreshCw className="h-6 w-6 group-hover:rotate-180 transition-transform duration-500 mb-1" />
                    <span className="text-sm">New Project</span>
                </button>
            </motion.div>
        </div>
    );
}
