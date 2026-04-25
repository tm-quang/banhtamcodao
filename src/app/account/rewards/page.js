/**
 * Account rewards page component
 * @file src/app/account/rewards/page.js
 */
'use client';
import { useMemo, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Diamond, Bell, Gift, TrendingUp, History as HistoryIcon, Ticket } from 'lucide-react';

export default function RewardsPage() {
    const { user, loading, refreshUser } = useAuth();

    useEffect(() => {
        if (!loading && user) {
            const interval = setInterval(() => { refreshUser(); }, 30000);
            return () => clearInterval(interval);
        }
    }, [loading, user, refreshUser]);

    const tier = user?.membership_level || 'Khách hàng mới';
    const currentPoints = user?.reward_points || 0;
    
    let nextTierTarget = 500;
    if (tier === 'Khách hàng thân thiết') nextTierTarget = 1500;
    else if (tier === 'Khách hàng VIP') nextTierTarget = 1500;
    
    const progress = nextTierTarget > 0 ? Math.min(100, Math.round((currentPoints / nextTierTarget) * 100)) : 100;

    const tierConfig = {
        'Khách hàng VIP': {
            gradient: 'from-[#0F172A] via-[#1E293B] to-[#334155]',
            accent: 'text-cyan-400',
            bgAccent: 'bg-cyan-500/20',
            label: 'Hạng Kim Cương'
        },
        'Khách hàng thân thiết': {
            gradient: 'from-[#334155] via-[#475569] to-[#64748B]',
            accent: 'text-slate-300',
            bgAccent: 'bg-slate-400/20',
            label: 'Hạng Bạc'
        },
        'Khách hàng mới': {
            gradient: 'from-[#78350F] via-[#92400E] to-[#B45309]',
            accent: 'text-amber-200',
            bgAccent: 'bg-amber-500/20',
            label: 'Hạng Đồng'
        }
    };

    const currentConfig = tierConfig[tier] || tierConfig['Khách hàng mới'];

    const benefitCards = useMemo(
        () => [
            { title: 'Giảm 10% đơn tiếp theo', description: 'Áp dụng khi đạt mốc 1.000 điểm tích lũy.', available: currentPoints >= 1000, icon: Gift },
            { title: 'Free ship nội thành', description: 'Ưu đãi cho mọi đơn hàng từ 150k.', available: true, icon: Ticket },
            { title: 'Quà tặng sinh nhật', description: 'Món quà bất ngờ trong tháng sinh nhật.', available: true, icon: Bell },
        ],
        [currentPoints]
    );

    if (loading && !user) {
        return (
            <div className="space-y-6">
                <div className="h-[250px] rounded-2xl bg-gray-100" />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[1, 2, 3].map(i => <div key={i} className="h-24 rounded-2xl bg-gray-50" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Tier Card */}
            <section className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${currentConfig.gradient} p-5 text-white shadow-sm`}>
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/5 blur-3xl" />
                
                <div className="relative flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-1.5 mb-1.5">
                                <div className={`flex h-6 w-6 items-center justify-center rounded-full ${currentConfig.bgAccent}`}>
                                    <Diamond size={12} className={currentConfig.accent} />
                                </div>
                                <span className={`text-[8px] font-bold uppercase tracking-widest ${currentConfig.accent}`}>
                                    {currentConfig.label}
                                </span>
                            </div>
                            <h2 className="text-xl font-black tracking-tight leading-none">{tier}</h2>
                        </div>
                        <div className="text-right">
                            <p className="text-[8px] font-bold uppercase tracking-widest text-white/50 mb-0">Điểm hiện có</p>
                            <p className="text-2xl font-black tracking-tighter leading-none">{currentPoints}</p>
                        </div>
                    </div>

                    <div className="space-y-2 pt-2.5 border-t border-white/10">
                        <div className="flex items-center justify-between text-[10px] font-bold">
                            <span className="text-white/70">Tiến trình</span>
                            <span className={currentConfig.accent}>{progress}%</span>
                        </div>
                        <div className="relative h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                            <div
                                className={`absolute top-0 left-0 h-full rounded-full bg-white transition-all duration-1000 ease-out`}
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Point Stats */}
            <section className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                    { label: 'Đã quy đổi', value: user.redeemed_points || 0, icon: HistoryIcon },
                    { label: 'Đơn ưu đãi', value: user.discounted_orders || 0, icon: Gift },
                    { label: 'Chờ duyệt', value: user.upcoming_points || 0, icon: TrendingUp },
                ].map((stat) => (
                    <div key={stat.label} className="rounded-xl bg-white p-4 shadow-sm border border-gray-50 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">
                            <stat.icon size={18} />
                        </div>
                        <div>
                            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">{stat.label}</p>
                            <p className="text-xl font-black text-secondary tracking-tight">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </section>

            {/* Benefits */}
            <section className="space-y-3">
                <h3 className="text-base font-bold text-secondary px-1">Đặc quyền</h3>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                    {benefitCards.map((benefit) => (
                        <div
                            key={benefit.title}
                            className={`relative rounded-xl border p-4 transition-all ${
                                benefit.available
                                    ? 'bg-white border-gray-100 shadow-sm'
                                    : 'bg-gray-50 border-dashed border-gray-200 grayscale'
                            }`}
                        >
                            <div className="flex items-start justify-between gap-3 mb-3">
                                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${benefit.available ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-400'}`}>
                                    <benefit.icon size={18} />
                                </div>
                                {benefit.available && (
                                    <button className="px-3 py-1.5 rounded-lg bg-secondary text-white text-[9px] font-bold transition-all">
                                        ĐỔI
                                    </button>
                                )}
                            </div>
                            <h4 className="text-sm font-bold text-secondary mb-0.5 leading-tight">{benefit.title}</h4>
                            <p className="text-[11px] text-gray-500 font-medium leading-tight">{benefit.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Tips Section */}
            <section className="rounded-xl bg-slate-900 p-6 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl" />
                <div className="relative z-10">
                    <h3 className="text-lg font-bold mb-4">Mẹo tích điểm ⚡</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                            'Đặt món trực tiếp qua website để nhận điểm ngay.',
                            'Mời bạn bè để nhận ngay 200 điểm.',
                            'Theo dõi ngày hội "Double Points".',
                            'Cập nhật ngày sinh để nhận quà tặng.'
                        ].map((tip, i) => (
                            <div key={i} className="flex gap-3 items-start">
                                <div className="h-5 w-5 rounded bg-white/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                                    {i + 1}
                                </div>
                                <p className="text-[13px] text-white/70 leading-relaxed">{tip}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}