import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useCreateOrder } from '../api';
import { useEditions } from '../../editions/api';
import { IOrder } from '../types';

export const CreateOrderPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Partial<IOrder>>({
    dateOrder: new Date(),
    status: 'pending',
    items: [],
  });

  const createOrder = useCreateOrder();
  const { data: editions } = useEditions();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.items && formData.items.length > 0) {
      createOrder.mutate(formData);
    }
  };

  const handleAddItem = (editionId: number, quantity: number) => {
    const edition = editions?.find(e => e.id === editionId);
    if (edition) {
      setFormData(prev => ({
        ...prev,
        items: [...(prev.items || []), { edition, quantity }]
      }));
    }
  };

  const handleRemoveItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items?.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Створити замовлення</h1>
          <p className="text-gray-600 mb-6">Введіть інформацію про нове замовлення</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Дата замовлення</label>
              <input
                type="date"
                value={formData.dateOrder instanceof Date ? formData.dateOrder.toISOString().split('T')[0] : ''}
                onChange={(e) => setFormData(prev => ({ ...prev, dateOrder: new Date(e.target.value) }))}
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
                {/* Changes: value "confirmed" -> "processing" to match backend validator */}
                <option value="processing">В обробці (Підтверджено)</option>
                <option value="completed">Завершено</option>
                <option value="cancelled">Скасовано</option>
              </select>
            </div>

            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Видання в замовленні</h3>
              {formData.items && formData.items.length > 0 ? (
                <div className="space-y-2 mb-4">
                  {formData.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-white rounded border border-gray-200">
                      <div>
                        <p className="font-medium text-gray-900">{item.edition?.book?.title}</p>
                        <p className="text-sm text-gray-600">Кількість: {item.quantity}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        Видалити
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4 mb-4">Немає видань в замовленні</p>
              )}

              <div className="grid grid-cols-2 gap-2">
                <select
                  id="editionSelect"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
                  defaultValue=""
                >
                  <option value="">Оберіть видання</option>
                  {editions?.map(e => (
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
              <button
                type="button"
                onClick={() => {
                  const editionId = Number((document.getElementById('editionSelect') as HTMLSelectElement).value);
                  const quantity = Number((document.getElementById('quantityInput') as HTMLInputElement).value);
                  if (editionId && quantity > 0) {
                    handleAddItem(editionId, quantity);
                    (document.getElementById('editionSelect') as HTMLSelectElement).value = '';
                    (document.getElementById('quantityInput') as HTMLInputElement).value = '1';
                  }
                }}
                className="w-full mt-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                + Додати видання
              </button>
            </div>

            <div className="flex gap-3 pt-4">
              <button 
                type="submit" 
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                disabled={createOrder.isPending}
              >
                {createOrder.isPending ? 'Збереження...' : 'Зберегти'}
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