"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, MessageSquare, BarChart3, Film, Upload, Sparkles, AlertCircle, CheckCircle2, Loader2, ChevronRight, ChevronLeft, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import NeuralWaveform from '@/components/NeuralWaveform';
import { useDropzone } from 'react-dropzone';
import { uploadVideo, getStatus, getResult } from '@/lib/api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function DirectorConsole() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [chat, setChat] = useState([
    { role: 'ai', text: 'Neural Engine initialized. Ready for direction.' }
  ]);
  const [status, setStatus] = useState('IDLE');
  const [videoId, setVideoId] = useState<string | null>(null);
  const [videoResult, setVideoResult] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showHint, setShowHint] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Poll for status
  useEffect(() => {
    if (videoId && status === 'PROCESSING') {
      const interval = setInterval(async () => {
        try {
          const res = await getStatus(videoId);
          if (res.status === 'completed') {
            setStatus('COMPLETED');
            const result = await getResult(videoId);
            setVideoResult(result);
            setChat(prev => [...prev, { role: 'ai', text: 'Analysis complete. Smart Highlights generated.' }]);
            clearInterval(interval);
          } else if (res.status === 'failed') {
            if (retryCount < 3) {
              setRetryCount(prev => prev + 1);
              console.warn(`Retrying status poll... (${retryCount + 1}/3)`);
            } else {
              setStatus('FAILED');
              setChat(prev => [...prev, { role: 'ai', text: `Analysis failed: ${res.error}` }]);
              clearInterval(interval);
            }
          }
        } catch (e) {
          console.error(e);
        }
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [videoId, status, retryCount]);

  // Sync time
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => setDuration(video.duration);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [videoResult]);

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    setStatus('UPLOADING');
    setChat(prev => [...prev, { role: 'user', text: `Uploading ${acceptedFiles[0].name}...` }]);

    try {
      const res = await uploadVideo(acceptedFiles[0]);
      setVideoId(res.id);
      setStatus('PROCESSING');
      setChat(prev => [...prev, { role: 'ai', text: 'Video received. Starting deep neural analysis...' }]);
    } catch (e) {
      setStatus('FAILED');
      setChat(prev => [...prev, { role: 'ai', text: 'Upload failed. Check backend connection.' }]);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { 'video/*': [] },
    multiple: false
  });

  const seekTo = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setIsPlaying(true);
      videoRef.current.play();
    }
  };

  const parseTime = (tStr: string) => {
    if (typeof tStr === 'number') return tStr;
    const parts = tStr.split(':').map(parseFloat);
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    return parts[0] * 60 + parts[1];
  };

  // Get current state data
  const currentEmotion = videoResult?.emotion_map?.find((e: any) => {
    const t = parseTime(e.time);
    return Math.abs(t - currentTime) < 1.0;
  });

  return (
    <main className="min-h-screen p-4 lg:p-8 flex flex-col gap-6 bg-[#050505] text-white">
      <div className="neural-bg" />

      {/* Header */}
      <header className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#00FF94] rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(0,255,148,0.5)]">
            <Film className="text-black w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black tracking-tighter neon-text">CINEMA AI <span className="text-xs font-mono opacity-50 ml-2">v1.0_BRAIN</span></h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="glass-panel px-4 py-2 flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${status === 'PROCESSING' ? 'bg-yellow-500 animate-pulse' : 'bg-[#00FF94]'}`} />
            <span className="text-xs font-mono uppercase tracking-widest opacity-70">
              {status === 'IDLE' ? 'System Ready' : status}
            </span>
          </div>
          <div {...getRootProps()}>
            <input {...getInputProps()} />
            <button className="cyber-button flex items-center gap-2">
              <Upload size={18} />
              {status === 'UPLOADING' ? 'UPLOADING...' : 'NEW PROJECT'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">

        {/* Left: AI Director */}
        <section className="lg:col-span-3 flex flex-col gap-4 overflow-hidden">
          <div className="glass-panel flex-1 flex flex-col p-4 overflow-hidden">
            <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-2">
              <MessageSquare size={16} className="text-[#00FF94]" />
              <h2 className="text-sm font-mono uppercase tracking-tighter">AI Director Chat</h2>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              {chat.map((msg, i) => (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={i}
                  className={`p-3 rounded-xl text-sm ${msg.role === 'ai' ? 'bg-white/5 border border-white/5' : 'bg-[#00FF94]/10 border border-[#00FF94]/20 text-[#00FF94]'}`}
                >
                  <span className="text-[10px] font-mono opacity-50 block mb-1 uppercase">{msg.role}</span>
                  {msg.text}
                </motion.div>
              ))}
              {status === 'PROCESSING' && (
                <div className="flex items-center gap-2 text-xs font-mono text-[#00FF94] opacity-50 animate-pulse">
                  <Loader2 size={12} className="animate-spin" />
                  Analyzing footage...
                </div>
              )}
            </div>

            <div className="mt-4 relative">
              <input
                type="text"
                placeholder="Ask Director to edit..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#00FF94]/50 outline-none transition-all"
              />
              <Sparkles size={16} className="absolute right-4 top-3.5 text-[#00FF94] opacity-50" />
            </div>
          </div>
        </section>

        {/* Center: Master Monitor */}
        <section className="lg:col-span-6 flex flex-col gap-4 overflow-hidden">
          <div className="glass-panel flex-1 relative overflow-hidden group">
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
              <button onClick={() => {
                if (isPlaying) videoRef.current?.pause();
                else videoRef.current?.play();
                setIsPlaying(!isPlaying);
              }} className="w-20 h-20 bg-[#00FF94] rounded-full flex items-center justify-center text-black shadow-[0_0_30px_rgba(0,255,148,0.6)]">
                {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
              </button>
            </div>

            {/* Video Player */}
            <div className="w-full h-full bg-gradient-to-br from-zinc-900 to-black flex items-center justify-center overflow-hidden">
              {videoResult ? (
                <video
                  ref={videoRef}
                  src={`${API_BASE}/download/render_${videoResult.render_id}.mp4`}
                  className="w-full h-full object-contain"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
              ) : (
                <div className="text-center opacity-20">
                  <Film size={80} className="mx-auto mb-4" />
                  <p className="font-mono text-sm uppercase tracking-[0.5em]">
                    {status === 'PROCESSING' ? 'Analyzing...' : 'No Footage Loaded'}
                  </p>
                </div>
              )}
            </div>

            {/* HUD Overlays */}
            <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none z-10">
              <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded border border-white/10 flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-red-500 animate-pulse' : 'bg-zinc-500'}`} />
                <span className="text-[10px] font-mono uppercase tracking-widest">
                  {isPlaying ? 'LIVE' : 'PAUSED'} {new Date(currentTime * 1000).toISOString().substr(11, 8)}
                </span>
              </div>

              <AnimatePresence>
                {currentEmotion && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-[#00FF94]/20 backdrop-blur-md px-3 py-1 rounded border border-[#00FF94]/30 flex items-center gap-2"
                  >
                    <Zap size={12} className="text-[#00FF94]" />
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#00FF94]">
                      {currentEmotion.emotion} DETECTED
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Interactive Scene Strip */}
          <div className="glass-panel h-24 p-2 flex flex-col gap-1 overflow-hidden">
            <div className="flex justify-between items-center px-2">
              <span className="text-[8px] font-mono uppercase tracking-widest opacity-50">Interactive Scene Strip</span>
              <span className="text-[8px] font-mono uppercase tracking-widest opacity-50">{videoResult?.scenes?.length || 0} SCENES DETECTED</span>
            </div>
            <div className="flex-1 overflow-x-auto flex gap-2 custom-scrollbar pb-1" ref={scrollRef}>
              {videoResult?.scenes?.map((scene: any, i: number) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => seekTo(parseTime(scene.start))}
                  className={`flex-none w-32 h-full bg-white/5 rounded-lg border overflow-hidden relative group ${Math.abs(parseTime(scene.start) - currentTime) < 2 ? 'border-[#00FF94]' : 'border-white/10'}`}
                >
                  <img
                    src={`${API_BASE}/outputs/frames/${videoId}/frame_${String(i).padStart(4, '0')}.jpg`}
                    className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity"
                    onError={(e: any) => e.target.src = 'https://via.placeholder.com/128x72?text=SCENE'}
                  />
                  <div className="absolute bottom-1 left-1 bg-black/60 px-1 rounded text-[8px] font-mono">
                    {scene.start}
                  </div>
                </motion.button>
              ))}
              {!videoResult && Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex-none w-32 h-full bg-white/5 rounded-lg border border-white/5 animate-pulse" />
              ))}
            </div>
          </div>

          {/* Neural Timeline */}
          <div className="glass-panel h-24 p-4 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-mono uppercase tracking-widest opacity-50">Neural Intensity Map</span>
            </div>
            <div className="flex-1 bg-white/5 rounded-lg overflow-hidden relative cursor-pointer" onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const percent = x / rect.width;
              seekTo(percent * duration);
            }}>
              <NeuralWaveform
                data={videoResult?.audio_intensity || Array.from({ length: 100 }, (_, i) => ({ time: i, intensity: 0.1 }))}
                height={40}
              />
              <motion.div
                className="absolute top-0 w-px h-full bg-[#00FF94] shadow-[0_0_10px_#00FF94]"
                animate={{ left: `${(currentTime / (duration || 1)) * 100}%` }}
                transition={{ duration: 0.1, ease: 'linear' }}
              />
            </div>
          </div>
        </section>

        {/* Right: Scene Insights */}
        <section className="lg:col-span-3 flex flex-col gap-4 overflow-hidden">
          <div className="glass-panel flex-1 p-4 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
            <div className="flex items-center gap-2 border-b border-white/5 pb-2">
              <BarChart3 size={16} className="text-[#00FF94]" />
              <h2 className="text-sm font-mono uppercase tracking-tighter">Scene Insights</h2>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                <span className="text-[10px] font-mono opacity-50 uppercase block mb-2">Pacing Score</span>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-black text-[#00FF94]">
                    {videoResult ? Math.round(videoResult.comparison?.rankings[0]?.metrics?.pacing_delivery * 100) : '--'}
                  </span>
                  <span className="text-xs font-mono opacity-50 mb-1">/ 100</span>
                </div>
                <div className="mt-2 h-1 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-[#00FF94]" style={{ width: `${videoResult?.comparison?.rankings[0]?.metrics?.pacing_delivery * 100 || 0}%` }} />
                </div>
              </div>

              <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                <span className="text-[10px] font-mono opacity-50 uppercase block mb-2">Detected Characters</span>
                <div className="flex flex-wrap gap-2">
                  {videoResult?.characters?.map((c: any) => (
                    <span key={c.id} className="px-2 py-1 bg-white/5 rounded text-[10px] font-mono uppercase border border-white/10">{c.id}</span>
                  )) || <span className="text-[10px] opacity-30 italic">None</span>}
                </div>
              </div>

              {videoResult?.comparison?.rankings[0]?.metrics?.mistakes_penalty > 0 && (
                <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                  <div className="flex items-center gap-2 text-red-400 mb-2">
                    <AlertCircle size={14} />
                    <span className="text-[10px] font-mono uppercase">Mistakes Detected</span>
                  </div>
                  <p className="text-[10px] opacity-70">Long silence or pacing issues detected. Recommend auto-trim.</p>
                </div>
              )}

              <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                <span className="text-[10px] font-mono opacity-50 uppercase block mb-2">Transcript Preview</span>
                <p className="text-[10px] leading-relaxed opacity-70 italic">
                  "{videoResult?.transcript || 'No transcript available.'}"
                </p>
              </div>
            </div>
          </div>

          <div className="glass-panel p-4">
            <button
              disabled={!videoResult}
              className="w-full py-3 bg-[#00FF94] text-black disabled:bg-white/5 disabled:text-white/30 rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(0,255,148,0.3)]"
            >
              Export Master Cut
            </button>
          </div>
        </section>

      </div>

      {/* Director's Hint Overlay */}
      <AnimatePresence>
        {showHint && status === 'IDLE' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 glass-panel p-6 max-w-md border-[#00FF94]/30 shadow-[0_0_50px_rgba(0,255,148,0.2)]"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[#00FF94]/20 flex items-center justify-center flex-none">
                <Sparkles className="text-[#00FF94]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#00FF94] mb-1 uppercase tracking-tighter">Director's Hint</h3>
                <p className="text-xs opacity-70 leading-relaxed mb-4">
                  Welcome to the **Director's Console**. Upload your footage to see how **Neural Intensity Map** spikes reveal emotional beats and high-energy moments automatically.
                </p>
                <button
                  onClick={() => setShowHint(false)}
                  className="text-[10px] font-mono uppercase tracking-widest text-[#00FF94] hover:underline"
                >
                  Dismiss Console Guide
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
