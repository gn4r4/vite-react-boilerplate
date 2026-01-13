import { Outlet, useLocation } from '@tanstack/react-router';
import { Sidebar } from '../components/layout/Sidebar';

export const MainLayout = () => {
  const { pathname } = useLocation();

  const publicRoutes = ['/login', '/register', '/forgot-password'];
  const isPublicPage = publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'));

  if (isPublicPage) {
    return <Outlet />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      <Sidebar />
      <main className="flex-1 ml-72 p-8 lg:p-10 transition-all duration-300 ease-in-out">
        <div className="max-w-[1600px] mx-auto w-full animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
};