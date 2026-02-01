"use client";

import { type SubscriptionPlan } from "@/lib/schemas/plan";
import { PricingCard } from "./PricingCard";

interface PricingOverviewProps {
  plans: SubscriptionPlan[];
}

export function PricingOverview({ plans }: PricingOverviewProps) {
  return (
    <div className="mt-12">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-6">
        Current Pricing Overview
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <PricingCard key={plan.id} plan={plan} />
        ))}
      </div>
    </div>
  );
}
