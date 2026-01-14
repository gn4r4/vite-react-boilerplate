import { Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { MENU_CONFIG } from '@/config/menuConfig';
import { ReaderHomePage } from './ReaderHomePage';
import { getDashboardStats } from '@/features/dashboard/api';
import { Role } from '@/features/auth/types';

const getRoleTheme = (role: Role | null | undefined) => {
  switch (role) {
    case 'ADMINISTRATOR':
      return { gradient: 'from-violet-600 to-fuchsia-600', shadow: 'shadow-fuchsia-200', icon: '👑', label: 'Адміністратор' };
    case 'LIBRARIAN':
      return { gradient: 'from-blue-600 to-cyan-500', shadow: 'shadow-cyan-200', icon: '📚', label: 'Бібліотекар' };
    case 'RESTORER':
      return { gradient: 'from-amber-500 to-orange-500', shadow: 'shadow-orange-200', icon: '🛠️', label: 'Реставратор' };
    default:
      return { gradient: 'from-slate-700 to-slate-900', shadow: 'shadow-slate-200', icon: '👤', label: 'Користувач' };
  }
};

export const DashboardPage = () => {

  const user = useAuthStore((state) => state.user);
  const role = user?.role; 

  const theme = getRoleTheme(role);

  if (role === 'READER' || !role) {
    return <ReaderHomePage />;
  }

  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: getDashboardStats,
    enabled: role === 'ADMINISTRATOR' || role === 'LIBRARIAN',
    staleTime: 1000 * 60 * 5,
  });

  const filteredSections = MENU_CONFIG.map((section) => {
    const visibleItems = section.items.filter((item) => {
      if (!item.allowedRoles) return true;
      return role && item.allowedRoles.includes(role);
    });
    return { ...section, items: visibleItems };
  }).filter((section) => section.items.length > 0);

  const statCards = [
    { 
      label: 'Книг у фонді', 
      value: stats?.totalBooks,
      icon: '📖', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100'
    },
    { 
      label: 'Активних читачів', 
      value: stats?.activeReaders, 
      icon: '👥', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100'
    },
    { 
      label: 'Видано сьогодні', 
      value: stats?.issuedToday, 
      icon: '🔄', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100'
    },
    { 
      label: 'Заборгованості', 
      value: stats?.overdueBooks, 
      icon: '⚠️', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100'
    },
  ];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Доброго ранку' : hour < 18 ? 'Доброго дня' : 'Доброго вечора';

  return (
    <div className="space-y-10 pb-10">
      
      {/* HERO SECTION */}
      <div className={`relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r ${theme.gradient} text-white shadow-2xl ${theme.shadow} transition-all duration-500`}>
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-white opacity-10 blur-3xl mix-blend-overlay"></div>
        <div className="absolute bottom-0 left-10 w-56 h-56 rounded-full bg-white opacity-10 blur-[80px] mix-blend-overlay"></div>

        <div className="relative z-10 px-8 py-10 md:px-12 md:py-14 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="space-y-2">
            <div className="flex items-center gap-3 opacity-90 mb-3">
              <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center text-lg shadow-inner">
                {theme.icon}
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-white/80">
                Панель керування
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              {greeting}, {theme.label}!
            </h1>
            <p className="text-white/80 text-lg max-w-xl leading-relaxed font-medium">
              Огляд системи та швидкий доступ до основних функцій.
            </p>
          </div>
          
          <div className="hidden md:block bg-white/10 px-8 py-5 rounded-2xl backdrop-blur-md border border-white/20 shadow-lg text-center min-w-[180px]">
            <div className="text-xs font-bold text-white/60 uppercase tracking-widest mb-1">Сьогодні</div>
            <div className="text-3xl font-extrabold">
              {new Date().toLocaleDateString('uk-UA', { day: 'numeric' })}
            </div>
            <div className="text-sm font-medium text-white/90 uppercase tracking-wide">
              {new Date().toLocaleDateString('uk-UA', { month: 'long', weekday: 'short' })}
            </div>
          </div>
        </div>
      </div>

      {/* STATS ROW */}
      {(role === 'ADMINISTRATOR' || role === 'LIBRARIAN') && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 animate-fade-in-up">
          {statCards.map((stat, idx) => (
            <div key={idx} className={`bg-white p-6 rounded-3xl border ${stat.border} shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex items-center gap-5 hover:shadow-[0_10px_25px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 group`}>
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0 ${stat.bg} ${stat.color} group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-sm`}>
                {stat.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">{stat.label}</p>
                
                {isLoading ? (
                  <div className="h-8 w-24 bg-slate-100 rounded-lg animate-pulse" />
                ) : isError ? (
                  <span className="text-xs text-red-400 font-medium bg-red-50 px-2 py-1 rounded">Помилка</span>
                ) : (
                  <p className="text-3xl font-extrabold text-slate-800 truncate tracking-tight">
                    {typeof stat.value === 'number' ? stat.value.toLocaleString('uk-UA') : '0'}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MENU GRID */}
      <div className="space-y-12">
        {filteredSections.map((section) => (
          <div key={section.title} className="animate-fade-in-up">
            <div className="flex items-center gap-4 mb-6 px-1">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                {section.title}
              </h2>
              <div className="h-px bg-gradient-to-r from-slate-200 to-transparent flex-1"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {section.items.map((item) => (
                <Link 
                  key={item.to} 
                  to={item.to}
                  className="group relative bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_15px_30px_rgba(0,0,0,0.08)] hover:border-blue-200/50 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                >
                  {/* Hover Gradient Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-blue-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-6">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm ${item.color || 'bg-slate-50 text-slate-500'} group-hover:scale-110 group-hover:shadow-md transition-all duration-300`}>
                        {item.icon}
                      </div>
                      <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-700 transition-colors mb-2">
                      {item.label}
                    </h3>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">
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