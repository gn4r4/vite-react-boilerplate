import { useState } from 'react';
import { useNavigate, Link } from '@tanstack/react-router';
import { useCreatePosition } from '../api';
import type { IPositionPayload, IPosition } from '../types';

export const CreatePositionPage = () => {
  const navigate = useNavigate();
  const createPosition = useCreatePosition();
  
  const [formData, setFormData] = useState({
    name: '',
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      setError('Назва посади не може бути порожньою');
      return;
    }

    const payload: IPositionPayload = {
      name: trimmedName,
    };

    createPosition.mutate(payload as unknown as Partial<IPosition>, {
        onSuccess: () => navigate({ to: '/positions' }),
        onError: (err: any) => {
            setError(err?.response?.data?.message || 'Помилка при створенні посади');
        }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-10 flex justify-center">
      <div className="w-full max-w-3xl">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
           <Link to="/positions" className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 transition-all">
             ←
           </Link>
           <div>
             <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Нова посада</h1>
             <p className="text-slate-500">Додавання нової штатної одиниці</p>
           </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden p-6 md:p-8">

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-center gap-3">
              <span className="text-xl">⚠️</span>
              <p className="font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
                    <span>💼</span> Інформація
                </h2>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Назва посади <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        required
                        className="w-full px-4 py-3 bg-white rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-400 font-medium"
                        value={formData.name}
                        onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value });
                        if (error) setError(null);
                        }}
                        placeholder="Наприклад: Бібліотекар"
                    />
                </div>
            </div>
            
            {/* Buttons */}
            <div className="flex gap-4 pt-4 border-t border-slate-100">
              <button 
                type="button" 
                onClick={() => navigate({ to: '/positions' })} 
                className="flex-1 px-6 py-3.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 hover:text-slate-800 transition-all"
              >
                Скасувати
              </button>
              <button 
                type="submit" 
                className="flex-1 px-6 py-3.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 active:scale-95 shadow-lg shadow-blue-200 transition-all disabled:opacity-70 disabled:pointer-events-none"
                disabled={createPosition.isPending}
              >
                {createPosition.isPending ? 'Збереження...' : 'Створити посаду'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};