import { useState } from 'react';
import { useNavigate, Link } from '@tanstack/react-router';
import { useCreateShelf } from '../api';
import { useCabinets } from '../../cabinets/api';
import type { IShelfPayload, IShelf } from '../types';

export const CreateShelfPage = () => {
  const navigate = useNavigate();
  const { data: cabinets } = useCabinets();
  const createShelf = useCreateShelf();
  
  const [formData, setFormData] = useState({
    shelfcode: '',
    id_cabinet: '',
  });

  const [formErrors, setFormErrors] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
    
    if (!formData.shelfcode?.trim()) {
        setFormErrors("Код полиці є обов'язковим полем");
        return;
    }
    
    if (!formData.id_cabinet) {
        setFormErrors("Будь ласка, оберіть шафу");
        return;
    }

    if (formData.shelfcode?.trim() && formData.id_cabinet) {
      const payload: IShelfPayload = {
        shelfcode: formData.shelfcode.trim(),
        id_cabinet: Number(formData.id_cabinet),
      };

      createShelf.mutate(payload as unknown as Partial<IShelf>, {
        onSuccess: () => navigate({ to: '/shelves' }),
        onError: () => setFormErrors("Помилка при створенні полиці. Спробуйте ще раз."),
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-10 flex justify-center">
      <div className="w-full max-w-3xl">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
           <Link to="/shelves" className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 transition-all">
             ←
           </Link>
           <div>
             <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Нова полиця</h1>
             <p className="text-slate-500">Додавання нової полиці в шафу</p>
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
                <span>🗄️</span> Розташування
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Шафа */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Шафа <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select
                        name="id_cabinet"
                        value={formData.id_cabinet}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all appearance-none cursor-pointer"
                        required
                    >
                        <option value="" disabled hidden>Оберіть шафу...</option>
                        {cabinets?.map((cabinet) => (
                        <option key={cabinet.id} value={cabinet.id}>
                            {cabinet.name}
                        </option>
                        ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                  </div>
                </div>

                {/* Код полиці */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Код полиці <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="shelfcode"
                    value={formData.shelfcode}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-400 font-medium"
                    required
                    placeholder="Наприклад: A-1"
                  />
                </div>
              </div>
            </div>
            
            {/* Buttons */}
            <div className="flex gap-4 pt-4 border-t border-slate-100">
              <button 
                type="button" 
                onClick={() => navigate({ to: '/shelves' })} 
                className="flex-1 px-6 py-3.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 hover:text-slate-800 transition-all"
              >
                Скасувати
              </button>
              <button 
                type="submit" 
                disabled={createShelf.isPending}
                className="flex-1 px-6 py-3.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 active:scale-95 shadow-lg shadow-blue-200 transition-all disabled:opacity-70 disabled:pointer-events-none"
              >
                {createShelf.isPending ? 'Збереження...' : 'Створити полицю'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};