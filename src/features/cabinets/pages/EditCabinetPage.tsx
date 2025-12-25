import { useEffect, useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useCabinet, useUpdateCabinet } from '../api';
import type { ICabinetPayload } from '../types';

export const EditCabinetPage = () => {
  const { cabinetId } = useParams({ from: '/cabinets/$cabinetId' });
  const navigate = useNavigate();
  const id = Number(cabinetId);

  const { data: cabinet, isLoading } = useCabinet(id);
  const updateCabinet = useUpdateCabinet();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const [formErrors, setFormErrors] = useState<string | null>(null);

  useEffect(() => {
    if (cabinet) {
      setFormData({
        name: cabinet.name,
        description: cabinet.description || '',
      });
    }
  }, [cabinet]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (formErrors) setFormErrors(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors(null);
    
    if (!formData.name.trim()) {
      setFormErrors('Назва шафи є обов\'язковою');
      return;
    }

    const payload: ICabinetPayload = {
      name: formData.name.trim(),
      description: formData.description.trim() || null,
    };

    updateCabinet.mutate({ 
      id, 
      data: payload as any 
    }, {
      onError: () => {
        setFormErrors('Помилка оновлення даних. Спробуйте пізніше.');
      }
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Редагувати шафу</h1>
          <p className="text-gray-600 mb-6">Оновіть інформацію про шафу</p>

          {formErrors && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {formErrors}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Назва *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
                required
                placeholder="Введіть назву шафи"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Опис</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
                placeholder="Введіть опис шафи"
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-70 disabled:cursor-not-allowed"
                disabled={updateCabinet.isPending}
              >
                {updateCabinet.isPending ? 'Збереження...' : 'Оновити'}
              </button>
              <button
                type="button"
                onClick={() => navigate({ to: '/cabinets' })}
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