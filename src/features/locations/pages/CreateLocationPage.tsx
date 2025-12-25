import { useState, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useCreateLocation, useLocations } from '../api';
import { useShelves } from '../../shelves/api'; 
import { IShelf } from '../../shelves/types';
import type { ICreateLocationPayload } from '../types';

export const CreateLocationPage = () => {
  const navigate = useNavigate();
  const createLocation = useCreateLocation();
  const { data: shelves, isLoading: isShelvesLoading } = useShelves();
  const { data: allLocations } = useLocations();

  const [idShelf, setIdShelf] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [shelfFilter, setShelfFilter] = useState(''); // Стан для пошуку полиці

  // Підрахунок місць на обраній полиці
  const shelfStats = useMemo(() => {
    if (!idShelf || !allLocations) return null;
    
    const selectedShelfId = Number(idShelf);
    const locationsOnShelf = allLocations.filter(loc => loc.shelf?.id === selectedShelfId);
    const freeLocations = locationsOnShelf.filter(loc => loc.copybook === null).length;
    
    return {
      total: locationsOnShelf.length,
      free: freeLocations,
      occupied: locationsOnShelf.length - freeLocations
    };
  }, [idShelf, allLocations]);

  // Фільтрація та сортування полиць для випадаючого списку
  const filteredShelves = useMemo(() => {
      if (!shelves) return [];
      
      let result = [...shelves];
      
      // Фільтр
      if (shelfFilter) {
          const lowerFilter = shelfFilter.toLowerCase();
          result = result.filter(s => 
              (s.cabinet?.name?.toLowerCase().includes(lowerFilter) || '') || 
              (s.code || s.shelfcode || '').toLowerCase().includes(lowerFilter)
          );
      }
      
      // Сортування: Шафа -> Код полиці
      result.sort((a, b) => {
          const cabA = a.cabinet?.name || '';
          const cabB = b.cabinet?.name || '';
          if (cabA !== cabB) return cabA.localeCompare(cabB);
          
          const codeA = a.code || a.shelfcode || '';
          const codeB = b.code || b.shelfcode || '';
          return codeA.localeCompare(codeB);
      });
      
      return result;
  }, [shelves, shelfFilter]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (idShelf && quantity > 0) {
      
      const payload: ICreateLocationPayload = {
        id_shelf: Number(idShelf),
        quantity: Number(quantity)
      };

      createLocation.mutate(payload);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-xl mt-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-4">Додати місця на полицю</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Вибір полиці */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Оберіть полицю</label>
          
          {/* Поле пошуку полиці */}
          <div className="mb-2">
            <input
                type="text"
                placeholder="Фільтрувати список полиць (назва шафи або код)..."
                value={shelfFilter}
                onChange={(e) => setShelfFilter(e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="relative">
            <select
              value={idShelf}
              onChange={(e) => setIdShelf(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-lg bg-white appearance-none focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
              required
              disabled={isShelvesLoading}
              size={filteredShelves.length > 10 ? 5 : 1} // Якщо полиць багато і є фільтр, можна показати список (опціонально)
            >
              <option value="" disabled hidden>Оберіть полицю зі списку...</option>
              {filteredShelves.map((shelf: IShelf) => (
                <option key={shelf.id} value={shelf.id}>
                   Шафа: {shelf.cabinet?.name || '?'}, Код: {shelf.code || shelf.shelfcode}
                </option>
              ))}
            </select>
          </div>
          {filteredShelves.length === 0 && shelfFilter && (
              <p className="text-xs text-red-500 mt-1">Полиць не знайдено за вашим запитом.</p>
          )}

          {/* Статистика обраної полиці */}
          {shelfStats && (
            <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center justify-between text-sm">
                <div>
                  <span className="text-blue-700 font-medium">Поточна статистика полиці:</span>
                </div>
                <div className="flex gap-6 text-xs">
                  <div className="text-right">
                    <div className="text-blue-900 font-bold">{shelfStats.total}</div>
                    <div className="text-blue-600">місць всього</div>
                  </div>
                  <div className="text-right">
                    <div className="text-green-700 font-semibold">{shelfStats.free}</div>
                    <div className="text-green-600">вільно</div>
                  </div>
                  <div className="text-right">
                    <div className="text-red-700 font-semibold">{shelfStats.occupied}</div>
                    <div className="text-red-600">зайнято</div>
                  </div>
                </div>
              </div>
              
              {/* Прогноз після додавання */}
              {quantity > 0 && (
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <div className="text-xs text-blue-600">
                    <span className="font-medium">Після додавання {quantity} {quantity === 1 ? 'місця' : 'місць'}:</span>
                  </div>
                  <div className="mt-2 flex gap-6">
                    <div className="text-right text-xs">
                      <div className="text-blue-900 font-bold">{shelfStats.total + quantity}</div>
                      <div className="text-blue-600">місць всього</div>
                    </div>
                    <div className="text-right text-xs">
                      <div className="text-green-700 font-semibold">{shelfStats.free + quantity}</div>
                      <div className="text-green-600">вільно</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Вибір кількості місць */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Кількість місць для додавання</label>
          <input
            type="number"
            min="1"
            max="100"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-full border border-gray-300 p-3 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
            required
          />
          <p className="text-xs text-gray-500 mt-2">
            Буде створено {quantity} {quantity === 1 ? 'нове місце' : 'нових місць'} для обраної полиці.
          </p>
        </div>

        {/* Кнопки */}
        <div className="flex justify-end gap-3 pt-4 border-t">
            <button
                type="button"
                onClick={() => navigate({ to: '/locations' })}
                className="px-6 py-2 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 transition font-medium"
            >
                Скасувати
            </button>
            <button
                type="submit"
                disabled={createLocation.isPending || !idShelf}
                className={`px-6 py-2 rounded-lg text-white shadow-md transition font-medium ${
                    createLocation.isPending || !idShelf ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'
                }`}
            >
                {createLocation.isPending ? 'Збереження...' : `Створити ${quantity > 1 ? quantity + ' місць' : 'місце'}`}
            </button>
        </div>
      </form>
    </div>
  );
};