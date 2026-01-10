import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6366F1'];

const ExpenseChart = ({ transactions, isPrivacyMode }) => {

  const data = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'EXPENSE');
    const grouped = expenses.reduce((acc, curr) => {
      if (!acc[curr.category]) { acc[curr.category] = 0; }
      acc[curr.category] += curr.amount;
      return acc;
    }, {});

    return Object.keys(grouped).map(key => ({
      name: key,
      value: grouped[key] / 100 
    })).filter(item => item.value > 0);

  }, [transactions]);

  if (data.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-3xl p-6 h-full flex flex-col items-center justify-center text-center opacity-50">
        <div className="text-4xl mb-2">📊</div>
        <p className="text-sm text-textMuted">Sin datos de gastos</p>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-3xl p-6 shadow-card flex flex-col items-center h-full w-full relative overflow-hidden">
      <h3 className="text-white font-bold mb-2 self-start font-heading">Distribución</h3>
      
      <div className={`h-64 w-full flex-1 min-h-[250px] ${isPrivacyMode ? 'blur-sm' : ''}`}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            
            {/* Tooltip actualizado con formato ES-AR sin decimales */}
            {!isPrivacyMode && (
              <Tooltip
                formatter={(value) => `$${Math.round(value).toLocaleString('es-AR')}`}
                contentStyle={{
                  backgroundColor: '#1A1626',
                  border: '1px solid #2E2442',
                  borderRadius: '12px',
                  color: '#fff',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
                }}
                itemStyle={{ color: '#E9D5FF' }}
              />
            )}
            <Legend 
              iconType="circle" 
              layout="horizontal" 
              verticalAlign="bottom" 
              align="center"
              wrapperStyle={{ paddingTop: '20px', fontSize: '12px', opacity: 0.8 }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ExpenseChart;