import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useCreateCopybook } from '../api';
import { useEditions } from '../../editions/api';
import { useShelves } from '../../shelves/api';
import { useLocations } from '../../locations/api';
import type { CopybookPayload } from '../types';

export const CreateCopybookPage = () => {
  const navigate = useNavigate();
  const createCopybookMutation = useCreateCopybook();
  
  const { data: editions } = useEditions();
  const { data: shelves } = useShelves();
  const { data: locations } = useLocations();

  // Знаходимо всі вільні локації
  const freeLocations = locations?.filter(loc => !loc.copybook) || [];

  const [formData, setFormData] = useState({
    id_edition: '',
    id_shelves: [] as string[],
    quantity: 1,
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

    // Валідація
    if (!formData.id_edition) {
      setFormErrors('Будь ласка, оберіть видання');
      return;
    }

    if (formData.quantity < 1) {
      setFormErrors('Кількість копій має бути більше 0');
      return;
    }

    const selectedShelves = formData.id_shelves.map(Number);
    let copiesToCreate: Array<{ shelfId: number | null; locationId: number | null }> = [];
    let copyIndex = 0;

    // Логіка розподілу копій по полицях
    for (let i = 0; i < formData.quantity; i++) {
      // Якщо полиці обрані, розподіляємо циклічно. Якщо ні - створюємо без прив'язки до полиці.
      const shelfIndex = selectedShelves.length > 0 ? copyIndex % selectedShelves.length : -1;
      const shelfId = shelfIndex !== -1 ? selectedShelves[shelfIndex] : null;

      let locationForThisCopy: typeof freeLocations[0] | null = null;

      if (shelfId) {
        // Знаходимо вільні місця на конкретній полиці
        const locationsForShelf = freeLocations.filter(loc => loc.shelf?.id === shelfId);
        // Враховуємо, що ми могли вже "зайняти" місце в цьому циклі для попередньої копії
        const usedLocationsForShelf = copiesToCreate.filter(c => c.shelfId === shelfId).length;
        
        locationForThisCopy = locationsForShelf[usedLocationsForShelf] || null;
      }

      copiesToCreate.push({
        shelfId,
        locationId: locationForThisCopy?.id || null
      });

      copyIndex++;
    }

    let createdCount = 0;
    let failedCount = 0;

    // Відправляємо запити на створення
    copiesToCreate.forEach((copyData) => {
      const payload: CopybookPayload = {
        id_edition: Number(formData.id_edition),
        id_location: copyData.locationId, // може бути null, якщо місця немає або полиця не обрана
        status: formData.status
      };

      createCopybookMutation.mutate(payload, {
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
              setFormErrors(`Увага! ${failedCount} копія(и) не створена(и) через помилку.`);
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
          <p className="text-gray-500 text-sm mb-6">Оберіть видання, кількість та (опціонально) полиці для розміщення.</p>
          
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
                    {edition.book?.title} ({edition.yearPublication ? new Date(edition.yearPublication).getFullYear() : '-'})
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
              <p className="text-xs text-gray-500 mt-1">
                {formData.id_shelves.length > 0 
                  ? "Копії будуть автоматично розподілені по вільних місцях на обраних полицях." 
                  : "Копії будуть створені без прив'язки до полиці (ви зможете вказати це пізніше)."}
              </p>
            </div>

            {/* Вибір полиць */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Полиці для розташування <span className="text-gray-400 font-normal text-xs">(Опціонально)</span>
              </label>

              <input
                type="text"
                placeholder="Пошук полиці (назва шафи або код)..."
                className="w-full border border-gray-300 p-2 rounded mb-3 text-sm focus:outline-none focus:border-blue-500"
                value={shelfSearch}
                onChange={(e) => setShelfSearch(e.target.value)}
              />

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {shelves
                  ?.filter(shelf => {
                    // Фільтр: показуємо тільки полиці з вільними місцями, якщо ми хочемо їх призначити
                    const freeLocationsForShelf = freeLocations.filter(
                      loc => loc.shelf?.id === shelf.id
                    ).length;
                    
                    // Пошук
                    const searchText = `${(shelf.cabinet as any)?.name || '?'} ${shelf.shelfcode}`.toLowerCase();
                    return searchText.includes(shelfSearch.toLowerCase());
                  })
                  .map((shelf) => {
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
                          // Блокуємо вибір, якщо немає вільних місць
                          disabled={freeLocationsForShelf === 0}
                        />
                        <span className={`ml-3 flex-1 ${freeLocationsForShelf === 0 ? 'opacity-50' : ''}`}>
                          <span className="text-gray-700 font-medium">
                            {(shelf.cabinet as any)?.name || '?'} (полиця {shelf.shelfcode})
                          </span>
                          <span className={`ml-2 text-xs ${freeLocationsForShelf > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {freeLocationsForShelf > 0 ? `${freeLocationsForShelf} вільних місць` : 'Немає місць'}
                          </span>
                        </span>
                      </label>
                    );
                  })}
              </div>
              <p className="text-right text-xs text-gray-500 mt-3">
                Обрано: {formData.id_shelves.length} полиць
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <button 
                type="submit" 
                disabled={createCopybookMutation.isPending}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
              >
                {createCopybookMutation.isPending ? 'Створення...' : `Створити ${formData.quantity} копій`}
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