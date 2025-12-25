import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
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
  
  // Пошук видання
  const [editionSearch, setEditionSearch] = useState('');

  // Фільтрація списку видань
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

      updateOrder.mutate({ id, data: payload });
    } else {
        alert("Додайте хоча б одне видання");
    }
  };

  const handleAddItem = (editionId: number, quantity: number) => {
    const edition = editions?.find(e => e.id === editionId);
    if (!edition) return;

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
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-gray-600">Завантаження...</div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Редагувати замовлення</h1>
          <p className="text-gray-600 mb-6">Оновіть інформацію про замовлення #{id}</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Дата замовлення</label>
                  <input
                    type="date"
                    value={formData.date instanceof Date ? formData.date.toISOString().split('T')[0] : ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: new Date(e.target.value) }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Статус</label>
                  <select
                    value={formData.status || 'pending'}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
                  >
                    <option value="pending">Очікування</option>
                    <option value="processing">В обробці</option>
                    <option value="completed">Завершено</option>
                    <option value="cancelled">Скасовано</option>
                  </select>
                </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Постачальник</label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
              >
                <option value="">Оберіть постачальника</option>
                {suppliers?.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Видання в замовленні</h3>
                  <span className="text-sm text-gray-600">
                      Всього книг: <span className="font-bold">{totalQuantity}</span>
                  </span>
              </div>

              {formData.editions && formData.editions.length > 0 ? (
                <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                  {formData.editions.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-white rounded border border-gray-200 shadow-sm">
                      <div>
                        <p className="font-medium text-gray-900">{item.edition?.book?.title}</p>
                        <p className="text-sm text-gray-600">Кількість: {item.quantity}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="text-red-600 hover:text-red-800 font-medium text-sm"
                      >
                        Видалити
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4 mb-4 bg-white rounded border border-dashed border-gray-300">Немає видань в замовленні</p>
              )}

              <div className="space-y-2">
                 <input 
                    type="text" 
                    placeholder="Пошук книги за назвою..." 
                    value={editionSearch}
                    onChange={(e) => setEditionSearch(e.target.value)}
                    className="w-full px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500 mb-1"
                 />

                <div className="grid grid-cols-[1fr_100px] gap-2">
                    <select
                    id="editionSelect"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
                    defaultValue=""
                    >
                    <option value="">
                         {filteredEditions.length === 0 ? 'Нічого не знайдено' : 'Оберіть видання...'}
                    </option>
                    {filteredEditions.map(e => (
                        <option key={e.id} value={e.id}>{e.book?.title}</option>
                    ))}
                    </select>
                    <input
                    type="number"
                    id="quantityInput"
                    min="1"
                    defaultValue="1"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
                    placeholder="Кількість"
                    />
                </div>
              </div>
              
              <button
                type="button"
                onClick={() => {
                  const select = document.getElementById('editionSelect') as HTMLSelectElement;
                  const input = document.getElementById('quantityInput') as HTMLInputElement;
                  const editionId = Number(select.value);
                  const quantity = Number(input.value);
                  
                  if (editionId && quantity > 0) {
                    handleAddItem(editionId, quantity);
                    select.value = '';
                    input.value = '1';
                    setEditionSearch('');
                  }
                }}
                className="w-full mt-3 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm"
              >
                + Додати видання
              </button>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow"
                disabled={updateOrder.isPending}
              >
                {updateOrder.isPending ? 'Збереження...' : 'Оновити замовлення'}
              </button>
              <button
                type="button"
                onClick={() => navigate({ to: '/orders' })}
                className="flex-1 bg-gray-300 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-400 transition-colors font-medium"
              >
                Скасувати
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};