import { Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { MENU_CONFIG } from '@/config/menuConfig';
import { ReaderHomePage } from './ReaderHomePage';
import { getDashboardStats } from '@/features/dashboard/api';
import { Role } from '@/features/auth/types';

// Хелпер для теми залежно від ролі
const getRoleTheme = (role: Role | null) => {
  switch (role) {
    case 'ADMINISTRATOR':
      return { gradient: 'from-violet-600 to-indigo-600', shadow: 'shadow-indigo-200', icon: '👑', label: 'Адміністратор' };
    case 'LIBRARIAN':
      return { gradient: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-200', icon: '📚', label: 'Бібліотекар' };
    case 'RESTORER':
      return { gradient: 'from-amber-500 to-orange-600', shadow: 'shadow-orange-200', icon: '🛠️', label: 'Реставратор' };
    default:
      return { gradient: 'from-slate-700 to-slate-900', shadow: 'shadow-slate-200', icon: '👤', label: 'Користувач' };
  }
};

export const DashboardPage = () => {
  const role = useAuthStore((state) => state.role);
  const theme = getRoleTheme(role);

  // 1. ЛОГІКА ДЛЯ ЧИТАЧА ТА ГОСТЯ
  // Якщо роль READER або не авторизований -> показуємо каталог
  if (role === 'READER' || !role) {
    return <ReaderHomePage />;
  }

  // 2. ЗАПИТ НА БЕКЕНД (Тільки для співробітників)
  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: getDashboardStats,
    enabled: role === 'ADMINISTRATOR' || role === 'LIBRARIAN',
    staleTime: 1000 * 60 * 5, // Кешуємо на 5 хвилин
  });

  // 3. Фільтрація меню на основі ролі
  const filteredSections = MENU_CONFIG.map((section) => {
    const visibleItems = section.items.filter((item) => {
      if (!item.allowedRoles) return true;
      return role && item.allowedRoles.includes(role);
    });
    return { ...section, items: visibleItems };
  }).filter((section) => section.items.length > 0);

  // 4. Статистика
  const statCards = [
    { 
      label: 'Книг у фонді', 
      value: stats?.totalBooks,
      icon: '📖', color: 'text-blue-600', bg: 'bg-blue-50' 
    },
    { 
      label: 'Активних читачів', 
      value: stats?.activeReaders, 
      icon: '👥', color: 'text-emerald-600', bg: 'bg-emerald-50' 
    },
    { 
      label: 'Видано сьогодні', 
      value: stats?.issuedToday, 
      icon: '🔄', color: 'text-amber-600', bg: 'bg-amber-50' 
    },
    { 
      label: 'Заборгованості', 
      value: stats?.overdueBooks, 
      icon: '⚠️', color: 'text-red-600', bg: 'bg-red-50' 
    },
  ];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Доброго ранку' : hour < 18 ? 'Доброго дня' : 'Доброго вечора';

  return (
    <div className="space-y-8 pb-10">
      
      {/* HERO SECTION */}
      <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-r ${theme.gradient} text-white shadow-xl ${theme.shadow} transition-all duration-500`}>
        {/* Декоративні елементи фону */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-10 blur-3xl"></div>
        <div className="absolute bottom-0 left-20 w-40 h-40 rounded-full bg-white opacity-10 blur-2xl"></div>

        <div className="relative z-10 p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2 opacity-90">
              <span className="text-2xl">{theme.icon}</span>
              <span className="text-xs font-bold uppercase tracking-widest bg-white/20 px-3 py-1 rounded-lg backdrop-blur-sm border border-white/10">
                Панель керування
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
              {greeting}, {theme.label}! 👋
            </h1>
            <p className="text-white/80 text-lg max-w-xl leading-relaxed">
              Система працює у штатному режимі. Оберіть необхідний модуль для початку роботи.
            </p>
          </div>
          
          <div className="hidden md:block text-right bg-white/10 px-6 py-4 rounded-2xl backdrop-blur-sm border border-white/10 shadow-inner">
            <div className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-1">Сьогодні</div>
            <div className="text-2xl font-bold">
              {new Date().toLocaleDateString('uk-UA', { day: 'numeric', month: 'long' })}
            </div>
            <div className="text-sm text-white/80 capitalize">
              {new Date().toLocaleDateString('uk-UA', { weekday: 'long' })}
            </div>
          </div>
        </div>
      </div>

      {/* STATS ROW (Тільки для Адміна та Бібліотекаря) */}
      {(role === 'ADMINISTRATOR' || role === 'LIBRARIAN') && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up">
          {statCards.map((stat, idx) => (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow cursor-default group">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                {stat.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{stat.label}</p>
                
                {isLoading ? (
                  <div className="h-7 w-24 bg-slate-100 rounded-md animate-pulse" />
                ) : isError ? (
                  <span className="text-xs text-red-400 font-medium">Дані недоступні</span>
                ) : (
                  <p className="text-2xl font-extrabold text-slate-800 truncate" title={String(stat.value)}>
                    {typeof stat.value === 'number' ? stat.value.toLocaleString('uk-UA') : '0'}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MENU GRID */}
      <div className="space-y-10">
        {filteredSections.map((section) => (
          <div key={section.title} className="animate-fade-in-up">
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                {section.title}
              </h2>
              <div className="h-px bg-slate-200 flex-1"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {section.items.map((item) => (
                <Link 
                  key={item.to} 
                  to={item.to}
                  className="group relative bg-white rounded-2xl p-6 border border-slate-200 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.08)] hover:border-blue-200 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                >
                  <div className="flex items-start justify-between mb-5">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm ${item.color || 'bg-slate-50 text-slate-500'} group-hover:scale-110 transition-transform duration-300`}>
                      {item.icon}
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                      <span>↗</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors mb-2">
                      {item.label}
                    </h3>
                    <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">
                      {item.desc || 'Перехід до управління розділом'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};