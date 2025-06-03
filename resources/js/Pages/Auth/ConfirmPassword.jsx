import InputError from '@/components/InputError';
import TextInput from '@/components/TextInput';
import ApplicationLogo from '@/components/ApplicationLogo';
import { Head, useForm } from '@inertiajs/react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.confirm'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
            <Head title="Confirm Password" />
            
            <div className="mb-4">
                <div className="flex items-center gap-2 justify-center font-medium">
                    <ApplicationLogo className="h-8 w-8" />
                    <span className="dark:text-white">Budget Buddy</span>
                </div>
            </div>
            
            <Card className="w-full max-w-md border dark:border-slate-700">
                <CardHeader className="text-center space-y-1">
                    <CardTitle className="text-xl font-medium">Security check</CardTitle>
                    <CardDescription>
                        Please confirm your password to continue
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mb-4 text-sm text-gray-600 dark:text-gray-400 bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                        This is a secure area of the application. Please confirm your
                        password before continuing.
                    </div>

                    <form onSubmit={submit}>
                        <div className="grid gap-4">
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
                                    autoComplete="current-password"
                                    isFocused={true}
                                    onChange={(e) => setData('password', e.target.value)}
                                    required
                                />
                                <InputError message={errors.password} className="mt-2" />
                            </div>

                            <button 
                                type="submit" 
                                disabled={processing}
                                className="bg-black dark:bg-white text-white dark:text-black rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                            >
                                Confirm
                            </button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
