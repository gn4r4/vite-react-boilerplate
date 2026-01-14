import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from '@tanstack/react-router';
import { useUser, useUpdateUser } from '../api';
import { IUser, Role, Language } from '../types';
import { useAuthStore } from '@/store/authStore'; // Імпорт стору

export const EditUserPage = () => {
  const { userId } = useParams({ from: '/users/$userId' });
  const navigate = useNavigate();
  const id = Number(userId);

  const { data: user, isLoading } = useUser(id);
  const updateUser = useUpdateUser();
  
  // Отримуємо поточного користувача
  const { user: currentUser } = useAuthStore();
  
  // Перевіряємо, чи редагує адмін сам себе
  const isEditingSelf = currentUser?.id === id;

  const [formData, setFormData] = useState<Partial<IUser>>({
    username: '',
    name: '',
    email: '',
    role: Role.READER,
    language: Language.ukUA,
  });
  
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        name: user.name || '',
        email: user.email,
        role: user.role,
        language: user.language || Language.ukUA,
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    updateUser.mutate({
      id,
      data: {
        username: formData.username,
        name: formData.name,
        email: formData.email,
        role: formData.role, // Відправляємо поточну роль (якщо disabled, значення все одно в стейті)
        language: formData.language
      },
    }, {
        onError: (err: any) => {
            setFormError(err?.response?.data?.message || 'Помилка при оновленні');
        }
    });
  };

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50/50">
        <div className="flex flex-col items-center gap-3">
             <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
             <div className="text-gray-500 font-medium">Завантаження даних...</div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-10 flex justify-center">
      <div className="w-full max-w-2xl">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
           <Link to="/users" className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 transition-all">
             ←
           </Link>
           <div className="flex-1 flex justify-between items-center">
             <div>
                <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Редагування</h1>
                <p className="text-slate-500">Зміна даних користувача</p>
             </div>
             <div className="hidden sm:block px-3 py-1 bg-slate-200 text-slate-600 rounded-lg font-mono text-sm font-bold">
                ID: #{id}
             </div>
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
                  <label className="block text-sm font-bold text-slate-700 mb-2">Логін</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-400 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Повне ім'я</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-400 font-medium"
                  />
                </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-400 font-medium"
                required
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
                            disabled={isEditingSelf} // Блокуємо зміну ролі для себе
                            className={`w-full px-4 py-3 bg-white rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all appearance-none cursor-pointer text-slate-700 font-medium ${isEditingSelf ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''}`}
                        >
                            <option value={Role.READER}>Читач</option>
                            <option value={Role.LIBRARIAN}>Бібліотекар</option>
                            <option value={Role.RESTORER}>Реставратор</option>
                            <option value={Role.ADMINISTRATOR}>Адміністратор</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                    </div>
                    {isEditingSelf && (
                        <p className="text-xs text-amber-600 mt-1.5 ml-1">
                            ⚠️ Ви не можете змінити власну роль.
                        </p>
                    )}
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
                className="flex-1 px-6 py-3.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 active:scale-95 shadow-lg shadow-blue-200 transition-all disabled:opacity-70 disabled:pointer-events-none"
                disabled={updateUser.isPending}
              >
                {updateUser.isPending ? 'Збереження...' : 'Зберегти зміни'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};