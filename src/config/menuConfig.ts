import { Role } from '@/types';

export interface MenuItem {
  label: string;
  to: string;
  icon: string;
  desc?: string;
  color?: string;
  allowedRoles?: Role[]; // Якщо не вказано (undefined) - доступно всім
}

export interface MenuGroup {
  title: string;
  description?: string;
  items: MenuItem[];
}

export const MENU_CONFIG: MenuGroup[] = [
  // 1. Секція спеціально для Читача
  {
    title: 'Особистий кабінет',
    description: 'Ваш простір',
    items: [
      { 
        label: 'Мої книги', 
        to: '/my-books', // Не забудь створити цей роут або заглушку
        icon: '📚', 
        desc: 'Книги, які ви читаєте зараз', 
        color: 'bg-blue-50 text-blue-600', 
        allowedRoles: ['READER'] 
      },
      { 
        label: 'Історія', 
        to: '/history', 
        icon: '📜', 
        desc: 'Історія ваших запозичень', 
        color: 'bg-purple-50 text-purple-600', 
        allowedRoles: ['READER'] 
      },
      { 
        label: 'Обране', 
        to: '/favorites', 
        icon: '❤️', 
        desc: 'Збережені книги', 
        color: 'bg-red-50 text-red-600', 
        allowedRoles: ['READER'] 
      },
    ]
  },

  // 2. Каталог (Доступний всім: і Читачам, і Адмінам)
  {
    title: 'Каталог',
    description: 'Основні бібліотечні фонди та довідники',
    items: [
      { label: 'Книги', to: '/books', icon: '📖', desc: 'Загальний список творів', color: 'bg-blue-50 text-blue-600' }, // allowedRoles: undefined = всім
      { label: 'Видання', to: '/editions', icon: '📠', desc: 'Конкретні видання та тиражі', color: 'bg-indigo-50 text-indigo-600' },
      { label: 'Автори', to: '/authors', icon: '✍️', desc: 'База письменників', color: 'bg-violet-50 text-violet-600' },
      { label: 'Жанри', to: '/genres', icon: '🏷️', desc: 'Класифікація жанрів', color: 'bg-pink-50 text-pink-600' },
      { label: 'Категорії', to: '/categories', icon: '📂', desc: 'Рубрикатор літератури', color: 'bg-rose-50 text-rose-600' },
      { label: 'Видавці', to: '/publishers', icon: '🏢', desc: 'Партнери та видавництва', color: 'bg-orange-50 text-orange-600' },
    ]
  },

  // 3. Секції тільки для співробітників
  {
    title: 'Облік та зберігання',
    description: 'Фізичне розміщення та інвентаризація',
    items: [
      { label: 'Копії', to: '/copybooks', icon: '📑', desc: 'Інвентарні номери книг', color: 'bg-emerald-50 text-emerald-600', allowedRoles: ['ADMINISTRATOR', 'LIBRARIAN', 'RESTORER'] },
      { label: 'Локації', to: '/locations', icon: '📍', desc: 'Зали та приміщення', color: 'bg-teal-50 text-teal-600', allowedRoles: ['ADMINISTRATOR', 'RESTORER'] },
      { label: 'Полиці', to: '/shelves', icon: '🗃️', desc: 'Стелажі та полиці', color: 'bg-cyan-50 text-cyan-600', allowedRoles: ['ADMINISTRATOR', 'RESTORER'] },
      { label: 'Шафи', to: '/cabinets', icon: '🗄️', desc: 'Книжкові шафи', color: 'bg-sky-50 text-sky-600', allowedRoles: ['ADMINISTRATOR', 'RESTORER'] },
    ]
  },
  {
    title: 'Операції',
    description: 'Робота з читачами та закупівлі',
    items: [
      { label: 'Видача', to: '/lendings', icon: '🔄', desc: 'Журнал видачі та повернень', color: 'bg-amber-50 text-amber-600', allowedRoles: ['ADMINISTRATOR', 'LIBRARIAN'] },
      { label: 'Замовлення', to: '/orders', icon: '🛒', desc: 'Закупівля нової літератури', color: 'bg-yellow-50 text-yellow-600', allowedRoles: ['ADMINISTRATOR', 'LIBRARIAN'] },
      { label: 'Постачальники', to: '/suppliers', icon: '🚚', desc: 'Контрагенти та доставка', color: 'bg-lime-50 text-lime-600', allowedRoles: ['ADMINISTRATOR', 'LIBRARIAN'] },
    ]
  },
  {
    title: 'Адміністрування',
    description: 'Управління користувачами системи',
    items: [
      { label: 'Читачі', to: '/readers', icon: '👥', desc: 'Картотека відвідувачів', color: 'bg-fuchsia-50 text-fuchsia-600', allowedRoles: ['ADMINISTRATOR', 'LIBRARIAN'] },
      { label: 'Працівники', to: '/employees', icon: '💼', desc: 'Штат бібліотеки', color: 'bg-purple-50 text-purple-600', allowedRoles: ['ADMINISTRATOR'] },
      { label: 'Посади', to: '/positions', icon: '📛', desc: 'Штатний розклад', color: 'bg-slate-100 text-slate-600', allowedRoles: ['ADMINISTRATOR'] },
    ]
  }
];