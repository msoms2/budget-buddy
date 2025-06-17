import React from 'react';
import { Link, Head } from '@inertiajs/react';
import ApplicationLogo from '@/components/ApplicationLogo';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/components/theme/theme-provider";
import { 
  CreditCardIcon, 
  ChartPieIcon, 
  TargetIcon, 
  ArrowRightIcon, 
  CheckCircleIcon,
  LineChartIcon,
  LayoutDashboardIcon,
  WalletIcon,
  MoonIcon,
  SunIcon
} from "lucide-react";

export default function Welcome({ auth }) {
  const { theme, setTheme } = useTheme();
  
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <>
      <Head title="Budget Buddy - Financial Management System" />
      <div className="min-h-screen bg-background">
        {/* Header/Navigation */}
        <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              {/* Logo and App Name */}
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ApplicationLogo className="h-8 w-8 fill-current text-primary" />
                </div>
                <div className="ml-2 text-xl font-bold text-foreground">
                  Budget Buddy
                </div>
              </div>
              
              {/* Navigation Links */}
              <div className="flex items-center gap-4">
                <button 
                  onClick={toggleTheme}
                  className="p-2 rounded-md text-muted-foreground hover:text-foreground"
                >
                  {theme === 'dark' ? (
                    <SunIcon className="h-5 w-5" />
                  ) : (
                    <MoonIcon className="h-5 w-5" />
                  )}
                </button>
                
                {auth.user ? (
                  <Button asChild>
                    <Link href={route('dashboard')} className="flex items-center gap-2">
                      <LayoutDashboardIcon className="h-4 w-4" />
                      Dashboard
                    </Link>
                  </Button>
                ) : (
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" asChild>
                      <Link href={route('login')}>Log in</Link>
                    </Button>
                    <Button asChild>
                      <Link href={route('register')}>Register</Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <section className="py-12 md:py-20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="flex flex-col gap-6">
                <div>
                  <Badge variant="outline" className="mb-4 px-3 py-1 text-sm">
                    <CheckCircleIcon className="h-3 w-3 mr-1" /> 
                    Trusted by thousands
                  </Badge>
                  <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
                    Take control of your <span className="text-primary">finances</span> today
                  </h1>
                  <p className="mt-6 text-xl text-muted-foreground">
                    Budget Buddy helps you track expenses, visualize spending patterns, and reach your financial goals faster.
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  {auth.user ? (
                    <Button size="lg" asChild>
                      <Link href={route('dashboard')} className="flex items-center gap-2">
                        Go to Dashboard
                        <ArrowRightIcon className="h-4 w-4" />
                      </Link>
                    </Button>
                  ) : (
                    <>
                      <Button size="lg" asChild>
                        <Link href={route('register')} className="flex items-center gap-2">
                          Get Started
                          <ArrowRightIcon className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button size="lg" variant="outline" asChild>
                        <Link href={route('login')}>Log in</Link>
                      </Button>
                    </>
                  )}
                </div>
                
                <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircleIcon className="h-4 w-4 text-primary" />
                  <span>No credit card required</span>
                </div>
              </div>
              
              <div className="hidden md:flex justify-end">
                <div className="relative">
                  <div className="absolute -top-6 -left-6 bg-primary/10 rounded-full w-64 h-64 blur-2xl"></div>
                  <div className="absolute -bottom-10 -right-10 bg-primary/10 rounded-full w-80 h-80 blur-3xl"></div>
                  <div className="relative w-full h-full">
                    <ApplicationLogo className="h-72 w-72 fill-current text-primary" />
                  </div>
                </div>
              </div>
            </div>
          </section>
          
          {/* Features Section */}
          <section className="py-12" id="features">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">Smart Financial Features</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Everything you need to manage your personal finances effectively and reach your financial goals.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="overflow-hidden border border-border">
                <CardHeader className="pb-3">
                  <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                    <CreditCardIcon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Track Expenses</CardTitle>
                  <CardDescription className="text-muted-foreground mt-2">
                    Easily monitor your spending habits and categorize expenses for better financial awareness
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircleIcon className="h-4 w-4 text-primary" />
                      <span>Automatic categorization</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircleIcon className="h-4 w-4 text-primary" />
                      <span>Recurring expense tracking</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircleIcon className="h-4 w-4 text-primary" />
                      <span>Receipt scanning</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card className="overflow-hidden border border-border">
                <CardHeader className="pb-3">
                  <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                    <ChartPieIcon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Visualize Data</CardTitle>
                  <CardDescription className="text-muted-foreground mt-2">
                    See where your money goes with intuitive charts and reports to guide financial decisions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircleIcon className="h-4 w-4 text-primary" />
                      <span>Spending breakdowns</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircleIcon className="h-4 w-4 text-primary" />
                      <span>Income vs. expense analysis</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircleIcon className="h-4 w-4 text-primary" />
                      <span>Trend identification</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card className="overflow-hidden border border-border">
                <CardHeader className="pb-3">
                  <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                    <TargetIcon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Set Budget Goals</CardTitle>
                  <CardDescription className="text-muted-foreground mt-2">
                    Create personalized budget targets and receive notifications to stay on track financially
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircleIcon className="h-4 w-4 text-primary" />
                      <span>Custom budget creation</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircleIcon className="h-4 w-4 text-primary" />
                      <span>Progress tracking</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircleIcon className="h-4 w-4 text-primary" />
                      <span>Smart alerts and notifications</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section>
          
          {/* Call to Action */}
          <section className="py-16">
            <Card className="bg-card border-none">
              <CardContent className="p-8">
                <div className="flex flex-col items-center text-center">
                  <WalletIcon className="h-12 w-12 text-primary mb-6" />
                  <h2 className="text-3xl font-bold text-foreground mb-4">Ready to manage your finances better?</h2>
                  <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
                    Join thousands of users who have taken control of their financial future with Budget Buddy.
                    Start for free - no credit card required.
                  </p>
                  {auth.user ? (
                    <Button size="lg" asChild>
                      <Link href={route('dashboard')} className="flex items-center gap-2">
                        <LayoutDashboardIcon className="h-4 w-4" />
                        Go to Dashboard
                      </Link>
                    </Button>
                  ) : (
                    <Button size="lg" asChild>
                      <Link href={route('register')} className="flex items-center gap-2">
                        Get Started for Free
                        <ArrowRightIcon className="h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
        
        {/* Footer */}
        <footer className="border-t border-border bg-card">
          <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="md:flex md:items-center md:justify-between">
              <div className="flex items-center">
                <ApplicationLogo className="h-6 w-6 fill-current text-primary" />
                <span className="ml-2 text-sm font-medium text-foreground">Budget Buddy</span>
              </div>
              <div className="mt-4 md:mt-0">
                <p className="text-sm text-muted-foreground">
                  © {new Date().getFullYear()} Budget Buddy. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}