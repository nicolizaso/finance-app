import { useState, useEffect } from 'react';
import { 
    Package, Plus, Trash2, Edit2, CheckCircle2, 
    Circle, AlertCircle, Sparkles, DollarSign, 
    X, ExternalLink, ChevronDown, ChevronUp, 
    ShoppingBag, LayoutList, Gift 
} from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../api/axios';
import { useOutletContext } from 'react-router-dom';

const WishlistCard = ({ refreshTrigger }) => {
    const [wishlists, setWishlists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);

    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        type: 'ITEM',
        items: []
    });
    const [newItem, setNewItem] = useState({ description: '', estimatedCost: '', link: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const contextData = useOutletContext();
    const onRefresh = contextData?.onRefresh || (() => {});
    const handleGamification = contextData?.handleGamification || (() => {});

    // Urgency Logic
    const toggleUrgency = async (wishlist, item = null) => {
        const levels = ['low', 'medium', 'high'];
        const currentUrgency = item ? (item.urgency || 'low') : (wishlist.urgency || 'low');
        const nextIndex = (levels.indexOf(currentUrgency) + 1) % levels.length;
        const nextUrgency = levels[nextIndex];

        try {
            if (item) {
                // Update sub-item
                 await api.patch(`/wishlist/${wishlist._id}/items/${item._id}`, { urgency: nextUrgency });
            } else {
                // Update main wishlist
                await api.put(`/wishlist/${wishlist._id}`, { urgency: nextUrgency });
            }
            fetchWishlists();
        } catch (error) {
            console.error("Error updating urgency", error);
        }
    };

    const UrgencyIndicator = ({ urgency, onClick }) => {
        const colors = {
            low: 'bg-emerald-500',
            medium: 'bg-yellow-500',
            high: 'bg-rose-500'
        };
        return (
            <button
                onClick={(e) => { e.stopPropagation(); onClick(); }}
                className={`w-3 h-3 rounded-full ${colors[urgency || 'low']} ring-2 ring-slate-800 hover:ring-white/20 transition-all shadow-lg shadow-black/50`}
                title={`Prioridad: ${urgency || 'low'}`}
            />
        );
    };

    const getRemaining = (w) => w.items.reduce((sum, item) => !item.isBought ? sum + (item.estimatedPrice || item.estimatedCost || 0) : sum, 0);

    const fetchWishlists = async () => {
        try {
            const res = await api.get('/wishlist');
            setWishlists(res.data.data);
        } catch (error) {
            console.error("Error fetching wishlists:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWishlists();
    }, [refreshTrigger]);

    const handleOpenCreate = () => {
        setIsEditing(false);
        setEditingId(null);
        setFormData({ title: '', type: 'ITEM', items: [] });
        setNewItem({ description: '', estimatedCost: '', link: '' });
        setShowModal(true);
    };

    const handleOpenEdit = (wishlist) => {
        setIsEditing(true);
        setEditingId(wishlist._id);
        
        if (wishlist.type === 'ITEM' && wishlist.items.length > 0) {
            const itemData = wishlist.items[0];
            setFormData({
                title: wishlist.title,
                type: 'ITEM',
                items: []
            });
            setNewItem({
                description: itemData.description || wishlist.title,
                estimatedCost: itemData.estimatedPrice || itemData.estimatedCost || '',
                link: itemData.link || ''
            });
        } else {
            setFormData({
                title: wishlist.title,
                type: 'PROJECT',
                items: wishlist.items.map(i => ({
                    description: i.description,
                    estimatedCost: i.estimatedPrice || i.estimatedCost,
                    link: i.link,
                    isBought: i.isBought,
                    _id: i._id
                }))
            });
        }
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("¿Eliminar este deseo/proyecto?")) return;
        try {
            await api.delete(`/wishlist/${id}`);
            fetchWishlists();
        } catch (error) {
            console.error(error);
        }
    };

    const handleAddItemToProject = () => {
        if (!newItem.description || !newItem.estimatedCost) return;
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { ...newItem, isBought: false }]
        }));
        setNewItem({ description: '', estimatedCost: '', link: '' });
    };

    const handleRemoveSubItem = (index) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        let payload = {
            title: formData.title,
            type: formData.type,
            items: []
        };

        if (formData.type === 'ITEM') {
            payload.items = [{
                description: formData.title,
                estimatedPrice: parseFloat(newItem.estimatedCost) || 0,
                link: newItem.link
            }];
        } else {
            payload.items = formData.items.map(i => ({
                description: i.description,
                estimatedPrice: parseFloat(i.estimatedCost) || 0,
                link: i.link,
                isBought: i.isBought || false
            }));
        }

        try {
            if (isEditing && editingId) {
                await api.put(`/wishlist/${editingId}`, payload);
                alert("Actualizado correctamente");
            } else {
                await api.post('/wishlist', payload);
                alert(formData.type === 'PROJECT' ? "Proyecto creado exitosamente" : "Deseo agregado correctamente");
                if (handleGamification) handleGamification('wishlist_created');
            }
            setShowModal(false);
            fetchWishlists();
        } catch (error) {
            console.error("Error saving:", error);
            alert("Error al guardar");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBuyItem = async (wishlistId, itemId, itemData) => {
        const result = await Swal.fire({
            title: `¿Registrar gasto?`,
            text: `¿Deseas registrar "${itemData.description}" como un gasto real ahora?`,
            icon: 'question',
            showDenyButton: true,
            showCancelButton: true,
            confirmButtonText: 'Sí, crear gasto',
            denyButtonText: 'No, solo marcar pagado',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#10B981', // emerald-500
            denyButtonColor: '#6366f1', // indigo-500
            background: '#1e293b', // slate-800
            color: '#fff'
        });

        if (result.isDismissed) return;

        try {
            // Option 1: Create Expense + Mark Paid
            if (result.isConfirmed) {
                await api.post('/transactions', {
                    description: itemData.description,
                    amount: Number(itemData.estimatedPrice || itemData.estimatedCost), // Fix: Ensure raw number
                    category: 'Compras',
                    type: 'EXPENSE',
                    date: new Date(),
                    paymentMethod: 'DEBIT'
                });

                // ALSO mark as paid
                await api.patch(`/wishlist/${wishlistId}/items/${itemId}`, { isBought: true });

                Swal.fire({
                    title: '¡Listo!',
                    text: 'Gasto creado y marcado como pagado.',
                    icon: 'success',
                    background: '#1e293b',
                    color: '#fff'
                });

            }
            // Option 2: Just Mark Paid
            else if (result.isDenied) {
                await api.patch(`/wishlist/${wishlistId}/items/${itemId}`, { isBought: true });
                Swal.fire({
                    title: 'Actualizado',
                    text: 'Item marcado como pagado.',
                    icon: 'success',
                    background: '#1e293b',
                    color: '#fff'
                });
            }

            onRefresh();
            fetchWishlists();
            
        } catch (error) {
            console.error(error);
            Swal.fire({
                title: 'Error',
                text: 'Hubo un problema al procesar la solicitud',
                icon: 'error',
                background: '#1e293b',
                color: '#fff'
            });
        }
    };

    return (
        <>
            <div className="bento-card relative overflow-hidden group flex flex-col h-full flex-1 bg-slate-800 border-slate-700">
                {/* Header */}
                <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 to-rose-500 flex items-center justify-center shadow-lg shadow-rose-500/20">
                            <Sparkles className="text-white" size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white font-heading leading-tight">Wishlist & Planes</h3>
                            <p className="text-xs text-slate-400">Proyectos y cosas por comprar</p>
                        </div>
                    </div>
                    <button 
                        onClick={handleOpenCreate}
                        className="bg-white/5 hover:bg-white/10 p-2 rounded-lg transition-colors border border-white/5 text-white"
                    >
                        <Plus size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="space-y-3 relative z-10 flex-1 overflow-y-auto custom-scrollbar pr-2">
                    {loading ? (
                        <p className="text-slate-400 text-sm">Cargando deseos...</p>
                    ) : wishlists.length === 0 ? (
                        <div className="text-center py-4 border border-dashed border-slate-600 rounded-xl">
                            <p className="text-slate-400 text-sm">Tu lista de deseos está vacía.</p>
                        </div>
                    ) : (
                        wishlists.map((w) => (
                            <div key={w._id} className="bg-slate-700/30 border border-slate-700/50 rounded-xl p-3 hover:border-indigo-500/30 transition-colors">
                                <div className="flex justify-between items-center">
                                    <div 
                                        className="flex items-center gap-3 flex-1 cursor-pointer"
                                        onClick={() => w.type === 'PROJECT' && setExpandedId(expandedId === w._id ? null : w._id)}
                                    >
                                        <div className="relative">
                                            {w.type === 'PROJECT' ? (
                                                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                                    <LayoutList size={16} />
                                                </div>
                                            ) : (
                                                <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center text-teal-400">
                                                    <ShoppingBag size={16} />
                                                </div>
                                            )}
                                            <div className="absolute -top-1 -right-1">
                                                <UrgencyIndicator urgency={w.urgency} onClick={() => toggleUrgency(w)} />
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="font-bold text-white text-sm">{w.title}</h4>
                                            <p className="text-xs text-slate-400">
                                                {w.type === 'PROJECT' 
                                                    ? `${w.items.filter(i => i.isBought).length}/${w.items.length} items` 
                                                    : `$${getRemaining(w).toLocaleString()}`
                                                }
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handleOpenEdit(w)} className="p-1.5 text-slate-400 hover:text-indigo-400 transition-colors">
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(w._id)} className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                        {w.type === 'PROJECT' && (
                                            <button onClick={() => setExpandedId(expandedId === w._id ? null : w._id)} className="text-slate-400">
                                                {expandedId === w._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Expanded Project View */}
                                {w.type === 'PROJECT' && expandedId === w._id && (
                                    <div className="mt-3 pl-4 border-l-2 border-slate-600 space-y-2">
                                        {w.items.map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-center text-sm group/item">
                                                <div className="flex items-center gap-2">
                                                    <UrgencyIndicator urgency={item.urgency} onClick={() => toggleUrgency(w, item)} />
                                                    <button 
                                                        onClick={() => !item.isBought && handleBuyItem(w._id, item._id, item)}
                                                        className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${item.isBought ? 'bg-emerald-500 border-emerald-500' : 'border-slate-400 hover:border-indigo-400'}`}
                                                    >
                                                        {item.isBought && <CheckCircle2 size={10} className="text-white" />}
                                                    </button>
                                                    <span className={item.isBought ? 'text-emerald-500 italic line-through' : 'text-slate-200'}>
                                                        {item.description}
                                                    </span>
                                                    {item.link && (
                                                        <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300">
                                                            <ExternalLink size={12} />
                                                        </a>
                                                    )}
                                                </div>
                                                <span className="font-mono text-xs text-slate-400">${item.estimatedPrice?.toLocaleString()}</span>
                                            </div>
                                        ))}
                                        <div className="pt-2 mt-2 border-t border-slate-600 flex justify-between items-center">
                                            <span className="text-xs font-bold text-slate-400 uppercase">Restante</span>
                                            <span className="text-sm font-mono font-bold text-emerald-400">${getRemaining(w).toLocaleString()}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Modal de Creación / Edición */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowModal(false)}>
                    <div className="w-full max-w-lg bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-2xl animate-scale-in" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white font-heading">
                                {isEditing ? 'Editar Wishlist' : 'Nuevo Deseo o Proyecto'}
                            </h3>
                            <button onClick={() => setShowModal(false)}><X className="text-slate-400 hover:text-white" /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 block">Título</label>
                                <input 
                                    type="text" 
                                    className="input-pro w-full bg-slate-900 border-slate-700 focus:border-indigo-500"
                                    value={formData.title} 
                                    onChange={e => setFormData({...formData, title: e.target.value})}
                                    placeholder="Ej: Setup Gamer, Vacaciones..." 
                                    required
                                />
                            </div>

                            <div className="flex gap-4">
                                <label className={`flex-1 p-3 rounded-xl border cursor-pointer transition-all ${formData.type === 'ITEM' ? 'bg-indigo-500/20 border-indigo-500 text-white' : 'bg-slate-700/20 border-transparent text-slate-400'}`}>
                                    <input type="radio" className="hidden" name="type" value="ITEM" checked={formData.type === 'ITEM'} onChange={() => setFormData({...formData, type: 'ITEM'})} />
                                    <div className="flex flex-col items-center gap-1">
                                        <Gift size={20} />
                                        <span className="text-sm font-bold">Ítem Único</span>
                                    </div>
                                </label>
                                <label className={`flex-1 p-3 rounded-xl border cursor-pointer transition-all ${formData.type === 'PROJECT' ? 'bg-indigo-500/20 border-indigo-500 text-white' : 'bg-slate-700/20 border-transparent text-slate-400'}`}>
                                    <input type="radio" className="hidden" name="type" value="PROJECT" checked={formData.type === 'PROJECT'} onChange={() => setFormData({...formData, type: 'PROJECT'})} />
                                    <div className="flex flex-col items-center gap-1">
                                        <LayoutList size={20} />
                                        <span className="text-sm font-bold">Proyecto</span>
                                    </div>
                                </label>
                            </div>

                            {/* Campos condicionales */}
                            {formData.type === 'ITEM' ? (
                                <div className="space-y-3 animate-fade-in">
                                    <div>
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 block">Precio Estimado</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-3 text-slate-400">$</span>
                                            <input 
                                                type="number" 
                                                className="input-pro w-full pl-8 bg-slate-900 border-slate-700 focus:border-indigo-500"
                                                value={newItem.estimatedCost} 
                                                onChange={e => setNewItem({...newItem, estimatedCost: e.target.value})}
                                                placeholder="0.00" 
                                            />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3 animate-fade-in">
                                    <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                                        <h4 className="text-sm font-bold text-white mb-2">Items del Proyecto</h4>
                                        <div className="flex gap-2 mb-3">
                                            <input 
                                                type="text" 
                                                className="input-pro flex-1 text-sm h-10 bg-slate-900 border-slate-700"
                                                placeholder="Ej: Pintura" 
                                                value={newItem.description}
                                                onChange={e => setNewItem({...newItem, description: e.target.value})}
                                            />
                                            <input 
                                                type="number" 
                                                className="input-pro w-24 text-sm h-10 bg-slate-900 border-slate-700"
                                                placeholder="$ Costo" 
                                                value={newItem.estimatedCost}
                                                onChange={e => setNewItem({...newItem, estimatedCost: e.target.value})}
                                            />
                                            <button 
                                                type="button" 
                                                onClick={handleAddItemToProject}
                                                className="bg-indigo-500 hover:bg-indigo-600 text-white p-2 rounded-lg"
                                            >
                                                <Plus size={20} />
                                            </button>
                                        </div>

                                        {/* Lista temporal */}
                                        <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                                            {formData.items.map((sub, idx) => (
                                                <div key={idx} className="flex justify-between items-center bg-slate-800 p-2 rounded-lg text-xs border border-slate-700">
                                                    <span className="text-white">{sub.description}</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono text-teal-400">${sub.estimatedCost || sub.estimatedPrice}</span>
                                                        <button type="button" onClick={() => handleRemoveSubItem(idx)} className="text-rose-400 hover:text-rose-300"><X size={14} /></button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 block">Link (Opcional)</label>
                                <input 
                                    type="url" 
                                    className="input-pro w-full bg-slate-900 border-slate-700 focus:border-indigo-500"
                                    value={newItem.link} 
                                    onChange={e => setNewItem({...newItem, link: e.target.value})} 
                                    placeholder="https://..." 
                                />
                            </div>

                            <button type="submit" className="btn-primary w-full mt-2" disabled={isSubmitting}>
                                {isSubmitting ? 'Guardando...' : (isEditing ? 'Guardar Cambios' : 'Crear Wishlist')}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default WishlistCard;
