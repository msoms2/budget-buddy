import React, { useState } from 'react';
import { useEffect } from 'react';
import InputError from '@/components/InputError';
import TextInput from '@/components/TextInput';
import Checkbox from '@/components/Checkbox';
import ApplicationLogo from '@/components/ApplicationLogo';
import { Head, Link, useForm } from '@inertiajs/react';
import { Eye, EyeOff } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function Login({ status, canResetPassword }) {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onSuccess: () => {
                window.location.href = route('dashboard');
            }
        });
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
            <Head title="Log in" />
            
            <div className="mb-4">
                <div className="flex items-center gap-2 justify-center font-medium">
                    <ApplicationLogo className="h-8 w-8" />
                    <span className="dark:text-white">Budget Buddy</span>
                </div>
            </div>
            
            <Card className="w-full max-w-md border dark:border-slate-700">
                <CardHeader className="text-center space-y-1">
                    <CardTitle className="text-xl font-medium">Welcome back</CardTitle>
                    <CardDescription>
                        Login with your Apple or Google account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {status && (
                        <div className="mb-4 text-sm font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                            {status}
                        </div>
                    )}

                    <div className="grid gap-6">
                        <div className="flex flex-col gap-4">
                            <button type="button" className="w-full flex items-center justify-center gap-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-md px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700">
                                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                    <path
                                        d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
                                        fill="currentColor" />
                                </svg>
                                Login with Apple
                            </button>
                            <button type="button" className="w-full flex items-center justify-center gap-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-md px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700">
                                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                    <path
                                        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                                        fill="currentColor" />
                                </svg>
                                Login with Google
                            </button>
                        </div>

                        <div className="relative text-center text-sm">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-gray-300 dark:border-slate-700"></span>
                            </div>
                            <div className="relative flex justify-center">
                                <span className="bg-white dark:bg-card px-2 text-sm text-gray-500 dark:text-gray-400">
                                    Or continue with
                                </span>
                            </div>
                        </div>

                        <form onSubmit={submit}>
                            {/* CSRF token is handled automatically by Inertia.js */}
                            <div className="grid gap-4">
                                <div className="grid gap-1">
                                    <label htmlFor="email" className="text-sm font-medium leading-none dark:text-gray-200">
                                        Email
                                    </label>
                                    <TextInput
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        placeholder="m@example.com"
                                        className="h-9 w-full rounded-md border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                        autoComplete="username"
                                        isFocused={true}
                                        onChange={(e) => setData('email', e.target.value)}
                                    />
                                    <InputError message={errors.email} className="mt-2" />
                                </div>

                                <div className="grid gap-1">
                                    <div className="flex items-center justify-between">
                                        <label htmlFor="password" className="text-sm font-medium leading-none dark:text-gray-200">
                                            Password
                                        </label>
                                        {canResetPassword && (
                                            <Link
                                                href={route('password.request')}
                                                className="text-sm text-gray-600 dark:text-gray-400 underline-offset-4 hover:underline"
                                            >
                                                Forgot your password?
                                            </Link>
                                        )}
                                    </div>
                                    <div className="relative">
                                        <TextInput
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            value={data.password}
                                            className="h-9 w-full rounded-md border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white pr-10"
                                            autoComplete="current-password"
                                            onChange={(e) => setData('password', e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                    <InputError message={errors.password} className="mt-2" />
                                </div>

                                <div className="flex items-center">
                                    <Checkbox
                                        id="remember"
                                        name="remember"
                                        checked={data.remember}
                                        onChange={(e) => setData('remember', e.target.checked)}
                                        className="h-4 w-4 text-black dark:text-white focus:ring-black dark:focus:ring-white border-gray-300 dark:border-slate-600 rounded"
                                    />
                                    <label htmlFor="remember" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                                        Remember me
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-black dark:bg-white text-white dark:text-black rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                                >
                                    Login
                                </button>

                                <div className="text-center text-sm dark:text-gray-300">
                                    Don't have an account?{" "}
                                    <Link 
                                        href={route('register')}
                                        className="text-black dark:text-white font-medium underline-offset-4 hover:underline"
                                    >
                                        Sign up
                                    </Link>
                                </div>
                            </div>
                        </form>
                    </div>
                </CardContent>
            </Card>

            <div className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400 max-w-md">
                By clicking continue, you agree to our{" "}
                <a href="#" className="underline underline-offset-4 hover:text-black dark:hover:text-white">Terms of Service</a>{" "}
                and{" "}
                <a href="#" className="underline underline-offset-4 hover:text-black dark:hover:text-white">Privacy Policy</a>.
            </div>
        </div>
    );
}
