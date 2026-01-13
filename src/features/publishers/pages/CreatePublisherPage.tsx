import { useState } from 'react';
import { useNavigate, Link } from '@tanstack/react-router';
import { useCreatePublisher } from '../api';
import type { IPublisherPayload, IPublisher } from '../types';

export const CreatePublisherPage = () => {
  const navigate = useNavigate();
  const createPublisher = useCreatePublisher();
  
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    contact: '',
  });

  const [formErrors, setFormErrors] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors(null);

    if (!formData.name.trim()) {
        setFormErrors("Назва видавництва не може бути порожньою");
        return;
    }

    const payload: IPublisherPayload = {
      name: formData.name.trim(),
      address: formData.address.trim() || null,
      contact: formData.contact.trim() || null,
    };

    createPublisher.mutate(payload as unknown as Partial<IPublisher>, {
      onSuccess: () => navigate({ to: '/publishers' }),
      onError: () => setFormErrors("Не вдалося створити видавця. Спробуйте ще раз."),
    });
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-10 flex justify-center">
      <div className="w-full max-w-3xl">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
           <Link to="/publishers" className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 transition-all">
             ←
           </Link>
           <div>
             <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Новий видавець</h1>
             <p className="text-slate-500">Додавання партнера-видавництва</p>
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
                <span>🏢</span> Інформація про організацію
              </h2>

              {/* Назва */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Назва <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 bg-white rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-400 font-medium"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Введіть назву видавництва"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Адреса */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Адреса</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-white rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-400 font-medium"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Місто, вулиця..."
                  />
                </div>

                {/* Контакт */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Контактні дані</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-white rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-400 font-medium"
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    placeholder="Телефон або Email"
                  />
                </div>
              </div>
            </div>
            
            {/* Buttons */}
            <div className="flex gap-4 pt-4 border-t border-slate-100">
              <button 
                type="button" 
                onClick={() => navigate({ to: '/publishers' })} 
                className="flex-1 px-6 py-3.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 hover:text-slate-800 transition-all"
              >
                Скасувати
              </button>
              <button 
                type="submit" 
                disabled={createPublisher.isPending}
                className="flex-1 px-6 py-3.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 active:scale-95 shadow-lg shadow-blue-200 transition-all disabled:opacity-70 disabled:pointer-events-none"
              >
                {createPublisher.isPending ? 'Збереження...' : 'Створити видавця'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};