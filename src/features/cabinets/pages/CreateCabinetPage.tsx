import { useState } from 'react';
import { useNavigate, Link } from '@tanstack/react-router';
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
    if (formErrors) setFormErrors(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors(null);
    
    if (!formData.name.trim()) {
      setFormErrors('Назва шафи є обов\'язковою');
      return;
    }

    const payload: ICabinetPayload = {
      name: formData.name.trim(),
      description: formData.description.trim() || null,
    };

    createCabinet.mutate(payload as any, {
      onSuccess: () => {
        navigate({ to: '/cabinets' });
      },
      onError: () => {
        setFormErrors('Сталася помилка при створенні. Спробуйте ще раз.');
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-10 flex justify-center">
      <div className="w-full max-w-3xl">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
           <Link to="/cabinets" className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 transition-all">
             ←
           </Link>
           <div>
             <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Нова шафа</h1>
             <p className="text-slate-500">Додавання нової шафи для зберігання книг</p>
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
                <span>🗄️</span> Інформація
              </h2>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Назва шафи <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-400 font-medium"
                  required
                  placeholder="Введіть назву (наприклад: Шафа А)"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Опис</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-400 font-medium resize-y min-h-[100px]"
                  placeholder="Додаткова інформація (розташування, призначення...)"
                />
              </div>
            </div>
            
            {/* Buttons */}
            <div className="flex gap-4 pt-4 border-t border-slate-100">
              <button 
                type="button" 
                onClick={() => navigate({ to: '/cabinets' })} 
                className="flex-1 px-6 py-3.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 hover:text-slate-800 transition-all"
              >
                Скасувати
              </button>
              <button 
                type="submit" 
                disabled={createCabinet.isPending}
                className="flex-1 px-6 py-3.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 active:scale-95 shadow-lg shadow-blue-200 transition-all disabled:opacity-70 disabled:pointer-events-none"
              >
                {createCabinet.isPending ? 'Збереження...' : 'Створити шафу'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};