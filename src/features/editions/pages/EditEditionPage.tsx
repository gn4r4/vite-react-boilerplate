import { useEffect, useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useEdition, useUpdateEdition } from '../api';
import { usePublishers } from '../../publishers/api';
import { useBooks } from '../../books/api';
import { IEdition, IEditionPayload } from '../types';

export const EditEditionPage = () => {
  const { editionId } = useParams({ from: '/editions/$editionId' });
  const navigate = useNavigate();
  const id = Number(editionId);

  const { data: edition, isLoading } = useEdition(id);
  const updateEdition = useUpdateEdition();
  const { data: publishers } = usePublishers();
  const { data: books } = useBooks();

  const [formData, setFormData] = useState<Partial<IEdition>>({
    book: null,
    publisher: null,
    yearPublication: new Date(),
  });

  useEffect(() => {
    if (edition) {
      setFormData({
        ...edition,
        yearPublication: new Date(edition.yearPublication)
      });
    }
  }, [edition]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.book?.id && formData.publisher?.id) {
      const payload: IEditionPayload = {
        id_book: Number(formData.book.id),
        id_publisher: Number(formData.publisher.id),
        yearpublication: formData.yearPublication 
            ? new Date(formData.yearPublication).toISOString().split('T')[0] 
            : new Date().toISOString().split('T')[0]
      };

      // Типи тепер збігаються
      updateEdition.mutate({ id, data: payload });
    }
  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-gray-600">Завантаження...</div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Редагувати видання</h1>
          <p className="text-gray-600 mb-6">Оновіть інформацію про видання</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ... Поля форми ідентичні CreateEditionPage (Книга, Видавець, Рік) ... */}
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

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Рік видання</label>
              <input
                type="date"
                value={formData.yearPublication instanceof Date && !isNaN(formData.yearPublication.getTime()) 
                    ? formData.yearPublication.toISOString().split('T')[0] 
                    : ''}
                onChange={(e) => setFormData(prev => ({ ...prev, yearPublication: new Date(e.target.value) }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none transition"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                disabled={updateEdition.isPending}
              >
                {updateEdition.isPending ? 'Збереження...' : 'Оновити'}
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