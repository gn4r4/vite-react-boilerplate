import { useEffect, useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { usePublisher, useUpdatePublisher } from '../api';
import type { IPublisherPayload, IPublisher } from '../types';

export const EditPublisherPage = () => {
  const { publisherId } = useParams({ strict: false });
  const navigate = useNavigate();
  const id = Number(publisherId);
  
  const { data: publisher, isLoading } = usePublisher(id);
  const updatePublisher = useUpdatePublisher();

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    contact: '',
  });

  useEffect(() => {
    if (publisher) {
      setFormData({
        name: publisher.name,
        address: publisher.address || '',
        contact: publisher.contact || '',
      });
    }
  }, [publisher]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
        alert("Назва не може бути порожньою");
        return;
    }

    const payload: IPublisherPayload = {
      name: formData.name.trim(),
      address: formData.address.trim() || null,
      contact: formData.contact.trim() || null,
    };

    updatePublisher.mutate({ 
      id: id, 
      data: payload as unknown as Partial<IPublisher>
    });
  };

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Редагувати видавця</h1>
          <p className="text-gray-600 mb-6">Оновіть інформацію про видавця</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Назва *</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Введіть назву видавництва"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Адреса</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Введіть адресу (опціонально)"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Контакт</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                placeholder="Введіть контакт (опціонально)"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button 
                type="submit" 
                disabled={updatePublisher.isPending}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-70"
              >
                {updatePublisher.isPending ? 'Збереження...' : 'Зберегти'}
              </button>
              <button 
                type="button" 
                onClick={() => navigate({ to: '/publishers' })} 
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