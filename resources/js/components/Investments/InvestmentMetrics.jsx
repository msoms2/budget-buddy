import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCurrency } from '@/hooks/useCurrency.jsx';
import { 
  TrendingUpIcon, 
  TrendingDownIcon, 
  DollarSignIcon,
  Target,
  Briefcase,
  Activity
} from "lucide-react";

export default function InvestmentMetrics({ metrics }) {
  const { formatCurrency } = useCurrency();
  const cards = [
    {
      title: "Total Portfolio Value",
      value: formatCurrency(metrics.total_value),
      change: metrics.value_change,
      icon: DollarSignIcon,
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      iconColor: "text-blue-600",
      titleColor: "text-blue-700 dark:text-blue-300",
      description: "Total value of all investments"
    },
    {
      title: "Total Return",
      value: formatCurrency(metrics.total_return),
      change: metrics.return_percentage,
      changePrefix: "",
      changeSuffix: "%",
      icon: Target,
      bgColor: metrics.total_return >= 0 ? "bg-green-50 dark:bg-green-900/20" : "bg-red-50 dark:bg-red-900/20",
      iconColor: metrics.total_return >= 0 ? "text-green-600" : "text-red-600",
      titleColor: metrics.total_return >= 0 ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300",
      description: metrics.total_return >= 0 ? "Portfolio is growing" : "Portfolio needs attention"
    },
    {
      title: "Best Performing",
      value: metrics.best_performing?.name || "N/A",
      change: metrics.best_performing?.roi || 0,
      changePrefix: "",
      changeSuffix: "%",
      icon: TrendingUpIcon,
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      iconColor: "text-purple-600",
      titleColor: "text-purple-700 dark:text-purple-300",
      description: "Top investment by ROI"
    },
    {
      title: "Total Investments",
      value: metrics.total_investments,
      change: metrics.new_investments_month,
      changePrefix: "+",
      description: "New this month",
      icon: Briefcase,
      bgColor: "bg-amber-50 dark:bg-amber-900/20",
      iconColor: "text-amber-600",
      titleColor: "text-amber-700 dark:text-amber-300",
      footerDescription: "Active portfolio positions"
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title} className={card.bgColor}>
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {card.title}
            </CardTitle>
            <card.icon className={`h-5 w-5 ${card.iconColor}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${card.titleColor}`}>
              {card.value}
            </div>
            {card.change !== undefined && (
              <div className="flex items-center gap-1 mt-1">
                <Badge variant="outline" className={`flex gap-1 rounded-lg text-xs ${
                  card.change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {card.change >= 0 ? <TrendingUpIcon className="size-3" /> : <TrendingDownIcon className="size-3" />}
                  {card.change >= 0 ? "+" : ""}
                  {card.changePrefix || ""}{card.change}{card.changeSuffix || ""}
                </Badge>
                {card.description && (
                  <span className="text-xs text-muted-foreground ml-1">{card.description}</span>
                )}
              </div>
            )}
          </CardContent>
          {card.footerDescription && (
            <CardFooter className="flex-col items-start gap-1 text-sm">
              <div className="line-clamp-1 flex gap-2 font-medium text-muted-foreground">
                {card.footerDescription}
              </div>
            </CardFooter>
          )}
        </Card>
      ))}
    </div>
  );
}