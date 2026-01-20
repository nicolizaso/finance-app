import { useState, useEffect } from 'react';
import api from '../api/axios';
import FinancialCalendar from '../components/FinancialCalendar';
import { useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';

const CalendarView = () => {
    const { transactions, onRefresh, isPrivacyMode } = useOutletContext();
    const [fixedExpenses, setFixedExpenses] = useState([]);

    useEffect(() => {
        const fetchFixed = async () => {
            try {
                const res = await api.get('/fixed-expenses');
                if (res.data.success) {
                    setFixedExpenses(res.data.data);
                }
            } catch (e) { console.error(e); }
        };
        fetchFixed();
    }, [onRefresh]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-4 h-full"
        >
             <h3 className="text-xl font-bold text-white font-heading">Calendario Financiero</h3>
             <div className="flex-1 bento-card p-4 min-h-[600px] h-full">
                 <FinancialCalendar
                    transactions={transactions}
                    fixedExpenses={fixedExpenses}
                    onRefresh={onRefresh}
                    isPrivacyMode={isPrivacyMode}
                />
             </div>
        </motion.div>
    );
};

export default CalendarView;
