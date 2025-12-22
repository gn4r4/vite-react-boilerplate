import { useEffect, useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useLending, useUpdateLending } from '../api';
import { ILending } from '../types';

export const EditLendingPage = () => {
  const { lendingId } = useParams({ from: '/lendings/$lendingId' });
  const navigate = useNavigate();
  const id = Number(lendingId);

  const { data: lending, isLoading } = useLending(id);
  const updateLending = useUpdateLending();

  const [formErrors, setFormErrors] = useState<string | null>(null);
  const [dateReturn, setDateReturn] = useState<string>('');

  useEffect(() => {
    if (lending) {
      // Конвертуємо дату якщо вона є
      if (lending.dateReturn) {
        const date = new Date(lending.dateReturn);
        setDateReturn(date.toISOString().split('T')[0]);
      }
    }
  }, [lending]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors(null);

    // Перевіримо що дата повернення не раніше дати видачі
    if (dateReturn && lending?.dateLending) {
      const lendingDate = new Date(lending.dateLending);
      const returnDate = new Date(dateReturn);
      if (returnDate < lendingDate) {
        setFormErrors('Дата повернення не може бути раніше дати видачі');
        return;
      }
    }

    updateLending.mutate({
      id,
      data: {
        datereturn: dateReturn || null,
        copybookIds: lending?.items?.map(item => item.id) || []
      }
    });
  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-gray-600">Завантаження...</div>
      </div>
    );

  if (!lending)
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-gray-600">Видачу не знайдено</div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Редагувати видачу #{lending.id}</h1>
          </div>

          {formErrors && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {formErrors}
            </div>
          )}

          {updateLending.isError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              Помилка: {(updateLending.error as any)?.response?.data?.message || 'Невідома помилка'}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Читач - read-only */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Читач</label>
              <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed">
                {lending.reader?.fullName || 'Невідомий'}
              </div>
            </div>

            {/* Працівник - read-only */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Працівник</label>
              <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed">
                {lending.employee?.fullName || 'Невідомий'}
              </div>
            </div>

            {/* Дата видачі - read-only */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Дата видачі</label>
              <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed">
                {new Date(lending.dateLending).toLocaleDateString('uk-UA')}
              </div>
            </div>

            {/* Дата повернення - editable */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Дата повернення</label>
              <input
                type="date"
                value={dateReturn}
                onChange={(e) => setDateReturn(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
              />
              <p className="text-xs text-gray-500 mt-1">Заповніть, коли читач повернув книгу</p>
            </div>

            {/* Копії - read-only list */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Копії книг</label>
              <div className="space-y-2">
                {lending.items?.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">Копій не знайдено</p>
                )}
                {lending.items?.map((copybook) => (
                  <div 
                    key={copybook.id}
                    className="flex items-center p-3 rounded border border-gray-300 bg-white"
                  >
                    <span className="text-gray-700 font-medium">
                      #{copybook.id} - {copybook.edition?.book?.title || 'Невідомо'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={updateLending.isPending}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
              >
                {updateLending.isPending ? 'Збереження...' : 'Зберегти зміни'}
              </button>
              <button
                type="button"
                onClick={() => navigate({ to: '/lendings' })}
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
