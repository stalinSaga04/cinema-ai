'use client';

import { useState, useEffect } from 'react';
import { getAdminStats } from '@/lib/api';
import {
    TrendingUp, Users, Cpu, IndianRupee, Activity,
    RefreshCcw, ShieldAlert, Loader2, Zap, Film,
    ArrowUp, ArrowDown, Clock
} from 'lucide-react';
import { motion } from 'framer-motion';

const PLAN_COLORS: Record<string, string> = {
    free: 'bg-gray-600',
    creator: 'bg-amber-500',
    pro: 'bg-[#f0b429]',
    agency: 'bg-purple-500',
};

const PLAN_TEXT: Record<string, string> = {
    free: 'text-gray-400',
    creator: 'text-amber-400',
    pro: 'text-[#f0b429]',
    agency: 'text-purple-400',
};

export default function AdminDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchStats = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await getAdminStats();
            setStats(data);
        } catch (err: any) {
            setError(err.message || 'Failed to load admin stats.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchStats(); }, []);

    if (loading && !stats) {
        return (
            <div className="min-h-screen bg-[#080808] flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 text-[#f0b429] animate-spin mx-auto" />
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Loading Command Centre...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#080808] flex items-center justify-center text-center p-8">
                <div>
                    <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
                    <p className="text-red-400 font-mono text-sm">{error}</p>
                </div>
            </div>
        );
    }

    const paidUsers = (stats?.user_breakdown?.creator || 0) + (stats?.user_breakdown?.pro || 0) + (stats?.user_breakdown?.agency || 0);
    const isProfit = stats?.profit_estimate_inr >= 0;

    return (
        <div className="min-h-screen bg-[#080808] text-white font-dm-sans">

            {/* TOP NAV */}
            <header className="h-16 border-b border-white/5 bg-[#0a0a0a] flex items-center justify-between px-8 sticky top-0 z-50">
                <div className="flex items-center space-x-3">
                    <Film className="h-5 w-5 text-[#f0b429]" />
                    <span className="font-bebas-neue tracking-widest text-xl pt-1">CINEMA AI</span>
                    <span className="ml-3 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-[10px] font-bold text-red-400 uppercase tracking-widest flex items-center space-x-1.5">
                        <ShieldAlert className="w-3 h-3" />
                        <span>Admin Console</span>
                    </span>
                </div>
                <button
                    onClick={fetchStats}
                    className="p-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-gray-400 hover:text-[#f0b429]"
                >
                    <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </header>

            <main className="p-8 max-w-[1600px] mx-auto space-y-8">

                <div>
                    <h1 className="text-5xl font-bebas-neue tracking-wider mb-1">COMMAND <span className="text-[#f0b429]">CENTRE</span></h1>
                    <p className="text-gray-500 text-sm">Real-time business intelligence across all Cinema AI users.</p>
                </div>

                {/* ── ROW 1: KPI CARDS ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                    <KpiCard
                        label="MRR Estimate"
                        value={`₹${(stats?.mrr_estimate_inr || 0).toLocaleString()}`}
                        sub="Monthly recurring revenue"
                        icon={IndianRupee}
                        color="text-[#f0b429]"
                        glow="shadow-[0_0_30px_rgba(240,180,41,0.08)]"
                    />
                    <KpiCard
                        label="Total Users"
                        value={stats?.total_users || 0}
                        sub={`${paidUsers} paid · ${stats?.user_breakdown?.free || 0} free`}
                        icon={Users}
                        color="text-blue-400"
                        glow="shadow-[0_0_30px_rgba(96,165,250,0.08)]"
                    />
                    <KpiCard
                        label="Conversion Rate"
                        value={`${stats?.conversion_rate_pct || 0}%`}
                        sub="Free → Paid upgrade rate"
                        icon={TrendingUp}
                        color="text-green-400"
                        glow="shadow-[0_0_30px_rgba(74,222,128,0.08)]"
                    />
                    <KpiCard
                        label={isProfit ? 'Gross Profit' : 'Net Loss'}
                        value={`₹${Math.abs(stats?.profit_estimate_inr || 0).toLocaleString()}`}
                        sub={`Compute cost: ₹${stats?.compute_cost_inr || 0}`}
                        icon={isProfit ? ArrowUp : ArrowDown}
                        color={isProfit ? 'text-green-400' : 'text-red-400'}
                        glow={isProfit ? 'shadow-[0_0_30px_rgba(74,222,128,0.08)]' : 'shadow-[0_0_30px_rgba(239,68,68,0.08)]'}
                    />
                </div>

                {/* ── ROW 2: PLAN DISTRIBUTION + MODE BREAKDOWN ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Plan Distribution */}
                    <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8">
                        <h2 className="font-bebas-neue text-3xl tracking-wider mb-6">Plan Distribution</h2>
                        <div className="space-y-5">
                            {Object.entries(stats?.user_breakdown || {}).map(([plan, count]: any) => {
                                const pct = stats?.total_users > 0 ? ((count / stats.total_users) * 100).toFixed(0) : 0;
                                return (
                                    <div key={plan}>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className={`text-sm font-bold uppercase tracking-widest ${PLAN_TEXT[plan] || 'text-gray-400'}`}>{plan}</span>
                                            <span className="text-sm font-bold text-white">{count} users <span className="text-gray-600">({pct}%)</span></span>
                                        </div>
                                        <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${pct}%` }}
                                                transition={{ duration: 0.8, ease: 'easeOut' }}
                                                className={`h-full rounded-full ${PLAN_COLORS[plan] || 'bg-gray-600'}`}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Editing Mode Breakdown */}
                    <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="font-bebas-neue text-3xl tracking-wider">Editing Mode Usage</h2>
                            <Activity className="w-5 h-5 text-gray-700" />
                        </div>
                        <div className="space-y-5">
                            {Object.entries(stats?.mode_breakdown || { highlight: 0, smart_trim: 0, story: 0 }).map(([mode, count]: any) => {
                                const total = stats?.total_projects || 1;
                                const pct = ((count / total) * 100).toFixed(0);
                                return (
                                    <div key={mode}>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-bold uppercase tracking-widest text-gray-300">{mode.replace('_', ' ')}</span>
                                            <span className="text-sm font-bold text-white">{count} projects</span>
                                        </div>
                                        <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${pct}%` }}
                                                transition={{ duration: 0.8, ease: 'easeOut' }}
                                                className="h-full rounded-full bg-gradient-to-r from-[#f0b429] to-[#d49917]"
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between text-sm">
                            <span className="text-gray-500 uppercase tracking-widest font-bold text-xs">Total Projects</span>
                            <span className="font-bold text-white text-2xl font-bebas-neue tracking-wider">{stats?.total_projects || 0}</span>
                        </div>
                    </div>
                </div>

                {/* ── ROW 3: RECENT SIGNUPS + TOP POWER USERS ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Recent Signups */}
                    <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8">
                        <div className="flex items-center space-x-3 mb-6">
                            <Clock className="w-5 h-5 text-blue-400" />
                            <h2 className="font-bebas-neue text-3xl tracking-wider">Recent Signups</h2>
                        </div>
                        <div className="space-y-3">
                            {(stats?.recent_signups || []).length === 0 && (
                                <p className="text-gray-600 text-sm">No signups yet.</p>
                            )}
                            {(stats?.recent_signups || []).map((u: any, i: number) => (
                                <div key={u.id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold text-gray-400">
                                            {i + 1}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-gray-300 font-mono">{u.id.slice(0, 16)}...</p>
                                            <p className="text-xs text-gray-600">{new Date(u.created_at).toLocaleDateString('en-IN')}</p>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                                        u.plan === 'free' ? 'border-gray-700 text-gray-500' :
                                        u.plan === 'pro' ? 'border-[#f0b429]/40 text-[#f0b429]' :
                                        'border-amber-500/40 text-amber-400'
                                    }`}>
                                        {u.plan || 'free'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Top Power Users */}
                    <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8">
                        <div className="flex items-center space-x-3 mb-6">
                            <Zap className="w-5 h-5 text-[#f0b429]" />
                            <h2 className="font-bebas-neue text-3xl tracking-wider">Top Power Users</h2>
                        </div>
                        <div className="space-y-3">
                            {(stats?.top_users || []).length === 0 && (
                                <p className="text-gray-600 text-sm">No usage data yet.</p>
                            )}
                            {(stats?.top_users || []).map((u: any, i: number) => (
                                <div key={u.id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                            i === 0 ? 'bg-[#f0b429] text-black' :
                                            i === 1 ? 'bg-gray-400 text-black' :
                                            i === 2 ? 'bg-amber-700 text-black' :
                                            'bg-white/5 text-gray-400'
                                        }`}>
                                            #{i + 1}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-gray-300 font-mono">{u.id.slice(0, 16)}...</p>
                                            <p className="text-xs text-gray-600">{(u.plan || 'free').toUpperCase()}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-[#f0b429]">{parseFloat(u.usage_minutes_used || 0).toFixed(1)} min</p>
                                        <p className="text-[10px] text-gray-600">used</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Compute Health ── */}
                <div className="bg-gradient-to-r from-[#f0b429]/10 to-transparent border border-[#f0b429]/20 rounded-3xl p-8 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Server Compute Usage</p>
                        <p className="text-4xl font-bebas-neue tracking-wider text-white">{(stats?.total_minutes_processed || 0).toFixed(1)} <span className="text-gray-500 text-2xl">minutes processed</span></p>
                        <p className="text-sm text-gray-500 mt-1">Estimated cost: <span className="text-red-400 font-bold">₹{stats?.compute_cost_inr || 0}</span> | Revenue: <span className="text-green-400 font-bold">₹{stats?.mrr_estimate_inr || 0}</span></p>
                    </div>
                    <Cpu className="w-20 h-20 text-[#f0b429]/20" />
                </div>

            </main>
        </div>
    );
}

function KpiCard({ label, value, sub, icon: Icon, color, glow }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-[#0a0a0a] border border-white/5 rounded-3xl p-7 ${glow}`}
        >
            <div className={`p-3 rounded-2xl bg-white/5 w-fit mb-5`}>
                <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.25em] mb-2">{label}</p>
            <p className={`text-4xl font-bebas-neue tracking-wider ${color}`}>{value}</p>
            <p className="text-xs text-gray-600 mt-1 font-medium">{sub}</p>
        </motion.div>
    );
}
