import { Head, Link, useForm } from '@inertiajs/react';
import ApplicationLogo from '@/components/ApplicationLogo';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();

        post(route('verification.send'));
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
            <Head title="Email Verification" />
            
            <div className="mb-4">
                <div className="flex items-center gap-2 justify-center font-medium">
                    <ApplicationLogo className="h-8 w-8" />
                    <span className="dark:text-white">Budget Buddy</span>
                </div>
            </div>
            
            <Card className="w-full max-w-md border dark:border-slate-700">
                <CardHeader className="text-center space-y-1">
                    <CardTitle className="text-xl font-medium">Verify email address</CardTitle>
                    <CardDescription>
                        Complete your account setup by verifying your email
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mb-4 text-sm text-gray-600 dark:text-gray-400 bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                        Thanks for signing up! Before getting started, could you verify
                        your email address by clicking on the link we just emailed to
                        you? If you didn't receive the email, we will gladly send you
                        another.
                    </div>

                    {status === 'verification-link-sent' && (
                        <div className="mb-4 text-sm font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                            A new verification link has been sent to the email address
                            you provided during registration.
                        </div>
                    )}

                    <form onSubmit={submit}>
                        <div className="grid gap-4">
                            <div className="flex items-center justify-between">
                                <button 
                                    type="submit" 
                                    disabled={processing}
                                    className="bg-black dark:bg-white text-white dark:text-black rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                                >
                                    Resend Verification Email
                                </button>

                                <Link
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                    className="text-sm text-gray-600 dark:text-gray-400 underline-offset-4 hover:underline"
                                >
                                    Log Out
                                </Link>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <div className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400 max-w-md">
                By continuing, you agree to our{" "}
                <a href="#" className="underline underline-offset-4 hover:text-black dark:hover:text-white">Terms of Service</a>{" "}
                and{" "}
                <a href="#" className="underline underline-offset-4 hover:text-black dark:hover:text-white">Privacy Policy</a>.
            </div>
        </div>
    );
}
