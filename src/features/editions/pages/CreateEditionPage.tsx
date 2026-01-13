import { useState } from 'react';
import { useNavigate, Link } from '@tanstack/react-router';
import { useCreateEdition } from '../api';
import { usePublishers } from '../../publishers/api';
import { useBooks } from '../../books/api';
import type { IEditionPayload, IEdition } from '../types';

export const CreateEditionPage = () => {
  const navigate = useNavigate();

  // Використовуємо Partial<IEdition> для локального стейту форми
  const [formData, setFormData] = useState<Partial<IEdition>>({
    book: null,
    publisher: null,
    yearPublication: new Date(),
    ISBN: '',
    pages: null,
  });

  const [formErrors, setFormErrors] = useState<string | null>(null);

  const createEdition = useCreateEdition();
  const { data: publishers } = usePublishers();
  const { data: books } = useBooks();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors(null);
    
    if (!formData.book?.id || !formData.publisher?.id) {
        setFormErrors("Будь ласка, оберіть книгу та видавця");
        return;
    }

    // Формуємо payload
    const payload: IEditionPayload = {
      id_book: Number(formData.book.id),
      id_publisher: Number(formData.publisher.id),
      yearpublication: formData.yearPublication
        ? new Date(formData.yearPublication).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      ISBN: formData.ISBN?.trim() || null,
      pages: formData.pages ? Number(formData.pages) : null
    };

    createEdition.mutate(payload, {
        onSuccess: () => navigate({ to: '/editions' }),
        onError: () => {
            setFormErrors("Помилка при створенні видання");
        }
    });
  };

  // Хелпер для безпечного отримання дати у форматі YYYY-MM-DD для input
  const getDateString = (date?: Date) => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-10 flex justify-center">
      <div className="w-full max-w-3xl">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
           <Link to="/editions" className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 transition-all">
             ←
           </Link>
           <div>
             <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Нове видання</h1>
             <p className="text-slate-500">Реєстрація нового видання книги в системі</p>
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
                <span>📖</span> Основні дані
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Книга */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Книга <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select
                        value={formData.book?.id || ''}
                        onChange={(e) => {
                        const book = books?.find(b => b.id === Number(e.target.value));
                        setFormData(prev => ({ ...prev, book: book || null }));
                        }}
                        className="w-full px-4 py-3 bg-white rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all appearance-none cursor-pointer"
                        required
                    >
                        <option value="" disabled hidden>Оберіть книгу...</option>
                        {books?.map((book) => (
                        <option key={book.id} value={book.id}>
                            {book.title}
                        </option>
                        ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                  </div>
                </div>

                {/* Видавець */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Видавець <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select
                        value={formData.publisher?.id || ''}
                        onChange={(e) => {
                        const publisher = publishers?.find(p => p.id === Number(e.target.value));
                        setFormData(prev => ({ ...prev, publisher: publisher || null }));
                        }}
                        className="w-full px-4 py-3 bg-white rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all appearance-none cursor-pointer"
                        required
                    >
                        <option value="" disabled hidden>Оберіть видавця...</option>
                        {publishers?.map((publisher) => (
                        <option key={publisher.id} value={publisher.id}>
                            {publisher.name}
                        </option>
                        ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Рік видання */}
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Рік видання <span className="text-red-500">*</span></label>
                    <input
                    type="date"
                    required
                    value={getDateString(formData.yearPublication)}
                    onChange={(e) => setFormData(prev => ({ ...prev, yearPublication: new Date(e.target.value) }))}
                    className="w-full px-4 py-3 bg-white rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-600 font-medium"
                    />
                </div>

                {/* Сторінок */}
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Кількість сторінок</label>
                    <input
                    type="number"
                    min="1"
                    value={formData.pages || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, pages: e.target.value ? Number(e.target.value) : null }))}
                    className="w-full px-4 py-3 bg-white rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-400 font-medium"
                    placeholder="Наприклад: 350"
                    />
                </div>
              </div>

              {/* ISBN */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">ISBN</label>
                <input
                    type="text"
                    value={formData.ISBN || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, ISBN: e.target.value }))}
                    className="w-full px-4 py-3 bg-white rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-400 font-medium font-mono"
                    placeholder="978-3-16-148410-0"
                />
              </div>
            </div>
            
            {/* Buttons */}
            <div className="flex gap-4 pt-4 border-t border-slate-100">
              <button 
                type="button" 
                onClick={() => navigate({ to: '/editions' })} 
                className="flex-1 px-6 py-3.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 hover:text-slate-800 transition-all"
              >
                Скасувати
              </button>
              <button 
                type="submit" 
                disabled={createEdition.isPending}
                className="flex-1 px-6 py-3.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 active:scale-95 shadow-lg shadow-blue-200 transition-all disabled:opacity-70 disabled:pointer-events-none"
              >
                {createEdition.isPending ? 'Збереження...' : 'Створити видання'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};