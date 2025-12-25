import { Link, useLocation } from '@tanstack/react-router';

const menuGroups = [
  {
    title: 'Каталог',
    items: [
      { label: 'Книги', to: '/books' },
      { label: 'Видання', to: '/editions' },
      { label: 'Автори', to: '/authors' },
      { label: 'Жанри', to: '/genres' },
      { label: 'Категорії', to: '/categories' },
      { label: 'Видавці', to: '/publishers' },
    ]
  },
  {
    title: 'Облік',
    items: [
      { label: 'Копії', to: '/copybooks' },
      { label: 'Локації', to: '/locations' },
      { label: 'Полиці', to: '/shelves' },
      { label: 'Шафи', to: '/cabinets' },
    ]
  },
  {
    title: 'Операції',
    items: [
      { label: 'Видача', to: '/lendings' },
      { label: 'Замовлення', to: '/orders' },
      { label: 'Постачальники', to: '/suppliers' },
    ]
  },
  {
    title: 'Люди',
    items: [
      { label: 'Читачі', to: '/readers' },
      { label: 'Працівники', to: '/employees' },
      { label: 'Посади', to: '/positions' },
    ]
  }
];

export const Sidebar = () => {
  const { pathname } = useLocation();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col fixed left-0 top-0 bottom-0 overflow-y-auto">
      <div className="p-6 border-b border-gray-100">
        <Link to="/" className="text-xl font-bold text-blue-600 flex items-center gap-2">
          <span>📚 LibraryApp</span>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-6">
        {menuGroups.map((group) => (
          <div key={group.title}>
            <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              {group.title}
            </h3>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname.startsWith(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <div className="text-xs text-gray-400 text-center">
          © 2025 Library System
        </div>
      </div>
    </aside>
  );
};