<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\QueryException;

class TestDatabaseConnection extends Command
{
    protected $signature = 'db:test-connection';
    protected $description = 'Test database connection and log diagnostic information';

    public function handle()
    {
        $this->info('Testing database connection...');
        
        // Log current configuration
        $config = config('database.connections.mysql');
        $this->info('Database Configuration:');
        $this->info("Host: {$config['host']}");
        $this->info("Port: {$config['port']}");
        $this->info("Database: {$config['database']}");
        $this->info("Username: {$config['username']}");
        $this->info("Password: " . (empty($config['password']) ? '(empty)' : '(set)'));
        
        try {
            // Test basic connection
            DB::connection()->getPdo();
            $this->info('✅ Database connection successful!');
            
            // Test a simple query
            $result = DB::select('SELECT 1 as test');
            $this->info('✅ Simple query test successful!');
            
            // Test users table access
            $userCount = DB::table('users')->count();
            $this->info("✅ Users table accessible. Count: {$userCount}");
            
        } catch (QueryException $e) {
            $this->error('❌ Database query error:');
            $this->error("Error Code: {$e->getCode()}");
            $this->error("Error Message: {$e->getMessage()}");
            
            // Log additional connection details
            $this->error('Connection details:');
            $this->error("Driver: " . $e->getConnectionName());
            
        } catch (\Exception $e) {
            $this->error('❌ General database connection error:');
            $this->error("Error: {$e->getMessage()}");
            $this->error("File: {$e->getFile()}:{$e->getLine()}");
        }
        
        // Additional network diagnostics
        $this->info("\nNetwork Diagnostics:");
        $host = $config['host'];
        $port = $config['port'];
        
        // Test if port is open
        $connection = @fsockopen($host, $port, $errno, $errstr, 5);
        if ($connection) {
            $this->info("✅ Port {$port} is open on {$host}");
            fclose($connection);
        } else {
            $this->error("❌ Cannot connect to {$host}:{$port}");
            $this->error("Error: {$errstr} (Code: {$errno})");
        }
        
        return 0;
    }
}