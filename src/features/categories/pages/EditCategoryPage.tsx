import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from '@tanstack/react-router';
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
      onSuccess: () => {
        navigate({ to: '/categories' });
      },
      onError: () => {
        setFormErrors('Помилка при оновленні категорії');
      }
    });
  };

  if (isLoading) 
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50/50">
        <div className="flex flex-col items-center gap-3">
             <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
             <div className="text-gray-500 font-medium">Завантаження даних категорії...</div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-10 flex justify-center">
      <div className="w-full max-w-3xl">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
           <Link to="/categories" className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 transition-all">
             ←
           </Link>
           <div className="flex-1 flex justify-between items-center">
             <div>
                <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Редагування</h1>
                <p className="text-slate-500">Зміна назви категорії</p>
             </div>
             <div className="hidden sm:block px-3 py-1 bg-slate-200 text-slate-600 rounded-lg font-mono text-sm font-bold">
                ID: #{categoryId}
             </div>
           </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden p-6 md:p-8">

          {formErrors && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-center gap-3">
              <span className="text-xl">⚠️</span>
              <p className="font-medium">{formErrors}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
                <span>🏷️</span> Основна інформація
              </h2>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Назва категорії <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 bg-white rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-400 font-medium"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (formErrors) setFormErrors(null);
                  }}
                  placeholder="Введіть назву категорії"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4 border-t border-slate-100">
              <button 
                type="button" 
                onClick={() => navigate({ to: '/categories' })} 
                className="flex-1 px-6 py-3.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 hover:text-slate-800 transition-all"
              >
                Скасувати
              </button>
              <button 
                type="submit" 
                disabled={updateCategory.isPending}
                className="flex-1 px-6 py-3.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 active:scale-95 shadow-lg shadow-blue-200 transition-all disabled:opacity-70 disabled:pointer-events-none"
              >
                {updateCategory.isPending ? 'Збереження...' : 'Зберегти зміни'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};