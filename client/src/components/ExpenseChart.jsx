import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6366F1'];

const ExpenseChart = ({ transactions }) => {

  const data = useMemo(() => {
    // 1. Filtramos solo GASTOS (ignoramos ingresos)
    const expenses = transactions.filter(t => t.type === 'EXPENSE');

    // 2. Agrupamos por categoría y sumamos montos
    const grouped = expenses.reduce((acc, curr) => {
      if (!acc[curr.category]) {
        acc[curr.category] = 0;
      }
      acc[curr.category] += curr.amount;
      return acc;
    }, {});

    // 3. Convertimos a formato para el gráfico
    return Object.keys(grouped).map(key => ({
      name: key,
      value: grouped[key] / 100 // Convertimos centavos a reales
    })).filter(item => item.value > 0); // Ocultamos categorías vacías

  }, [transactions]);

  if (data.length === 0) return null; // No mostrar nada si no hay gastos

  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 mb-8 flex flex-col items-center">
      <h3 className="text-gray-300 font-bold mb-4 self-start">Distribución de Gastos</h3>
      
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60} // Esto lo hace una "Dona"
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value) => `$${value.toFixed(2)}`}
              contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff' }}
            />
            <Legend iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ExpenseChart;