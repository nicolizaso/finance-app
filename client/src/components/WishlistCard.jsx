import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Plus, Trash2, Check, ExternalLink, ChevronDown, ChevronUp, ShoppingBag, LayoutList, Package, Gift } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

const WishlistCard = ({ refreshTrigger }) => {
  const [wishlists, setWishlists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    type: 'ITEM', // PROJECT or ITEM
    items: []
  });
  const [newItem, setNewItem] = useState({ description: '', estimatedPrice: '', link: '' });
  const [isCreating, setIsCreating] = useState(false);

  // Access context for transaction creation
  const { onRefresh, handleGamification } = useOutletContext() || {};

  const fetchWishlists = async () => {
    try {
      const res = await api.get('/wishlist');
      if (res.data.success) {
        setWishlists(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching wishlists:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlists();
  }, [refreshTrigger]);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    try {
        const payload = { ...formData };

        // If type is ITEM, ensure we have one item in the list if not already added?
        // Actually, let's just use the form data.
        // If it's ITEM type but user didn't add items manually, we can treat the main title/price as the item?
        // But the UI below allows adding items.
        // Let's enforce adding at least one item or auto-create one for ITEM type.

        if (payload.type === 'ITEM' && payload.items.length === 0 && newItem.estimatedPrice) {
            payload.items.push({
                description: payload.title,
                estimatedPrice: newItem.estimatedPrice,
                link: newItem.link
            });
        }

        await api.post('/wishlist', payload);

        // Success Feedback & Reset
        alert('Proyecto creado con éxito');
        setShowModal(false);
        setFormData({ title: '', type: 'ITEM', items: [] });
        setNewItem({ description: '', estimatedPrice: '', link: '' });

        fetchWishlists();
        if (onRefresh) onRefresh();

    } catch (err) {
        console.error(err);
        alert('Error al crear el proyecto');
    } finally {
        setIsCreating(false);
    }
  };

  const addItemToForm = () => {
    if (!newItem.description || !newItem.estimatedPrice) return;
    setFormData({
        ...formData,
        items: [...formData.items, { ...newItem, estimatedPrice: parseFloat(newItem.estimatedPrice) }]
    });
    setNewItem({ description: '', estimatedPrice: '', link: '' });
  };

  const deleteWishlist = async (id) => {
    if (!confirm('¿Eliminar esta lista?')) return;
    try {
        await api.delete(`/wishlist/${id}`);
        fetchWishlists();
    } catch(err) { console.error(err); }
  };

  const markItemBought = async (wishlist, item) => {
    if (item.isBought) return; // Already bought

    const confirmed = confirm(`¿Compraste "${item.description}"? \nEsto creará una transacción de gasto automáticamente.`);
    if (!confirmed) return;

    try {
        // 1. Mark as bought in wishlist
        await api.patch(`/wishlist/${wishlist._id}/items/${item._id}`, { isBought: true });

        // 2. Create actual transaction
        // We need to guess some fields or use defaults
        const transactionPayload = {
            description: item.description,
            amount: Math.round(item.estimatedPrice * 100), // convert to cents
            type: 'EXPENSE',
            category: 'Varios', // Default category
            date: new Date().toISOString().split('T')[0],
            paymentMethod: 'DEBIT',
            installments: 1,
            status: 'COMPLETED',
            needsReview: true // Flag for review so user can adjust category/method later
        };

        const res = await api.post('/transactions', transactionPayload);

        // Refresh everything
        fetchWishlists();
        if (onRefresh) onRefresh();
        if (handleGamification && res.data.gamification) handleGamification(res.data.gamification);

    } catch (err) {
        console.error("Error processing purchase:", err);
        alert("Error al procesar la compra");
    }
  };

  return (
    <div className="bento-card relative overflow-hidden flex flex-col h-full min-h-[400px]">
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Gift className="text-purple-400" /> Wishlist & Planes
          </h3>
          <p className="text-textMuted text-xs">Metas de compra y proyectos</p>
        </div>
        <button
            onClick={() => setShowModal(true)}
            className="p-2 bg-primary/20 hover:bg-primary/30 text-primary rounded-xl transition-colors"
        >
            <Plus size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 relative z-10 pr-2">
        {loading ? (
            <p className="text-textMuted text-center py-10">Cargando...</p>
        ) : wishlists.length === 0 ? (
            <div className="text-center py-10 opacity-50">
                <Gift size={48} className="mx-auto mb-2" />
                <p>Tu lista de deseos está vacía</p>
            </div>
        ) : (
            wishlists.map(w => {
                const totalItems = w.items.length;
                const boughtItems = w.items.filter(i => i.isBought).length;
                const progress = totalItems > 0 ? (boughtItems / totalItems) * 100 : 0;

                return (
                    <div key={w._id} className="bg-surfaceHighlight/30 border border-white/5 rounded-xl overflow-hidden hover:border-purple-500/30 transition-colors">
                        {/* Header Row */}
                        <div
                            className="p-3 flex justify-between items-center cursor-pointer"
                            onClick={() => toggleExpand(w._id)}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${w.type === 'PROJECT' ? 'bg-blue-500/20 text-blue-400' : 'bg-pink-500/20 text-pink-400'}`}>
                                    {w.type === 'PROJECT' ? <LayoutList size={18} /> : <Package size={18} />}
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm text-white">{w.title}</h4>
                                    <div className="flex items-center gap-2 text-xs text-textMuted">
                                        <span className="font-mono text-emerald-400">${w.totalEstimated.toLocaleString()}</span>
                                        <span>• {boughtItems}/{totalItems} items</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {w.type === 'PROJECT' && (
                                     <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                        <div className="h-full bg-purple-500" style={{ width: `${progress}%` }}></div>
                                     </div>
                                )}
                                {expandedId === w._id ? <ChevronUp size={16} className="text-textMuted" /> : <ChevronDown size={16} className="text-textMuted" />}
                            </div>
                        </div>

                        {/* Expanded Details */}
                        {expandedId === w._id && (
                            <div className="bg-black/20 p-3 border-t border-white/5 space-y-2">
                                {w.items.map((item, idx) => (
                                    <div key={idx} className={`flex justify-between items-center text-sm p-2 rounded-lg ${item.isBought ? 'opacity-50 line-through' : 'hover:bg-white/5'}`}>
                                        <div className="flex flex-col min-w-0 flex-1">
                                            <span className="text-white truncate">{item.description}</span>
                                            <div className="flex gap-2 text-xs text-textMuted">
                                                <span>${item.estimatedPrice.toLocaleString()}</span>
                                                {item.link && (
                                                    <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                                        Link <ExternalLink size={10} />
                                                    </a>
                                                )}
                                            </div>
                                        </div>

                                        {!item.isBought ? (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); markItemBought(w, item); }}
                                                className="ml-2 p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/40 transition-colors"
                                                title="Marcar como comprado y agregar gasto"
                                            >
                                                <ShoppingBag size={16} />
                                            </button>
                                        ) : (
                                            <Check size={16} className="text-emerald-500 ml-2" />
                                        )}
                                    </div>
                                ))}
                                <div className="pt-2 flex justify-end">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); deleteWishlist(w._id); }}
                                        className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
                                    >
                                        <Trash2 size={12} /> Eliminar Lista
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })
        )}
      </div>

      {/* Modal de Creación */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
             <div className="bg-surface border border-purple-500/30 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-border bg-surfaceHighlight/20 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-white">Nuevo Deseo / Proyecto</h3>
                    <button onClick={() => setShowModal(false)} className="text-textMuted hover:text-white"><X size={20} /></button>
                </div>

                <div className="p-4 overflow-y-auto custom-scrollbar">
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div>
                            <label className="block text-xs text-textMuted mb-1">Título</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={e => setFormData({...formData, title: e.target.value})}
                                className="input-pro"
                                placeholder="ej. Decoración Patio o PS5"
                                required
                            />
                        </div>

                        <div className="flex gap-2">
                             <button
                                type="button"
                                onClick={() => setFormData({...formData, type: 'ITEM'})}
                                className={`flex-1 py-2 rounded-xl text-sm font-bold border ${formData.type === 'ITEM' ? 'bg-pink-500/20 border-pink-500/50 text-pink-400' : 'border-transparent bg-surfaceHighlight text-textMuted'}`}
                             >
                                Item Único
                             </button>
                             <button
                                type="button"
                                onClick={() => setFormData({...formData, type: 'PROJECT'})}
                                className={`flex-1 py-2 rounded-xl text-sm font-bold border ${formData.type === 'PROJECT' ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' : 'border-transparent bg-surfaceHighlight text-textMuted'}`}
                             >
                                Proyecto
                             </button>
                        </div>

                        {/* Add Items Section */}
                        <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                            <h4 className="text-xs font-bold text-textMuted mb-2 uppercase">
                                {formData.type === 'PROJECT' ? 'Items del Proyecto' : 'Detalles del Item'}
                            </h4>

                            {/* List of added items (for PROJECT) */}
                            {formData.items.length > 0 && (
                                <div className="space-y-2 mb-3">
                                    {formData.items.map((it, idx) => (
                                        <div key={idx} className="flex justify-between text-sm bg-surfaceHighlight/30 p-2 rounded">
                                            <span className="truncate">{it.description}</span>
                                            <span className="font-mono">${it.estimatedPrice}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Input fields for new item */}
                            {(formData.type === 'PROJECT' || formData.items.length === 0) && (
                                <div className="space-y-2">
                                    <input
                                        type="text"
                                        placeholder="Descripción Item"
                                        value={newItem.description}
                                        onChange={e => setNewItem({...newItem, description: e.target.value})}
                                        className="input-pro text-sm"
                                    />
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            placeholder="Precio Est."
                                            value={newItem.estimatedPrice}
                                            onChange={e => setNewItem({...newItem, estimatedPrice: e.target.value})}
                                            className="input-pro text-sm flex-1"
                                        />
                                         <input
                                            type="text"
                                            placeholder="Link (opc)"
                                            value={newItem.link}
                                            onChange={e => setNewItem({...newItem, link: e.target.value})}
                                            className="input-pro text-sm flex-1"
                                        />
                                    </div>
                                    {formData.type === 'PROJECT' && (
                                        <button
                                            type="button"
                                            onClick={addItemToForm}
                                            className="w-full py-2 bg-surfaceHighlight hover:bg-white/10 text-xs rounded-lg transition-colors"
                                        >
                                            + Agregar a la lista
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="pt-2">
                            <button type="submit" disabled={isCreating} className="btn-primary w-full disabled:opacity-50">
                                {isCreating ? 'Creando...' : `Crear ${formData.type === 'PROJECT' ? 'Proyecto' : 'Deseo'}`}
                            </button>
                        </div>
                    </form>
                </div>
             </div>
        </div>
      )}
    </div>
  );
};

// Helper icon
const X = ({ size }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

export default WishlistCard;
