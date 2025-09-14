"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMatchingClientsCount } from "@/hooks/use-matching-clients-count";
import { ServiceProfile } from "@/lib/packages";
import { Users } from "lucide-react";

interface AssignButtonWithBadgeProps {
  package: ServiceProfile;
  onAssign: () => void;
}

export function AssignButtonWithBadge({
  package: pkg,
  onAssign,
}: AssignButtonWithBadgeProps) {
  const { data: matchingData, isLoading } = useMatchingClientsCount(pkg.id);

  const availableClientsCount = matchingData?.totalMatches || 0;

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={onAssign}
        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-blue-200 dark:border-blue-800"
        title={`Assign clients to this package (${availableClientsCount} clients available for assignment)`}
        disabled={isLoading}
      >
        <Users className="h-3 w-3" />
      </Button>
      {availableClientsCount > 0 && (
        <Badge
          variant="secondary"
          className={`absolute -top-3 -right-3 flex items-center justify-center p-0 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 ${
            availableClientsCount > 99
              ? "h-6 w-auto px-1 min-w-6"
              : availableClientsCount > 9
              ? "h-5 w-6"
              : "h-5 w-5"
          }`}
        >
          {availableClientsCount > 99 ? "99+" : availableClientsCount}
        </Badge>
      )}
    </div>
  );
}
