import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useCreateCopybook } from '../api';
import { useEditions } from '../../editions/api';
import { useShelves } from '../../shelves/api';
import { useLocations } from '../../locations/api';

export const CreateCopybookPage = () => {
  const navigate = useNavigate();
  const createCopybookMutation = useCreateCopybook();
  
  const { data: editions } = useEditions();
  const { data: shelves } = useShelves();
  const { data: locations } = useLocations();

  // Фільтруємо ТІЛЬКИ вільні локації (де copybook === null)
  const freeLocations = locations?.filter(loc => !loc.copybook) || [];

  const [formData, setFormData] = useState({
    id_edition: '',
    id_shelves: [] as string[], // Масив вибраних полиць
    quantity: 1, // Загальна кількість копій для розподілу
    status: 'доступний',
  });

  const [formErrors, setFormErrors] = useState<string | null>(null);
  const [shelfSearch, setShelfSearch] = useState('');

  const handleShelfToggle = (shelfId: string) => {
    setFormData(prev => {
      const isSelected = prev.id_shelves.includes(shelfId);
      if (isSelected) {
        return { ...prev, id_shelves: prev.id_shelves.filter(id => id !== shelfId) };
      } else {
        return { ...prev, id_shelves: [...prev.id_shelves, shelfId] };
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors(null);

    if (!formData.id_edition) {
      setFormErrors('Будь ласка, оберіть видання');
      return;
    }

    if (formData.quantity < 1) {
      setFormErrors('Кількість копій має бути більше 0');
      return;
    }

    // Логіка розподілу копій по полицях
    const selectedShelves = formData.id_shelves.map(Number);
    let copiesToCreate: Array<{ shelfId: number | null; locationId: number | null }> = [];
    let copyIndex = 0;

    // Розподіляємо копії по вибраних полицях, беручи вільні місця на кожній
    for (let i = 0; i < formData.quantity; i++) {
      const shelfIndex = copyIndex % selectedShelves.length;
      const shelfId = selectedShelves[shelfIndex];

      // Знаходимо доступні локації для цієї полиці
      const locationsForShelf = freeLocations.filter(loc => loc.shelf?.id === shelfId);

      // Визначаємо кількість місць вже використаних для цього shelf в цьому цикле
      const usedLocationsForShelf = copiesToCreate.filter(c => c.shelfId === shelfId).length;

      // Беремо наступне вільне місце на полиці (якщо є)
      const locationForThisCopy = locationsForShelf[usedLocationsForShelf] || null;

      copiesToCreate.push({
        shelfId,
        locationId: locationForThisCopy?.id || null
      });

      copyIndex++;
    }

    // Створюємо копії послідовно
    let createdCount = 0;
    let failedCount = 0;

    copiesToCreate.forEach((copyData) => {
      createCopybookMutation.mutate({
        id_edition: Number(formData.id_edition),
        id_location: copyData.locationId,
        status: formData.status
      }, {
        onSuccess: () => {
          createdCount++;
          if (createdCount + failedCount === formData.quantity) {
            navigate({ to: '/copybooks' });
          }
        },
        onError: () => {
          failedCount++;
          if (createdCount + failedCount === formData.quantity) {
            if (failedCount > 0) {
              setFormErrors(`Помилка! ${failedCount} копія(и) не створена(и)`);
            } else {
              navigate({ to: '/copybooks' });
            }
          }
        }
      });
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Створити нові примірники</h1>
          <p className="text-gray-500 text-sm mb-6">Оберіть полиці та загальну кількість копій. Система розподілить їх по вибраних полицях</p>
          
          {formErrors && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {formErrors}
            </div>
          )}

          {createCopybookMutation.isError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              Помилка: {(createCopybookMutation.error as any)?.response?.data?.message || 'Невідома помилка'}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Видання */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Видання *</label>
              <select
                value={formData.id_edition}
                onChange={(e) => setFormData({ ...formData, id_edition: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none transition bg-white"
                required
              >
                <option value="">Оберіть видання...</option>
                {editions?.map((edition) => (
                  <option key={edition.id} value={edition.id}>
                    {edition.book?.title} ({edition.yearPublication})
                  </option>
                ))}
              </select>
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

            {/* Кількість копій */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Загальна кількість копій *</label>
              <input
                type="number"
                min="1"
                max="50"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none transition bg-white"
              />
              <p className="text-xs text-gray-500 mt-1">Копії будуть розподілені по вибраних полицях</p>
            </div>

            {/* Вибір полиць */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Полиці для розташування <span className="text-gray-400 font-normal text-xs">(Оберіть одну або декілька)</span>
              </label>

              <input
                type="text"
                placeholder="Пошук полиці..."
                className="w-full border border-gray-300 p-2 rounded mb-3 text-sm focus:outline-none focus:border-blue-500"
                value={shelfSearch}
                onChange={(e) => setShelfSearch(e.target.value)}
              />

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {shelves
                  ?.filter(shelf => {
                    const freeLocationsForShelf = freeLocations.filter(
                      loc => loc.shelf?.id === shelf.id
                    ).length;
                    // Не показуємо полиці без вільних місць
                    if (freeLocationsForShelf === 0) return false;
                    // Фільтруємо за пошуком
                    const searchText = `${shelf.cabinet?.name || '?'} ${shelf.shelfcode}`.toLowerCase();
                    return searchText.includes(shelfSearch.toLowerCase());
                  })
                  .map((shelf) => {
                    // Рахуємо кількість вільних місць на цій полиці
                    const freeLocationsForShelf = freeLocations.filter(
                      loc => loc.shelf?.id === shelf.id
                    ).length;

                    const isSelected = formData.id_shelves.includes(String(shelf.id));
                    
                    return (
                      <label 
                        key={shelf.id} 
                        className={`flex items-center p-3 rounded cursor-pointer transition border ${
                          isSelected 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-transparent hover:bg-white'
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                          checked={isSelected}
                          onChange={() => handleShelfToggle(String(shelf.id))}
                        />
                        <span className="ml-3 flex-1">
                          <span className="text-gray-700 font-medium">
                            {shelf.cabinet?.name || '?'} (полиця {shelf.shelfcode})
                          </span>
                          <span className={`ml-2 text-xs ${freeLocationsForShelf > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {freeLocationsForShelf} вільних місць
                          </span>
                        </span>
                      </label>
                    );
                  })}
                {shelves?.filter(shelf => {
                  const freeLocationsForShelf = freeLocations.filter(
                    loc => loc.shelf?.id === shelf.id
                  ).length;
                  return freeLocationsForShelf > 0;
                }).length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">Немає полиць з вільними місцями</p>
                ) : shelves?.filter(shelf => {
                  const freeLocationsForShelf = freeLocations.filter(
                    loc => loc.shelf?.id === shelf.id
                  ).length;
                  if (freeLocationsForShelf === 0) return false;
                  const searchText = `${shelf.cabinet?.name || '?'} ${shelf.shelfcode}`.toLowerCase();
                  return searchText.includes(shelfSearch.toLowerCase());
                }).length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">Полиці не знайдені</p>
                ) : null}
              </div>
              <p className="text-right text-xs text-gray-500 mt-3">
                Обрано: {formData.id_shelves.length} полиць
              </p>
            </div>

            {/* Показуємо план розподілу */}
            {formData.id_shelves.length > 0 && formData.quantity > 0 && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800 mb-2">
                  <strong>План розподілу:</strong> {formData.quantity} копія(и) по {formData.id_shelves.length} полиці(ях)
                </p>
                <ul className="text-xs text-blue-700 space-y-1">
                  {formData.id_shelves.map((shelfId) => {
                    const shelf = shelves?.find(s => String(s.id) === shelfId);
                    const freeLocationsForShelf = freeLocations.filter(loc => loc.shelf?.id === Number(shelfId)).length;
                    return (
                      <li key={shelfId}>
                        • Шафа {shelf?.cabinet?.number_cabinet} (полиця {shelf?.shelfcode}): макс {freeLocationsForShelf} копій
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button 
                type="submit" 
                disabled={createCopybookMutation.isPending}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
              >
                {createCopybookMutation.isPending ? 'Створення...' : 'Створити копії'}
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
