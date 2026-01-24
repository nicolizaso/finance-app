import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useMemo, useState } from 'react';

const COLORS = [
    '#7c3aed', // Primary (Violet)
    '#d8b4fe', // Neon
    '#06b6d4', // Cyan
    '#f43f5e', // Rose
    '#f59e0b', // Amber
    '#10b981', // Emerald
    '#6366f1', // Indigo
    '#ec4899', // Pink
];

const CustomTooltip = ({ active, payload, totalSpent }) => {
    if (active && payload && payload.length) {
        const { name, value } = payload[0];
        const percent = totalSpent ? ((value / totalSpent) * 100).toFixed(1) : '0.0';
        return (
            <div className="bg-surface border border-border p-3 rounded-lg shadow-xl z-50">
                <p className="text-white font-bold mb-1">{name}</p>
                <p className="text-neon text-sm font-mono">
                    ${value.toLocaleString()} ({percent}%)
                </p>
            </div>
        );
    }
    return null;
};

const CategoryBreakdownChart = ({ data, period }) => {
    // Select data based on period
    const chartData = useMemo(() => {
        if (!data) return [];
        return data[period] || [];
    }, [data, period]);

    const [activeIndex, setActiveIndex] = useState(null);

    const totalSpent = useMemo(() => chartData.reduce((acc, curr) => acc + curr.value, 0), [chartData]);

    const activeItem = activeIndex !== null ? chartData[activeIndex] : null;

    const onPieEnter = (_, index) => {
        setActiveIndex(index);
    };

    return (
        <div className="bento-card h-[400px] flex flex-col relative">
             <div className="flex justify-between items-center mb-2 pl-2">
                <h3 className="text-lg font-bold text-white">Desglose por Categoría</h3>
            </div>

            <div className="flex-1 w-full min-w-0 relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                            onMouseEnter={onPieEnter}
                            onClick={onPieEnter}
                            stroke="none"
                        >
                            {chartData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}
                                    opacity={activeIndex === null || activeIndex === index ? 1 : 0.3}
                                    className="transition-opacity duration-300 outline-none"
                                />
                            ))}
                        </Pie>
                        <Tooltip content={(props) => <CustomTooltip {...props} totalSpent={totalSpent} />} />
                    </PieChart>
                </ResponsiveContainer>

                {/* Center Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    {activeItem ? (
                        <>
                            <p className="text-textMuted text-xs font-medium uppercase tracking-wider mb-1">{activeItem.name}</p>
                            <p className="text-white text-xl font-bold">${activeItem.value.toLocaleString()}</p>
                            <p className="text-neon text-xs">
                                {totalSpent ? ((activeItem.value / totalSpent) * 100).toFixed(1) : 0}%
                            </p>
                        </>
                    ) : (
                        <>
                            <p className="text-textMuted text-xs font-medium uppercase tracking-wider mb-1">Total</p>
                            <p className="text-white text-xl font-bold">${totalSpent.toLocaleString()}</p>
                        </>
                    )}
                </div>
            </div>

            {/* Legend / List below */}
             <div className="mt-4 px-2 max-h-[80px] overflow-y-auto custom-scrollbar flex flex-wrap gap-2 justify-center">
                {chartData.map((entry, index) => (
                    <div
                        key={index}
                        className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-full border border-border cursor-pointer transition-colors ${activeIndex === index ? 'bg-white/10' : 'bg-transparent'}`}
                        onClick={() => setActiveIndex(index === activeIndex ? null : index)}
                    >
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span className="text-textSecondary">{entry.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CategoryBreakdownChart;
