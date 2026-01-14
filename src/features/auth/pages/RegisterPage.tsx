import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from '@tanstack/react-router';
import { useRegister } from '../api';
import { registerSchema, RegisterCredentials } from '../types';

export const RegisterPage = () => {
  const { mutate: registerUser, isPending, error } = useRegister();
  const [isReaderMode, setIsReaderMode] = useState(false);

  const { 
    register, 
    handleSubmit, 
    setValue,
    formState: { errors } 
  } = useForm<RegisterCredentials>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      createReader: false
    }
  });

  useEffect(() => {
    setValue('createReader', isReaderMode);
  }, [isReaderMode, setValue]);

  const onSubmit = (data: RegisterCredentials) => {
    if (data.createReader && data.firstname && data.lastname) {
        data.name = `${data.lastname} ${data.firstname}`;
    }
    registerUser(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-5%] right-[-5%] w-[500px] h-[500px] rounded-full bg-emerald-50 blur-3xl opacity-60"></div>
      <div className="absolute bottom-[-5%] left-[-5%] w-[500px] h-[500px] rounded-full bg-blue-50 blur-3xl opacity-60"></div>

      <div className="w-full max-w-[550px] relative z-10 animate-fade-in-up">
        
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 md:p-10">
            
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg shadow-emerald-100 mb-4 text-2xl text-white transform -rotate-3">
                    📝
                </div>
                <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
                    Створити акаунт
                </h1>
                <p className="text-slate-500 text-sm font-medium mt-1">Приєднуйтесь до нашої спільноти</p>
            </div>

            {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm flex items-start gap-3">
                <span className="text-lg">⚠️</span>
                <div className="flex flex-col">
                    <span className="font-bold">Помилка валідації</span>
                    {(error as any).response?.data?.errorsValidation ? (
                        <ul className="list-disc list-inside mt-1 text-xs opacity-90">
                           {(error as any).response.data.errorsValidation.map((err: any, idx: number) => (
                               <li key={idx}>{Object.values(err)[0] as string}</li>
                           ))}
                        </ul>
                    ) : (
                        <span className="text-xs">{(error as any).response?.data?.message || 'Сталася помилка'}</span>
                    )}
                </div>
            </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            
            <div className="space-y-5">
                <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Логін (Нікнейм)</label>
                    <div className="relative group">
                        <input
                            type="text"
                            {...register('username')}
                            className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white outline-none transition-all placeholder:text-slate-400 font-medium"
                            placeholder="user123"
                        />
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">👤</span>
                    </div>
                    {errors.username && <p className="text-red-500 text-xs font-bold mt-1.5 ml-1">{errors.username.message}</p>}
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Email</label>
                    <div className="relative group">
                        <input
                            type="email"
                            {...register('email')}
                            className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white outline-none transition-all placeholder:text-slate-400 font-medium"
                            placeholder="reader@library.ua"
                        />
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">✉️</span>
                    </div>
                    {errors.email && <p className="text-red-500 text-xs font-bold mt-1.5 ml-1">{errors.email.message}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Пароль</label>
                        <div className="relative group">
                            <input
                                type="password"
                                {...register('password')}
                                className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white outline-none transition-all placeholder:text-slate-400 font-medium"
                                placeholder="••••••••"
                            />
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">🔑</span>
                        </div>
                        {errors.password && <p className="text-red-500 text-xs font-bold mt-1.5 ml-1">{errors.password.message}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Підтвердження</label>
                        <div className="relative group">
                            <input
                                type="password"
                                {...register('passwordConfirm')}
                                className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white outline-none transition-all placeholder:text-slate-400 font-medium"
                                placeholder="••••••••"
                            />
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">🔒</span>
                        </div>
                        {errors.passwordConfirm && <p className="text-red-500 text-xs font-bold mt-1.5 ml-1">{errors.passwordConfirm.message}</p>}
                    </div>
                </div>
            </div>

            {/* Feature Toggle */}
            <div className="pt-2">
                <label className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all border ${
                    isReaderMode 
                    ? 'bg-blue-50 border-blue-200 shadow-sm' 
                    : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                }`}>
                    <div className="relative flex items-center">
                        <input 
                            type="checkbox" 
                            className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-slate-300 transition-all checked:border-blue-600 checked:bg-blue-600"
                            checked={isReaderMode}
                            onChange={(e) => setIsReaderMode(e.target.checked)}
                        />
                        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        </span>
                    </div>
                    <div className="flex-1">
                        <span className={`block text-sm font-bold ${isReaderMode ? 'text-blue-700' : 'text-slate-700'}`}>Я хочу стати читачем</span>
                        <span className="block text-xs text-slate-500">Створити бібліотечну картку для доступу до книг</span>
                    </div>
                </label>
            </div>

            {/* Dynamic Content */}
            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isReaderMode ? 'max-h-[500px] opacity-100 mt-4' : 'max-h-24 opacity-100 mt-2'}`}>
                {isReaderMode ? (
                    <div className="space-y-4 p-5 bg-slate-50 rounded-2xl border border-slate-200">
                        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-200">
                            <span className="text-lg">🆔</span>
                            <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Персональні дані</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1 ml-1">Ім'я <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    {...register('firstname')}
                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none text-sm font-medium transition-all"
                                    placeholder="Іван"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1 ml-1">Прізвище <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    {...register('lastname')}
                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none text-sm font-medium transition-all"
                                    placeholder="Іванов"
                                />
                            </div>
                        </div>
                        {(errors.firstname || errors.lastname) && (
                            <p className="text-red-500 text-xs font-bold">Заповніть ім'я та прізвище для картки</p>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1 ml-1">По-батькові</label>
                                <input
                                    type="text"
                                    {...register('patronymic')}
                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none text-sm font-medium transition-all"
                                    placeholder="Іванович"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1 ml-1">Телефон</label>
                                <input
                                    type="text"
                                    {...register('contact')}
                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none text-sm font-medium transition-all"
                                    placeholder="+380..."
                                />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Як до вас звертатися?</label>
                        <div className="relative group">
                            <input
                                type="text"
                                {...register('name')}
                                className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white outline-none transition-all placeholder:text-slate-400 font-medium"
                                placeholder="Ім'я (опціонально)"
                            />
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">🙂</span>
                        </div>
                    </div>
                )}
            </div>

            <button
                type="submit"
                disabled={isPending}
                className="w-full bg-emerald-600 text-white font-bold py-3.5 rounded-xl hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-200 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-4 shadow-md shadow-emerald-100"
            >
                {isPending ? 'Реєстрація...' : 'Зареєструватися'}
            </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                <p className="text-sm text-slate-500 font-medium">
                    Вже маєте акаунт?{' '}
                    <Link to="/login" className="text-blue-600 hover:text-blue-800 font-bold hover:underline transition-all">
                        Увійти тут
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