"use client";

import { Button } from "@/components/ui/button";
import PageLoader from "@/components/ui/page-loader";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/lib/auth-context";
import {
  BarChart3,
  Building2,
  LogOut,
  Menu,
  Settings,
  Shield,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Define navigation structure with direct menu items
const navigationStructure = [
  { name: "Dashboard", href: "/admin", icon: BarChart3, type: "single" },
  {
    name: "Organizations",
    href: "/admin/organizations",
    icon: Building2,
    type: "single",
  },
  { name: "Users", href: "/admin/users", icon: Users, type: "single" },
  { name: "Plans", href: "/admin/plans", icon: Settings, type: "single" },
  {
    name: "Permissions",
    href: "/admin/permissions",
    icon: Shield,
    type: "single",
  },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login");
    }

    // Redirect non-super admin users to dashboard
    if (!isLoading && isAuthenticated && user?.role !== "SUPER_ADMIN") {
      router.push("/dashboard");
    }
  }, [isLoading, isAuthenticated, user?.role, router]);

  const handleLogout = async () => {
    await logout();
    router.push("/auth/login");
  };

  if (isLoading || (!isAuthenticated && isLoading)) {
    return <PageLoader fullScreen message="Loading session..." />;
  }

  if (!isAuthenticated || user?.role !== "SUPER_ADMIN") {
    return null; // Will redirect to appropriate page
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 theme-transition">
      {/* Mobile sidebar */}
      <div
        className={classNames(
          sidebarOpen ? "fixed inset-0 flex z-[60] md:hidden" : "hidden"
        )}
      >
        <div
          className="fixed inset-0 bg-slate-900 bg-opacity-50 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-slate-800 theme-transition shadow-xl">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                Super Admin
              </h1>
            </div>
            <nav className="mt-5 px-2 space-y-1">
              {navigationStructure.map((item) => {
                const isCurrent = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={classNames(
                      isCurrent
                        ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-r-2 border-blue-600 dark:border-blue-400"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white",
                      "group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg theme-transition-fast"
                    )}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon
                      className={classNames(
                        isCurrent
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300",
                        "mr-3 h-5 w-5 transition-colors duration-200"
                      )}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center w-full">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  {user?.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {user?.role}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <ThemeToggle />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-50">
        <div className="flex-1 flex flex-col min-h-0 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 theme-transition">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                Super Admin
              </h1>
            </div>
            <nav className="mt-5 flex-1 px-2 bg-white dark:bg-slate-800 space-y-1 theme-transition">
              {navigationStructure.map((item) => {
                const isCurrent = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={classNames(
                      isCurrent
                        ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-r-2 border-blue-600 dark:border-blue-400"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white",
                      "group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg theme-transition-fast"
                    )}
                  >
                    <item.icon
                      className={classNames(
                        isCurrent
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300",
                        "mr-3 h-5 w-5 transition-colors duration-200"
                      )}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center w-full">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  {user?.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {user?.role}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <ThemeToggle />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1 bg-slate-50 dark:bg-slate-900 theme-transition">
        <div className="sticky top-0 z-30 md:hidden bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              type="button"
              className="inline-flex items-center justify-center h-10 w-10 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-200"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900 theme-transition">
          {children}
        </main>
      </div>
    </div>
  );
}
