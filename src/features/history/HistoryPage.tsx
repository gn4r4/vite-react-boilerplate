import { useState, useMemo } from 'react';
import { Link } from '@tanstack/react-router';
import { useMyHistory } from '@/features/lendings/api';

export const HistoryPage = () => {
  const { data: history, isLoading } = useMyHistory();

  // Стейт для фільтрів
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'returned' | 'overdue'>('all');

  // Хелпер для визначення типу статусу (для логіки)
  const getStatusType = (lending: any) => {
    if (lending.dateReturn) return 'returned';
    const planDate = lending.dateReturnPlanned ? new Date(lending.dateReturnPlanned) : null;
    if (planDate && planDate < new Date()) return 'overdue';
    return 'active';
  };

  // Хелпер для візуалізації статусу (для UI)
  const getStatusDisplay = (type: string) => {
    switch (type) {
        case 'returned': return { label: 'Завершено', color: 'bg-emerald-100 text-emerald-700', icon: '✅' };
        case 'overdue': return { label: 'Прострочено', color: 'bg-red-100 text-red-700', icon: '⚠️' };
        default: return { label: 'Активно', color: 'bg-blue-100 text-blue-700', icon: '📖' };
    }
  };

  // Логіка фільтрації
  const filteredHistory = useMemo(() => {
    if (!history) return [];

    return history.filter((item) => {
        // 1. Фільтр по статусу
        const statusType = getStatusType(item);
        if (filterStatus !== 'all' && statusType !== filterStatus) {
            return false;
        }

        // 2. Пошук
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const idMatch = item.id.toString().includes(query);
            
            // Шукаємо всередині книг (назва або видавництво)
            const booksMatch = item.copybooks?.some((cb: any) => 
                cb.edition?.book?.title?.toLowerCase().includes(query) ||
                cb.edition?.publisher?.name?.toLowerCase().includes(query)
            );

            return idMatch || booksMatch;
        }

        return true;
    });
  }, [history, filterStatus, searchQuery]);

  if (isLoading) return (
    <div className="flex justify-center items-center h-[50vh]">
       <div className="w-10 h-10 border-4 border-slate-100 border-t-blue-500 rounded-full animate-spin"></div>
    </div>
  );

  // Якщо взагалі немає історії (навіть без фільтрів)
  if (!history || history.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-dashed border-slate-200 text-center max-w-4xl mx-auto mt-10">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-3xl mb-4 shadow-sm">
                📜
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-1">Історія порожня</h3>
            <p className="text-slate-400 text-sm max-w-xs mx-auto">
                Ви ще не брали книг у нашій бібліотеці. Саме час знайти щось цікаве!
            </p>
            <Link to="/" className="mt-6 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
                Перейти до каталогу
            </Link>
        </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-12 animate-fade-in space-y-8">
      
      {/* 1. Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-2">
        <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Історія читання</h1>
            <p className="text-slate-500 mt-1">Хронологія ваших запозичень</p>
        </div>
        <div className="flex gap-2">
            <div className="bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm text-center min-w-[80px]">
                <span className="block text-xl font-bold text-slate-800">{history.length}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Всього</span>
            </div>
            <div className="bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 text-center min-w-[80px]">
                <span className="block text-xl font-bold text-blue-700">
                    {history.filter(i => !i.dateReturn).length}
                </span>
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">На руках</span>
            </div>
        </div>
      </div>

      {/* 2. Toolbar (Search & Filter) */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
            <input 
                type="text" 
                placeholder="Пошук за ID, назвою книги або видавництвом..." 
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 rounded-xl outline-none transition-all text-sm font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl overflow-x-auto">
            {[
                { id: 'all', label: 'Всі' },
                { id: 'active', label: 'Активні' },
                { id: 'returned', label: 'Повернуті' },
                { id: 'overdue', label: 'Прострочені' },
            ].map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => setFilterStatus(tab.id as any)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                        filterStatus === tab.id 
                        ? 'bg-white text-slate-800 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    {tab.label}
                </button>
            ))}
        </div>
      </div>

      {/* 3. List Content */}
      <div className="space-y-6">
        {filteredHistory.length === 0 ? (
            <div className="text-center py-16 text-slate-400 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                <span className="text-4xl block mb-2 opacity-50">🕵️‍♂️</span>
                <p>Нічого не знайдено за вашим запитом</p>
                <button 
                    onClick={() => {setSearchQuery(''); setFilterStatus('all')}}
                    className="text-blue-600 text-sm font-bold mt-2 hover:underline"
                >
                    Скинути фільтри
                </button>
            </div>
        ) : (
            filteredHistory.map((lending) => {
                const statusType = getStatusType(lending);
                const statusUI = getStatusDisplay(statusType);
                
                const dateLending = new Date(lending.dateLending).toLocaleDateString('uk-UA');
                const dateReturn = lending.dateReturn ? new Date(lending.dateReturn).toLocaleDateString('uk-UA') : null;
                const datePlanned = lending.dateReturnPlanned ? new Date(lending.dateReturnPlanned).toLocaleDateString('uk-UA') : null;

                return (
                    <div key={lending.id} className="group bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300">
                        
                        {/* Lending Header */}
                        <div className="bg-slate-50/50 px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${statusUI.color} bg-opacity-20`}>
                                    {statusUI.icon}
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                        Видача #{lending.id}
                                    </div>
                                    <div className="text-xs text-slate-500 font-medium mt-0.5">
                                        {dateLending} — {dateReturn ? `Повернуто ${dateReturn}` : `План: ${datePlanned}`}
                                    </div>
                                </div>
                            </div>
                            <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${statusUI.color}`}>
                                {statusUI.label}
                            </span>
                        </div>

                        {/* Books List */}
                        <div className="divide-y divide-slate-50">
                            {lending.copybooks?.map((cb: any) => (
                                <div key={cb.id} className="p-5 flex gap-5 hover:bg-slate-50 transition-colors">
                                    <div className="w-12 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg shrink-0 flex items-center justify-center shadow-inner text-xl">
                                        📕
                                    </div>
                                    
                                    <div className="flex-1 min-w-0 py-0.5">
                                        <h4 className="text-base font-bold text-slate-800 leading-tight mb-2 truncate" title={cb.edition?.book?.title}>
                                            {cb.edition?.book?.title || 'Без назви'}
                                        </h4>
                                        
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {cb.edition?.yearPublication && (
                                                <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-[10px] font-medium text-slate-600 border border-slate-200">
                                                    📅 {new Date(cb.edition.yearPublication).getFullYear()}
                                                </span>
                                            )}
                                            {cb.edition?.publisher && (
                                                <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-[10px] font-medium text-slate-600 border border-slate-200">
                                                    🏢 {cb.edition.publisher.name}
                                                </span>
                                            )}
                                        </div>
                                        
                                        <div className="flex flex-wrap items-center gap-3">
                                            <span className="text-[10px] font-mono text-slate-400">
                                                ID: #{cb.id}
                                            </span>
                                            
                                            {cb.dateReturnActual ? (
                                                <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                                                    ✓ Повернуто {new Date(cb.dateReturnActual).toLocaleDateString('uk-UA')}
                                                </span>
                                            ) : (
                                                <span className="text-[10px] font-bold text-blue-600">
                                                    На руках
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })
        )}
      </div>
    </div>
  );
};