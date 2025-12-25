import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useCreateCategory } from '../api';
import type { ICategoryPayload, ICategory } from '../types';

export const CreateCategoryPage = () => {
  const navigate = useNavigate();
  const createCategory = useCreateCategory();
  
  const [formData, setFormData] = useState({
    name: '',
  });

  const [formErrors, setFormErrors] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors(null);

    // Валідація
    if (!formData.name.trim()) {
      setFormErrors('Назва категорії не може бути порожньою');
      return;
    }

    const payload: ICategoryPayload = {
      name: formData.name.trim(),
    };

    createCategory.mutate(payload as unknown as Partial<ICategory>, {
      onError: () => {
        setFormErrors('Помилка при створенні категорії');
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Нова категорія</h1>
          <p className="text-gray-600 mb-6">Введіть назву нової категорії</p>

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
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (formErrors) setFormErrors(null);
                }}
                placeholder="Введіть назву категорії"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button 
                type="submit" 
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-70 disabled:cursor-not-allowed"
                disabled={createCategory.isPending}
              >
                {createCategory.isPending ? 'Збереження...' : 'Зберегти'}
              </button>
              <button 
                type="button" 
                onClick={() => navigate({ to: '/categories' })} 
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