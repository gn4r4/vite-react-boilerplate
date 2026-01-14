import { useState } from 'react';
import { useNavigate, Link } from '@tanstack/react-router';
import { useCreateUser } from '../api';
import { Role, Language } from '../types';

export const CreateUserPage = () => {
  const navigate = useNavigate();
  const createUser = useCreateUser();
  
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    password: '',
    role: Role.READER,
    language: Language.ukUA,
  });

  const [formError, setFormError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Валідація
    if(!formData.username || !formData.email || !formData.password) {
        setFormError("Будь ласка, заповніть всі обов'язкові поля");
        return;
    }

    createUser.mutate(formData, {
        onError: (err: any) => {
            setFormError(err?.response?.data?.message || 'Помилка при створенні користувача');
        }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-10 flex justify-center">
      <div className="w-full max-w-2xl">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
           <Link to="/users" className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 transition-all">
             ←
           </Link>
           <div>
             <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Новий користувач</h1>
             <p className="text-slate-500">Створення облікового запису для входу в систему</p>
           </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden p-6 md:p-8">
          
          {formError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-center gap-3">
              <span className="text-xl">⚠️</span>
              <p className="font-medium">{formError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Логін (Username) <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-400 font-medium"
                    required
                    placeholder="user123"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Повне ім'я</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-400 font-medium"
                    placeholder="Іван Іванов"
                  />
                </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Email <span className="text-red-500">*</span></label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-400 font-medium"
                required
                placeholder="example@mail.com"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Пароль <span className="text-red-500">*</span></label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-400 font-medium"
                required
                placeholder="********"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Роль доступу</label>
                    <div className="relative">
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-white rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all appearance-none cursor-pointer text-slate-700 font-medium"
                        >
                            <option value={Role.READER}>Читач (READER)</option>
                            <option value={Role.LIBRARIAN}>Бібліотекар (LIBRARIAN)</option>
                            <option value={Role.RESTORER}>Реставратор (RESTORER)</option>
                            <option value={Role.ADMINISTRATOR}>Адміністратор (ADMINISTRATOR)</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Мова інтерфейсу</label>
                    <div className="relative">
                        <select
                            name="language"
                            value={formData.language}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-white rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all appearance-none cursor-pointer text-slate-700 font-medium"
                        >
                            <option value={Language.ukUA}>Українська</option>
                            <option value={Language.enUS}>English</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                    </div>
                </div>
            </div>
            
            <div className="flex gap-4 pt-6 border-t border-slate-100">
              <button 
                type="button" 
                onClick={() => navigate({ to: '/users' })} 
                className="flex-1 px-6 py-3.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 hover:text-slate-800 transition-all"
              >
                Скасувати
              </button>
              <button 
                type="submit" 
                disabled={createUser.isPending}
                className="flex-1 px-6 py-3.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 active:scale-95 shadow-lg shadow-blue-200 transition-all disabled:opacity-70 disabled:pointer-events-none"
              >
                {createUser.isPending ? 'Збереження...' : 'Створити'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};