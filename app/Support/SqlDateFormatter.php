<?php

namespace App\Support;

use Illuminate\Support\Facades\DB;

class SqlDateFormatter
{
    /**
     * Return a SQL expression that formats $column as YYYY-MM across SQLite, PostgreSQL, and MySQL.
     */
    public static function yearMonth(string $column = 'date'): string
    {
        return match (DB::connection()->getDriverName()) {
            'pgsql' => "TO_CHAR({$column}, 'YYYY-MM')",
            'sqlite' => "strftime('%Y-%m', {$column})",
            default => "DATE_FORMAT({$column}, '%Y-%m')",
        };
    }

    /**
     * Return a SQL expression that formats $column as YYYY-WW across SQLite, PostgreSQL, and MySQL.
     */
    public static function yearWeek(string $column = 'date'): string
    {
        return match (DB::connection()->getDriverName()) {
            'pgsql' => "TO_CHAR({$column}, 'IYYY-IW')",
            'sqlite' => "strftime('%Y-%W', {$column})",
            default => "DATE_FORMAT({$column}, '%Y-%u')",
        };
    }

    /**
     * Return a SQL expression that formats $column as YYYY-MM-DD across SQLite, PostgreSQL, and MySQL.
     */
    public static function yearMonthDay(string $column = 'date'): string
    {
        return match (DB::connection()->getDriverName()) {
            'pgsql' => "TO_CHAR({$column}, 'YYYY-MM-DD')",
            default => "DATE({$column})",
        };
    }
}
