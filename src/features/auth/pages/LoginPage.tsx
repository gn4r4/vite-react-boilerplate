import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
    <div className="flex min-h-screen items-center justify-center bg-slate-50 font-sans p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
        
        {/* Логотип по центру */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-blue-200 mb-4 text-white">
            📚
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Library App</h1>
          <p className="text-slate-500 text-sm mt-1">Увійдіть для доступу до панелі</p>
        </div>
        
        {/* Відображення помилки */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm flex items-start gap-2 animate-pulse">
            <span>⚠️</span>
            <span>{(error as any).response?.data?.message || 'Невірний логін або пароль'}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Email</label>
            <input
              type="email"
              {...register('email')}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all placeholder:text-slate-400"
              placeholder="admin@library.ua"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1 ml-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Пароль</label>
            <input
              type="password"
              {...register('password')}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all placeholder:text-slate-400"
              placeholder="••••••••"
            />
            {errors.password && <p className="text-red-500 text-xs mt-1 ml-1">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-blue-600 text-white font-semibold py-3.5 rounded-xl hover:bg-blue-700 active:scale-[0.98] transition-all shadow-lg shadow-blue-200 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
          >
            {isPending ? 'Перевірка даних...' : 'Увійти в систему'}
          </button>
        </form>

        <div className="mt-8 text-center">
           <p className="text-xs text-slate-400">
             Забули пароль? Зверніться до адміністратора.
           </p>
        </div>
      </div>
    </div>
  );
};