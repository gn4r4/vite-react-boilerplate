import { useState, useMemo } from 'react';
import { useNavigate, Link } from '@tanstack/react-router';
import { useCreateLending } from '../api';
import { useCopybooks } from '../../copybooks/api';
import { useReaders } from '../../readers/api';
import { useEmployees } from '../../employees/api';
import { ILendingPayload } from '../types';
import { ICopybook } from '../../copybooks/types';

// Helper to get local date string YYYY-MM-DD
const getLocalDateString = (date = new Date()) => {
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - (offset * 60 * 1000));
  return localDate.toISOString().split('T')[0];
};

export const CreateLendingPage = () => {
  const [selectedCopybooks, setSelectedCopybooks] = useState<ICopybook[]>([]);
  const [readerId, setReaderId] = useState<string>('');
  const [employeeId, setEmployeeId] = useState<string>('');
  
  const [datePlanned, setDatePlanned] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return getLocalDateString(d);
  });
  
  const [copySearchQuery, setCopySearchQuery] = useState('');
  const [showSelectedOnly, setShowSelectedOnly] = useState(false);
  const [formErrors, setFormErrors] = useState<string | null>(null);

  const createLending = useCreateLending();
  const navigate = useNavigate();
  
  const { data: copybooks, isLoading: isLoadingBooks } = useCopybooks();
  const { data: readers, isLoading: isLoadingReaders } = useReaders();
  const { data: employees, isLoading: isLoadingEmployees } = useEmployees();

  // Filter available copybooks
  const availableCopybooks = useMemo(() => {
    return copybooks
      ?.filter(cb => cb.status === 'доступний')
      .sort((a, b) => (a.edition?.book?.title || '').localeCompare(b.edition?.book?.title || '')) || [];
  }, [copybooks]);

  const filteredCopybooks = useMemo(() => {
    let list = availableCopybooks;

    // 1. Filter "Selected Only"
    if (showSelectedOnly) {
        list = list.filter(cb => selectedCopybooks.some(sel => sel.id === cb.id));
    }

    // 2. Search Filter
    if (copySearchQuery) {
        const lowerQuery = copySearchQuery.toLowerCase();
        list = list.filter(cb => {
            const title = cb.edition?.book?.title?.toLowerCase() || '';
            const id = cb.id.toString();
            return id.includes(lowerQuery) || title.includes(lowerQuery);
        });
    }

    return list;
  }, [availableCopybooks, copySearchQuery, showSelectedOnly, selectedCopybooks]);

  const handleCopybookToggle = (copybook: ICopybook, isChecked: boolean) => {
    if (isChecked) {
      setSelectedCopybooks(prev => [...prev, copybook]);
    } else {
      setSelectedCopybooks(prev => prev.filter(item => item.id !== copybook.id));
      if (showSelectedOnly && selectedCopybooks.length <= 1) {
          setShowSelectedOnly(false);
      }
    }
  };

  const handleClearSelection = () => {
      setSelectedCopybooks([]);
      setShowSelectedOnly(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors(null);

    if (!readerId) return setFormErrors('Будь ласка, оберіть читача');
    if (!employeeId) return setFormErrors('Будь ласка, оберіть працівника');
    if (selectedCopybooks.length === 0) return setFormErrors('Будь ласка, оберіть хоча б одну книгу');
    if (!datePlanned) return setFormErrors('Вкажіть планову дату повернення');

    const today = getLocalDateString();
    if (datePlanned < today) return setFormErrors('Планова дата повернення не може бути в минулому');

    const payload: ILendingPayload = {
      id_reader: Number(readerId),
      id_employee: Number(employeeId),
      datelending: today, 
      datereturn_planned: datePlanned,
      datereturn: null,
      id_copybook: selectedCopybooks.map(item => item.id),
    };

    createLending.mutate(payload, {
      onSuccess: () => navigate({ to: '/lendings' }),
      onError: (error: any) => {
        setFormErrors(error?.response?.data?.message || 'Помилка при створенні видачі');
      }
    });
  };

  const isLoading = isLoadingBooks || isLoadingReaders || isLoadingEmployees;

  if (isLoading) return (
    <div className="flex justify-center items-center h-screen bg-gray-50/50">
      <div className="flex flex-col items-center gap-3">
           <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
           <div className="text-gray-500 font-medium">Завантаження довідників...</div>
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
           <div>
             <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Нова видача</h1>
             <p className="text-slate-500">Оформлення видачі книг читачеві</p>
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
            
            {/* Учасники */}
            <div className="space-y-6">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
                    <span>👥</span> Учасники процесу
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Читач <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <select
                            value={readerId}
                            onChange={(e) => setReaderId(e.target.value)}
                            className="w-full px-4 py-3 bg-white rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all appearance-none cursor-pointer"
                            >
                            <option value="">Оберіть читача...</option>
                            {readers?.map((reader) => (
                                <option key={reader.id} value={reader.id}>{reader.fullName}</option>
                            ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Працівник <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <select
                            value={employeeId}
                            onChange={(e) => setEmployeeId(e.target.value)}
                            className="w-full px-4 py-3 bg-white rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all appearance-none cursor-pointer"
                            >
                            <option value="">Оберіть працівника...</option>
                            {employees?.map((employee) => (
                                <option key={employee.id} value={employee.id}>{employee.fullName}</option>
                            ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Дати */}
            <div className="space-y-6">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
                    <span>📅</span> Терміни
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Дата видачі</label>
                        <div className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-500 font-medium cursor-not-allowed flex items-center justify-between">
                            <span>{new Date().toLocaleDateString('uk-UA')}</span>
                            <span className="text-xs uppercase font-bold tracking-wider text-slate-400">Сьогодні</span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Планове повернення <span className="text-red-500">*</span></label>
                        <input 
                        type="date"
                        value={datePlanned}
                        onChange={(e) => setDatePlanned(e.target.value)}
                        className="w-full px-4 py-3 bg-white rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium text-slate-700"
                        min={getLocalDateString()} 
                        />
                    </div>
                </div>
            </div>

            {/* Блок вибору книг */}
            <div className="space-y-6">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <span>📚</span> Книги <span className="text-red-500">*</span>
                    </h2>
                    <div className="flex items-center gap-3">
                        {selectedCopybooks.length > 0 && (
                            <button 
                                type="button" 
                                onClick={handleClearSelection}
                                className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors"
                            >
                                Очистити все
                            </button>
                        )}
                        <span className="text-sm font-medium px-3 py-1 bg-blue-50 text-blue-700 rounded-lg">
                            Обрано: {selectedCopybooks.length}
                        </span>
                    </div>
                </div>
              
                <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-200">
                    <div className="flex flex-col sm:flex-row gap-4 mb-4">
                        <div className="relative flex-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                            <input
                                type="text"
                                placeholder="Пошук книги по назві або ID..."
                                className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 text-sm shadow-sm"
                                value={copySearchQuery}
                                onChange={(e) => setCopySearchQuery(e.target.value)}
                            />
                        </div>
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-600 cursor-pointer bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors select-none">
                            <input 
                                type="checkbox" 
                                checked={showSelectedOnly}
                                onChange={(e) => setShowSelectedOnly(e.target.checked)}
                                disabled={selectedCopybooks.length === 0}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <span>Тільки обрані</span>
                        </label>
                    </div>

                    <div className="max-h-80 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                        {availableCopybooks.length === 0 ? (
                            <div className="text-center py-8 text-slate-400">
                                <p>Немає доступних книг для видачі</p>
                            </div>
                        ) : filteredCopybooks.length === 0 ? (
                            <div className="text-center py-8 text-slate-400">
                                <p>{showSelectedOnly ? 'Список обраних книг порожній' : 'Нічого не знайдено'}</p>
                            </div>
                        ) : (
                        filteredCopybooks.map((copybook) => {
                            const isSelected = selectedCopybooks.some(item => item.id === copybook.id);
                            return (
                            <label 
                                key={copybook.id} 
                                className={`flex items-start p-3 rounded-xl cursor-pointer transition-all border ${
                                isSelected 
                                    ? 'bg-blue-50 border-blue-500 shadow-sm' 
                                    : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-sm'
                                }`}
                            >
                                <div className="mt-1 mr-3">
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={(e) => handleCopybookToggle(copybook, e.target.checked)}
                                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300 cursor-pointer"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <p className={`font-bold text-sm truncate pr-2 ${isSelected ? 'text-blue-800' : 'text-slate-800'}`}>
                                        {copybook.edition?.book?.title || 'Без назви'}
                                    </p>
                                    <span className="text-[10px] font-mono bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200 shrink-0">
                                        #{copybook.id}
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-slate-500">
                                    <span>
                                        🏢 {copybook.edition?.publisher?.name || '-'}
                                    </span>
                                    <span>
                                        📅 {copybook.edition?.yearPublication ? new Date(copybook.edition.yearPublication).getFullYear() : '-'}
                                    </span>
                                    {copybook.location && (
                                        <span className="text-slate-400">
                                            📍 {copybook.location.shelf?.cabinet?.name + ' Полиця ' + copybook.location.shelf?.shelfcode}
                                        </span>
                                    )}
                                </div>
                                </div>
                            </label>
                            );
                        })
                        )}
                    </div>
                </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4 border-t border-slate-100">
              <button 
                type="button" 
                onClick={() => navigate({ to: '/lendings' })} 
                className="flex-1 px-6 py-3.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 hover:text-slate-800 transition-all"
              >
                Скасувати
              </button>
              <button 
                type="submit" 
                disabled={createLending.isPending}
                className="flex-1 px-6 py-3.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 active:scale-95 shadow-lg shadow-blue-200 transition-all disabled:opacity-70 disabled:pointer-events-none"
              >
                {createLending.isPending ? 'Збереження...' : 'Створити видачу'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};