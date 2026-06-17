'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getProjects, getUserUsage, logout } from '@/lib/api';
import { Project } from '@/lib/types';
import {
    Film, Plus, Clock, Zap, LogOut, LayoutDashboard,
    Settings, User, MoreVertical, Loader2, TrendingUp,
    ArrowRight, Crown, Play
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const PLAN_BADGE: Record<string, { label: string, color: string, border: string }> = {
    free:    { label: 'FREE',    color: 'text-gray-400',    border: 'border-gray-600' },
    creator: { label: 'CREATOR', color: 'text-amber-400',   border: 'border-amber-500' },
    pro:     { label: 'PRO',     color: 'text-[#f0b429]',   border: 'border-[#f0b429]' },
    agency:  { label: 'AGENCY',  color: 'text-purple-400',  border: 'border-purple-500' },
};

// Circular arc gauge component
function UsageGauge({ used, limit }: { used: number, limit: number }) {
    const pct = Math.min((used / Math.max(limit, 1)) * 100, 100);
    const radius = 70;
    const circ = 2 * Math.PI * radius;
    const dashoffset = circ - (pct / 100) * circ;
    const isHigh = pct >= 80;

    return (
        <div className="relative flex items-center justify-center w-48 h-48 mx-auto">
            <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 160 160">
                <circle cx="80" cy="80" r={radius} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="12" />
                <motion.circle
                    cx="80" cy="80" r={radius}
                    fill="none"
                    stroke={isHigh ? '#f87171' : '#f0b429'}
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={circ}
                    initial={{ strokeDashoffset: circ }}
                    animate={{ strokeDashoffset: dashoffset }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                />
            </svg>
            <div className="text-center z-10">
                <p className={`text-4xl font-bebas-neue tracking-wider ${isHigh ? 'text-red-400' : 'text-[#f0b429]'}`}>
                    {used.toFixed(1)}
                </p>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">of {limit}m</p>
            </div>
        </div>
    );
}

export default function Dashboard() {
    const router = useRouter();
    const [projects, setProjects] = useState<Project[]>([]);
    const [usage, setUsage] = useState({ plan: 'free', used: 0, limit: 10, total_projects: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [projs, use] = await Promise.all([getProjects(), getUserUsage()]);
                const active = projs.filter(p => p.status !== 'deleted');
                setProjects(active);
                setUsage({
                    plan: use.plan,
                    used: use.usage_minutes_used,
                    limit: use.usage_minutes_limit,
                    total_projects: active.length,
                });
            } catch (err) {
                console.error('Dashboard error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#080808] flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-[#f0b429] animate-spin" />
            </div>
        );
    }

    const badge = PLAN_BADGE[usage.plan.toLowerCase()] || PLAN_BADGE.free;
    const remaining = Math.max(0, usage.limit - usage.used);
    const isFree = usage.plan.toLowerCase() === 'free';
    const readyProjects = projects.filter(p => p.status === 'ready' || p.status === 'done');
    const mostUsedMode = projects.length > 0
        ? Object.entries(
            projects.reduce((acc: any, p) => { acc[p.mode || 'highlight'] = (acc[p.mode || 'highlight'] || 0) + 1; return acc; }, {})
        ).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || 'Highlight'
        : '—';

    return (
        <div className="min-h-screen bg-[#080808] text-white flex font-dm-sans">

            {/* ── SIDEBAR ── */}
            <aside className="w-64 border-r border-white/5 bg-[#0a0a0a] flex flex-col p-6 fixed inset-y-0 z-50">
                <div className="flex items-center space-x-2 mb-12">
                    <Film className="h-6 w-6 text-[#f0b429]" />
                    <span className="font-bebas-neue text-2xl tracking-widest pt-1">CINEMA AI</span>
                </div>

                <nav className="flex-1 space-y-2">
                    <SidebarItem icon={LayoutDashboard} label="Dashboard" active href="/dashboard" />
                    <SidebarItem icon={User} label="Profile" href="#" disabled />
                    <SidebarItem icon={Settings} label="Settings" href="#" disabled />
                </nav>

                {/* Plan badge in sidebar */}
                <div className={`mb-6 border ${badge.border} rounded-2xl p-4`}>
                    <div className="flex items-center justify-between mb-3">
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${badge.color}`}>{badge.label} PLAN</span>
                        {isFree && <Crown className="w-3 h-3 text-[#f0b429]" />}
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mb-2">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min((usage.used / usage.limit) * 100, 100)}%` }}
                            className="h-full rounded-full bg-[#f0b429]"
                        />
                    </div>
                    <p className="text-xs text-gray-500">{remaining.toFixed(1)} min left</p>
                    {isFree && (
                        <button className="mt-3 w-full text-center text-[10px] font-bold uppercase tracking-widest text-[#f0b429] hover:underline">
                            Upgrade →
                        </button>
                    )}
                </div>

                <div className="pt-4 border-t border-white/5">
                    <button
                        onClick={() => { logout(); router.push('/'); }}
                        className="flex items-center space-x-3 text-gray-500 hover:text-white transition-colors w-full p-2"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="text-sm font-bold uppercase tracking-widest">Logout</span>
                    </button>
                </div>
            </aside>

            {/* ── MAIN CONTENT ── */}
            <main className="flex-1 ml-64 p-10 max-w-[1400px]">

                {/* Greeting */}
                <div className="mb-10">
                    <h1 className="text-5xl font-bebas-neue tracking-wider mb-1">
                        YOUR <span className="text-[#f0b429]">STUDIO</span>
                    </h1>
                    <p className="text-gray-400 text-sm">Here's everything happening in your Cinema AI workspace.</p>
                </div>

                {/* ── STATS ROW ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">

                    {/* Big Circular Usage Gauge */}
                    <div className="col-span-1 sm:col-span-2 lg:col-span-1 bg-[#0a0a0a] border border-white/5 rounded-3xl p-6 flex flex-col items-center">
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-4">Usage Gauge</p>
                        <UsageGauge used={usage.used} limit={usage.limit} />
                        <p className="text-xs text-gray-600 mt-4 text-center font-medium">Minutes used this month</p>
                    </div>

                    <MiniStat
                        label="Projects Created"
                        value={usage.total_projects}
                        icon={Film}
                        color="text-blue-400"
                    />
                    <MiniStat
                        label="Videos Completed"
                        value={readyProjects.length}
                        icon={Play}
                        color="text-green-400"
                    />
                    <MiniStat
                        label="Favourite Mode"
                        value={mostUsedMode.replace('_', ' ')}
                        icon={TrendingUp}
                        color="text-purple-400"
                        isText
                    />
                </div>

                {/* Upgrade nudge for free users */}
                {isFree && (
                    <div className="mb-10 bg-gradient-to-r from-[#f0b429]/10 via-transparent to-transparent border border-[#f0b429]/20 rounded-2xl p-5 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-[#f0b429]/10 rounded-xl">
                                <Crown className="w-5 h-5 text-[#f0b429]" />
                            </div>
                            <div>
                                <p className="font-bold text-sm text-white">You are on the Free plan</p>
                                <p className="text-xs text-gray-400">Upgrade to Creator for 50 mins/month, HD exports, and no watermark.</p>
                            </div>
                        </div>
                        <button className="flex items-center space-x-2 bg-[#f0b429] text-black px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#d49917] transition-all whitespace-nowrap shrink-0 ml-4">
                            <span>Upgrade</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* ── PROJECTS GRID ── */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xs font-bold text-gray-500 uppercase tracking-[0.25em]">Recent Projects</h2>
                    <button
                        onClick={() => router.push('/workspace')}
                        className="bg-[#f0b429] text-black px-5 py-2.5 rounded-xl font-bold flex items-center space-x-2 hover:opacity-90 transition-all text-sm"
                    >
                        <Plus className="w-4 h-4" />
                        <span>NEW PROJECT</span>
                    </button>
                </div>

                {projects.length === 0 ? (
                    <div className="bg-white/[0.02] border border-dashed border-white/10 rounded-3xl p-20 flex flex-col items-center text-center">
                        <div className="bg-white/5 p-4 rounded-full mb-6">
                            <Film className="w-12 h-12 text-gray-700" />
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-gray-300">No projects yet</h3>
                        <p className="text-gray-500 text-sm max-w-xs mx-auto mb-8">Ready to create your first AI-edited masterpiece?</p>
                        <button
                            onClick={() => router.push('/workspace')}
                            className="text-[#f0b429] font-bold uppercase tracking-widest text-xs hover:underline decoration-2 underline-offset-4"
                        >
                            Create Now →
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map(p => (
                            <ProjectCard key={p.id} project={p} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

function SidebarItem({ icon: Icon, label, active = false, disabled = false, href }: any) {
    const cls = `flex items-center space-x-3 p-3 rounded-xl transition-all cursor-pointer group
        ${active ? 'bg-[#f0b429]/10 text-white' : 'text-gray-500 hover:text-gray-300'}
        ${disabled ? 'opacity-30 cursor-not-allowed pointer-events-none' : ''}`;
    if (disabled) return (
        <div className={cls}>
            <Icon className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-bold uppercase tracking-widest">{label}</span>
        </div>
    );
    return (
        <Link href={href} className={cls}>
            <Icon className={`w-5 h-5 ${active ? 'text-[#f0b429]' : 'text-gray-600 group-hover:text-gray-400'}`} />
            <span className="text-sm font-bold uppercase tracking-widest">{label}</span>
        </Link>
    );
}

function MiniStat({ label, value, icon: Icon, color, isText }: any) {
    return (
        <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-6 flex flex-col">
            <div className={`p-3 bg-white/5 rounded-2xl w-fit mb-4`}>
                <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-2">{label}</p>
            <p className={`font-bebas-neue tracking-wider leading-none ${color} ${isText ? 'text-2xl' : 'text-4xl'}`}>{value}</p>
        </div>
    );
}

function ProjectCard({ project }: { project: Project }) {
    const isReady = project.status === 'ready' || project.status === 'done';

    return (
        <motion.div
            whileHover={{ y: -4 }}
            className="group bg-[#0a0a0a] border border-white/5 hover:border-[#f0b429]/30 rounded-3xl overflow-hidden transition-all shadow-xl"
        >
            <div className="aspect-video bg-white/[0.03] relative flex items-center justify-center overflow-hidden">
                {isReady ? (
                    <div className="w-full h-full bg-gradient-to-br from-[#f0b429]/10 to-transparent flex items-center justify-center">
                        <Film className="w-10 h-10 text-[#f0b429]/30 group-hover:scale-110 transition-transform" />
                    </div>
                ) : (
                    <div className="flex flex-col items-center space-y-2 opacity-30">
                        <Loader2 className="w-8 h-8 animate-spin" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">{project.status}...</span>
                    </div>
                )}

                {isReady && (
                    <Link
                        href={`/workspace/review/${project.id}`}
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                        <div className="bg-[#f0b429] text-black w-12 h-12 rounded-full flex items-center justify-center translate-y-4 group-hover:translate-y-0 transition-transform">
                            <Play className="w-5 h-5 ml-0.5" />
                        </div>
                    </Link>
                )}
            </div>

            <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-bold truncate pr-4">{project.name || 'Untitled Work'}</h3>
                    <button className="text-gray-700 hover:text-white shrink-0">
                        <MoreVertical className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex items-center space-x-2 mb-4">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-2 py-0.5 border border-white/5 rounded-full">{project.mode || 'highlight'}</span>
                    <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{project.content_type || 'vlog'}</span>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                        {new Date(project.created_at).toLocaleDateString('en-IN')}
                    </span>
                    {isReady && (
                        <Link href={`/workspace/review/${project.id}`} className="text-[#f0b429] text-xs font-bold uppercase tracking-widest hover:underline flex items-center space-x-1">
                            <span>Open</span>
                            <ArrowRight className="w-3 h-3" />
                        </Link>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
