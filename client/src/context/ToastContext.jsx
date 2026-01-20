import { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info', duration = 3000) => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, message, type }]);

        if (duration) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ addToast, removeToast }}>
            {children}
            <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
                <AnimatePresence>
                    {toasts.map(toast => (
                        <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};

const Toast = ({ message, type, onClose }) => {
    const bgColors = {
        success: 'bg-emerald-500/10 border-emerald-500 text-emerald-500',
        error: 'bg-rose-500/10 border-rose-500 text-rose-500',
        info: 'bg-blue-500/10 border-blue-500 text-blue-500',
        warning: 'bg-amber-500/10 border-amber-500 text-amber-500'
    };

    const icons = {
        success: CheckCircle,
        error: AlertCircle,
        info: Info,
        warning: AlertCircle
    };

    const Icon = icons[type] || Info;

    return (
        <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            layout
            className={`pointer-events-auto flex items-center gap-3 p-4 rounded-xl border backdrop-blur-md shadow-lg min-w-[300px] max-w-sm ${bgColors[type] || bgColors.info}`}
        >
            <Icon size={20} />
            <p className="flex-1 text-sm font-medium text-white">{message}</p>
            <button onClick={onClose} className="opacity-70 hover:opacity-100 transition-opacity">
                <X size={16} />
            </button>
        </motion.div>
    );
};
