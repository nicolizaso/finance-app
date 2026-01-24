import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import ExpensesIncomeChart from '../components/analytics/ExpensesIncomeChart';
import CategoryBreakdownChart from '../components/analytics/CategoryBreakdownChart';
import SpendingTrendChart from '../components/analytics/SpendingTrendChart';
import DashboardFilter from '../components/analytics/DashboardFilter';
import { LayoutDashboard } from 'lucide-react';

const StatsView = () => {
    const { stats } = useOutletContext();
    const [breakdownPeriod, setBreakdownPeriod] = useState('thisMonth');

    return (
        <div className="space-y-6 animate-fade-in pb-24 md:pb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-2xl font-heading font-bold text-white flex items-center gap-2">
                    <LayoutDashboard className="text-primary" />
                    Análisis Financiero
                </h2>
                <div className="flex items-center gap-2">
                    <span className="text-textSecondary text-sm hidden md:block">Periodo:</span>
                    <DashboardFilter currentFilter={breakdownPeriod} onFilterChange={setBreakdownPeriod} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7">
                    <ExpensesIncomeChart data={stats ? stats.last6Months : []} />
                </div>
                <div className="lg:col-span-5">
                    <CategoryBreakdownChart data={stats ? stats.categoryBreakdown : null} period={breakdownPeriod} />
                </div>
            </div>

            <div className="grid grid-cols-1">
                <SpendingTrendChart data={stats ? stats.spendingTrend : []} />
            </div>
        </div>
    );
};

export default StatsView;
