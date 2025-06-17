import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  ArrowUpRight,
  BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "@inertiajs/react";

/**
 * StatCard Component
 * 
 * Dashboard statistics card with:
 * - Main value display
 * - Trend indicators
 * - Progress bars
 * - Action buttons
 * - Customizable themes
 * - Loading states
 * 
 * @param {Object} props
 * @param {string} props.title - Card title
 * @param {string|number} props.value - Main value to display
 * @param {string} props.description - Card description
 * @param {React.ReactNode} props.icon - Icon component
 * @param {Object} props.trend - Trend data {value, direction, label}
 * @param {Object} props.progress - Progress data {value, max, label}
 * @param {Array} props.actions - Action buttons
 * @param {string} props.theme - Color theme
 * @param {boolean} props.loading - Loading state
 * @param {string} props.format - Value format type
 * @param {string} props.suffix - Value suffix
 * @param {string} props.prefix - Value prefix
 * @param {React.ReactNode} props.footer - Custom footer content
 * @param {string} props.className - Additional CSS classes
 * @param {Function} props.onClick - Card click handler
 * @param {string} props.href - Link URL
 * @param {boolean} props.hoverable - Enable hover effects
 */
export default function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  progress,
  actions = [],
  theme = 'blue',
  loading = false,
  format = 'number',
  suffix = '',
  prefix = '',
  footer,
  className = "",
  onClick,
  href,
  hoverable = true
}) {
  // Theme configurations
  const themes = {
    blue: {
      gradient: "from-blue-50/80 via-indigo-50/60 to-purple-50/40 dark:from-blue-950/30 dark:via-indigo-950/20 dark:to-purple-950/10",
      accent: "from-blue-100/50 to-transparent dark:from-blue-900/20",
      iconBg: "from-blue-500 to-blue-600",
      textColor: "text-blue-900 dark:text-blue-100",
      descColor: "text-blue-700 dark:text-blue-300",
      indicatorColor: "bg-blue-500",
      progressBg: "bg-blue-100 dark:bg-blue-900/30"
    },
    emerald: {
      gradient: "from-emerald-50/80 via-green-50/60 to-teal-50/40 dark:from-emerald-950/30 dark:via-green-950/20 dark:to-teal-950/10",
      accent: "from-emerald-100/50 to-transparent dark:from-emerald-900/20",
      iconBg: "from-emerald-500 to-emerald-600",
      textColor: "text-emerald-900 dark:text-emerald-100",
      descColor: "text-emerald-700 dark:text-emerald-300",
      indicatorColor: "bg-emerald-500",
      progressBg: "bg-emerald-100 dark:bg-emerald-900/30"
    },
    rose: {
      gradient: "from-rose-50/80 via-pink-50/60 to-red-50/40 dark:from-rose-950/30 dark:via-pink-950/20 dark:to-red-950/10",
      accent: "from-rose-100/50 to-transparent dark:from-rose-900/20",
      iconBg: "from-rose-500 to-rose-600",
      textColor: "text-rose-900 dark:text-rose-100",
      descColor: "text-rose-700 dark:text-rose-300",
      indicatorColor: "bg-rose-500",
      progressBg: "bg-rose-100 dark:bg-rose-900/30"
    },
    violet: {
      gradient: "from-violet-50/80 via-purple-50/60 to-indigo-50/40 dark:from-violet-950/30 dark:via-purple-950/20 dark:to-indigo-950/10",
      accent: "from-violet-100/50 to-transparent dark:from-violet-900/20",
      iconBg: "from-violet-500 to-violet-600",
      textColor: "text-violet-900 dark:text-violet-100",
      descColor: "text-violet-700 dark:text-violet-300",
      indicatorColor: "bg-violet-500",
      progressBg: "bg-violet-100 dark:bg-violet-900/30"
    },
    amber: {
      gradient: "from-amber-50/80 via-orange-50/60 to-yellow-50/40 dark:from-amber-950/30 dark:via-orange-950/20 dark:to-yellow-950/10",
      accent: "from-amber-100/50 to-transparent dark:from-amber-900/20",
      iconBg: "from-amber-500 to-orange-500",
      textColor: "text-amber-900 dark:text-amber-100",
      descColor: "text-amber-700 dark:text-amber-300",
      indicatorColor: "bg-amber-500",
      progressBg: "bg-amber-100 dark:bg-amber-900/30"
    },
    gray: {
      gradient: "from-slate-50/80 via-gray-50/60 to-zinc-50/40 dark:from-slate-950/30 dark:via-gray-950/20 dark:to-zinc-950/10",
      accent: "from-slate-100/50 to-transparent dark:from-slate-900/20",
      iconBg: "from-slate-500 to-slate-600",
      textColor: "text-slate-900 dark:text-slate-100",
      descColor: "text-slate-700 dark:text-slate-300",
      indicatorColor: "bg-slate-500",
      progressBg: "bg-slate-100 dark:bg-slate-900/30"
    }
  };

  const currentTheme = themes[theme] || themes.blue;

  // Format value based on type
  const formatValue = (val) => {
    if (loading) return "...";
    if (val === null || val === undefined) return "N/A";

    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(val);
      case 'percentage':
        return `${val}%`;
      case 'number':
      default:
        return typeof val === 'number' ? val.toLocaleString() : val;
    }
  };

  // Trend icon
  const TrendIcon = trend?.direction === 'up' ? TrendingUp :
                   trend?.direction === 'down' ? TrendingDown : Minus;

  // Card content
  const cardContent = (
    <Card 
      className={cn(
        "group relative overflow-hidden border-0 shadow-lg transition-all duration-300",
        hoverable && "hover:shadow-xl hover:-translate-y-1",
        onClick || href ? "cursor-pointer" : "",
        className
      )}
      onClick={onClick}
    >
      {/* Background gradients */}
      <div className={`absolute inset-0 bg-gradient-to-br ${currentTheme.gradient}`} />
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${currentTheme.accent} rounded-bl-full`} />
      
      <CardHeader className="relative pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            {/* Title with indicator */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 ${currentTheme.indicatorColor} rounded-full animate-pulse`} />
              <CardTitle className={`${currentTheme.descColor} font-semibold text-xs uppercase tracking-wider`}>
                {title}
              </CardTitle>
            </div>
            
            {/* Main value */}
            <div className={`text-4xl font-bold tabular-nums ${currentTheme.textColor} leading-none`}>
              {loading ? (
                <div className="h-10 bg-muted rounded animate-pulse" />
              ) : (
                `${prefix}${formatValue(value)}${suffix}`
              )}
            </div>
            
            {/* Trend indicator */}
            {trend && !loading && (
              <div className="flex items-center gap-2 pt-1">
                <div className={cn(
                  "flex items-center gap-1 px-2.5 py-1 rounded-full",
                  trend.direction === 'up' && "bg-green-100 dark:bg-green-900/30",
                  trend.direction === 'down' && "bg-red-100 dark:bg-red-900/30",
                  trend.direction === 'neutral' && "bg-gray-100 dark:bg-gray-900/30"
                )}>
                  <TrendIcon className={cn(
                    "h-3.5 w-3.5",
                    trend.direction === 'up' && "text-green-600",
                    trend.direction === 'down' && "text-red-600",
                    trend.direction === 'neutral' && "text-gray-600"
                  )} />
                  <span className={cn(
                    "text-xs font-bold",
                    trend.direction === 'up' && "text-green-700 dark:text-green-300",
                    trend.direction === 'down' && "text-red-700 dark:text-red-300",
                    trend.direction === 'neutral' && "text-gray-700 dark:text-gray-300"
                  )}>
                    {trend.value}
                  </span>
                </div>
                {trend.label && (
                  <span className="text-xs text-muted-foreground font-medium">
                    {trend.label}
                  </span>
                )}
              </div>
            )}
          </div>
          
          {/* Icon */}
          {Icon && (
            <div className="relative flex-shrink-0">
              <div className={`absolute inset-0 ${currentTheme.iconBg.split(' ')[1]} rounded-2xl blur-sm opacity-20 group-hover:opacity-40 transition-opacity duration-300`} />
              <div className={`relative bg-gradient-to-br ${currentTheme.iconBg} p-3.5 rounded-2xl shadow-lg`}>
                <Icon className="h-7 w-7 text-white" />
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      
      {/* Progress or description */}
      {(progress || description) && (
        <CardContent className="relative pt-0 pb-4">
          {progress && !loading && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className={`${currentTheme.descColor} font-medium`}>
                  {progress.label || 'Progress'}
                </span>
                <span className={`font-bold ${currentTheme.textColor}`}>
                  {progress.value}
                  {progress.max && `/${progress.max}`}
                </span>
              </div>
              <Progress
                value={progress.max ? (progress.value / progress.max) * 100 : progress.value}
                className={`h-2 ${currentTheme.progressBg}`}
              />
            </div>
          )}
          
          {description && !progress && (
            <p className={`text-sm ${currentTheme.descColor} font-medium`}>
              {description}
            </p>
          )}
        </CardContent>
      )}
      
      {/* Footer */}
      {(footer || actions.length > 0) && (
        <CardFooter className="relative pt-0 pb-4">
          {footer || (
            <div className="w-full space-y-3">
              {actions.map((action, index) => (
                <React.Fragment key={index}>
                  {action.href ? (
                    <Button
                      variant={action.variant || "ghost"}
                      size={action.size || "sm"}
                      className={cn(
                        "w-full justify-center group/link",
                        action.className
                      )}
                      asChild
                    >
                      <Link href={action.href}>
                        {action.label}
                        <ArrowUpRight className="ml-2 h-4 w-4 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                      </Link>
                    </Button>
                  ) : (
                    <Button
                      variant={action.variant || "ghost"}
                      size={action.size || "sm"}
                      className={cn("w-full justify-center", action.className)}
                      onClick={action.onClick}
                      disabled={action.disabled}
                    >
                      {action.icon && <action.icon className="mr-2 h-4 w-4" />}
                      {action.label}
                    </Button>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
        </CardFooter>
      )}
    </Card>
  );

  // Wrap with link if href is provided
  if (href && !onClick) {
    return (
      <Link href={href} className="block">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}

/**
 * Helper function to create stat card configurations
 */
export const createStatCard = ({
  title,
  value,
  description = null,
  icon = null,
  theme = 'blue',
  trend = null,
  progress = null,
  actions = [],
  format = 'number',
  prefix = '',
  suffix = '',
  href = null,
  onClick = null
}) => ({
  title,
  value,
  description,
  icon,
  theme,
  trend,
  progress,
  actions,
  format,
  prefix,
  suffix,
  href,
  onClick
});