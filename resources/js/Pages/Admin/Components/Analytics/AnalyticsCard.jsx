import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  ArrowUpRight,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "@inertiajs/react";

/**
 * AnalyticsCard Component
 * 
 * Reusable card component for KPIs and metrics in analytics dashboards.
 * Features:
 * - Flexible metric display with customizable formatting
 * - Trend indicators with visual feedback
 * - Loading states with skeleton UI
 * - Action buttons and links
 * - Responsive design
 * - Accessibility features
 * 
 * @param {Object} props
 * @param {string} props.title - Card title
 * @param {string|number} props.value - Main metric value
 * @param {string} props.description - Card description
 * @param {React.ReactNode} props.icon - Icon component
 * @param {Object} props.trend - Trend data {value, direction, label, percentage}
 * @param {string} props.format - Value format: 'number', 'currency', 'percentage'
 * @param {string} props.suffix - Value suffix
 * @param {string} props.prefix - Value prefix
 * @param {Array} props.actions - Action buttons
 * @param {boolean} props.loading - Loading state
 * @param {string} props.variant - Card variant: 'default', 'compact', 'detailed'
 * @param {string} props.theme - Color theme
 * @param {string} props.className - Additional CSS classes
 * @param {Function} props.onClick - Card click handler
 * @param {string} props.href - Link URL
 * @param {Object} props.metadata - Additional metadata to display
 */
