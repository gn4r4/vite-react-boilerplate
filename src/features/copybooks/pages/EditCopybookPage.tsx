import { useEffect, useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useCopybook, useUpdateCopybook } from '../api';
import { useShelves } from '../../shelves/api';
import { useLocations } from '../../locations/api';
import type { CopybookPayload } from '../types';

export const EditCopybookPage = () => {
  const { copybookId } = useParams({ from: '/copybooks/$copybookId' });
  const navigate = useNavigate();
  const id = Number(copybookId);

  const { data: copybook, isLoading: isBookLoading } = useCopybook(id);
  const { data: shelves } = useShelves();
  const { data: locations, isLoading: isLocLoading } = useLocations();
  const updateCopybookMutation = useUpdateCopybook();

  const [formData, setFormData] = useState({
    status: '',
    id_shelf: '',
  });

  const [formErrors, setFormErrors] = useState<string | null>(null);

  useEffect(() => {
    if (copybook) {
      setFormData({
        status: copybook.status,
        id_shelf: copybook.location?.shelf?.id ? String(copybook.location.shelf.id) : '',
      });
    }
  }, [copybook]);

  // Список всіх локацій, які або вільні, або зайняті САМЕ ЦІЄЮ книгою
  const availableLocations = locations?.filter(
    loc => !loc.copybook || (copybook?.location && loc.id === copybook.location.id)
  ) || [];

  // Локації на конкретній обраній полиці
  const locationsForShelf = formData.id_shelf
    ? availableLocations.filter(loc => String(loc.shelf?.id) === String(formData.id_shelf))
    : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors(null);

    let selectedLocationId: number | null = null;

    if (formData.id_shelf) {
      // Якщо обрана полиця, беремо перше доступне місце (або поточне, якщо воно там)
      if (locationsForShelf.length > 0) {
        selectedLocationId = locationsForShelf[0].id;
      } else {
        setFormErrors('На обраній полиці немає вільних місць!');
        return;
      }
    } else {
      // Якщо полиця не обрана, значить прибираємо з місця
      selectedLocationId = null;
    }

    // Формування payload
    const payload: CopybookPayload = {
        status: formData.status,
        id_location: selectedLocationId // number | null
    };

    updateCopybookMutation.mutate({
      id,
      data: payload
    });
  };

  if (isBookLoading || isLocLoading) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        <span className="text-xl animate-pulse">Завантаження даних примірника...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex justify-between items-center mb-6 border-b pb-4">
            <h1 className="text-3xl font-bold text-gray-900">Редагувати примірник</h1>
            <span className="text-sm text-gray-400 bg-gray-100 px-2 py-1 rounded">ID: {id}</span>
          </div>
          
          {formErrors && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {formErrors}
            </div>
          )}

          {updateCopybookMutation.isError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              Помилка: {(updateCopybookMutation.error as any)?.response?.data?.message || 'Невідома помилка'}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Назва книги */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Назва книги</label>
              <div className="p-3 bg-gray-100 rounded-lg text-gray-600 font-medium">
                {copybook?.edition?.book?.title || 'Назва невідома'} 
                <span className="text-gray-400 font-normal ml-2">
                    ({copybook?.edition?.yearPublication ? new Date(copybook.edition.yearPublication).getFullYear() : 'рік не вказано'})
                </span>
              </div>
            </div>

            {/* Статус */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Статус</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none transition bg-white"
              >
                <option value="доступний">Доступний</option>
                <option value="виданий">Виданий</option>
                <option value="реставрується">Реставрація</option>
                <option value="списаний">Списаний</option>
              </select>
            </div>

            {/* Полиця */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Полиця <span className="text-gray-400 font-normal">(де зберігається книга)</span>
              </label>
              <select
                value={formData.id_shelf}
                onChange={(e) => setFormData({ ...formData, id_shelf: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none transition bg-white"
              >
                <option value="">-- Без місця (Зняти з полиці) --</option>
                
                {shelves
                  ?.filter((shelf) => {
                    // Показуємо тільки полиці, де є вільні місця АБО де ця книга вже лежить
                    const hasFreeSpace = availableLocations.some(loc => loc.shelf?.id === shelf.id);
                    return hasFreeSpace;
                  })
                  .map((shelf) => (
                    <option key={shelf.id} value={shelf.id}>
                      {(shelf.cabinet as any)?.name || '?'}, Полиця: {shelf.shelfcode}
                      {copybook?.location?.shelf?.id === shelf.id ? ' (Поточне місце)' : ''}
                    </option>
                  ))}
              </select>
            </div>

            {/* Інформаційний блок про місце */}
            {formData.id_shelf && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                  {locationsForShelf.length > 0 ? (
                      <>
                        <strong>Готово до переміщення:</strong> Книга буде автоматично закріплена за вільним місцем #{locationsForShelf[0].id} на цій полиці.
                      </>
                  ) : (
                      <span className="text-red-600 font-bold">Увага: На цій полиці немає вільних місць!</span>
                  )}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button 
                type="submit" 
                disabled={updateCopybookMutation.isPending}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
              >
                {updateCopybookMutation.isPending ? 'Збереження...' : 'Зберегти зміни'}
              </button>
              <button 
                type="button" 
                onClick={() => navigate({ to: '/copybooks' })} 
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