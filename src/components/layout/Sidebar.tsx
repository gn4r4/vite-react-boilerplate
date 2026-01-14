import { Link, useLocation, useNavigate } from '@tanstack/react-router';
import { useAuthStore } from '@/store/authStore';
import { MENU_CONFIG } from '@/config/menuConfig';
import { Role } from '@/features/auth/types';

// Оновлені стилі бейджів (узгоджено з Dashboard)
const getRoleBadgeStyle = (role: Role | null | undefined) => {
  switch (role) {
    case 'ADMINISTRATOR': return 'bg-violet-100 text-violet-700 border-violet-200';
    case 'LIBRARIAN': return 'bg-cyan-100 text-cyan-700 border-cyan-200';
    case 'RESTORER': return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'READER': return 'bg-blue-100 text-blue-700 border-blue-200';
    default: return 'bg-slate-100 text-slate-600 border-slate-200';
  }
};

const getRoleLabel = (role: Role | null | undefined) => {
    switch (role) {
      case 'ADMINISTRATOR': return 'Адміністратор';
      case 'LIBRARIAN': return 'Бібліотекар';
      case 'RESTORER': return 'Реставратор';
      case 'READER': return 'Читач';
      default: return 'Гість';
    }
};

export const Sidebar = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const getDisplayName = () => {
    if (!user) return 'Гість';
    if (user.employee) {
        return `${user.employee.lastname} ${user.employee.firstname} ${user.employee.patronymic || ''}`.trim();
    }
    if (user.reader) {
        return `${user.reader.lastname} ${user.reader.firstname} ${user.reader.patronymic || ''}`.trim();
    }
    return user.name || user.username || user.email;
  };

  const displayName = getDisplayName();
  const role = user?.role;
  const avatarInitial = displayName ? displayName.charAt(0).toUpperCase() : '?';

  const handleLogout = () => {
    logout();
    navigate({ to: '/login' });
  };

  const filteredGroups = MENU_CONFIG.map((group) => {
    const visibleItems = group.items.filter((item) => {
      if (!item.allowedRoles) return true;
      return role && item.allowedRoles.includes(role);
    });
    return { ...group, items: visibleItems };
  }).filter((group) => group.items.length > 0);

  const roleBadgeStyle = getRoleBadgeStyle(role);
  const roleLabel = getRoleLabel(role);

  return (
    <aside className="w-72 bg-white min-h-screen flex flex-col fixed left-0 top-0 bottom-0 z-50 transition-all duration-300 shadow-[4px_0_24px_rgba(0,0,0,0.02)] border-r border-slate-100/50">
      
      {/* 1. BRAND LOGO */}
      <div className="h-24 flex items-center px-6">
        <Link to="/" className="flex items-center gap-3.5 group w-full p-2 rounded-2xl hover:bg-slate-50 transition-colors">
          <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200 group-hover:scale-105 transition-transform duration-300">
            <span className="font-extrabold text-xl font-serif">L</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold text-slate-800 tracking-tight leading-none group-hover:text-blue-600 transition-colors">
              Library<span className="text-blue-500">App</span>
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Management v2.0</span>
          </div>
        </Link>
      </div>

      {/* 2. NAVIGATION MENU */}
      <nav className="flex-1 px-4 py-4 space-y-8 overflow-y-auto custom-scrollbar">
        {filteredGroups.map((group) => (
          <div key={group.title} className="animate-fade-in">
            <div className="px-4 flex items-center gap-3 mb-3">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest select-none">
                {group.title}
                </span>
                <div className="h-px bg-slate-100 flex-1"></div>
            </div>
            
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.to || (item.to !== '/' && pathname.startsWith(item.to));
                
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`
                      group relative flex items-center gap-3.5 px-4 py-3 text-sm font-medium rounded-2xl transition-all duration-200
                      ${isActive
                        ? 'bg-gradient-to-r from-blue-50 to-white text-blue-700 shadow-sm'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                      }
                    `}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-blue-600 rounded-r-full" />
                    )}

                    <span className={`text-lg transition-transform duration-300 ${isActive ? 'scale-110 drop-shadow-sm' : 'group-hover:scale-110 opacity-70 group-hover:opacity-100'}`}>
                      {item.icon}
                    </span>
                    <span className="relative z-10 font-semibold tracking-tight">{item.label}</span>
                    
                    {/* Hover Arrow */}
                    <span className={`ml-auto text-xs transition-all duration-300 ${isActive ? 'opacity-100 text-blue-400 translate-x-0' : 'opacity-0 -translate-x-2 group-hover:translate-x-0 group-hover:opacity-100 text-slate-300'}`}>
                      ➝
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {filteredGroups.length === 0 && (
          <div className="px-4 py-12 text-center opacity-60">
            <div className="p-6 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
               <span className="text-3xl block mb-3">🔒</span>
               <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Меню обмежено</p>
            </div>
          </div>
        )}
      </nav>

      {/* 3. USER PROFILE (Footer) */}
      <div className="p-4 bg-white/80 backdrop-blur-sm border-t border-slate-100">
        <div className="group relative bg-slate-50/50 hover:bg-white hover:shadow-lg hover:shadow-slate-100 hover:border-slate-100 border border-transparent rounded-[1.2rem] p-3 transition-all duration-300">
          <div className="flex items-center gap-3">
            <div className="relative">
                <div className="w-11 h-11 rounded-full bg-white border-2 border-white shadow-sm flex items-center justify-center shrink-0 text-slate-700 font-extrabold text-sm select-none group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                    {avatarInitial}
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800 truncate leading-tight" title={displayName}>
                {displayName}
              </p>
              <div className="mt-1 flex items-center">
                 <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider border ${roleBadgeStyle}`}>
                    {roleLabel}
                 </span>
              </div>
            </div>

            <button 
              onClick={handleLogout}
              className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all active:scale-90"
              title="Вийти з системи"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};