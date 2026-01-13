import { useState } from 'react';
import { useNavigate, Link } from '@tanstack/react-router';
import { useCreateEmployee } from '../api';
import { usePositions } from '../../positions/api';

export const CreateEmployeePage = () => {
  const navigate = useNavigate();
  const createEmployee = useCreateEmployee();
  const { data: positions } = usePositions();

  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    patronymic: '',
    contact: '',
    address: '',
    position: '',
  });

  const [formErrors, setFormErrors] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors(null);

    // Валідація: ім'я та прізвище обов'язкові і не повинні бути пустими
    if (!formData.firstname.trim() || !formData.lastname.trim()) {
      setFormErrors('Будь ласка, введіть ім\'я та прізвище');
      return;
    }

    createEmployee.mutate({
      firstname: formData.firstname.trim(),
      lastname: formData.lastname.trim(),
      patronymic: formData.patronymic.trim() || null,
      contact: formData.contact.trim(),
      address: formData.address.trim(),
      id_position: formData.position ? Number(formData.position) : null,
    }, {
        onSuccess: () => navigate({ to: '/employees' }),
        onError: (error: any) => {
            setFormErrors(error?.response?.data?.message || 'Помилка при створенні працівника');
        }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-10 flex justify-center">
      <div className="w-full max-w-3xl">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
           <Link to="/employees" className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 transition-all">
             ←
           </Link>
           <div>
             <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Новий працівник</h1>
             <p className="text-slate-500">Додавання співробітника до штату</p>
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
            
            {/* Особисті дані */}
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
                            placeholder="Введіть ім'я..."
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
                            placeholder="Введіть прізвище..."
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
                        placeholder="Введіть по-батькові (опціонально)..."
                    />
                </div>
            </div>

            {/* Професійна інформація */}
            <div className="space-y-6">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
                    <span>💼</span> Професійна та контактна інформація
                </h2>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Посада</label>
                    <div className="relative">
                        <select
                            value={formData.position}
                            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                            className="w-full px-4 py-3 bg-white rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all appearance-none cursor-pointer"
                        >
                            <option value="">Оберіть посаду...</option>
                            {positions?.map((position) => (
                            <option key={position.id} value={position.id}>
                                {position.name}
                            </option>
                            ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Контакт</label>
                    <input
                        type="text"
                        value={formData.contact}
                        onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                        className="w-full px-4 py-3 bg-white rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-400 font-medium"
                        placeholder="Телефон, Email..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Адреса проживання</label>
                    <textarea
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full px-4 py-3 bg-white rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-400 font-medium resize-y min-h-[100px]"
                        placeholder="Введіть адресу..."
                        rows={3}
                    />
                </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4 border-t border-slate-100">
              <button 
                type="button" 
                onClick={() => navigate({ to: '/employees' })} 
                className="flex-1 px-6 py-3.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 hover:text-slate-800 transition-all"
              >
                Скасувати
              </button>
              <button 
                type="submit" 
                disabled={createEmployee.isPending}
                className="flex-1 px-6 py-3.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 active:scale-95 shadow-lg shadow-blue-200 transition-all disabled:opacity-70 disabled:pointer-events-none"
              >
                {createEmployee.isPending ? 'Збереження...' : 'Додати працівника'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};