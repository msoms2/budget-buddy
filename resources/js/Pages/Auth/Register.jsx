import React, { useEffect } from 'react';
import InputError from '@/components/InputError';
import TextInput from '@/components/TextInput';
import ApplicationLogo from '@/components/ApplicationLogo';
import { Head, Link, useForm } from '@inertiajs/react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Register({ countries }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        country_id: '',
    });

    useEffect(() => {
        return () => {
            reset('password', 'password_confirmation');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
            <Head title="Register" />
            
            <div className="mb-4">
                <div className="flex items-center gap-2 justify-center font-medium">
                    <ApplicationLogo className="h-8 w-8" />
                    <span className="dark:text-white">Budget Buddy</span>
                </div>
            </div>
            
            <Card className="w-full max-w-md border dark:border-slate-700">
                <CardHeader className="text-center space-y-1">
                    <CardTitle className="text-xl font-medium">Create account</CardTitle>
                    <CardDescription>
                        Enter your information to create an account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={submit}>
                        <div className="grid gap-4">
                            <div className="grid gap-1">
                                <label htmlFor="name" className="text-sm font-medium leading-none dark:text-gray-200">
                                    Name
                                </label>
                                <TextInput
                                    id="name"
                                    name="name"
                                    value={data.name}
                                    placeholder="John Doe"
                                    className="h-9 w-full rounded-md border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                    autoComplete="name"
                                    isFocused={true}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                />
                                <InputError message={errors.name} className="mt-2" />
                            </div>

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
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                />
                                <InputError message={errors.email} className="mt-2" />
                            </div>

                            <div className="grid gap-1">
                                <label htmlFor="password" className="text-sm font-medium leading-none dark:text-gray-200">
                                    Password
                                </label>
                                <TextInput
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={data.password}
                                    className="h-9 w-full rounded-md border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                    autoComplete="new-password"
                                    onChange={(e) => setData('password', e.target.value)}
                                    required
                                />
                                <InputError message={errors.password} className="mt-2" />
                            </div>

                            <div className="grid gap-1">
                                <label htmlFor="password_confirmation" className="text-sm font-medium leading-none dark:text-gray-200">
                                    Confirm Password
                                </label>
                                <TextInput
                                    id="password_confirmation"
                                    type="password"
                                    name="password_confirmation"
                                    value={data.password_confirmation}
                                    className="h-9 w-full rounded-md border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                    autoComplete="new-password"
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    required
                                />
                                <InputError message={errors.password_confirmation} className="mt-2" />
                            </div>

                            <div className="grid gap-1">
                                <label htmlFor="country" className="text-sm font-medium leading-none dark:text-gray-200">
                                    Country
                                </label>
                                <Select
                                    value={data.country_id}
                                    onValueChange={(value) => setData('country_id', value)}
                                    required
                                >
                                    <SelectTrigger className="h-9 w-full dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                                        <SelectValue placeholder="Select your country" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {countries.map((country) => (
                                            <SelectItem key={country.id} value={country.id.toString()}>
                                                {country.name} ({country.currency?.code || 'N/A'})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.country_id} className="mt-2" />
                            </div>

                            <button 
                                type="submit" 
                                disabled={processing}
                                className="bg-black dark:bg-white text-white dark:text-black rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                            >
                                Register
                            </button>

                            <div className="text-center text-sm dark:text-gray-300">
                                Already have an account?{" "}
                                <Link 
                                    href={route('login')}
                                    className="text-black dark:text-white font-medium underline-offset-4 hover:underline"
                                >
                                    Log in
                                </Link>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <div className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400 max-w-md">
                By registering, you agree to our{" "}
                <a href="#" className="underline underline-offset-4 hover:text-black dark:hover:text-white">Terms of Service</a>{" "}
                and{" "}
                <a href="#" className="underline underline-offset-4 hover:text-black dark:hover:text-white">Privacy Policy</a>.
            </div>
        </div>
    );
}
