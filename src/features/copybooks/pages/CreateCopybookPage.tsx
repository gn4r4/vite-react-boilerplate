import { useState } from 'react';
import { useNavigate, Link } from '@tanstack/react-router';
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
      const shelfIndex = selectedShelves.length > 0 ? copyIndex % selectedShelves.length : -1;
      const shelfId = shelfIndex !== -1 ? selectedShelves[shelfIndex] : null;

      let locationForThisCopy: typeof freeLocations[0] | null = null;

      if (shelfId) {
        const locationsForShelf = freeLocations.filter(loc => loc.shelf?.id === shelfId);
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

    copiesToCreate.forEach((copyData) => {
      const payload: CopybookPayload = {
        id_edition: Number(formData.id_edition),
        id_location: copyData.locationId,
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
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-10 flex justify-center">
      <div className="w-full max-w-3xl">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
           <Link to="/copybooks" className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 transition-all">
             ←
           </Link>
           <div>
             <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Нові примірники</h1>
             <p className="text-slate-500">Реєстрація фізичних копій книг та розміщення на полицях</p>
           </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden p-6 md:p-8">
          
          {formErrors && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-center gap-3">
              <span className="text-xl">⚠️</span>
              <p className="font-medium">{formErrors}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Основна інформація */}
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
                <span>📖</span> Основна інформація
              </h2>

              {/* Видання */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Видання <span className="text-red-500">*</span></label>
                <div className="relative">
                  <select
                    value={formData.id_edition}
                    onChange={(e) => setFormData({ ...formData, id_edition: e.target.value })}
                    className="w-full px-4 py-3 bg-white rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all appearance-none cursor-pointer"
                    required
                  >
                    <option value="" disabled hidden>Оберіть видання...</option>
                    {editions?.map((edition) => (
                      <option key={edition.id} value={edition.id}>
                        {edition.book?.title} ({edition.yearPublication ? new Date(edition.yearPublication).getFullYear() : '-'})
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Статус */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Статус</label>
                  <div className="relative">
                    <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full px-4 py-3 bg-white rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all appearance-none cursor-pointer"
                    >
                        <option value="доступний">Доступний</option>
                        <option value="виданий">Виданий</option>
                        <option value="реставрується">Реставрація</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                  </div>
                </div>

                {/* Кількість */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Кількість копій <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                    className="w-full px-4 py-3 bg-white rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Розміщення */}
            <div className="space-y-6">
              <div className="flex justify-between items-end pb-2 border-b border-slate-100">
                 <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <span>📍</span> Розміщення
                 </h2>
                 <span className="text-xs text-slate-400 font-medium">Опціонально</span>
              </div>

              <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-200">
                <div className="relative mb-4">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                  <input
                    type="text"
                    placeholder="Пошук полиці (назва шафи або код)..."
                    className="w-full pl-10 pr-4 py-2 bg-white rounded-lg border border-slate-200 focus:border-blue-500 focus:outline-none text-sm"
                    value={shelfSearch}
                    onChange={(e) => setShelfSearch(e.target.value)}
                  />
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {shelves
                    ?.filter(shelf => {
                      const searchText = `${(shelf.cabinet as any)?.name || '?'} ${shelf.shelfcode}`.toLowerCase();
                      return searchText.includes(shelfSearch.toLowerCase());
                    })
                    .map((shelf) => {
                      const freeLocationsForShelf = freeLocations.filter(
                        loc => loc.shelf?.id === shelf.id
                      ).length;

                      const isSelected = formData.id_shelves.includes(String(shelf.id));
                      const isDisabled = freeLocationsForShelf === 0;
                      
                      return (
                        <label 
                          key={shelf.id} 
                          className={`flex items-center p-3 rounded-xl cursor-pointer transition-all border ${
                            isSelected 
                              ? 'bg-blue-50 border-blue-500 shadow-sm' 
                              : isDisabled 
                                ? 'bg-slate-100 border-transparent opacity-60 cursor-not-allowed'
                                : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-sm'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded border flex items-center justify-center mr-3 transition-colors ${
                            isSelected ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300'
                          }`}>
                            {isSelected && <span className="text-white text-xs font-bold">✓</span>}
                          </div>
                          
                          <input
                            type="checkbox"
                            className="hidden"
                            checked={isSelected}
                            onChange={() => !isDisabled && handleShelfToggle(String(shelf.id))}
                            disabled={isDisabled}
                          />
                          
                          <div className="flex-1 flex justify-between items-center">
                            <div>
                                <span className="text-sm font-bold text-slate-700 block">
                                    {(shelf.cabinet as any)?.name || 'Шафа ???'}
                                </span>
                                <span className="text-xs text-slate-500">
                                    Полиця: {shelf.shelfcode}
                                </span>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded font-medium ${freeLocationsForShelf > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                {freeLocationsForShelf > 0 ? `${freeLocationsForShelf} місць` : 'Немає місць'}
                            </span>
                          </div>
                        </label>
                      );
                    })}
                </div>
                
                <p className="text-right text-xs text-slate-500 mt-3 pt-2 border-t border-slate-200">
                    {formData.id_shelves.length > 0 
                        ? `Обрано полиць: ${formData.id_shelves.length}. Копії будуть розподілені автоматично.`
                        : "Полиці не обрані. Копії будуть створені без прив'язки до місця."}
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4 border-t border-slate-100">
              <button 
                type="button" 
                onClick={() => navigate({ to: '/copybooks' })} 
                className="flex-1 px-6 py-3.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 hover:text-slate-800 transition-all"
              >
                Скасувати
              </button>
              <button 
                type="submit" 
                disabled={createCopybookMutation.isPending}
                className="flex-1 px-6 py-3.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 active:scale-95 shadow-lg shadow-blue-200 transition-all disabled:opacity-70 disabled:pointer-events-none"
              >
                {createCopybookMutation.isPending ? 'Створення...' : `Створити (${formData.quantity})`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};