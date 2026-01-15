import { useState } from 'react';
import * as Icons from 'lucide-react';
import { Plus, Minus } from 'lucide-react';

export default function SavingsCard({ goal, onAddFunds, onWithdraw, isPrivacyMode }) {
    const { title, targetAmount, currentAmount, icon, color, deadline } = goal;

    // Percentage for Ring
    const percentage = Math.min(100, Math.max(0, (currentAmount / targetAmount) * 100));
    const circumference = 2 * Math.PI * 40; // radius 40
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    const IconComponent = Icons[icon] || Icons.PiggyBank;

    // Format Money
    const formatMoney = (amount) => {
        if (isPrivacyMode) return '****';
        return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(amount);
    };

    return (
        <div className="bg-surfaceHighlight/10 border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-between gap-4 min-w-[200px] hover:border-white/20 transition-all group relative overflow-hidden">
            {/* Background Glow */}
            <div
                className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none"
                style={{ backgroundColor: color }}
            ></div>

            {/* Header */}
            <div className="w-full text-center z-10">
                <h3 className="font-bold text-white text-md truncate">{title}</h3>
                <p className="text-xs text-textMuted mt-1">
                    Meta: {formatMoney(targetAmount)}
                </p>
                {deadline && (
                    <p className="text-[10px] text-textMuted mt-0.5">
                        {new Date(deadline).toLocaleDateString()}
                    </p>
                )}
            </div>

            {/* Circular Progress */}
            <div className="relative w-32 h-32 flex items-center justify-center z-10">
                {/* Background Circle */}
                <svg className="absolute w-full h-full transform -rotate-90">
                    <circle
                        cx="64"
                        cy="64"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-white/10"
                    />
                    <circle
                        cx="64"
                        cy="64"
                        r="40"
                        stroke={color}
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out drop-shadow-[0_0_8px_rgba(0,0,0,0.5)]"
                        style={{ filter: `drop-shadow(0 0 4px ${color})` }}
                    />
                </svg>

                {/* Icon Center */}
                <div
                    className="w-16 h-16 rounded-full flex items-center justify-center bg-surface border-2 border-transparent relative"
                    style={{ borderColor: `${color}40` }}
                >
                    <IconComponent size={32} color={color} />
                </div>
            </div>

            {/* Current Amount & Actions */}
            <div className="w-full flex flex-col items-center gap-3 z-10">
                <div className="text-center">
                    <span className={`text-xl font-bold text-white ${isPrivacyMode ? 'blur-sm' : ''}`}>
                         {formatMoney(currentAmount)}
                    </span>
                    <p className="text-xs text-textMuted">Ahorrado ({Math.round(percentage)}%)</p>
                </div>

                <div className="flex gap-2 w-full">
                    <button
                        onClick={() => onWithdraw(goal)}
                        className="flex-1 btn-icon h-8 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors rounded-lg flex items-center justify-center"
                        title="Retirar"
                    >
                        <Minus size={16} />
                    </button>
                    <button
                        onClick={() => onAddFunds(goal)}
                        className="flex-1 btn-icon h-8 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-colors rounded-lg flex items-center justify-center"
                        title="Agregar Fondos"
                    >
                        <Plus size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
