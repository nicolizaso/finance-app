import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Radio, AlertTriangle, TrendingUp } from 'lucide-react';

const SubscriptionWidget = () => {
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchSubscriptions = async () => {
        try {
            const res = await api.get('/fixed-expenses');
            if (res.data.success) {
                // Filter only subscriptions
                const subs = res.data.data.filter(item => item.isSubscription);

                // Calculate days until due for sorting
                const today = new Date();
                const currentDay = today.getDate();

                const sortedSubs = subs.sort((a, b) => {
                    const daysA = getDaysUntilDue(a.dayOfMonth, currentDay);
                    const daysB = getDaysUntilDue(b.dayOfMonth, currentDay);
                    return daysA - daysB;
                });

                setSubscriptions(sortedSubs.slice(0, 2)); // Take top 2
            }
        } catch (error) {
            console.error("Error fetching subscriptions:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubscriptions();
        // Optional: Listen to refresh events if needed, but simple fetch on mount is okay for now
    }, []);

    const getDaysUntilDue = (dueDay, currentDay) => {
        if (dueDay >= currentDay) {
            return dueDay - currentDay;
        } else {
            // Next month
            const today = new Date();
            const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
            return (daysInMonth - currentDay) + dueDay;
        }
    };

    if (loading) return null; // Or a skeleton
    if (subscriptions.length === 0) return null; // Don't show if no subscriptions

    return (
        <div className="bento-card p-4 flex flex-col gap-3 relative overflow-hidden group">
             {/* Background Decoration */}
             <div className="absolute -right-4 -top-4 text-surfaceHighlight/30 transform rotate-12 group-hover:rotate-0 transition-transform duration-500">
                <Radio size={80} />
            </div>

            <h3 className="text-md font-bold text-white flex items-center gap-2 relative z-10">
                <Radio size={18} className="text-primary" /> Subscription Radar
            </h3>

            <div className="space-y-3 relative z-10">
                {subscriptions.map(sub => {
                    const daysUntil = getDaysUntilDue(sub.dayOfMonth, new Date().getDate());
                    const isApproaching = daysUntil <= 3;
                    const isPriceHike = sub.lastAmount > 0 && sub.amount > sub.lastAmount;

                    return (
                        <div key={sub._id} className="bg-surfaceHighlight/40 p-3 rounded-xl border border-white/5 flex justify-between items-center">
                            <div className="flex flex-col min-w-0">
                                <span className="text-sm font-bold text-white truncate">{sub.title}</span>
                                <div className="flex items-center gap-2">
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isApproaching ? 'bg-yellow-500/20 text-yellow-400' : 'bg-surface text-textMuted'}`}>
                                        {daysUntil === 0 ? 'Hoy' : `En ${daysUntil} días`}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="text-right">
                                    <span className="block text-sm font-mono text-white">
                                        ${(sub.amount / 100).toFixed(2)}
                                    </span>
                                    {isPriceHike && (
                                        <div className="flex items-center justify-end gap-1 text-[10px] text-rose-400 font-bold">
                                            <TrendingUp size={10} />
                                            <span>Subió</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default SubscriptionWidget;
