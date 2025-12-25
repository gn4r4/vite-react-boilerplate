import { Link } from '@tanstack/react-router';

// Конфігурація розділів для швидкого доступу
const sections = [
  {
    title: '📚 Бібліотечний каталог',
    items: [
      { label: 'Книги', to: '/books', description: 'Управління книгами', color: 'bg-blue-100 text-blue-700' },
      { label: 'Видання', to: '/editions', description: 'Конкретні видання книг', color: 'bg-blue-50 text-blue-600' },
      { label: 'Автори', to: '/authors', description: 'База авторів', color: 'bg-indigo-100 text-indigo-700' },
      { label: 'Жанри', to: '/genres', description: 'Довідник жанрів', color: 'bg-indigo-50 text-indigo-600' },
      { label: 'Категорії', to: '/categories', description: 'Категорії літератури', color: 'bg-indigo-50 text-indigo-600' },
      { label: 'Видавці', to: '/publishers', description: 'Партнери-видавництва', color: 'bg-indigo-50 text-indigo-600' },
    ]
  },
  {
    title: '📦 Облік та Зберігання',
    items: [
      { label: 'Примірники (Копії)', to: '/copybooks', description: 'Фізичні екземпляри', color: 'bg-green-100 text-green-700' },
      { label: 'Локації (Місця)', to: '/locations', description: 'Розміщення книг', color: 'bg-teal-100 text-teal-700' },
      { label: 'Полиці', to: '/shelves', description: 'Управління полицями', color: 'bg-teal-50 text-teal-600' },
      { label: 'Шафи', to: '/cabinets', description: 'Управління шафами', color: 'bg-teal-50 text-teal-600' },
    ]
  },
  {
    title: '🔄 Операції',
    items: [
      { label: 'Видача книг', to: '/lendings', description: 'Видача та повернення', color: 'bg-red-100 text-red-700' },
      { label: 'Замовлення', to: '/orders', description: 'Закупівля літератури', color: 'bg-purple-100 text-purple-700' },
      { label: 'Постачальники', to: '/suppliers', description: 'База постачальників', color: 'bg-purple-50 text-purple-600' },
    ]
  },
  {
    title: '👥 Користувачі та Персонал',
    items: [
      { label: 'Читачі', to: '/readers', description: 'База читачів', color: 'bg-yellow-100 text-yellow-700' },
      { label: 'Працівники', to: '/employees', description: 'Персонал бібліотеки', color: 'bg-orange-100 text-orange-700' },
      { label: 'Посади', to: '/positions', description: 'Довідник посад', color: 'bg-orange-50 text-orange-600' },
    ]
  }
];

export const DashboardPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900">Бібліотечна Система</h1>
          <p className="text-gray-600 mt-2 text-lg">Панель адміністратора для швидкого доступу до ресурсів.</p>
        </div>
        
        <div className="space-y-12">
          {sections.map((section) => (
            <div key={section.title} className="animate-fade-in">
              <h2 className="text-xl font-bold text-gray-800 mb-5 border-b border-gray-200 pb-2 flex items-center gap-2">
                {section.title}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {section.items.map((item) => (
                  <Link 
                    key={item.to} 
                    to={item.to}
                    className="block group h-full"
                  >
                    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-6 border border-gray-100 h-full flex flex-col justify-between group-hover:-translate-y-1 group-hover:border-blue-200">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${item.color} text-xl font-bold shadow-sm`}>
                          {item.label.charAt(0)}
                        </div>
                        <span className="text-gray-300 group-hover:text-blue-500 transition-colors text-xl">↗</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                          {item.label}
                        </h3>
                        <p className="text-sm text-gray-500 mt-2 font-medium">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};