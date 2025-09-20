"use client";

import { Card } from "@/components/ui/card";
import { Activity } from "lucide-react";

export function ConnectionHelp() {
  return (
    <Card className="p-3 sm:p-4 mb-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-1">
          <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
            Connection Testing Tips
          </h4>
          <p className="text-xs text-blue-700 dark:text-blue-300">
            • Page loads with real-time connection status (may take a few
            seconds)
            <br />
            • If a server is unreachable, it will show as "Server is
            disconnected"
            <br />
            • Ensure the correct port is open (usually 8728 for API or 8729 for
            API-SSL)
            <br />• Check firewall settings that might block the connection
          </p>
        </div>
      </div>
    </Card>
  );
}
