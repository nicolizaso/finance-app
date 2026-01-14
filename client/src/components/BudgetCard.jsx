import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { Settings, Check, X } from 'lucide-react';

const BudgetCard = ({ transactions, refreshTrigger }) => {
    const [budgets, setBudgets] = useState([]);
    const [editingCategory, setEditingCategory] = useState(null);
    const [newLimit, setNewLimit] = useState('');
    const [loading, setLoading] = useState(true);

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // 1-12
    const currentYear = currentDate.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    const dayOfMonth = currentDate.getDate();
    const pacePercentage = (dayOfMonth / daysInMonth) * 100;

    // Calculate totals per category from transactions
    // Filter transactions for current month first
    const currentMonthTransactions = transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate.getMonth() + 1 === currentMonth && tDate.getFullYear() === currentYear && t.type === 'EXPENSE';
    });

    const categoryTotals = currentMonthTransactions.reduce((acc, t) => {
        const cat = t.category || 'Uncategorized';
        acc[cat] = (acc[cat] || 0) + t.amount;
        return acc;
    }, {});

    // Get all unique categories from transactions + budgets
    // We want to show budgets for categories that exist in transactions OR have a budget set
    const categoriesFromTransactions = Object.keys(categoryTotals);

    // Fetch budgets
    const fetchBudgets = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/budgets?month=${currentMonth}&year=${currentYear}`);
            setBudgets(response.data);
        } catch (error) {
            console.error("Error fetching budgets:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBudgets();
    }, [currentMonth, currentYear, refreshTrigger]);

    // Combine categories
    const allCategories = new Set([...categoriesFromTransactions, ...budgets.map(b => b.category)]);
    const sortedCategories = Array.from(allCategories).sort();

    const handleUpdateBudget = async (category) => {
        try {
            const amount = parseFloat(newLimit);
            if (isNaN(amount) || amount <= 0) return;

            await axios.post('/budgets', {
                category,
                limitAmount: amount,
                month: currentMonth,
                year: currentYear
            });

            await fetchBudgets();
            setEditingCategory(null);
            setNewLimit('');
        } catch (error) {
            console.error("Error updating budget:", error);
        }
    };

    const getBudgetForCategory = (cat) => budgets.find(b => b.category === cat);

    return (
        <div className="bento-card h-full flex flex-col p-0 border-primary/10">
            <div className="p-4 border-b border-border bg-surfaceHighlight/20 flex justify-between items-center">
                <h3 className="text-md font-bold text-white">Presupuestos (Este Mes)</h3>
                <span className="text-xs text-textSecondary">Día {dayOfMonth} ({Math.round(pacePercentage)}%)</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col gap-4">
                {sortedCategories.length === 0 && (
                    <div className="text-center text-textSecondary py-4">
                        No hay gastos ni presupuestos este mes.
                    </div>
                )}

                {sortedCategories.map(cat => {
                    const totalSpent = categoryTotals[cat] || 0;
                    const budgetObj = getBudgetForCategory(cat);
                    const limit = budgetObj ? budgetObj.limitAmount : 0;
                    const hasBudget = limit > 0;

                    const percentUsed = hasBudget ? (totalSpent / limit) * 100 : 0;
                    const isOverBudget = hasBudget && totalSpent > limit;

                    // Colors
                    let barColor = 'bg-emerald-500';
                    if (percentUsed > 80) barColor = 'bg-rose-500';
                    else if (percentUsed >= 50) barColor = 'bg-amber-500';

                    // Edit Mode
                    const isEditing = editingCategory === cat;

                    return (
                        <div key={cat} className="flex flex-col gap-1">
                            <div className="flex justify-between items-center text-sm">
                                <span className="font-medium text-white truncate max-w-[40%]">{cat}</span>
                                <div className="flex items-center gap-2">
                                    <span className={isOverBudget ? 'text-error font-bold' : 'text-textSecondary'}>
                                        ${totalSpent.toLocaleString()}
                                    </span>
                                    <span className="text-textSecondary">/</span>

                                    {isEditing ? (
                                        <div className="flex items-center gap-1">
                                            <input
                                                type="number"
                                                className="w-20 bg-surface border border-border rounded px-1 py-0.5 text-right text-white text-xs"
                                                value={newLimit}
                                                onChange={(e) => setNewLimit(e.target.value)}
                                                placeholder={limit}
                                                autoFocus
                                            />
                                            <button onClick={() => handleUpdateBudget(cat)} className="text-success hover:text-success/80">
                                                <Check size={16} />
                                            </button>
                                            <button onClick={() => setEditingCategory(null)} className="text-error hover:text-error/80">
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1 cursor-pointer group" onClick={() => {
                                            setEditingCategory(cat);
                                            setNewLimit(limit || '');
                                        }}>
                                            <span className="text-textSecondary min-w-[30px] text-right">
                                                {hasBudget ? `$${limit.toLocaleString()}` : '--'}
                                            </span>
                                            <Settings size={12} className="text-textSecondary opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Progress Bar Container */}
                            <div className="relative w-full h-2 bg-surface rounded-full overflow-hidden mt-1">
                                {/* Pace Marker */}
                                <div
                                    className="absolute top-0 bottom-0 w-0.5 bg-white z-10 opacity-50"
                                    style={{ left: `${pacePercentage}%` }}
                                    title="Pace (Today)"
                                />

                                {/* Actual Progress */}
                                <div
                                    className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                                    style={{ width: `${Math.min(percentUsed, 100)}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default BudgetCard;
