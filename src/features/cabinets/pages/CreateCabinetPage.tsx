import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useCreateCabinet } from '../api';
import type { ICabinetPayload } from '../types';

export const CreateCabinetPage = () => {
  const navigate = useNavigate();
  const createCabinet = useCreateCabinet();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const [formErrors, setFormErrors] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Скидаємо помилку при введенні
    if (formErrors) setFormErrors(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors(null);
    
    // Валідація
    if (!formData.name.trim()) {
      setFormErrors('Назва шафи є обов\'язковою');
      return;
    }

    const payload: ICabinetPayload = {
      name: formData.name.trim(),
      description: formData.description.trim() || null,
    };

    createCabinet.mutate(payload as any, {
      onError: (error) => {
        // Обробка помилок сервера (опціонально)
        setFormErrors('Сталася помилка при створенні. Спробуйте ще раз.');
        console.error(error);
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Створити шафу</h1>
          <p className="text-gray-600 mb-6">Введіть інформацію про нову шафу</p>

          {/* Відображення помилок */}
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
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition ${
                  formErrors ? 'border-red-500' : 'border-gray-300'
                }`}
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
                disabled={createCabinet.isPending}
              >
                {createCabinet.isPending ? 'Збереження...' : 'Зберегти'}
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