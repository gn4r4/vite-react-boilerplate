import { useState, useMemo } from 'react';
import { useNavigate, Link } from '@tanstack/react-router';
import { useCreateReader } from '../api';
import { useUsers } from '../../users/api';
import { useAuthStore } from '@/store/authStore';
import type { IReaderPayload, IReader } from '../types';

export const CreateReaderPage = () => {
  const navigate = useNavigate();
  const createReader = useCreateReader();
  
  const { user: currentUser } = useAuthStore();
  const isAdmin = currentUser?.role === 'ADMINISTRATOR';

  const { data: usersList, isLoading: isUsersLoading } = useUsers({ enabled: isAdmin });

  // Розумна фільтрація
  const availableUsers = useMemo(() => {
    if (!usersList) return [];
    
    return usersList.filter((u: any) => {
        // 1. Якщо у користувача вже є профіль читача - ховаємо
        if (u.reader) return false;
        
        // 2. СУВОРА ФІЛЬТРАЦІЯ: Показуємо ТІЛЬКИ тих, у кого роль 'READER'
        if (u.role !== 'READER') return false;

        // 3. Якщо у користувача є прив'язка до співробітника - теж ховаємо
        if (u.employee) return false;

        return true;
    });
  }, [usersList]);

  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    patronymic: '',
    contact: '',
    address: '',
  });
  
  const [userId, setUserId] = useState<string>('');
  const [formErrors, setFormErrors] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors(null);

    if (!formData.firstname.trim() || !formData.lastname.trim()) {
      setFormErrors('Будь ласка, введіть ім\'я та прізвище');
      return;
    }

    const payload: IReaderPayload = {
      firstname: formData.firstname.trim(),
      lastname: formData.lastname.trim(),
      patronymic: formData.patronymic.trim() || null, 
      contact: formData.contact.trim(),
      address: formData.address.trim(),
      ...(isAdmin ? { id_user: userId ? Number(userId) : null } : {})
    };

    createReader.mutate(payload as unknown as Partial<IReader>, {
        onSuccess: () => navigate({ to: '/readers' }),
        onError: (error: any) => {
            setFormErrors(error?.response?.data?.message || 'Помилка при створенні читача');
        }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-10 flex justify-center">
      <div className="w-full max-w-3xl">
        <div className="flex items-center gap-4 mb-8">
           <Link to="/readers" className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 transition-all">
             ←
           </Link>
           <div>
             <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Новий читач</h1>
             <p className="text-slate-500">Реєстрація нового користувача бібліотеки</p>
           </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden p-6 md:p-8">
          {formErrors && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-center gap-3">
              <span className="text-xl">⚠️</span>
              <p className="font-medium">{formErrors}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {isAdmin && (
                <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">🔐</span>
                        <h3 className="font-bold text-blue-900">Прив'язка до акаунту</h3>
                    </div>
                    <p className="text-sm text-blue-600/80 mb-3">
                        Оберіть системного користувача з роллю <b>READER</b>.
                    </p>
                    
                    <div className="relative">
                        <select
                            value={userId}
                            onChange={(e) => setUserId(e.target.value)}
                            disabled={isUsersLoading}
                            className="w-full px-4 py-3 bg-white rounded-xl border border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all appearance-none cursor-pointer text-blue-900 font-medium"
                        >
                            <option value="">-- Без прив'язки (Локальний читач) --</option>
                            {availableUsers.map((u: any) => (
                                <option key={u.id} value={u.id}>
                                    {u.email} ({u.username})
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-blue-400">▼</div>
                    </div>
                </div>
            )}

            <div className="space-y-6">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
                    <span>👤</span> Особисті дані
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Ім'я <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            value={formData.firstname}
                            onChange={(e) => setFormData({ ...formData, firstname: e.target.value })}
                            className="w-full px-4 py-3 bg-white rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-400 font-medium"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Прізвище <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            value={formData.lastname}
                            onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
                            className="w-full px-4 py-3 bg-white rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-400 font-medium"
                            required
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">По-батькові</label>
                    <input
                        type="text"
                        value={formData.patronymic}
                        onChange={(e) => setFormData({ ...formData, patronymic: e.target.value })}
                        className="w-full px-4 py-3 bg-white rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-400 font-medium"
                    />
                </div>
            </div>

            <div className="space-y-6">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
                    <span>📞</span> Контактна інформація
                </h2>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Контакт (Телефон / Email)</label>
                    <input
                        type="text"
                        value={formData.contact}
                        onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                        className="w-full px-4 py-3 bg-white rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-400 font-medium"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Адреса проживання</label>
                    <textarea
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full px-4 py-3 bg-white rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-400 font-medium resize-y min-h-[100px]"
                        rows={3}
                    />
                </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-slate-100">
              <button type="button" onClick={() => navigate({ to: '/readers' })} className="flex-1 px-6 py-3.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 hover:text-slate-800 transition-all">
                Скасувати
              </button>
              <button type="submit" disabled={createReader.isPending} className="flex-1 px-6 py-3.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 active:scale-95 shadow-lg shadow-blue-200 transition-all disabled:opacity-70 disabled:pointer-events-none">
                {createReader.isPending ? 'Збереження...' : 'Створити читача'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};