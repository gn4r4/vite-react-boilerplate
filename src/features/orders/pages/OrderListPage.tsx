import { useState, useMemo } from 'react';
import { Link } from '@tanstack/react-router';
import { useOrders, useDeleteOrder } from '../api';
import { IOrder } from '../types';

export const OrdersListPage = () => {
  const { data: orders, isLoading, error } = useOrders();
  const deleteOrder = useDeleteOrder();

  // Стейт для фільтрації, пошуку та сортування
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortConfig, setSortConfig] = useState<{ key: keyof IOrder | 'supplier'; direction: 'asc' | 'desc' } | null>(null);

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
             ? aValue.localeCompare(bValue) 
             : bValue.localeCompare(aValue);
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

  if (isLoading) 
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-gray-600">Завантаження замовлень...</div>
      </div>
    );

  if (error) 
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-red-600">Помилка завантаження данних!</div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Замовлення</h1>
            <p className="text-gray-600 mt-2">
              Знайдено замовлень: {processedOrders.length} (Всього: {orders?.length || 0})
            </p>
          </div>
          <Link 
            to="/orders/new" 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            + Додати замовлення
          </Link>
        </div>

        {/* Панель інструментів */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex gap-4 items-center flex-wrap">
            <div className="flex-1 min-w-[200px]">
                <input 
                    type="text" 
                    placeholder="Пошук за ID або Постачальником..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            <div className="min-w-[200px]">
                <select 
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="all">Всі статуси</option>
                    <option value="pending">Очікування</option>
                    <option value="processing">В обробці</option>
                    <option value="completed">Завершено</option>
                    <option value="cancelled">Скасовано</option>
                </select>
            </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          {processedOrders.length > 0 ? (
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th 
                    onClick={() => handleSort('date')}
                    className="px-6 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-200"
                  >
                    Дата {sortConfig?.key === 'date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    onClick={() => handleSort('supplier')}
                    className="px-6 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-200"
                  >
                    Постачальник {sortConfig?.key === 'supplier' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    onClick={() => handleSort('status')}
                    className="px-6 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-200"
                  >
                    Статус {sortConfig?.key === 'status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Видання</th> 
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Дії</th>
                </tr>
              </thead>
              <tbody>
                {processedOrders.map((order, index) => (
                  <tr 
                    key={order.id} 
                    className={`border-b hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {order.date ? new Date(order.date).toLocaleDateString('uk-UA') : '-'}
                      <div className="text-xs text-gray-400">#{order.id}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {order.supplier?.name || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                        {order.status === 'pending' && <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">Очікування</span>}
                        {order.status === 'processing' && <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">В обробці</span>}
                        {order.status === 'completed' && <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Завершено</span>}
                        {order.status === 'cancelled' && <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">Скасовано</span>}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {order.editions && order.editions.length > 0 ? (
                        <div className="space-y-1">
                          {order.editions.map((item, i) => (
                            <div key={i}>
                              <span className="font-medium">{item.edition?.book?.title}</span>
                              <span className="text-gray-400 text-xs ml-1">x{item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400">Пусто</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link 
                        to={`/orders/${order.id}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium transition-colors"
                      >
                        Редагувати
                      </Link>
                      <button 
                        onClick={() => {
                          if (window.confirm('Ви впевнені?')) {
                            deleteOrder.mutate(order.id);
                          }
                        }}
                        className="text-red-600 hover:text-red-800 hover:underline text-sm font-medium transition-colors"
                      >
                        Видалити
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-gray-600">
              <p className="text-lg">
                {searchQuery ? 'За вашим запитом нічого не знайдено' : 'Замовлень не знайдено'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};