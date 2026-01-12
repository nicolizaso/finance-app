import React, { useState, useMemo } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    X,
    CheckCircle2,
    AlertCircle,
    CreditCard,
    Calendar as CalendarIcon,
    Wallet
} from 'lucide-react';
import api from '../api/axios';

const FinancialCalendar = ({ transactions, fixedExpenses, onRefresh, isPrivacyMode }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedItems, setSelectedItems] = useState([]);

    // --- DATE HELPERS ---
    const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const getFirstDayOfMonth = (date) => {
        // 0 = Sunday, 1 = Monday, ...
        const day = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
        // Adjust for Monday start: Mon(1)->0, Sun(0)->6
        return day === 0 ? 6 : day - 1;
    };

    const monthNames = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const changeMonth = (offset) => {
        const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1);
        setCurrentDate(newDate);
        setSelectedDate(null);
    };

    const formatMoney = (amount) => Math.round(amount / 100).toLocaleString('es-AR');

    // --- DATA PROCESSING ---
    const calendarItems = useMemo(() => {
        const items = [];
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const maxDays = getDaysInMonth(currentDate);

        // 1. Real Transactions (Existing in DB)
        transactions.forEach(t => {
            const tDate = new Date(t.date);
            if (tDate.getFullYear() === year && tDate.getMonth() === month) {
                items.push({
                    id: t._id,
                    date: tDate.getDate(),
                    type: 'TRANSACTION',
                    data: t,
                    status: t.status,
                    isPaid: t.status === 'COMPLETED'
                });
            }
        });

        // 2. Credit Card Installments (Projected)
        transactions.filter(t => t.paymentMethod === 'CREDIT' && t.installments > 1).forEach(t => {
            const purchaseDate = new Date(t.date);
            const monthsDiff = (year - purchaseDate.getFullYear()) * 12 + (month - purchaseDate.getMonth());

            if (monthsDiff > 0 && monthsDiff < t.installments) {
                const installmentDay = purchaseDate.getDate();
                const actualDay = Math.min(installmentDay, maxDays);

                items.push({
                    id: `${t._id}_inst_${monthsDiff}`,
                    date: actualDay,
                    type: 'INSTALLMENT',
                    data: t,
                    installmentIndex: monthsDiff + 1,
                    status: 'PENDING',
                    isPaid: false
                });
            }
        });

        // 3. Fixed Expenses (Projected)
        // Project for ANY month (future or current) IF not already covered by a real transaction.
        // This ensures unpaid expenses show up in current month too if system didn't generate them yet
        // or user deleted them but rule exists.

        fixedExpenses.forEach(rule => {
             const actualDay = Math.min(rule.dayOfMonth, maxDays);

             // Check if a real transaction already exists for this rule in THIS month
             // Matching Criteria: Same description (roughly) and same month/year
             // This avoids duplication if the transaction was already generated/paid
             const alreadyExists = items.some(i =>
                 i.type === 'TRANSACTION' &&
                 i.data.description === rule.title &&
                 // Optional: Check amount or fuzzy match?
                 // Description matching is the most reliable link if no ID link exists.
                 // The system generates transactions with same description as title.
                 (i.data.amount === rule.amount || true) // Amount might change if edited, so ignore?
             );

             if (!alreadyExists) {
                 // Only project if the projected date is valid for this month
                 // (e.g. if rule is on 31st and month has 30, we already clamped actualDay)

                 // If we are in the past month (relative to real time), maybe we shouldn't project?
                 // But requirements say "Financial Calendar", usually historical view shows what happened.
                 // If user didn't pay in past month, it won't show unless we project "Missed Payments".
                 // For now, let's project always, assuming user wants to see what SHOULD happen/happened.

                 items.push({
                    id: `fixed_${rule._id}_${month}`,
                    date: actualDay,
                    type: 'FIXED_PROJECTION',
                    data: rule,
                    status: 'PENDING',
                    isPaid: false
                });
             }
        });

        return items;
    }, [currentDate, transactions, fixedExpenses]);

    // --- INTERACTION ---
    const handleDayClick = (day) => {
        const items = calendarItems.filter(i => i.date === day);
        if (items.length > 0) {
            setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
            setSelectedItems(items);
        }
    };

    const handleMarkAsPaid = async (item) => {
        if (item.type === 'TRANSACTION') {
            try {
                await api.put(`/transactions/${item.id}`, {
                    ...item.data,
                    status: 'COMPLETED'
                });
                onRefresh();
                // Update local state temporarily to reflect change instantly
                setSelectedItems(prev => prev.map(i => i.id === item.id ? { ...i, status: 'COMPLETED', isPaid: true } : i));
            } catch (error) {
                console.error(error);
            }
        } else if (item.type === 'FIXED_PROJECTION') {
            // Create the transaction as COMPLETED
            try {
                const rule = item.data;
                const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), item.date);

                await api.post('/transactions', {
                    description: rule.title,
                    amount: rule.amount,
                    type: 'EXPENSE',
                    category: rule.category,
                    date: date,
                    status: 'COMPLETED',
                    isFixed: true,
                    // Payment details
                    paymentMethod: rule.paymentMethod,
                    paymentLink: rule.paymentLink,
                    cbuAlias: rule.cbuAlias,
                    currency: rule.currency,
                    autoDebitCard: rule.autoDebitCard
                });
                onRefresh();
                // Close modal as data will refresh
                setSelectedDate(null);
            } catch (error) {
                console.error(error);
            }
        }
    };

    // --- RENDER ---
    const renderGrid = () => {
        const daysInMonth = getDaysInMonth(currentDate);
        const startDay = getFirstDayOfMonth(currentDate); // 0-6
        const days = [];

        // Empty slots
        for (let i = 0; i < startDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-24 bg-transparent border border-border/20 opacity-30"></div>);
        }

        // Days
        for (let day = 1; day <= daysInMonth; day++) {
            const items = calendarItems.filter(i => i.date === day);
            const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();

            // Indicators
            const hasOverdue = items.some(i => !i.isPaid && new Date(currentDate.getFullYear(), currentDate.getMonth(), day) < new Date() && i.type !== 'INSTALLMENT');
            const hasPending = items.some(i => !i.isPaid);
            const allPaid = items.length > 0 && items.every(i => i.isPaid);

            let indicatorColor = 'bg-gray-500'; // Default Future/Pending
            if (allPaid) indicatorColor = 'bg-emerald-500';
            else if (hasOverdue) indicatorColor = 'bg-rose-500';
            else if (hasPending) indicatorColor = 'bg-gray-400';

            days.push(
                <div
                    key={day}
                    onClick={() => handleDayClick(day)}
                    className={`h-24 border border-border/20 p-2 relative transition-all hover:bg-white/5 cursor-pointer flex flex-col items-start justify-between
                        ${isToday ? 'bg-primary/10 border-primary/50' : 'bg-surface/30'}
                    `}
                >
                    <span className={`text-sm font-bold ${isToday ? 'text-primary' : 'text-textMuted'}`}>{day}</span>

                    {items.length > 0 && (
                        <div className="flex flex-wrap gap-1 content-end w-full">
                            {/* Simple Dots */}
                            {items.slice(0, 5).map((item, idx) => {
                                let dotColor = 'bg-gray-500';
                                if (item.isPaid) dotColor = 'bg-emerald-500';
                                else if (item.type === 'INSTALLMENT') dotColor = 'bg-blue-400'; // Installments blueish?
                                else if (new Date(currentDate.getFullYear(), currentDate.getMonth(), day) < new Date()) dotColor = 'bg-rose-500';

                                return (
                                    <div key={idx} className={`w-2 h-2 rounded-full ${dotColor}`} title={item.data.description || item.data.title} />
                                );
                            })}
                            {items.length > 5 && <span className="text-[10px] text-textMuted">+</span>}
                        </div>
                    )}
                </div>
            );
        }
        return days;
    };

    return (
        <div className="flex flex-col h-full bg-surface rounded-3xl border border-border shadow-glow overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-border bg-surfaceHighlight/20">
                <h2 className="text-2xl font-bold text-white font-heading capitalize flex items-center gap-2">
                    <CalendarIcon className="text-primary" />
                    {monthNames[currentDate.getMonth()]} <span className="text-textMuted">{currentDate.getFullYear()}</span>
                </h2>
                <div className="flex gap-2">
                    <button onClick={() => changeMonth(-1)} className="p-2 rounded-xl bg-surface border border-border hover:border-primary text-textMuted hover:text-white transition-all"><ChevronLeft size={20} /></button>
                    <button onClick={() => changeMonth(1)} className="p-2 rounded-xl bg-surface border border-border hover:border-primary text-textMuted hover:text-white transition-all"><ChevronRight size={20} /></button>
                </div>
            </div>

            {/* Weekdays */}
            <div className="grid grid-cols-7 bg-surfaceHighlight/50 border-b border-border">
                {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => (
                    <div key={d} className="py-2 text-center text-xs font-bold text-textMuted uppercase tracking-wider">{d}</div>
                ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-7 flex-1 overflow-y-auto custom-scrollbar">
                {renderGrid()}
            </div>

            {/* Day Summary Modal */}
            {selectedDate && (
                <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
                    <div className="w-full max-w-md bg-surface border border-primary/50 rounded-3xl p-6 relative shadow-glow">
                        <button onClick={() => setSelectedDate(null)} className="absolute top-4 right-4 text-textMuted hover:text-white transition-colors">
                            <X size={20} />
                        </button>

                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-white font-heading">
                                {selectedDate.getDate()} de {monthNames[selectedDate.getMonth()]}
                            </h3>
                            <p className="text-textMuted text-sm">Resumen del día</p>
                        </div>

                        <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                            {selectedItems.map((item, idx) => {
                                const isOverdue = !item.isPaid && new Date() > selectedDate && item.type !== 'INSTALLMENT';
                                const canPay = !item.isPaid && item.type !== 'INSTALLMENT';

                                return (
                                    <div key={idx} className="bg-surfaceHighlight/30 p-3 rounded-xl border border-white/5 flex flex-col gap-2">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-start gap-3 min-w-0">
                                                <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${item.isPaid ? 'bg-emerald-500' : isOverdue ? 'bg-rose-500' : 'bg-blue-400'}`} />
                                                <div className="min-w-0">
                                                    <p className="text-white font-medium truncate">
                                                        {item.data.description || item.data.title}
                                                    </p>
                                                    {item.type === 'INSTALLMENT' && (
                                                        <p className="text-[10px] text-blue-300 flex items-center gap-1">
                                                            <CreditCard size={10} />
                                                            Cuota {item.installmentIndex}/{item.data.installments}
                                                        </p>
                                                    )}
                                                    {isOverdue && (
                                                        <p className="text-[10px] text-rose-400 flex items-center gap-1">
                                                            <AlertCircle size={10} /> Vencido
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <span className={`font-mono font-bold ${isPrivacyMode ? 'blur-sm' : ''} ${item.isPaid ? 'text-emerald-500' : 'text-white'}`}>
                                                ${isPrivacyMode ? '***' : formatMoney(item.type === 'INSTALLMENT' ? (item.data.amount / item.data.installments) : item.data.amount)}
                                            </span>
                                        </div>

                                        {/* Action Button */}
                                        {canPay && (
                                            <button
                                                onClick={() => handleMarkAsPaid(item)}
                                                className="mt-1 w-full py-2 bg-primary/20 hover:bg-primary/40 text-primary hover:text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 border border-primary/20"
                                            >
                                                <CheckCircle2 size={14} /> Marcar como Pagado
                                            </button>
                                        )}
                                        {item.type === 'INSTALLMENT' && (
                                             <div className="mt-1 w-full py-2 bg-white/5 rounded-lg text-xs text-center text-textMuted border border-white/5">
                                                Se paga en resumen de tarjeta
                                             </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FinancialCalendar;
