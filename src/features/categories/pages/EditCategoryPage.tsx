import { useState, useEffect } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useCategory, useUpdateCategory } from '../api';
import type { ICategoryPayload, ICategory } from '../types';

export const EditCategoryPage = () => {
  const { categoryId } = useParams({ strict: false });
  const navigate = useNavigate();
  
  const { data: category, isLoading } = useCategory(Number(categoryId));
  const updateCategory = useUpdateCategory();
  
  const [formData, setFormData] = useState({
    name: '',
  });

  const [formErrors, setFormErrors] = useState<string | null>(null);

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
      });
    }
  }, [category]);

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

    updateCategory.mutate({ 
      id: Number(categoryId), 
      data: payload as unknown as Partial<ICategory>
    }, {
      onError: () => {
        setFormErrors('Помилка при оновленні категорії');
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Редагувати категорію</h1>
          <p className="text-gray-600 mb-6">Оновіть назву категорії</p>

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
                disabled={updateCategory.isPending}
              >
                {updateCategory.isPending ? 'Збереження...' : 'Зберегти'}
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