import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from '@tanstack/react-router';
import { useCopybook, useUpdateCopybook } from '../api';
import { useShelves } from '../../shelves/api';
import { useLocations } from '../../locations/api';
import type { CopybookPayload } from '../types';

export const EditCopybookPage = () => {
  const { copybookId } = useParams({ strict: false });
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
      selectedLocationId = null;
    }

    const payload: CopybookPayload = {
        status: formData.status,
        id_location: selectedLocationId 
    };

    updateCopybookMutation.mutate({
      id,
      data: payload
    }, {
        onSuccess: () => navigate({ to: '/copybooks' })
    });
  };

  if (isBookLoading || isLocLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50/50">
        <div className="flex flex-col items-center gap-3">
             <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
             <div className="text-gray-500 font-medium">Завантаження даних...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-10 flex justify-center">
      <div className="w-full max-w-3xl">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
           <Link to="/copybooks" className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 transition-all">
             ←
           </Link>
           <div className="flex-1 flex justify-between items-center">
             <div>
                <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Редагування</h1>
                <p className="text-slate-500">Зміна статусу та переміщення</p>
             </div>
             <div className="hidden sm:block px-3 py-1 bg-slate-200 text-slate-600 rounded-lg font-mono text-sm font-bold">
                ID: #{id}
             </div>
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

          {updateCopybookMutation.isError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl">
              Помилка: {(updateCopybookMutation.error as any)?.response?.data?.message || 'Невідома помилка'}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Інфо про книгу */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-4">
                <div className="w-12 h-16 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-2xl shadow-sm">
                    📕
                </div>
                <div>
                    <h3 className="font-bold text-slate-800 text-lg">
                        {copybook?.edition?.book?.title || 'Назва невідома'}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                        Рік видання: {copybook?.edition?.yearPublication ? new Date(copybook.edition.yearPublication).getFullYear() : '-'}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {/* Статус */}
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Статус примірника</label>
                    <div className="relative">
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            className="w-full px-4 py-3 bg-white rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all appearance-none cursor-pointer"
                        >
                            <option value="доступний">Доступний</option>
                            <option value="виданий">Виданий</option>
                            <option value="реставрується">Реставрація</option>
                            <option value="списаний">Списаний</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                    </div>
                </div>

                {/* Полиця */}
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                        Локація <span className="font-normal text-slate-400">(Де знаходиться)</span>
                    </label>
                    <div className="relative">
                        <select
                            value={formData.id_shelf}
                            onChange={(e) => setFormData({ ...formData, id_shelf: e.target.value })}
                            className="w-full px-4 py-3 bg-white rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all appearance-none cursor-pointer"
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
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                    </div>
                </div>
            </div>

            {/* Інформаційний блок про місце */}
            {formData.id_shelf && (
              <div className={`p-4 rounded-xl border text-sm ${locationsForShelf.length > 0 ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-red-50 border-red-100 text-red-800'}`}>
                  {locationsForShelf.length > 0 ? (
                      <div className="flex items-center gap-2">
                        <span>✅</span>
                        <span>
                            <strong>Готово до переміщення:</strong> Книга буде автоматично закріплена за вільним місцем #{locationsForShelf[0].id} на цій полиці.
                        </span>
                      </div>
                  ) : (
                      <div className="flex items-center gap-2">
                        <span>❌</span>
                        <strong>Увага: На цій полиці немає вільних місць!</strong>
                      </div>
                  )}
              </div>
            )}

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
                disabled={updateCopybookMutation.isPending}
                className="flex-1 px-6 py-3.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 active:scale-95 shadow-lg shadow-blue-200 transition-all disabled:opacity-50 disabled:pointer-events-none"
              >
                {updateCopybookMutation.isPending ? 'Збереження...' : 'Зберегти зміни'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};