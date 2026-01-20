import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, ArrowRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NotificationPopup = ({ count, onClose }) => {
    const navigate = useNavigate();

    const handleAction = () => {
        navigate('/history', { state: { filter: 'pending' } });
        onClose();
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 50, scale: 0.9 }}
                className="fixed bottom-20 right-4 left-4 md:left-auto md:w-96 z-50"
            >
                <div className="bg-surface border border-orange-500/50 rounded-2xl p-4 shadow-glow flex flex-col gap-3 backdrop-blur-md">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center animate-pulse">
                                <AlertCircle size={24} />
                            </div>
                            <div>
                                <h4 className="text-white font-bold">Atención Requerida</h4>
                                <p className="text-sm text-textMuted">
                                    Tenés <span className="text-orange-400 font-bold">{count}</span> gastos rápidos pendientes de info.
                                </p>
                            </div>
                        </div>
                        <button onClick={onClose} className="text-textMuted hover:text-white">
                            <X size={18} />
                        </button>
                    </div>

                    <button
                        onClick={handleAction}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 rounded-xl flex items-center justify-center gap-2 transition-colors"
                    >
                        Revisar Ahora <ArrowRight size={18} />
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default NotificationPopup;
