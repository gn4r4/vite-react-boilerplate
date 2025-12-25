import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useLocation, useUpdateLocation, useLocations } from '../api';
import { useShelves } from '../../shelves/api';
import { IShelf } from '../../shelves/types';
import type { IUpdateLocationPayload } from '../types';

export const EditLocationPage = () => {
  const { locationId } = useParams({ strict: false });
  const navigate = useNavigate();
  const id = Number(locationId);

  const { data: location, isLoading: isLocationLoading } = useLocation(id);
  const { data: shelves, isLoading: isShelvesLoading } = useShelves();
  const { data: allLocations } = useLocations();
  
  const updateLocation = useUpdateLocation();

  const [idShelf, setIdShelf] = useState('');

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

  // Заповнення форми даними
  useEffect(() => {
    if (location && location.shelf) {
      setIdShelf(String(location.shelf.id));
    }
  }, [location]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Явне використання Payload
    const payload: IUpdateLocationPayload = {
      id_shelf: Number(idShelf)
    };

    updateLocation.mutate({
      id,
      data: payload
    });
  };

  if (isLocationLoading || isShelvesLoading) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        <span className="text-xl animate-pulse">Завантаження даних...</span>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-xl mt-6">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-800">Редагувати місце</h1>
        <span className="text-sm text-gray-400 bg-gray-100 px-2 py-1 rounded">ID: {id}</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Інформація про поточну книгу (тільки для читання) */}
        {location?.copybook && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Це місце зайняте книгою: <span className="font-bold">{location.copybook.edition?.book?.title}</span>.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Вибір нової полиці */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Полиця</label>
          <div className="relative">
            <select
              value={idShelf}
              onChange={(e) => setIdShelf(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-lg bg-white appearance-none focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
              required
            >
               {shelves?.map((shelf: IShelf) => (
                <option key={shelf.id} value={shelf.id}>
                   Шафа: {shelf.cabinet?.name || '?'}, Полиця: {shelf.shelfcode}
                </option>
              ))}
            </select>
          </div>

          {/* Статистика обраної полиці */}
          {shelfStats && (
            <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center justify-between text-sm">
                <div>
                  <span className="text-blue-700 font-medium">Всього місць на полиці:</span>
                  <span className="text-blue-900 font-bold ml-2">{shelfStats.total}</span>
                </div>
                <div className="flex gap-4 text-xs">
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
            </div>
          )}
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
                disabled={updateLocation.isPending}
                className="px-6 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition font-medium"
            >
                {updateLocation.isPending ? 'Збереження...' : 'Зберегти зміни'}
            </button>
        </div>
      </form>
    </div>
  );
};