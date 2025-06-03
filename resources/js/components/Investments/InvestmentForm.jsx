import * as React from "react";
import { useEffect } from "react";
import { useForm } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import CurrencySelector from "@/components/CurrencySelector";
import { Briefcase, Target } from "lucide-react";

export default function InvestmentForm({ isOpen, onClose, investment = null, categories }) {
  const { data, setData, post, put, processing, errors, reset } = useForm({
    name: investment?.name || "",
    symbol: investment?.symbol || "",
    investment_category_id: investment?.investment_category_id || "",
    currency_id: investment?.currency_id || "",
    initial_amount: investment?.initial_amount || "",
    current_amount: investment?.current_amount || "",
    purchase_date: investment?.purchase_date || "",
    description: investment?.description || "",
    status: investment?.status || "active",
  });

  useEffect(() => {
    if (investment) {
      setData({
        name: investment.name || "",
        symbol: investment.symbol || "",
        investment_category_id: investment.investment_category_id || "",
        currency_id: investment.currency_id || "",
        initial_amount: investment.initial_amount || "",
        current_amount: investment.current_amount || "",
        purchase_date: investment.purchase_date || "",
        description: investment.description || "",
        status: investment.status || "active",
      });
    } else {
      reset();
    }
  }, [investment]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (investment) {
      put(route("investments.update", investment.id), {
        onSuccess: () => {
          onClose();
          reset();
        },
      });
    } else {
      post(route("investments.store"), {
        onSuccess: () => {
          onClose();
          reset();
        },
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {investment ? (
              <>
                <Target className="h-5 w-5 text-blue-600" />
                Edit Investment
              </>
            ) : (
              <>
                <Briefcase className="h-5 w-5 text-blue-600" />
                Add New Investment
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {investment 
              ? "Update your investment details and track its performance."
              : "Add a new investment to your portfolio and start tracking its performance."
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">Investment Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Apple Inc., Tesla, Bitcoin"
                value={data.name}
                onChange={e => setData("name", e.target.value)}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="symbol" className="text-sm font-medium">Symbol</Label>
              <Input
                id="symbol"
                placeholder="e.g., AAPL, TSLA, BTC"
                value={data.symbol}
                onChange={e => setData("symbol", e.target.value.toUpperCase())}
                className={errors.symbol ? "border-red-500" : ""}
              />
              {errors.symbol && <p className="text-xs text-red-500">{errors.symbol}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-medium">Category *</Label>
              <Select
                value={data.investment_category_id || ""}
                onValueChange={value => setData("investment_category_id", value)}
              >
                <SelectTrigger className={errors.investment_category_id ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select investment category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.investment_category_id && <p className="text-xs text-red-500">{errors.investment_category_id}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm font-medium">Status</Label>
              <Select
                value={data.status || "active"}
                onValueChange={value => setData("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency" className="text-sm font-medium">Currency *</Label>
            <CurrencySelector
              value={data.currency_id}
              onChange={value => setData("currency_id", value)}
              className={errors.currency_id ? "border-red-500" : ""}
            />
            {errors.currency_id && <p className="text-xs text-red-500">{errors.currency_id}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="initial_amount" className="text-sm font-medium">Initial Investment *</Label>
              <Input
                id="initial_amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={data.initial_amount}
                onChange={e => setData("initial_amount", e.target.value)}
                className={errors.initial_amount ? "border-red-500" : ""}
              />
              {errors.initial_amount && <p className="text-xs text-red-500">{errors.initial_amount}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="current_amount" className="text-sm font-medium">Current Value</Label>
              <Input
                id="current_amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={data.current_amount}
                onChange={e => setData("current_amount", e.target.value)}
                className={errors.current_amount ? "border-red-500" : ""}
              />
              {errors.current_amount && <p className="text-xs text-red-500">{errors.current_amount}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="purchase_date" className="text-sm font-medium">Purchase Date *</Label>
            <Input
              id="purchase_date"
              type="date"
              value={data.purchase_date}
              onChange={e => setData("purchase_date", e.target.value)}
              className={errors.purchase_date ? "border-red-500" : ""}
            />
            {errors.purchase_date && <p className="text-xs text-red-500">{errors.purchase_date}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">Description</Label>
            <Textarea
              id="description"
              placeholder="Add notes about this investment..."
              rows={3}
              value={data.description}
              onChange={e => setData("description", e.target.value)}
              className={errors.description ? "border-red-500" : ""}
            />
            {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={processing} className="bg-blue-600 hover:bg-blue-700">
              {processing ? "Saving..." : (investment ? "Update Investment" : "Add Investment")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
