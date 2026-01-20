import { useState, useRef, useEffect } from 'react';
import { Package, Plus, Trash2, Edit2, CheckCircle2, Circle, AlertCircle, Sparkles, DollarSign, X } from 'lucide-react';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../context/ToastContext';

const WishlistCard = ({ items, onRefresh, isPrivacyMode }) => {
    const toast = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newItem, setNewItem] = useState({
        title: '',
        estimatedCost: '',
        currency: 'ARS',
        priority: 'MEDIUM',
        link: '',
        type: 'ITEM',
        items: [] // Sub-items for PROJECT
    });

    // Sub-item editing state
    const [subItemInput, setSubItemInput] = useState({ description: '', estimatedCost: '', currency: 'ARS' });

    // Editing State for Main Items
    const [editingId, setEditingId] = useState(null);

    const [filter, setFilter] = useState('ALL'); // ALL, COMPLETED, PENDING
    const scrollContainerRef = useRef(null);

    // Reset Form
    const resetForm = () => {
        setNewItem({ title: '', estimatedCost: '', currency: 'ARS', priority: 'MEDIUM', link: '', type: 'ITEM', items: [] });
        setSubItemInput({ description: '', estimatedCost: '', currency: 'ARS' });
        setEditingId(null);
    };

    const handleOpenModal = (itemToEdit = null) => {
        if (itemToEdit) {
            setEditingId(itemToEdit._id);
            setNewItem({
                title: itemToEdit.title,
                estimatedCost: itemToEdit.estimatedCost, // Will be ignored if PROJECT on backend, but good for form state
                currency: itemToEdit.currency,
                priority: itemToEdit.priority,
                link: itemToEdit.link || '',
                type: itemToEdit.type || 'ITEM',
                items: itemToEdit.items || []
            });
        } else {
            resetForm();
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        resetForm();
    };

    const handleAddSubItem = () => {
        if (!subItemInput.description || !subItemInput.estimatedCost) return;
        setNewItem(prev => ({
            ...prev,
            items: [...prev.items, { ...subItemInput, isCompleted: false }]
        }));
        setSubItemInput({ description: '', estimatedCost: '', currency: 'ARS' });
    };

    const handleRemoveSubItem = (index) => {
        setNewItem(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/wishlist/${editingId}`, newItem);
                toast.success('Elemento actualizado correctamente');
            } else {
                await api.post('/wishlist', newItem);
                // Corrected Success Message Logic
                if (newItem.type === 'PROJECT') {
                    toast.success('Proyecto creado correctamente');
                } else {
                    toast.success('Item agregado exitosamente');
                }
            }
            onRefresh();
            handleCloseModal();
        } catch (error) {
            console.error(error);
            toast.error('Error al guardar en wishlist');
        }
    };

    const toggleComplete = async (item) => {
        try {
             // Logic to toggle completion. For PROJECT, maybe can't complete whole thing via single click?
             // Assuming simple toggle for ITEM.
             await api.put(`/wishlist/${item._id}`, { ...item, isCompleted: !item.isCompleted });
             onRefresh();
             toast.success(item.isCompleted ? 'Marcado como pendiente' : '¡Completado!');
        } catch (error) {
            console.error(error);
            toast.error('Error al actualizar estado');
        }
    };

    const deleteItem = async (id) => {
        if (!confirm('¿Eliminar este deseo?')) return;
        try {
            await api.delete(`/wishlist/${id}`);
            toast.success('Eliminado correctamente');
            onRefresh();
        } catch (error) {
            console.error(error);
            toast.error('Error al eliminar');
        }
    };

    // Helper to format money
    const formatMoney = (amount) => amount ? Math.round(amount).toLocaleString('es-AR') : '0';

    // Filter Logic
    const filteredItems = items.filter(i => {
        if (filter === 'COMPLETED') return i.isCompleted;
        if (filter === 'PENDING') return !i.isCompleted;
        return true;
    });

    return (
        <>
            <div className="bento-card w-full h-full flex flex-col min-h-[300px]">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-white font-bold font-heading text-lg flex items-center gap-2">
                        <Package size={20} className="text-primary" /> Wishlist
                    </h3>
                    <div className="flex gap-2">
                        <button onClick={() => setFilter(filter === 'ALL' ? 'PENDING' : (filter === 'PENDING' ? 'COMPLETED' : 'ALL'))} className="text-xs font-bold text-textMuted uppercase px-2 py-1 bg-surfaceHighlight rounded-lg hover:text-white transition-colors">
                            {filter === 'ALL' ? 'Todos' : (filter === 'PENDING' ? 'Pendientes' : 'Completados')}
                        </button>
                        <button onClick={() => handleOpenModal()} className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white hover:bg-primaryHover transition-all shadow-glow">
                            <Plus size={18} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2" ref={scrollContainerRef}>
                    <AnimatePresence>
                        {filteredItems.map(item => (
                            <motion.div
                                key={item._id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className={`p-3 rounded-xl border transition-all group ${item.isCompleted ? 'bg-surfaceHighlight/20 border-white/5 opacity-60' : 'bg-surfaceHighlight/40 border-white/5 hover:border-primary/30'}`}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex items-start gap-3 flex-1">
                                        <button onClick={() => toggleComplete(item)} className={`mt-0.5 transition-colors ${item.isCompleted ? 'text-emerald-400' : 'text-textMuted hover:text-primary'}`}>
                                            {item.isCompleted ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                                        </button>
                                        <div>
                                            <p className={`text-sm font-medium ${item.isCompleted ? 'line-through text-textMuted' : 'text-white'}`}>
                                                {item.title}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`text-xs font-mono ${isPrivacyMode ? 'blur-sm' : ''} ${item.isCompleted ? 'text-textMuted' : 'text-emerald-400'}`}>
                                                    ${formatMoney(item.estimatedCost || item.totalEstimated)}
                                                </span>
                                                {item.type === 'PROJECT' && (
                                                    <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded border border-blue-500/30">PROYECTO</span>
                                                )}
                                                {item.priority === 'HIGH' && !item.isCompleted && <AlertCircle size={12} className="text-rose-400" />}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleOpenModal(item)} className="p-1.5 hover:bg-white/10 rounded-lg text-textMuted hover:text-white transition-colors">
                                            <Edit2 size={14} />
                                        </button>
                                        <button onClick={() => deleteItem(item._id)} className="p-1.5 hover:bg-rose-500/20 rounded-lg text-textMuted hover:text-rose-400 transition-colors">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>

                                {item.type === 'PROJECT' && item.items && item.items.length > 0 && (
                                    <div className="mt-3 pl-8 space-y-1">
                                        {item.items.map((sub, idx) => (
                                            <div key={idx} className="flex justify-between text-xs text-textMuted border-l-2 border-white/10 pl-2">
                                                <span>{sub.description}</span>
                                                <span className={`${isPrivacyMode ? 'blur-sm' : ''}`}>${formatMoney(sub.estimatedCost)}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {items.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full min-h-[150px] opacity-50">
                            <Sparkles size={32} className="text-textMuted mb-2" />
                            <p className="text-sm text-textMuted">Lista de deseos vacía</p>
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-surface border border-white/10 rounded-2xl w-full max-w-md p-6 relative shadow-2xl">
                        <button onClick={handleCloseModal} className="absolute top-4 right-4 text-textMuted hover:text-white"><X size={20} /></button>

                        <h3 className="text-xl font-bold text-white mb-4">{editingId ? 'Editar Deseo' : 'Nuevo Deseo'}</h3>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="label">Título</label>
                                <input type="text" className="input-pro w-full bg-void" value={newItem.title} onChange={e => setNewItem({...newItem, title: e.target.value})} required placeholder="Ej: Nueva Laptop" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Tipo</label>
                                    <select className="input-pro w-full bg-void" value={newItem.type} onChange={e => setNewItem({...newItem, type: e.target.value})}>
                                        <option value="ITEM">Item Único</option>
                                        <option value="PROJECT">Proyecto</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Prioridad</label>
                                    <select className="input-pro w-full bg-void" value={newItem.priority} onChange={e => setNewItem({...newItem, priority: e.target.value})}>
                                        <option value="LOW">Baja</option>
                                        <option value="MEDIUM">Media</option>
                                        <option value="HIGH">Alta</option>
                                    </select>
                                </div>
                            </div>

                            {newItem.type === 'ITEM' && (
                                <div>
                                    <label className="label">Costo Estimado</label>
                                    <div className="relative">
                                        <DollarSign size={16} className="absolute left-3 top-3 text-textMuted" />
                                        <input type="number" className="input-pro w-full bg-void pl-9" value={newItem.estimatedCost} onChange={e => setNewItem({...newItem, estimatedCost: e.target.value})} placeholder="0.00" />
                                    </div>
                                </div>
                            )}

                            {newItem.type === 'PROJECT' && (
                                <div className="bg-surfaceHighlight/30 p-3 rounded-xl space-y-3">
                                    <label className="text-xs font-bold text-textMuted uppercase">Sub-items del Proyecto</label>

                                    <div className="flex gap-2">
                                        <input type="text" className="input-pro flex-1 h-9 text-sm bg-void" placeholder="Descripción" value={subItemInput.description} onChange={e => setSubItemInput({...subItemInput, description: e.target.value})} />
                                        <input type="number" className="input-pro w-24 h-9 text-sm bg-void" placeholder="$ Costo" value={subItemInput.estimatedCost} onChange={e => setSubItemInput({...subItemInput, estimatedCost: e.target.value})} />
                                        <button type="button" onClick={handleAddSubItem} className="bg-primary hover:bg-primaryHover text-white p-2 rounded-lg transition-colors"><Plus size={16} /></button>
                                    </div>

                                    <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
                                        {newItem.items.map((sub, idx) => (
                                            <div key={idx} className="flex justify-between items-center bg-surface p-2 rounded-lg border border-white/5 text-sm">
                                                <span className="text-white">{sub.description}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-emerald-400">${sub.estimatedCost}</span>
                                                    <button type="button" onClick={() => handleRemoveSubItem(idx)} className="text-rose-400 hover:text-rose-300"><X size={14} /></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="label">Link (Opcional)</label>
                                <input type="url" className="input-pro w-full bg-void" value={newItem.link} onChange={e => setNewItem({...newItem, link: e.target.value})} placeholder="https://..." />
                            </div>

                            <button type="submit" className="btn-primary w-full mt-2">
                                {editingId ? 'Guardar Cambios' : 'Agregar a Wishlist'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default WishlistCard;
