import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Створити видання</h1>
          
          {formErrors && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {formErrors}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Книга *</label>
              <select
                value={formData.book?.id || ''}
                onChange={(e) => {
                  const book = books?.find(b => b.id === Number(e.target.value));
                  setFormData(prev => ({ ...prev, book: book || null }));
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none transition"
                required
              >
                <option value="">Виберіть книгу</option>
                {books?.map((book) => (
                  <option key={book.id} value={book.id}>
                    {book.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Видавець *</label>
              <select
                value={formData.publisher?.id || ''}
                onChange={(e) => {
                  const publisher = publishers?.find(p => p.id === Number(e.target.value));
                  setFormData(prev => ({ ...prev, publisher: publisher || null }));
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none transition"
                required
              >
                <option value="">Виберіть видавця</option>
                {publishers?.map((publisher) => (
                  <option key={publisher.id} value={publisher.id}>
                    {publisher.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Рік видання</label>
                <input
                  type="date"
                  required
                  value={getDateString(formData.yearPublication)}
                  onChange={(e) => setFormData(prev => ({ ...prev, yearPublication: new Date(e.target.value) }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Сторінок</label>
                <input
                  type="number"
                  min="1"
                  value={formData.pages || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, pages: e.target.value ? Number(e.target.value) : null }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none transition"
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">ISBN</label>
              <input
                type="text"
                value={formData.ISBN || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, ISBN: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none transition"
                placeholder="978-3-16-148410-0"
              />
            </div>
            
            <div className="flex gap-3 pt-4">
              <button 
                type="submit" 
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-70"
                disabled={createEdition.isPending}
              >
                {createEdition.isPending ? 'Збереження...' : 'Зберегти'}
              </button>
              <button 
                type="button" 
                onClick={() => navigate({ to: '/editions' })} 
                className="flex-1 bg-gray-300 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-400 transition-colors font-medium"
              >
                Скасувати
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};