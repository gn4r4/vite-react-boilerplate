import { useState, useMemo } from 'react';
import { useNavigate, Link } from '@tanstack/react-router';
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
  const [shelfFilter, setShelfFilter] = useState('');

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

  // Фільтрація та сортування полиць
  const filteredShelves = useMemo(() => {
      if (!shelves) return [];
      
      let result = [...shelves];
      
      if (shelfFilter) {
          const lowerFilter = shelfFilter.toLowerCase();
          result = result.filter(s => 
              (s.cabinet?.name?.toLowerCase().includes(lowerFilter) || '') || 
              (s.code || s.shelfcode || '').toLowerCase().includes(lowerFilter)
          );
      }
      
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

      createLocation.mutate(payload, {
          onSuccess: () => navigate({ to: '/locations' })
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-10 flex justify-center">
      <div className="w-full max-w-3xl">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
           <Link to="/locations" className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 transition-all">
             ←
           </Link>
           <div>
             <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Нові місця</h1>
             <p className="text-slate-500">Генерація нових місць для зберігання книг на полицях</p>
           </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden p-6 md:p-8">
          
          <form onSubmit={handleSubmit} className="space-y-8">
            
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
                <span>📍</span> Налаштування локації
              </h2>

              {/* Вибір полиці */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Оберіть полицю <span className="text-red-500">*</span></label>
                
                <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200 space-y-3">
                    {/* Пошук */}
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                        <input
                            type="text"
                            placeholder="Пошук (назва шафи або код)..."
                            value={shelfFilter}
                            onChange={(e) => setShelfFilter(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 text-sm"
                        />
                    </div>

                    <div className="relative">
                        <select
                        value={idShelf}
                        onChange={(e) => setIdShelf(e.target.value)}
                        className="w-full px-4 py-3 bg-white rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all appearance-none cursor-pointer"
                        required
                        disabled={isShelvesLoading}
                        size={filteredShelves.length > 8 ? 5 : 1} 
                        >
                        <option value="" disabled hidden>Оберіть полицю зі списку...</option>
                        {filteredShelves.map((shelf: IShelf) => (
                            <option key={shelf.id} value={shelf.id}>
                            🗄️ {shelf.cabinet?.name || '?'} — Полиця {shelf.code || shelf.shelfcode}
                            </option>
                        ))}
                        </select>
                        {filteredShelves.length <= 8 && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                        )}
                    </div>
                    
                    {filteredShelves.length === 0 && shelfFilter && (
                        <p className="text-xs text-red-500 pl-1">Нічого не знайдено.</p>
                    )}
                </div>

                {/* Статистика */}
                {shelfStats && (
                    <div className="mt-4 grid grid-cols-3 gap-3">
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-center">
                            <div className="text-2xl font-bold text-blue-700">{shelfStats.total}</div>
                            <div className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">Всього</div>
                        </div>
                        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-center">
                            <div className="text-2xl font-bold text-emerald-700">{shelfStats.free}</div>
                            <div className="text-[10px] uppercase font-bold text-emerald-500 tracking-wider">Вільних</div>
                        </div>
                        <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-center">
                            <div className="text-2xl font-bold text-amber-700">{shelfStats.occupied}</div>
                            <div className="text-[10px] uppercase font-bold text-amber-500 tracking-wider">Зайнятих</div>
                        </div>
                    </div>
                )}
              </div>

              {/* Кількість */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Кількість нових місць</label>
                <div className="flex items-center gap-4">
                    <input
                        type="number"
                        min="1"
                        max="100"
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        className="w-full px-4 py-3 bg-white rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium text-lg"
                        required
                    />
                    {shelfStats && quantity > 0 && (
                        <div className="shrink-0 text-sm text-slate-500 bg-slate-50 px-4 py-3 rounded-xl border border-slate-200">
                            Буде всього: <span className="font-bold text-slate-800">{shelfStats.total + quantity}</span>
                        </div>
                    )}
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4 border-t border-slate-100">
                <button
                    type="button"
                    onClick={() => navigate({ to: '/locations' })}
                    className="flex-1 px-6 py-3.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 hover:text-slate-800 transition-all"
                >
                    Скасувати
                </button>
                <button
                    type="submit"
                    disabled={createLocation.isPending || !idShelf}
                    className="flex-1 px-6 py-3.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 active:scale-95 shadow-lg shadow-blue-200 transition-all disabled:opacity-70 disabled:pointer-events-none"
                >
                    {createLocation.isPending ? 'Збереження...' : `Створити ${quantity} ${quantity === 1 ? 'місце' : 'місця'}`}
                </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};