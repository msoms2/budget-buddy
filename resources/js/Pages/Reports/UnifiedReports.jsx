import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import IncomeAnalysis from "@/Pages/Statistics/IncomeAnalysis";
import BudgetAnalysis from "@/Pages/Reports/BudgetAnalysis";
import TagAnalysis from "@/Pages/Reports/TagAnalysis";
import PaymentMethodAnalysis from "@/Pages/Reports/PaymentMethodAnalysis";
import ForecastReport from "@/Pages/Reports/ForecastReport";
import useReport from "./hooks/useReport";
import { ErrorBoundary } from "react-error-boundary";
import { Card } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

function ErrorFallback({ error }) {
  return (
    <Alert variant="destructive">
      <AlertTitle>Something went wrong</AlertTitle>
      <AlertDescription>{error.message}</AlertDescription>
    </Alert>
  );
}

// Individual tab components that only fetch data when rendered
function IncomeTab() {
  const {
    data: incomeData,
    isLoading: incomeLoading,
    error: incomeError
  } = useReport({
    routeName: "reports.income-analysis",
    defaultPeriod: "monthly"
  });

  return (
    <Card className="p-4">
      <IncomeAnalysis 
        incomeAnalysis={incomeData} 
        isLoading={incomeLoading}
        error={incomeError}
      />
    </Card>
  );
}

function BudgetTab() {
  const {
    data: budgetData,
    isLoading: budgetLoading,
    error: budgetError
  } = useReport({
    routeName: "reports.budget-analysis",
    defaultPeriod: "monthly"
  });

  return (
    <Card className="p-4">
      <BudgetAnalysis 
        data={budgetData} 
        isLoading={budgetLoading}
        error={budgetError}
      />
    </Card>
  );
}

function TagTab() {
  const {
    data: tagData,
    isLoading: tagLoading,
    error: tagError
  } = useReport({
    routeName: "reports.tag-analysis",
    defaultPeriod: "monthly"
  });

  return (
    <Card className="p-4">
      <TagAnalysis 
        data={tagData} 
        isLoading={tagLoading}
        error={tagError}
      />
    </Card>
  );
}

function PaymentTab() {
  const {
    data: paymentData,
    isLoading: paymentLoading,
    error: paymentError
  } = useReport({
    routeName: "reports.payment-method-analysis",
    defaultPeriod: "monthly"
  });

  return (
    <Card className="p-4">
      <PaymentMethodAnalysis 
        data={paymentData} 
        isLoading={paymentLoading}
        error={paymentError}
      />
    </Card>
  );
}

function ForecastTab() {
  const {
    data: forecastData,
    isLoading: forecastLoading,
    error: forecastError
  } = useReport({
    routeName: "reports.forecast",
    defaultPeriod: "monthly"
  });

  return (
    <Card className="p-4">
      <ForecastReport 
        data={forecastData} 
        isLoading={forecastLoading}
        error={forecastError}
      />
    </Card>
  );
}

export default function UnifiedReports() {
  const [activeTab, setActiveTab] = useState("income");

  const handleTabChange = (value) => {
    setActiveTab(value);
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Financial Reports</h1>
      
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="w-full justify-start mb-4">
          <TabsTrigger value="income">Income Analysis</TabsTrigger>
          <TabsTrigger value="budget">Budget Analysis</TabsTrigger>
          <TabsTrigger value="tags">Tag Analysis</TabsTrigger>
          <TabsTrigger value="payment">Payment Methods</TabsTrigger>
          <TabsTrigger value="forecast">Financial Forecast</TabsTrigger>
        </TabsList>

        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <TabsContent value="income">
            <IncomeTab />
          </TabsContent>

          <TabsContent value="budget">
            <BudgetTab />
          </TabsContent>

          <TabsContent value="tags">
            <TagTab />
          </TabsContent>

          <TabsContent value="payment">
            <PaymentTab />
          </TabsContent>

          <TabsContent value="forecast">
            <ForecastTab />
          </TabsContent>
        </ErrorBoundary>
      </Tabs>
    </div>
  );
}