import { Link, useLocation, useNavigate } from '@tanstack/react-router';
import { useAuthStore } from '@/store/authStore';
import { MENU_CONFIG } from '@/config/menuConfig';
import { Role } from '@/features/auth/types';

// Стилі бейджів для ролей
const getRoleBadgeStyle = (role: Role | null) => {
  switch (role) {
    case 'ADMINISTRATOR': return 'bg-violet-100 text-violet-700 border-violet-200';
    case 'LIBRARIAN': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'RESTORER': return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'READER': return 'bg-blue-100 text-blue-700 border-blue-200';
    default: return 'bg-slate-100 text-slate-600 border-slate-200';
  }
};

// Переклад ролей для відображення
const getRoleLabel = (role: Role | null) => {
    switch (role) {
      case 'ADMINISTRATOR': return 'Адмін';
      case 'LIBRARIAN': return 'Бібліотекар';
      case 'RESTORER': return 'Реставратор';
      case 'READER': return 'Читач';
      default: return 'Гість';
    }
};

export const Sidebar = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { email, role, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate({ to: '/login' });
  };

  // Фільтрація меню згідно з роллю
  const filteredGroups = MENU_CONFIG.map((group) => {
    const visibleItems = group.items.filter((item) => {
      // Якщо роль не вказана у allowedRoles, пункт доступний всім (або логіка навпаки, тут припускаємо strict mode)
      if (!item.allowedRoles) return true;
      return role && item.allowedRoles.includes(role);
    });
    return { ...group, items: visibleItems };
  }).filter((group) => group.items.length > 0);

  const roleBadgeStyle = getRoleBadgeStyle(role);
  const roleLabel = getRoleLabel(role);

  return (
    <aside className="w-72 bg-white border-r border-slate-200 min-h-screen flex flex-col fixed left-0 top-0 bottom-0 z-50 transition-all duration-300">
      
      {/* 1. BRAND LOGO */}
      <div className="h-20 flex items-center px-6 border-b border-slate-50">
        <Link to="/" className="flex items-center gap-3 group w-full">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200 group-hover:scale-105 transition-transform duration-300">
            <span className="font-bold text-lg">L</span>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-extrabold text-slate-800 tracking-tight leading-none group-hover:text-blue-600 transition-colors">
              Library<span className="text-blue-500">App</span>
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">System v2.0</span>
          </div>
        </Link>
      </div>

      {/* 2. NAVIGATION MENU */}
      <nav className="flex-1 px-4 py-6 space-y-8 overflow-y-auto custom-scrollbar">
        {filteredGroups.map((group) => (
          <div key={group.title} className="animate-fade-in">
            <h3 className="px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 select-none">
              {group.title}
            </h3>
            <div className="space-y-1">
              {group.items.map((item) => {
                // Перевірка активного стану (враховує вкладені роути)
                const isActive = pathname === item.to || (item.to !== '/' && pathname.startsWith(item.to));
                
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`
                      group relative flex items-center gap-3.5 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200
                      ${isActive
                        ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100/50'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }
                    `}
                  >
                    {/* Active Indicator Bar */}
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 bg-blue-600 rounded-r-full" />
                    )}

                    <span className={`text-lg transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110 opacity-70 group-hover:opacity-100'}`}>
                      {item.icon}
                    </span>
                    <span className="relative z-10">{item.label}</span>
                    
                    {/* Hover Arrow */}
                    <span className={`ml-auto text-xs opacity-0 -translate-x-2 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 ${isActive ? 'text-blue-400' : 'text-slate-300'}`}>
                      →
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {filteredGroups.length === 0 && (
          <div className="px-4 py-8 text-center">
            <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
               <span className="text-2xl block mb-2 opacity-50">🔒</span>
               <p className="text-xs text-slate-500 font-medium">Меню недоступне для вашої ролі</p>
            </div>
          </div>
        )}
      </nav>

      {/* 3. USER PROFILE (Footer) */}
      <div className="p-4 border-t border-slate-100 bg-white">
        <div className="group relative bg-slate-50 hover:bg-white hover:shadow-md hover:border-blue-100 border border-slate-200 rounded-2xl p-3 transition-all duration-300">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-white border border-slate-100 shadow-sm flex items-center justify-center shrink-0 text-slate-700 font-bold select-none group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
               {email ? email[0].toUpperCase() : '?'}
            </div>
            
            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate" title={email || ''}>
                {email || 'Користувач'}
              </p>
              <div className="mt-0.5 flex items-center">
                 <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${roleBadgeStyle}`}>
                    {roleLabel}
                 </span>
              </div>
            </div>

            {/* Logout Button */}
            <button 
              onClick={handleLogout}
              className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all active:scale-90"
              title="Вийти з системи"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};