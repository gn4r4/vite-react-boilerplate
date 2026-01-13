import { useState, useMemo } from 'react';
import { useNavigate, Link } from '@tanstack/react-router';
import { useCreateOrder } from '../api';
import { useEditions } from '../../editions/api';
import { useSuppliers } from '../../suppliers/api';
import type { IOrderPayload } from '../types';

interface ILocalEditionItem {
  id_edition: number;
  title: string;
  quantity: number;
}

export const CreateOrderPage = () => {
  const navigate = useNavigate();
  const createOrder = useCreateOrder();
  const { data: editions } = useEditions();
  const { data: suppliers } = useSuppliers();

  // Локальний стан форми
  const [dateOrder, setDateOrder] = useState<string>(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<string>('pending');
  const [supplierId, setSupplierId] = useState<string>('');
  const [selectedEditions, setSelectedEditions] = useState<ILocalEditionItem[]>([]);
  
  // Стан для додавання нового елементу
  const [editionSearch, setEditionSearch] = useState('');
  const [tempEditionId, setTempEditionId] = useState<string>('');
  const [tempQty, setTempQty] = useState<number>(1);

  // Фільтрація списку видань для селекта
  const filteredEditions = useMemo(() => {
    if (!editions) return [];
    if (!editionSearch) return editions;
    
    return editions.filter(e => 
      e.book?.title.toLowerCase().includes(editionSearch.toLowerCase()) || 
      e.ISBN?.includes(editionSearch)
    );
  }, [editions, editionSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!supplierId) {
      alert('Оберіть постачальника');
      return;
    }

    if (selectedEditions.length > 0) {
      const payload: IOrderPayload = {
        dateorder: dateOrder,
        status: status,
        id_supplier: Number(supplierId),
        id_editions: selectedEditions.map(item => ({
          id_edition: item.id_edition,
          quantity: item.quantity
        })),
      };

      createOrder.mutate(payload, {
          onSuccess: () => navigate({ to: '/orders' })
      });
    } else {
        alert('Додайте хоча б одне видання');
    }
  };

  const handleAddItem = () => {
    const editionId = Number(tempEditionId);
    const quantity = tempQty;
    const edition = editions?.find(e => e.id === editionId);
    
    if (!edition || quantity <= 0) return;

    setSelectedEditions(prev => {
      const existing = prev.find(item => item.id_edition === editionId);
      if (existing) {
        return prev.map(item => 
          item.id_edition === editionId 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { 
        id_edition: editionId, 
        title: edition.book?.title || 'Unknown', 
        quantity 
      }];
    });

    // Reset fields
    setTempEditionId('');
    setTempQty(1);
    setEditionSearch('');
  };

  const handleRemoveItem = (index: number) => {
    setSelectedEditions(prev => prev.filter((_, i) => i !== index));
  };

  const totalQuantity = selectedEditions.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-10 flex justify-center">
      <div className="w-full max-w-4xl">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
           <Link to="/orders" className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 transition-all">
             ←
           </Link>
           <div>
             <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Створити замовлення</h1>
             <p className="text-slate-500">Формування нового замовлення літератури у постачальника</p>
           </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden p-6 md:p-8">
          
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Основна інформація */}
            <div className="space-y-6">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
                    <span>📄</span> Деталі замовлення
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Дата замовлення</label>
                        <input
                            type="date"
                            value={dateOrder}
                            onChange={(e) => setDateOrder(e.target.value)}
                            className="w-full px-4 py-3 bg-white rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium text-slate-600"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Статус</label>
                        <div className="relative">
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full px-4 py-3 bg-white rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all appearance-none cursor-pointer"
                            >
                                <option value="pending">⏳ Очікування</option>
                                <option value="processing">🔄 В обробці</option>
                                <option value="completed">✅ Завершено</option>
                                <option value="cancelled">❌ Скасовано</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Постачальник <span className="text-red-500">*</span></label>
                    <div className="relative">
                        <select
                            value={supplierId}
                            onChange={(e) => setSupplierId(e.target.value)}
                            className="w-full px-4 py-3 bg-white rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all appearance-none cursor-pointer"
                            required
                        >
                            <option value="">Оберіть постачальника...</option>
                            {suppliers?.map(s => (
                            <option key={s.id} value={s.id}>{s.name} (ЄДРПОУ: {s.edrpou})</option>
                            ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                    </div>
                </div>
            </div>

            {/* Склад замовлення */}
            <div className="space-y-6">
                <div className="flex justify-between items-end pb-2 border-b border-slate-100">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <span>📦</span> Склад замовлення
                    </h2>
                    <span className="text-sm font-medium bg-blue-50 text-blue-700 px-3 py-1 rounded-lg border border-blue-100">
                        Всього книг: <strong>{totalQuantity}</strong>
                    </span>
                </div>

                {/* Список обраних */}
                <div className="space-y-2">
                    {selectedEditions.length > 0 ? (
                        selectedEditions.map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl group hover:border-blue-300 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-slate-200 text-sm">
                                        📖
                                    </div>
                                    <span className="font-semibold text-slate-700">{item.title}</span>
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

                {/* Форма додавання */}
                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 space-y-4">
                    <label className="block text-sm font-bold text-blue-900">Додати видання до списку</label>
                    
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

            {/* Actions */}
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
                disabled={createOrder.isPending}
              >
                {createOrder.isPending ? 'Збереження...' : 'Зберегти замовлення'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};