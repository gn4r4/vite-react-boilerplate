import { useState } from 'react';
import { useNavigate, Link } from '@tanstack/react-router';
import type { IAuthorPayload, IAuthor } from '../types';
import { useCreateAuthor } from '../api';

export const CreateAuthorPage = () => {
  const navigate = useNavigate();
  const createAuthor = useCreateAuthor();
  
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    patronymic: '',
    dateofbirth: '',
  });

  const [formErrors, setFormErrors] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormErrors(null);

    // Валідація
    if (!formData.firstname.trim() || !formData.lastname.trim()) {
      setFormErrors("Ім'я та прізвище є обов'язковими полями.");
      return;
    }

    // 1. Формуємо payload
    const payload: IAuthorPayload = {
      firstname: formData.firstname.trim(),
      lastname: formData.lastname.trim(),
      patronymic: formData.patronymic.trim() || null,
      dateofbirth: formData.dateofbirth || null
    };

    // 2. Підготовка даних для API (Partial<IAuthor>)
    const apiData: Partial<IAuthor> = {
      ...payload,
      dateofbirth: payload.dateofbirth ? new Date(payload.dateofbirth) : null
    };

    createAuthor.mutate(apiData, {
        onSuccess: () => navigate({ to: '/authors' }),
    });
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-10 flex justify-center">
      <div className="w-full max-w-3xl">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
           <Link to="/authors" className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 transition-all">
             ←
           </Link>
           <div>
             <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Новий автор</h1>
             <p className="text-slate-500">Додавання автора до бази даних</p>
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
                <span>👤</span> Особисті дані
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Ім'я */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Ім'я <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 bg-white rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-400 font-medium"
                    value={formData.firstname}
                    onChange={(e) => setFormData({ ...formData, firstname: e.target.value })}
                    placeholder="Введіть ім'я"
                  />
                </div>

                {/* Прізвище */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Прізвище <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 bg-white rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-400 font-medium"
                    value={formData.lastname}
                    onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
                    placeholder="Введіть прізвище"
                  />
                </div>
              </div>

              {/* По батькові */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">По батькові</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-white rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-400 font-medium"
                  value={formData.patronymic}
                  onChange={(e) => setFormData({ ...formData, patronymic: e.target.value })}
                  placeholder="Введіть по батькові (опціонально)"
                />
              </div>

              {/* Дата народження */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Дата народження</label>
                <input
                  type="date"
                  className="w-full px-4 py-3 bg-white rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium text-slate-600"
                  value={formData.dateofbirth}
                  onChange={(e) => setFormData({ ...formData, dateofbirth: e.target.value })}
                />
              </div>
            </div>
            
            {/* Buttons */}
            <div className="flex gap-4 pt-4 border-t border-slate-100">
              <button 
                type="button" 
                onClick={() => navigate({ to: '/authors' })} 
                className="flex-1 px-6 py-3.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 hover:text-slate-800 transition-all"
              >
                Скасувати
              </button>
              <button 
                type="submit" 
                disabled={createAuthor.isPending}
                className="flex-1 px-6 py-3.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 active:scale-95 shadow-lg shadow-blue-200 transition-all disabled:opacity-70 disabled:pointer-events-none"
              >
                {createAuthor.isPending ? 'Збереження...' : 'Створити автора'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};