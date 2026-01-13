import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from '@tanstack/react-router';
import { useOrder, useUpdateOrder } from '../api';
import { useEditions } from '../../editions/api';
import { useSuppliers } from '../../suppliers/api';
import { IOrder, IOrderPayload } from '../types';

export const EditOrderPage = () => {
  const { orderId } = useParams({ from: '/orders/$orderId' });
  const navigate = useNavigate();
  const id = Number(orderId);

  const { data: order, isLoading } = useOrder(id);
  const updateOrder = useUpdateOrder();
  const { data: editions } = useEditions();
  const { data: suppliers } = useSuppliers();

  const [formData, setFormData] = useState<Partial<IOrder>>({
    date: new Date(),
    status: 'pending',
    editions: [],
  });

  const [supplierId, setSupplierId] = useState<string>('');
  
  // States for adding items
  const [editionSearch, setEditionSearch] = useState('');
  const [tempEditionId, setTempEditionId] = useState<string>('');
  const [tempQty, setTempQty] = useState<number>(1);

  // Filter editions
  const filteredEditions = useMemo(() => {
    if (!editions) return [];
    if (!editionSearch) return editions;
    
    return editions.filter(e => 
      e.book?.title.toLowerCase().includes(editionSearch.toLowerCase()) || 
      e.ISBN?.includes(editionSearch)
    );
  }, [editions, editionSearch]);

  useEffect(() => {
    if (order) {
      setFormData({
        ...order,
        date: order.date ? new Date(order.date) : new Date(),
        editions: order.editions || []
      });

      if (order.supplier) {
        setSupplierId(order.supplier.id.toString());
      }
    }
  }, [order]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!supplierId) {
        alert("Постачальник обов'язковий");
        return;
    }

    if (formData.editions && formData.editions.length > 0) {
      const payload: IOrderPayload = {
        dateorder: formData.date ? formData.date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        status: formData.status || 'pending',
        id_supplier: Number(supplierId),
        id_editions: formData.editions.map(item => ({
            id_edition: item.edition.id,
            quantity: item.quantity
        }))
      };

      updateOrder.mutate({ id, data: payload }, {
          onSuccess: () => navigate({ to: '/orders' })
      });
    } else {
        alert("Додайте хоча б одне видання");
    }
  };

  const handleAddItem = () => {
    const editionId = Number(tempEditionId);
    const quantity = tempQty;
    const edition = editions?.find(e => e.id === editionId);
    
    if (!edition || quantity <= 0) return;

    setFormData(prev => {
      const currentItems = prev.editions || [];
      const existingItemIndex = currentItems.findIndex(item => item.edition.id === editionId);

      if (existingItemIndex >= 0) {
        const updatedItems = [...currentItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity
        };
        return { ...prev, editions: updatedItems };
      } else {
        return {
          ...prev,
          editions: [...currentItems, { edition, quantity }]
        };
      }
    });

    setTempEditionId('');
    setTempQty(1);
    setEditionSearch('');
  };

  const handleRemoveItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      editions: prev.editions?.filter((_, i) => i !== index)
    }));
  };

  const totalQuantity = formData.editions?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50/50">
        <div className="flex flex-col items-center gap-3">
             <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
             <div className="text-gray-500 font-medium">Завантаження замовлення...</div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-10 flex justify-center">
      <div className="w-full max-w-4xl">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
           <Link to="/orders" className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 transition-all">
             ←
           </Link>
           <div className="flex-1 flex justify-between items-center">
             <div>
                <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Редагування</h1>
                <p className="text-slate-500">Управління замовленням</p>
             </div>
             <div className="hidden sm:block px-3 py-1 bg-slate-200 text-slate-600 rounded-lg font-mono text-sm font-bold">
                ID: #{orderId}
             </div>
           </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden p-6 md:p-8">

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
                    <span>📄</span> Інформація про замовлення
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Дата замовлення</label>
                        <input
                            type="date"
                            value={formData.date instanceof Date ? formData.date.toISOString().split('T')[0] : ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, date: new Date(e.target.value) }))}
                            className="w-full px-4 py-3 bg-white rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium text-slate-600"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Статус</label>
                        <div className="relative">
                            <select
                                value={formData.status || 'pending'}
                                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                                className={`w-full px-4 py-3 rounded-xl border focus:ring-4 focus:ring-blue-500/10 outline-none transition-all appearance-none cursor-pointer font-medium ${
                                    formData.status === 'completed' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                                    formData.status === 'cancelled' ? 'bg-red-50 border-red-200 text-red-700' :
                                    formData.status === 'processing' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                                    'bg-white border-slate-200 text-slate-700'
                                }`}
                            >
                                <option value="pending">⏳ Очікування</option>
                                <option value="processing">🔄 В обробці</option>
                                <option value="completed">✅ Завершено</option>
                                <option value="cancelled">❌ Скасовано</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">▼</div>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Постачальник</label>
                    <div className="relative">
                        <select
                            value={supplierId}
                            onChange={(e) => setSupplierId(e.target.value)}
                            className="w-full px-4 py-3 bg-white rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all appearance-none cursor-pointer"
                        >
                            <option value="">Оберіть постачальника...</option>
                            {suppliers?.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div className="flex justify-between items-end pb-2 border-b border-slate-100">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <span>📦</span> Вміст
                    </h2>
                    <span className="text-sm font-medium bg-blue-50 text-blue-700 px-3 py-1 rounded-lg border border-blue-100">
                        Всього книг: <strong>{totalQuantity}</strong>
                    </span>
                </div>

                <div className="space-y-2">
                    {formData.editions && formData.editions.length > 0 ? (
                        formData.editions.map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl group hover:border-blue-300 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-slate-200 text-sm">
                                        📖
                                    </div>
                                    <span className="font-semibold text-slate-700">{item.edition?.book?.title}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Кількість</span>
                                    <span className="font-mono font-bold bg-white px-3 py-1 rounded border border-slate-200 text-slate-800">
                                        {item.quantity}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveItem(index)}
                                        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                                        title="Видалити"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                            <span className="text-4xl block mb-2 opacity-50">🛒</span>
                            <p className="text-slate-500">Список замовлення порожній</p>
                        </div>
                    )}
                </div>

                {/* Add Item Form */}
                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 space-y-4">
                    <label className="block text-sm font-bold text-blue-900">Додати видання</label>
                    
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400">🔍</span>
                        <input 
                            type="text" 
                            placeholder="Фільтр: назва книги або ISBN..." 
                            value={editionSearch}
                            onChange={(e) => setEditionSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                    </div>

                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <select
                                value={tempEditionId}
                                onChange={(e) => setTempEditionId(e.target.value)}
                                className="w-full px-4 py-3 bg-white rounded-lg border border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all appearance-none cursor-pointer"
                            >
                                <option value="">{filteredEditions.length === 0 ? 'Нічого не знайдено' : 'Оберіть видання зі списку...'}</option>
                                {filteredEditions.map(e => (
                                    <option key={e.id} value={e.id}>{e.book?.title} ({e.yearPublication ? new Date(e.yearPublication).getFullYear() : '-'})</option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                        </div>
                        <input
                            type="number"
                            min="1"
                            value={tempQty}
                            onChange={(e) => setTempQty(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-24 px-3 py-3 bg-white rounded-lg border border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none text-center font-bold text-slate-700"
                            placeholder="К-сть"
                        />
                        <button
                            type="button"
                            onClick={handleAddItem}
                            disabled={!tempEditionId}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all shadow-sm"
                        >
                            + Додати
                        </button>
                    </div>
                </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => navigate({ to: '/orders' })}
                className="flex-1 px-6 py-3.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 hover:text-slate-800 transition-all"
              >
                Скасувати
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 active:scale-95 shadow-lg shadow-blue-200 transition-all disabled:opacity-70 disabled:pointer-events-none"
                disabled={updateOrder.isPending}
              >
                {updateOrder.isPending ? 'Збереження...' : 'Зберегти зміни'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};