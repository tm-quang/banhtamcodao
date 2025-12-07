/**
 * Account rewards page component
 * @file src/app/account/rewards/page.js
 */
'use client';
import { useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Diamond, Bell, Gift, TrendingUp, History as HistoryIcon } from 'lucide-react';

export default function RewardsPage() {
    const { user } = useAuth();

    const tier = user?.membership_level || 'Thành viên thân thiết';
    const currentPoints = user?.reward_points || 0;
    const nextTierTarget = 5000;
    const progress = Math.min(100, Math.round((currentPoints / nextTierTarget) * 100));

    const benefitCards = useMemo(
        () => [
            {
                title: 'Giảm 10% cho đơn tiếp theo',
                description: 'Áp dụng khi điểm tích luỹ đạt 1.000 điểm.',
                available: currentPoints >= 1000,
            },
            {
                title: 'Miễn phí giao hàng nội thành',
                description: 'Tự động áp dụng khi đơn từ 150.000₫.',
                available: true,
            },
            {
                title: 'Ưu đãi sinh nhật',
                description: 'Tặng món yêu thích miễn phí trong tháng sinh nhật.',
                available: true,
            },
        ],
        [currentPoints]
    );

    if (!user) return null;

    return (
        <div className="space-y-6">
            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 p-6 text-white shadow-lg">
                <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.6) 0%, transparent 50%)' }} />
                <div className="relative flex flex-col gap-6">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-white/70">
                                <Diamond size={16} /> Chương trình khách hàng thân thiết
                            </span>
                            <h2 className="mt-2 text-2xl font-semibold">{tier}</h2>
                            <p className="mt-1 text-sm text-white/70">Tích điểm mỗi lần đặt món, đổi ưu đãi bất cứ lúc nào.</p>
                        </div>
                        <div className="flex flex-col items-end text-right">
                            <span className="text-xs uppercase tracking-widest text-white/70">Điểm hiện tại</span>
                            <span className="text-4xl font-bold">{currentPoints}</span>
                            <span className="text-xs text-white/60">Đạt {nextTierTarget} điểm để lên hạng tiếp theo</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-white/70">
                            <span>Tiến trình lên hạng</span>
                            <span>{progress}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-white/20">
                            <div
                                className="h-full rounded-full bg-white"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                </div>
            </section>

            <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Điểm đã đổi</p>
                        <HistoryIcon size={16} className="text-slate-400" />
                    </div>
                    <p className="mt-2 text-2xl font-bold text-slate-900">{user.redeemed_points || 0}</p>
                    <p className="mt-1 text-xs text-slate-500">Trong 12 tháng gần nhất</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Đơn được giảm giá</p>
                        <Gift size={16} className="text-slate-400" />
                    </div>
                    <p className="mt-2 text-2xl font-bold text-slate-900">{user.discounted_orders || 0}</p>
                    <p className="mt-1 text-xs text-slate-500">Tổng số đơn đã dùng ưu đãi</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Điểm dự kiến</p>
                        <TrendingUp size={16} className="text-slate-400" />
                    </div>
                    <p className="mt-2 text-2xl font-bold text-slate-900">{user.upcoming_points || 0}</p>
                    <p className="mt-1 text-xs text-slate-500">Đang chờ cộng sau các đơn gần đây</p>
                </div>
            </section>

            <section className="rounded-2xl border border-slate-100 bg-white shadow-sm">
                <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
                    <Bell className="text-slate-500" />
                    <h3 className="text-lg font-semibold text-slate-900">Ưu đãi dành riêng cho bạn</h3>
                </div>
                <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
                    {benefitCards.map((benefit) => (
                        <div
                            key={benefit.title}
                            className={`rounded-2xl border p-4 text-sm shadow-sm transition ${benefit.available
                                    ? 'border-slate-200 bg-white hover:border-slate-300'
                                    : 'border-dashed border-slate-200 bg-slate-50 text-slate-400'
                                }`}
                        >
                            <p className="text-base font-semibold text-slate-900">{benefit.title}</p>
                            <p className="mt-1 text-sm text-slate-500">{benefit.description}</p>
                            <div className="mt-4 flex items-center justify-between text-xs font-semibold uppercase tracking-wide">
                                <span className={benefit.available ? 'text-emerald-600' : 'text-slate-400'}>
                                    {benefit.available ? 'Sẵn sàng sử dụng' : 'Chưa đủ điều kiện'}
                                </span>
                                {benefit.available && (
                                    <button className="rounded-full border border-slate-300 px-3 py-1 text-xs text-slate-600 transition hover:border-slate-400">
                                        Đổi ưu đãi
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">Cách tích điểm nhanh hơn</h3>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
                    <li>Đặt món trực tiếp qua website sẽ cộng điểm ngay sau khi đơn hoàn tất.</li>
                    <li>Giới thiệu bạn bè: mỗi lần bạn bè đặt đơn đầu tiên, bạn nhận thêm 200 điểm.</li>
                    <li>Cập nhật thông tin cá nhân để nhận ưu đãi sinh nhật chính xác.</li>
                </ul>
            </section>
        </div>
    );
}