export default function AnalyticsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  format = 'number',
  suffix = '',
  prefix = '',
  actions = [],
  loading = false,
  variant = 'default',
  theme = 'blue',
  className = "",
  onClick,
  href,
  metadata
}) {
  // Theme configurations for analytics cards
  const themes = {
    blue: {
      gradient: "from-blue-50/50 via-indigo-50/30 to-blue-50/50 dark:from-blue-950/20 dark:via-indigo-950/10 dark:to-blue-950/20",
      iconBg: "bg-blue-500/10 dark:bg-blue-500/20",
      iconColor: "text-blue-600 dark:text-blue-400",
      accent: "border-l-blue-500",
      valueColor: "text-blue-900 dark:text-blue-100"
    },
    emerald: {
      gradient: "from-emerald-50/50 via-green-50/30 to-emerald-50/50 dark:from-emerald-950/20 dark:via-green-950/10 dark:to-emerald-950/20",
      iconBg: "bg-emerald-500/10 dark:bg-emerald-500/20",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      accent: "border-l-emerald-500",
      valueColor: "text-emerald-900 dark:text-emerald-100"
    },
    rose: {
      gradient: "from-rose-50/50 via-red-50/30 to-rose-50/50 dark:from-rose-950/20 dark:via-red-950/10 dark:to-rose-950/20",
      iconBg: "bg-rose-500/10 dark:bg-rose-500/20",
      iconColor: "text-rose-600 dark:text-rose-400",
      accent: "border-l-rose-500",
      valueColor: "text-rose-900 dark:text-rose-100"
    },
    violet: {
      gradient: "from-violet-50/50 via-purple-50/30 to-violet-50/50 dark:from-violet-950/20 dark:via-purple-950/10 dark:to-violet-950/20",
      iconBg: "bg-violet-500/10 dark:bg-violet-500/20",
      iconColor: "text-violet-600 dark:text-violet-400",
      accent: "border-l-violet-500",
      valueColor: "text-violet-900 dark:text-violet-100"
    },
    amber: {
      gradient: "from-amber-50/50 via-orange-50/30 to-amber-50/50 dark:from-amber-950/20 dark:via-orange-950/10 dark:to-amber-950/20",
      iconBg: "bg-amber-500/10 dark:bg-amber-500/20",
      iconColor: "text-amber-600 dark:text-amber-400",
      accent: "border-l-amber-500",
      valueColor: "text-amber-900 dark:text-amber-100"
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
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 2
        }).format(val);
      case 'percentage':
        return `${val}%`;
      case 'number':
      default:
        return typeof val === 'number' ? val.toLocaleString() : val;
    }
  };

  // Trend icon and styling
  const getTrendIcon = () => {
    if (!trend) return null;
    
    switch (trend.direction) {
      case 'up':
        return TrendingUp;
      case 'down':
        return TrendingDown;
      default:
        return Minus;
    }
  };

  const TrendIcon = getTrendIcon();

  // Render trend indicator
  const renderTrend = () => {
    if (!trend || loading) return null;

    return (
      <div className="flex items-center gap-2 mt-2">
        <div className={cn(
          "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
          trend.direction === 'up' && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
          trend.direction === 'down' && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
          trend.direction === 'neutral' && "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300"
        )}>
          {TrendIcon && <TrendIcon className="h-3 w-3" />}
          <span>{trend.value}</span>
        </div>
        {trend.label && (
          <span className="text-xs text-muted-foreground">
            {trend.label}
          </span>
        )}
      </div>
    );
  };

  // Render metadata
  const renderMetadata = () => {
    if (!metadata || loading) return null;

    return (
      <div className="mt-3 pt-3 border-t border-muted/50">
        <div className="grid grid-cols-2 gap-2 text-xs">
          {Object.entries(metadata).map(([key, val]) => (
            <div key={key} className="flex justify-between">
              <span className="text-muted-foreground capitalize">
                {key.replace(/([A-Z])/g, ' $1').toLowerCase()}:
              </span>
              <span className="font-medium">{val}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Card content based on variant
  const renderCardContent = () => {
    if (variant === 'compact') {
      return (
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              {loading ? (
                <Skeleton className="h-6 w-16" />
              ) : (
                <p className={cn("text-xl font-bold", currentTheme.valueColor)}>
                  {prefix}{formatValue(value)}{suffix}
                </p>
              )}
            </div>
            {Icon && (
              <div className={cn("p-2 rounded-lg", currentTheme.iconBg)}>
                <Icon className={cn("h-5 w-5", currentTheme.iconColor)} />
              </div>
            )}
          </div>
          {renderTrend()}
        </CardContent>
      );
    }

    return (
      <>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {title}
              </CardTitle>
              {description && (
                <CardDescription className="text-xs">
                  {description}
                </CardDescription>
              )}
            </div>
            {Icon && (
              <div className={cn("p-3 rounded-xl", currentTheme.iconBg)}>
                <Icon className={cn("h-6 w-6", currentTheme.iconColor)} />
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {loading ? (
            <Skeleton className="h-8 w-24 mb-2" />
          ) : (
            <div className={cn("text-3xl font-bold mb-1", currentTheme.valueColor)}>
              {prefix}{formatValue(value)}{suffix}
            </div>
          )}
          
          {renderTrend()}
          {variant === 'detailed' && renderMetadata()}
          
          {actions.length > 0 && (
            <div className="flex gap-2 mt-4">
              {actions.map((action, index) => (
                action.href ? (
                  <Button
                    key={index}
                    variant={action.variant || "outline"}
                    size="sm"
                    asChild
                    className={action.className}
                  >
                    <Link href={action.href}>
                      {action.icon && <action.icon className="h-4 w-4 mr-1" />}
                      {action.label}
                      <ArrowUpRight className="h-3 w-3 ml-1" />
                    </Link>
                  </Button>
                ) : (
                  <Button
                    key={index}
                    variant={action.variant || "outline"}
                    size="sm"
                    onClick={action.onClick}
                    disabled={action.disabled}
                    className={action.className}
                  >
                    {action.icon && <action.icon className="h-4 w-4 mr-1" />}
                    {action.label}
                  </Button>
                )
              ))}
            </div>
          )}
        </CardContent>
      </>
    );
  };

  const cardElement = (
    <Card 
      className={cn(
        "transition-all duration-200 hover:shadow-md",
        currentTheme.gradient && `bg-gradient-to-br ${currentTheme.gradient}`,
        currentTheme.accent && `border-l-4 ${currentTheme.accent}`,
        onClick || href ? "cursor-pointer hover:shadow-lg" : "",
        className
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
      aria-label={onClick ? `${title}: ${formatValue(value)}` : undefined}
    >
      {renderCardContent()}
    </Card>
  );

  // Wrap with link if href is provided
  if (href && !onClick) {
    return (
      <Link href={href} className="block">
        {cardElement}
      </Link>
    );
  }

  return cardElement;
}

/**
 * Helper function to create analytics card configurations
 */
export const createAnalyticsCard = ({
  title,
  value,
  description,
  icon,
  trend,
  format = 'number',
  prefix = '',
  suffix = '',
  theme = 'blue',
  variant = 'default',
  actions = [],
  metadata = null,
  href = null,
  onClick = null
}) => ({
  title,
  value,
  description,
  icon,
  trend,
  format,
  prefix,
  suffix,
  theme,
  variant,
  actions,
  metadata,
  href,
  onClick
});