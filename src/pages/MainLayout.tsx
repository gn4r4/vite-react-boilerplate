import { Outlet, useLocation } from '@tanstack/react-router';
import { Sidebar } from '../components/layout/Sidebar';

export const MainLayout = () => {
  const { pathname } = useLocation();

  // Список сторінок без меню
  const publicRoutes = ['/login', '/register', '/forgot-password'];
  const isPublicPage = publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'));

  // ВИПРАВЛЕННЯ:
  // Для сторінки логіну просто повертаємо Outlet без додаткових div-обгорток.
  // Нехай LoginPage сам вирішує, як йому виглядати (фон, центрування тощо).
  if (isPublicPage) {
    return <Outlet />;
  }

  // Для адмін-частини залишаємо макет з Sidebar
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 ml-64">
        <Outlet />
      </main>
    </div>
  );
};