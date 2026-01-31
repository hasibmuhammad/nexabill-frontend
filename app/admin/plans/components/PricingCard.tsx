"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";

interface Plan {
  id: string;
  name: string;
  description: string;
  maxClients: number;
  price: number;
  currency: string;
  billingCycle: string;
  features: string[];
  isActive: boolean;
}

interface PricingCardProps {
  plan: Plan;
}

export function PricingCard({ plan }: PricingCardProps) {
  return (
    <Card className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">
          {plan.name}
        </CardTitle>
        <p className="text-slate-600 dark:text-slate-400">{plan.description}</p>
      </CardHeader>
      <CardContent>
        <div className="text-center mb-6">
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {plan.currency} {plan.price.toLocaleString()}
          </div>
          <div className="text-slate-600 dark:text-slate-400">
            per {plan.billingCycle}
          </div>
        </div>

        <div className="space-y-2 mb-6">
          {plan.features.map((feature, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-sm text-slate-700 dark:text-slate-300">
                {feature}
              </span>
            </div>
          ))}
        </div>

        <div className="text-center">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              plan.isActive
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
            }`}
          >
            {plan.isActive ? "Active" : "Inactive"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
