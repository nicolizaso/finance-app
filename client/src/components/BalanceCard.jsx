import { useMemo } from 'react';

const BalanceCard = ({ transactions }) => {
  
    const stats = useMemo(() => {
      // FILTRO DE ORO: Solo consideramos transacciones COMPLETADAS para el saldo actual
      const completedTransactions = transactions.filter(t => t.status === 'COMPLETED');
  
      const amounts = completedTransactions.map(t => ({
        amount: t.amount,
        type: t.type
      }));
    const income = amounts
      .filter(item => item.type === 'INCOME')
      .reduce((acc, item) => acc + item.amount, 0);

    const expense = amounts
      .filter(item => item.type === 'EXPENSE')
      .reduce((acc, item) => acc + item.amount, 0);

    const total = income - expense;

    return {
      income: (income / 100).toFixed(2),
      expense: (expense / 100).toFixed(2),
      total: (total / 100).toFixed(2)
    };
  }, [transactions]);

  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-lg mb-8 border border-gray-700">
      <div className="grid grid-cols-3 gap-4 text-center divide-x divide-gray-700">
        
        {/* Ingresos */}
        <div>
          <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Ingresos</p>
          <p className="text-xl font-bold text-green-400 mt-1">
            +${stats.income}
          </p>
        </div>

        {/* Balance Total (Centro) */}
        <div>
          <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Saldo Actual</p>
          <p className={`text-2xl font-black mt-1 ${stats.total >= 0 ? 'text-white' : 'text-red-500'}`}>
            ${stats.total}
          </p>
        </div>

        {/* Gastos */}
        <div>
          <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Gastos</p>
          <p className="text-xl font-bold text-red-400 mt-1">
            -${stats.expense}
          </p>
        </div>

      </div>
    </div>
  );
};

export default BalanceCard;