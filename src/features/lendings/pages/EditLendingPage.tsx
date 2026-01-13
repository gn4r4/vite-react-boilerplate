import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from '@tanstack/react-router';
import { useLending, useUpdateLending } from '../api';
import type { ILendingPayload } from '../types';

export const EditLendingPage = () => {
  const { lendingId } = useParams({ strict: false });
  const navigate = useNavigate();
  const id = Number(lendingId);

  const { data: lending, isLoading } = useLending(id);
  const updateLending = useUpdateLending();

  const [formErrors, setFormErrors] = useState<string | null>(null);
  const [dateReturn, setDateReturn] = useState<string>('');
  const [dateReturnPlanned, setDateReturnPlanned] = useState<string>('');
  
  // booksToReturn - list of copybook IDs marked as "return now"
  const [booksToReturn, setBooksToReturn] = useState<number[]>([]);

  const isClosed = !!lending?.dateReturn;
  const isOverdue = !isClosed && lending?.dateReturnPlanned && new Date(lending.dateReturnPlanned) < new Date();

  useEffect(() => {
    if (lending) {
      if (lending.dateReturn) {
        setDateReturn(new Date(lending.dateReturn).toISOString().split('T')[0]);
      } else {
        setDateReturn('');
      }

      if (lending.dateReturnPlanned) {
        setDateReturnPlanned(new Date(lending.dateReturnPlanned).toISOString().split('T')[0]);
      }
    }
  }, [lending]);

  const toggleBookReturn = (copybookId: number) => {
    if (isClosed) return;

    setBooksToReturn(prev => {
      if (prev.includes(copybookId)) {
        return prev.filter(id => id !== copybookId);
      } else {
        return [...prev, copybookId];
      }
    });
  };

  const normalizeDate = (dateStr: string | Date) => {
    const d = new Date(dateStr);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isClosed) return;

    setFormErrors(null);
    if (!lending) return;

    const lendingDateStart = normalizeDate(lending.dateLending);

    if (dateReturn) {
      const returnDateNorm = normalizeDate(dateReturn);
      if (returnDateNorm < lendingDateStart) {
        setFormErrors('Дата повернення не може бути раніше дати видачі');
        return;
      }
    }

    if (dateReturnPlanned) {
      const plannedDateNorm = normalizeDate(dateReturnPlanned);
      if (plannedDateNorm < lendingDateStart) {
         setFormErrors('Планове повернення не може бути раніше дати видачі');
         return;
      }
    } else {
        setFormErrors('Планова дата повернення обов\'язкова');
        return;
    }

    const remainingBooksIds = lending.copybooks
      .filter(cb => !cb.dateReturnActual && !booksToReturn.includes(cb.id))
      .map(cb => cb.id);

    let finalDateReturn = dateReturn ? dateReturn : null;
    
    // Auto-close if all books returned
    const allBooksWillBeReturned = remainingBooksIds.length === 0;
    if (allBooksWillBeReturned && !finalDateReturn) {
        const today = new Date();
        const offset = today.getTimezoneOffset();
        const localDate = new Date(today.getTime() - (offset * 60 * 1000));
        finalDateReturn = localDate.toISOString().split('T')[0];
    }

    const payload: Partial<ILendingPayload> = {
        id_reader: lending.reader?.id,
        id_employee: lending.employee?.id, 
        datelending: lending.dateLending.toString(),
        datereturn: finalDateReturn,
        datereturn_planned: dateReturnPlanned,
        id_copybook: remainingBooksIds 
    };

    updateLending.mutate({
      id,
      data: payload
    }, {
        onSuccess: () => navigate({ to: '/lendings' }),
        onError: (error: any) => {
            setFormErrors(error?.response?.data?.message || 'Помилка оновлення');
        }
    });
  };

  if (isLoading) return (
    <div className="flex justify-center items-center h-screen bg-gray-50/50">
      <div className="flex flex-col items-center gap-3">
           <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
           <div className="text-gray-500 font-medium">Завантаження даних видачі...</div>
      </div>
    </div>
  );

  if (!lending) return (
    <div className="min-h-screen bg-gray-50 p-10 flex justify-center items-center">
        <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800">Видачу не знайдено</h2>
            <Link to="/lendings" className="text-blue-600 hover:underline mt-2 block">Повернутися до списку</Link>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-10 flex justify-center">
      <div className="w-full max-w-4xl">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
           <Link to="/lendings" className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 transition-all">
             ←
           </Link>
           <div className="flex-1 flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
             <div>
                <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Видача #{lending.id}</h1>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
                        isClosed 
                        ? 'bg-green-100 text-green-700 border-green-200' 
                        : isOverdue 
                            ? 'bg-red-100 text-red-700 border-red-200' 
                            : 'bg-blue-100 text-blue-700 border-blue-200'
                    }`}>
                        {isClosed ? 'Закрито' : isOverdue ? 'Прострочено' : 'Активно'}
                    </span>
                </div>
                <p className="text-slate-500 mt-1">
                    {isClosed ? 'Всі книги повернуто, процес завершено.' : 'Керування поверненням книг.'}
                </p>
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

          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Основна інформація */}
            <div className="space-y-6">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
                    <span>📋</span> Деталі
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Читач</label>
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-lg border border-slate-200">👤</div>
                            <span className="font-medium text-slate-800">{lending.reader?.fullName || 'Невідомий'}</span>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Працівник</label>
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-lg border border-slate-200">👔</div>
                            <span className="font-medium text-slate-800">{lending.employee?.fullName || 'Невідомий'}</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Дата видачі</label>
                        <div className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 font-medium">
                            {new Date(lending.dateLending).toLocaleDateString('uk-UA')}
                        </div>
                    </div>
                    
                    <div>
                        <label className={`block text-sm font-bold mb-2 ${isOverdue ? 'text-red-600' : 'text-slate-700'}`}>
                            Планове повернення
                        </label>
                        <input
                            type="date"
                            value={dateReturnPlanned}
                            onChange={(e) => setDateReturnPlanned(e.target.value)}
                            disabled={isClosed}
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium ${
                            isClosed 
                                ? 'bg-slate-50 text-slate-400 cursor-not-allowed border-slate-200' 
                                : isOverdue
                                    ? 'border-red-300 bg-red-50 text-red-700 focus:border-red-500'
                                    : 'border-slate-200 focus:border-blue-500'
                            }`}
                            required
                        />
                    </div>
                </div>
            </div>

            {/* Блок книг */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
                 <span>📚</span> Книги у видачі
              </h2>
              
              <div className="space-y-3">
                {lending.copybooks?.length === 0 && (
                  <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-500">
                      Всі книги з цього запису були повернуті раніше.
                  </div>
                )}
                
                {lending.copybooks?.map((copybook) => {
                  const isReturnedInDb = !!copybook.dateReturnActual;
                  const isMarkedForReturn = booksToReturn.includes(copybook.id);
                  
                  return (
                    <div 
                      key={copybook.id}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-all gap-4 ${
                        isReturnedInDb 
                           ? 'bg-green-50/50 border-green-200'
                           : isMarkedForReturn 
                              ? 'bg-blue-50 border-blue-200 shadow-sm'
                              : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 flex items-center justify-center rounded-lg text-xl ${isReturnedInDb ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'}`}>
                            {isReturnedInDb ? '✅' : '📖'}
                        </div>
                        <div>
                            <h3 className={`font-bold text-sm ${isMarkedForReturn || isReturnedInDb ? 'text-slate-600' : 'text-slate-800'}`}>
                                {copybook.edition?.book?.title || 'Невідомо'}
                            </h3>
                            <div className="flex flex-wrap gap-2 mt-1 text-xs">
                                <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">ID: #{copybook.id}</span>
                                {isReturnedInDb && (
                                    <span className="text-green-700 font-semibold">
                                        Повернуто: {new Date(copybook.dateReturnActual!).toLocaleDateString('uk-UA')}
                                    </span>
                                )}
                                {isMarkedForReturn && (
                                    <span className="text-blue-600 font-semibold">
                                        Буде повернуто зараз
                                    </span>
                                )}
                            </div>
                        </div>
                      </div>

                      {!isReturnedInDb && !isClosed ? (
                          <button
                            type="button"
                            onClick={() => toggleBookReturn(copybook.id)}
                            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all active:scale-95 ${
                                isMarkedForReturn
                                ? 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-50'
                                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-200'
                            }`}
                          >
                            {isMarkedForReturn ? 'Скасувати' : 'Повернути'}
                          </button>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Дата закриття */}
            <div className={`p-5 rounded-2xl border transition-all ${isClosed ? 'bg-slate-50 border-slate-200 opacity-70' : 'bg-blue-50/50 border-blue-100'}`}>
              <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                  <div>
                    <label className={`block text-sm font-bold mb-1 ${isClosed ? 'text-slate-500' : 'text-blue-900'}`}>
                        Дата повного закриття
                    </label>
                    <p className="text-xs text-slate-500 max-w-sm">
                        {isClosed 
                            ? "Дата, коли видача була повністю закрита." 
                            : "Якщо ви хочете закрити видачу вручну, вкажіть дату. При поверненні останньої книги це поле заповниться автоматично."
                        }
                    </p>
                  </div>
                  
                  <div className="flex gap-2 w-full md:w-auto">
                      <input
                        type="date"
                        value={dateReturn}
                        onChange={(e) => setDateReturn(e.target.value)}
                        disabled={isClosed}
                        className={`flex-1 md:w-48 px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-600 transition-all ${
                        isClosed 
                            ? 'bg-slate-200 border-slate-300 text-slate-500 cursor-not-allowed' 
                            : 'border-blue-300 bg-white text-blue-900'
                        }`}
                      />
                      {dateReturn && !isClosed && (
                          <button 
                            type="button"
                            onClick={() => setDateReturn('')}
                            className="px-3 py-2 bg-white border border-red-200 text-red-500 rounded-xl hover:bg-red-50 transition"
                            title="Очистити дату"
                          >
                              ✕
                          </button>
                      )}
                  </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-slate-100">
                <button
                    type="button"
                    onClick={() => navigate({ to: '/lendings' })}
                    className="flex-1 px-6 py-3.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 hover:text-slate-800 transition-all"
                >
                    Назад
                </button>
                
                {!isClosed && (
                    <button
                    type="submit"
                    disabled={updateLending.isPending}
                    className="flex-1 px-6 py-3.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 active:scale-95 shadow-lg shadow-blue-200 transition-all disabled:opacity-70 disabled:pointer-events-none"
                    >
                    {updateLending.isPending ? 'Збереження...' : 'Зберегти зміни'}
                    </button>
                )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};