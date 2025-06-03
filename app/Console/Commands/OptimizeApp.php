<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class OptimizeApp extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:optimize';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Optimize application for production performance';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Optimizing Budget Buddy application for better performance...');

        // Clear all caches first
        $this->call('cache:clear');
        $this->call('config:clear');
        $this->call('route:clear');
        $this->call('view:clear');
        
        // Generate optimized files
        $this->call('config:cache');
        $this->call('route:cache');
        $this->call('view:cache');
        $this->call('optimize');

        // Warm up commonly accessed routes
        $this->info('Warming up route cache...');
        
        $routes = [
            '/',
            '/login',
            '/dashboard',
            '/transactions',
            '/budgets',
            '/investments',
            '/reports',
        ];
        
        foreach ($routes as $route) {
            $url = config('app.url') . $route;
            $this->info("Warming: {$url}");
            try {
                file_get_contents($url);
            } catch (\Exception $e) {
                $this->warn("Could not warm {$url}: " . $e->getMessage());
            }
        }

        $this->info('✅ Application performance optimization completed!');
        $this->info('The application is now optimized for faster page navigation.');
    }
}