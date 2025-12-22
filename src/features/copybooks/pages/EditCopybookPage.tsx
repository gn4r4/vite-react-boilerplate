import { useEffect, useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useCopybook, useUpdateCopybook } from '../api';
import { useShelves } from '../../shelves/api';
import { useLocations } from '../../locations/api';

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
        // Якщо у книги є location з shelf, беремо shelf ID. Інакше - порожній рядок.
        id_shelf: copybook.location?.shelf?.id ? String(copybook.location.shelf.id) : '',
      });
    }
  }, [copybook]);

  // Фільтр: вільні локації АБО поточна локація цієї книги
  // (Потрібно для коректної роботи логіки "locationsForShelf" нижче)
  const freeLocations = locations?.filter(
    loc => !loc.copybook || (copybook?.location && loc.id === copybook.location.id)
  ) || [];

  // Доступні локації для ВИБРАНОЇ полиці (використовується при submit)
  const locationsForShelf = formData.id_shelf
    ? freeLocations.filter(loc => String(loc.shelf?.id) === String(formData.id_shelf))
    : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors(null);

    // Якщо обрана полиця, беремо першу доступну локацію, інакше - null (прибрати з полиці)
    let selectedLocationId: number | null = null;
    if (formData.id_shelf && locationsForShelf.length > 0) {
      selectedLocationId = locationsForShelf[0].id;
    }
    
    // Якщо користувач вибрав полицю, але там немає місць (теоретично неможливо через фільтр, але про всяк випадок)
    if (formData.id_shelf && !selectedLocationId) {
       setFormErrors('На обраній полиці немає вільних місць!');
       return;
    }

    updateCopybookMutation.mutate({
      id,
      data: {
        status: formData.status,
        id_location: selectedLocationId // Буде null, якщо полиця не вибрана, або число ID
      }
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
              <div className="p-3 bg-gray-100 rounded-lg text-gray-600">
                {copybook?.edition?.book?.title} ({copybook?.edition?.yearPublication})
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
              </select>
            </div>

            {/* Полиця */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Полиця <span className="text-gray-400 font-normal">(необов'язково)</span>
              </label>
              <select
                value={formData.id_shelf}
                onChange={(e) => setFormData({ ...formData, id_shelf: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none transition bg-white"
              >
                <option value="">-- Без місця (Прибрати з полиці) --</option>
                
                {/* ФІЛЬТРАЦІЯ: показуємо тільки полиці з вільними місцями АБО поточну полицю */}
                {shelves
                  ?.filter((shelf) => {
                    const hasFreeSpace = freeLocations.some(loc => loc.shelf?.id === shelf.id);
                    const isCurrentShelf = copybook?.location?.shelf?.id === shelf.id;
                    return hasFreeSpace || isCurrentShelf;
                  })
                  .map((shelf) => (
                    <option key={shelf.id} value={shelf.id}>
                      {shelf.cabinet?.name || '?'}, Полиця: {shelf.shelfcode}
                      {copybook?.location?.shelf?.id === shelf.id ? ' (Поточна)' : ''}
                    </option>
                  ))}
              </select>
            </div>

            {/* Показуємо інформацію про вибір локації */}
            {formData.id_shelf && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Автоматичний вибір:</strong> Книга буде розміщена на{' '}
                  {locationsForShelf.length > 0
                    ? `позиції ${locationsForShelf[0].id} на обраній полиці`
                    : 'цій полиці (немає вільних місць)'}
                </p>
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