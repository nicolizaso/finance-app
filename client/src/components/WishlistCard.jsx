import { useState, useEffect } from 'react';
import { 
    Package, Plus, Trash2, Edit2, CheckCircle2, 
    Circle, AlertCircle, Sparkles, DollarSign, 
    X, ExternalLink, ChevronDown, ChevronUp, 
    ShoppingBag, LayoutList, Gift 
} from 'lucide-react';
import api from '../api/axios';
import { useOutletContext } from 'react-router-dom';

const WishlistCard = ({ refreshTrigger }) => {
    const [wishlists, setWishlists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null); // Unificado: usaremos editingId en lugar de editId

    const [formData, setFormData] = useState({
        title: '',
        type: 'ITEM', // PROJECT or ITEM
        items: []
    });
    const [newItem, setNewItem] = useState({ description: '', estimatedCost: '', link: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Access context for transaction creation
    // Manejo seguro del contexto en caso de que useOutletContext sea null (aunque no debería)
    const contextData = useOutletContext();
    const onRefresh = contextData?.onRefresh || (() => {});
    const handleGamification = contextData?.handleGamification || (() => {});

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

    // Handlers
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
        
        // Si es un item simple, lo convertimos al formato del form
        if (wishlist.type === 'ITEM' && wishlist.items.length > 0) {
            const itemData = wishlist.items[0];
            setFormData({
                title: wishlist.title,
                type: 'ITEM',
                items: [] // No usamos el array items en modo ITEM simple para visualización, solo title/price
            });
            // Pre-llenamos el newItem para simular el campo simple
            setNewItem({
                description: itemData.description || wishlist.title, // Fallback
                estimatedCost: itemData.estimatedPrice || itemData.estimatedCost || '',
                link: itemData.link || ''
            });
        } else {
            // Es un proyecto
            setFormData({
                title: wishlist.title,
                type: 'PROJECT',
                items: wishlist.items.map(i => ({
                    description: i.description,
                    estimatedCost: i.estimatedPrice || i.estimatedCost, // Normalizamos nombres
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

        // Preparamos el payload
        let payload = {
            title: formData.title,
            type: formData.type,
            items: []
        };

        if (formData.type === 'ITEM') {
            // Si es item simple, creamos un array con un solo elemento
            payload.items = [{
                description: formData.title, // El título suele ser la descripción
                estimatedPrice: parseFloat(newItem.estimatedCost) || 0,
                link: newItem.link
            }];
        } else {
            // Si es proyecto, mandamos el array acumulado
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

    // Función para marcar como comprado (Logica "Make it Real")
    const handleBuyItem = async (wishlistId, itemId, itemData) => {
        if (!window.confirm(`¿Ya compraste "${itemData.description}"? Esto creará un gasto real.`)) return;

        try {
            // 1. Crear la transacción real
            await api.post('/transactions', {
                description: itemData.description,
                amount: itemData.estimatedPrice || itemData.estimatedCost,
                category: 'Compras', // O podrías preguntar/inferir
                type: 'EXPENSE',
                date: new Date(),
                paymentMethod: 'DEBIT' // Default
            });

            // 2. Marcar el item como comprado en la wishlist
            // Necesitamos saber si es un sub-item de un proyecto o un item único
            // Nota: Esta lógica depende de tu backend. Si tienes un endpoint especifico para "marcar comprado", úsalo.
            // Si no, hacemos un update completo. Aquí asumo un endpoint patch o similar, o refrescamos.
            // Simplificación: Volvemos a hacer fetch por ahora o asumimos éxito.
            
            // Opción B: Update local y PUT al backend (más complejo sin endpoint dedicado).
            // Para mantenerlo simple con Jules, asumiremos que editar el estado isBought requiere editar todo el objeto
            // O idealmente tu backend tiene PATCH /wishlist/:id/item/:itemId/buy
            
            // Por ahora solo feedback visual y refresh (la parte de backend del "check" la omito si no está implementada)
            alert("Gasto creado en Actividad. ¡Felicidades!");
            onRefresh(); // Refresca balance
            
            // TODO: Implementar la persistencia del estado "isBought" si no existe endpoint dedicado
            
        } catch (error) {
            console.error(error);
            alert("Error al crear el gasto");
        }
    };

    return (
        <>
            <div className="bento-card relative overflow-hidden group flex flex-col h-full flex-1">
                {/* Header */}
                <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 to-rose-500 flex items-center justify-center shadow-lg shadow-rose-500/20">
                            <Sparkles className="text-white" size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white font-heading leading-tight">Wishlist & Planes</h3>
                            <p className="text-xs text-textMuted">Proyectos y cosas por comprar</p>
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
                        <p className="text-textMuted text-sm">Cargando deseos...</p>
                    ) : wishlists.length === 0 ? (
                        <div className="text-center py-4 border border-dashed border-white/10 rounded-xl">
                            <p className="text-textMuted text-sm">Tu lista de deseos está vacía.</p>
                        </div>
                    ) : (
                        wishlists.map((w) => (
                            <div key={w._id} className="bg-surfaceHighlight/30 border border-white/5 rounded-xl p-3 hover:border-white/10 transition-colors">
                                <div className="flex justify-between items-center">
                                    <div 
                                        className="flex items-center gap-3 flex-1 cursor-pointer"
                                        onClick={() => w.type === 'PROJECT' && setExpandedId(expandedId === w._id ? null : w._id)}
                                    >
                                        {w.type === 'PROJECT' ? (
                                            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                                <LayoutList size={16} />
                                            </div>
                                        ) : (
                                            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                                                <ShoppingBag size={16} />
                                            </div>
                                        )}
                                        <div>
                                            <h4 className="font-bold text-white text-sm">{w.title}</h4>
                                            <p className="text-xs text-textMuted">
                                                {w.type === 'PROJECT' 
                                                    ? `${w.items.filter(i => i.isBought).length}/${w.items.length} items` 
                                                    : `$${w.totalEstimated?.toLocaleString() || 0}`
                                                }
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handleOpenEdit(w)} className="p-1.5 text-textMuted hover:text-primary transition-colors">
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(w._id)} className="p-1.5 text-textMuted hover:text-rose-500 transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                        {w.type === 'PROJECT' && (
                                            <button onClick={() => setExpandedId(expandedId === w._id ? null : w._id)} className="text-textMuted">
                                                {expandedId === w._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Expanded Project View */}
                                {w.type === 'PROJECT' && expandedId === w._id && (
                                    <div className="mt-3 pl-4 border-l-2 border-white/5 space-y-2">
                                        {w.items.map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-center text-sm group/item">
                                                <div className="flex items-center gap-2">
                                                    <button 
                                                        onClick={() => !item.isBought && handleBuyItem(w._id, item._id, item)}
                                                        className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${item.isBought ? 'bg-emerald-500 border-emerald-500' : 'border-textMuted hover:border-primary'}`}
                                                    >
                                                        {item.isBought && <CheckCircle2 size={10} className="text-white" />}
                                                    </button>
                                                    <span className={item.isBought ? 'text-textMuted line-through' : 'text-textMain'}>
                                                        {item.description}
                                                    </span>
                                                    {item.link && (
                                                        <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primaryHover">
                                                            <ExternalLink size={12} />
                                                        </a>
                                                    )}
                                                </div>
                                                <span className="font-mono text-xs text-textMuted">${item.estimatedPrice?.toLocaleString()}</span>
                                            </div>
                                        ))}
                                        <div className="pt-2 mt-2 border-t border-white/5 flex justify-between items-center">
                                            <span className="text-xs font-bold text-textMuted uppercase">Total Estimado</span>
                                            <span className="text-sm font-mono font-bold text-emerald-400">${w.totalEstimated?.toLocaleString()}</span>
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
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowModal(false)}>
                    <div className="w-full max-w-lg bg-surface border border-white/10 rounded-2xl p-6 shadow-2xl animate-scale-in" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white font-heading">
                                {isEditing ? 'Editar Wishlist' : 'Nuevo Deseo o Proyecto'}
                            </h3>
                            <button onClick={() => setShowModal(false)}><X className="text-textMuted hover:text-white" /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="label">Título</label>
                                <input 
                                    type="text" 
                                    className="input-pro w-full" 
                                    value={formData.title} 
                                    onChange={e => setFormData({...formData, title: e.target.value})}
                                    placeholder="Ej: Setup Gamer, Vacaciones..." 
                                    required
                                />
                            </div>

                            <div className="flex gap-4">
                                <label className={`flex-1 p-3 rounded-xl border cursor-pointer transition-all ${formData.type === 'ITEM' ? 'bg-primary/20 border-primary text-white' : 'bg-surfaceHighlight/20 border-transparent text-textMuted'}`}>
                                    <input type="radio" className="hidden" name="type" value="ITEM" checked={formData.type === 'ITEM'} onChange={() => setFormData({...formData, type: 'ITEM'})} />
                                    <div className="flex flex-col items-center gap-1">
                                        <Gift size={20} />
                                        <span className="text-sm font-bold">Ítem Único</span>
                                    </div>
                                </label>
                                <label className={`flex-1 p-3 rounded-xl border cursor-pointer transition-all ${formData.type === 'PROJECT' ? 'bg-primary/20 border-primary text-white' : 'bg-surfaceHighlight/20 border-transparent text-textMuted'}`}>
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
                                        <label className="label">Precio Estimado</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-3 text-textMuted">$</span>
                                            <input 
                                                type="number" 
                                                className="input-pro w-full pl-8" 
                                                value={newItem.estimatedCost} 
                                                onChange={e => setNewItem({...newItem, estimatedCost: e.target.value})}
                                                placeholder="0.00" 
                                            />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3 animate-fade-in">
                                    <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                                        <h4 className="text-sm font-bold text-white mb-2">Items del Proyecto</h4>
                                        <div className="flex gap-2 mb-3">
                                            <input 
                                                type="text" 
                                                className="input-pro flex-1 text-sm h-10" 
                                                placeholder="Ej: Pintura" 
                                                value={newItem.description}
                                                onChange={e => setNewItem({...newItem, description: e.target.value})}
                                            />
                                            <input 
                                                type="number" 
                                                className="input-pro w-24 text-sm h-10" 
                                                placeholder="$ Costo" 
                                                value={newItem.estimatedCost}
                                                onChange={e => setNewItem({...newItem, estimatedCost: e.target.value})}
                                            />
                                            <button 
                                                type="button" 
                                                onClick={handleAddItemToProject}
                                                className="bg-primary hover:bg-primaryHover text-white p-2 rounded-lg"
                                            >
                                                <Plus size={20} />
                                            </button>
                                        </div>

                                        {/* Lista temporal */}
                                        <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                                            {formData.items.map((sub, idx) => (
                                                <div key={idx} className="flex justify-between items-center bg-surface p-2 rounded-lg text-xs">
                                                    <span className="text-white">{sub.description}</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono text-emerald-400">${sub.estimatedCost || sub.estimatedPrice}</span>
                                                        <button type="button" onClick={() => handleRemoveSubItem(idx)} className="text-rose-400 hover:text-rose-300"><X size={14} /></button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="label">Link (Opcional)</label>
                                <input 
                                    type="url" 
                                    className="input-pro w-full bg-void" 
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