import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from '@tanstack/react-router';
import { useLogin } from '../api';
import { loginSchema, LoginCredentials } from '../types';

export const LoginPage = () => {
  const { mutate: login, isPending, error } = useLogin();
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm<LoginCredentials>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginCredentials) => {
    login(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 relative overflow-hidden">
      {/* Background Decor (Light) */}
      <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 rounded-full bg-blue-100/50 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-80 h-80 rounded-full bg-indigo-100/50 blur-3xl"></div>

      <div className="w-full max-w-[420px] relative z-10 animate-fade-in-up">
        
        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 md:p-10">
            
            {/* Header */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-200 mb-5 text-2xl text-white">
                    📚
                </div>
                <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight mb-1">
                    Вхід у систему
                </h1>
                <p className="text-slate-500 text-sm font-medium">Керування бібліотечним фондом</p>
            </div>

            {/* Error Message */}
            {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm flex items-start gap-3">
                <span className="text-lg">⚠️</span>
                <span className="font-medium mt-0.5">
                    {(error as any).response?.data?.message || 'Невірний логін або пароль'}
                </span>
            </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Email</label>
                    <div className="relative group">
                        <input
                            type="email"
                            {...register('email')}
                            className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white outline-none transition-all placeholder:text-slate-400 font-medium"
                            placeholder="admin@library.ua"
                        />
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors text-lg">✉️</span>
                    </div>
                    {errors.email && <p className="text-red-500 text-xs font-bold mt-1.5 ml-1">{errors.email.message}</p>}
                </div>

                <div>
                    <div className="flex justify-between items-center mb-1.5 ml-1">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Пароль</label>
                    </div>
                    <div className="relative group">
                        <input
                            type="password"
                            {...register('password')}
                            className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white outline-none transition-all placeholder:text-slate-400 font-medium"
                            placeholder="••••••••"
                        />
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors text-lg">🔑</span>
                    </div>
                    {errors.password && <p className="text-red-500 text-xs font-bold mt-1.5 ml-1">{errors.password.message}</p>}
                </div>

                <button
                    type="submit"
                    disabled={isPending}
                    className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-4 shadow-md shadow-blue-100"
                >
                    {isPending ? 'Перевірка...' : 'Увійти'}
                </button>
            </form>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                <p className="text-sm text-slate-500 font-medium">
                    Немає акаунту?{' '}
                    <Link 
                        to="/register" 
                        className="text-blue-600 hover:text-blue-800 font-bold hover:underline transition-all"
                    >
                        Створити
                    </Link>
                </p>
            </div>
        </div>
        
        <p className="text-center text-slate-400 text-xs font-medium mt-8">
             © 2026 Library System. All rights reserved.
        </p>
      </div>
    </div>
  );
};