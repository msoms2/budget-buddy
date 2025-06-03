import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Forecast({ auth, forecast, forecastLabels, incomeData, expenseData, savingsData, 
  projectedYearlyIncome, projectedYearlyExpense, projectedYearlySavings, projectedSavingsRate }) {
  
  const [duration, setDuration] = useState('3');
  const [forecastType, setForecastType] = useState('all');
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    // Combine data for chart based on selected duration
    const months = parseInt(duration);
    const data = forecastLabels.slice(0, months).map((month, index) => ({
      name: month,
      income: incomeData[index],
      expenses: expenseData[index],
      savings: savingsData[index]
    }));
    setChartData(data);
  }, [duration, forecastLabels, incomeData, expenseData, savingsData]);

  return (
    <AuthenticatedLayout user={auth.user}>
      <Head title="Financial Forecast" />

      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Financial Forecast</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Select value={duration} onValueChange={setDuration}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Forecast Duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 Month</SelectItem>
              <SelectItem value="3">3 Months</SelectItem>
              <SelectItem value="6">6 Months</SelectItem>
              <SelectItem value="12">12 Months</SelectItem>
            </SelectContent>
          </Select>

          <Select value={forecastType} onValueChange={setForecastType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Forecast Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Income & Expenses</SelectItem>
              <SelectItem value="income">Income Only</SelectItem>
              <SelectItem value="expenses">Expenses Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Projected Yearly Income</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${projectedYearlyIncome.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Projected Yearly Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${projectedYearlyExpense.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Projected Yearly Savings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${projectedYearlySavings.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Projected Savings Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projectedSavingsRate}%</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Forecast Chart</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {(forecastType === 'all' || forecastType === 'income') && (
                    <Line type="monotone" dataKey="income" stroke="#4ade80" name="Income" />
                  )}
                  {(forecastType === 'all' || forecastType === 'expenses') && (
                    <Line type="monotone" dataKey="expenses" stroke="#f43f5e" name="Expenses" />
                  )}
                  <Line type="monotone" dataKey="savings" stroke="#2563eb" name="Savings" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthenticatedLayout>
  );
}