import { useState, useMemo } from 'react';
import { Link } from '@tanstack/react-router';
import { useOrders, useDeleteOrder } from '../api';
import { IOrder } from '../types';
import { useAuthStore } from '@/store/authStore';

export const OrdersListPage = () => {
  // 1. Отримуємо роль
  const role = useAuthStore((state) => state.user?.role);
  const isReader = role === 'READER';

  const { data: orders, isLoading, error } = useOrders();
  const deleteOrder = useDeleteOrder();

  // Стейт для фільтрації, пошуку та сортування
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortConfig, setSortConfig] = useState<{ key: keyof IOrder | 'supplier'; direction: 'asc' | 'desc' } | null>(null);

  // Хелпер для стилів статусу
  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Завершено';
      case 'processing': return 'В обробці';
      case 'pending': return 'Очікування';
      case 'cancelled': return 'Скасовано';
      default: return status;
    }
  };

  // Обробка даних (Мемоізація)
  const processedOrders = useMemo(() => {
    if (!orders) return [];

    let result = [...orders];

    // 1. Пошук
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(order => 
        order.id.toString().includes(lowerQuery) ||
        (order.supplier?.name || '').toLowerCase().includes(lowerQuery)
      );
    }

    // 2. Фільтрація по статусу
    if (filterStatus !== 'all') {
      result = result.filter(order => order.status === filterStatus);
    }

    // 3. Сортування
    if (sortConfig) {
      result.sort((a, b) => {
        let aValue: any = '';
        let bValue: any = '';

        if (sortConfig.key === 'supplier') {
          aValue = a.supplier?.name || '';
          bValue = b.supplier?.name || '';
        } else if (sortConfig.key === 'date') {
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
        } else {
          // @ts-ignore
          aValue = a[sortConfig.key] || '';
          // @ts-ignore
          bValue = b[sortConfig.key] || '';
        }

        if (aValue === bValue) return 0;
        
        // Порівняння
        if (typeof aValue === 'string') {
           return sortConfig.direction === 'asc' 
             ? aValue.localeCompare(bValue, 'uk') 
             : bValue.localeCompare(aValue, 'uk');
        }
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      });
    }

    return result;
  }, [orders, searchQuery, filterStatus, sortConfig]);

  const handleSort = (key: keyof IOrder | 'supplier') => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Статистика
  const stats = useMemo(() => {
    if (!orders) return { total: 0, completed: 0, pending: 0 };
    return {
      total: orders.length,
      completed: orders.filter(o => o.status === 'completed').length,
      pending: orders.filter(o => o.status === 'pending').length
    };
  }, [orders]);

  if (isLoading) 
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-gray-500 font-medium">Завантаження замовлень...</div>
        </div>
      </div>
    );

  if (error) 
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-red-100 text-center">
          <div className="text-4xl mb-2">⚠️</div>
          <h3 className="text-lg font-bold text-gray-800">Виникла помилка</h3>
          <p className="text-red-500">Не вдалося завантажити дані про замовлення.</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header & Stats */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-4">Замовлення книг</h1>
            <div className="flex flex-wrap gap-3">
               <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 flex flex-col">
                 <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Всього</span>
                 <span className="text-xl font-bold text-slate-800">{stats.total}</span>
               </div>
               <div className="bg-emerald-50 px-4 py-2 rounded-xl shadow-sm border border-emerald-100 flex flex-col">
                 <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider">Виконано</span>
                 <span className="text-xl font-bold text-emerald-700">{stats.completed}</span>
               </div>
               <div className="bg-amber-50 px-4 py-2 rounded-xl shadow-sm border border-amber-100 flex flex-col">
                 <span className="text-[10px] uppercase font-bold text-amber-600 tracking-wider">Очікують</span>
                 <span className="text-xl font-bold text-amber-700">{stats.pending}</span>
               </div>
            </div>
          </div>
          
          {!isReader && (
            <Link 
              to="/orders/new" 
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow-md shadow-blue-200 font-medium"
            >
              <span>+</span> Створити замовлення
            </Link>
          )}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-2 rounded-2xl shadow-sm border border-slate-200">
            <div className="relative flex-1 w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    🔍
                </div>
                <input 
                    type="text" 
                    placeholder="Пошук за ID або Постачальником..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-transparent focus:outline-none text-slate-700 placeholder:text-slate-400"
                />
            </div>
            
            <div className="flex bg-slate-100 p-1 rounded-xl overflow-x-auto max-w-full">
                {[
                    { key: 'all', label: 'Всі' },
                    { key: 'pending', label: 'Очікування' },
                    { key: 'processing', label: 'В обробці' },
                    { key: 'completed', label: 'Завершено' },
                    { key: 'cancelled', label: 'Скасовано' },
                ].map((status) => (
                    <button
                        key={status.key}
                        onClick={() => setFilterStatus(status.key)}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                            filterStatus === status.key
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                        }`}
                    >
                        {status.label}
                    </button>
                ))}
            </div>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {processedOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full whitespace-nowrap">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th 
                      onClick={() => handleSort('date')}
                      className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors select-none"
                    >
                      Дата {sortConfig?.key === 'date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      onClick={() => handleSort('supplier')}
                      className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors select-none"
                    >
                      Постачальник {sortConfig?.key === 'supplier' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      onClick={() => handleSort('status')}
                      className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors select-none"
                    >
                      Статус {sortConfig?.key === 'status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Зміст замовлення
                    </th> 
                    {!isReader && <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Дії</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {processedOrders.map((order) => (
                    <tr 
                      key={order.id} 
                      className="hover:bg-blue-50/50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                            <span className="font-semibold text-slate-800">
                                {order.date ? new Date(order.date).toLocaleDateString('uk-UA') : '-'}
                            </span>
                            <span className="text-[10px] text-slate-400">ID: #{order.id}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                            <span className="text-lg opacity-70">🏢</span>
                            {order.supplier?.name || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusStyles(order.status)}`}>
                            {getStatusLabel(order.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {order.editions && order.editions.length > 0 ? (
                          <div className="flex flex-col gap-1">
                            {order.editions.slice(0, 3).map((item, i) => (
                              <div key={i} className="flex items-center gap-1.5">
                                <span className="text-slate-400 text-xs">📖</span>
                                <span className="font-medium truncate max-w-[200px]" title={item.edition?.book?.title}>
                                    {item.edition?.book?.title}
                                </span>
                                <span className="text-xs bg-slate-100 px-1.5 rounded text-slate-500 border border-slate-200">
                                    x{item.quantity}
                                </span>
                              </div>
                            ))}
                            {order.editions.length > 3 && (
                                <span className="text-xs text-blue-500 pl-5">
                                    + ще {order.editions.length - 3} ...
                                </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Порожнє замовлення</span>
                        )}
                      </td>
                      
                      {!isReader && (
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-3 opacity-80 group-hover:opacity-100 transition-opacity">
                            <Link 
                              to={`/orders/${order.id}`}
                              className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              Редагувати
                            </Link>
                            <button 
                              onClick={() => {
                                if (window.confirm('Ви впевнені, що хочете видалити це замовлення?')) {
                                  deleteOrder.mutate(order.id);
                                }
                              }}
                              className="text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              Видалити
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <span className="text-4xl mb-3">📦</span>
              <p className="text-lg font-medium">
                {searchQuery ? 'За вашим запитом нічого не знайдено' : 'Список замовлень порожній'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};