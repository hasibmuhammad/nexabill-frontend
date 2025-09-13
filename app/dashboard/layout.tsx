"use client";

import { Button } from "@/components/ui/button";
import PageLoader from "@/components/ui/page-loader";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/lib/auth-context";
import {
  Activity,
  ChevronRight,
  Cog,
  DollarSign,
  Home,
  LogOut,
  MapPin,
  Menu,
  Network,
  Package,
  Server,
  Settings,
  Settings2,
  Users,
  Wifi,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Define navigation structure with nested items
const navigationStructure = [
  { name: "Dashboard", href: "/dashboard", icon: Home, type: "single" },
  {
    name: "System Setup",
    icon: Cog,
    type: "group",
    children: [
      { name: "Packages", href: "/dashboard/packages", icon: Package },
      { name: "Zones", href: "/dashboard/zones", icon: MapPin },
      { name: "Subzones", href: "/dashboard/subzones", icon: MapPin },
      { name: "Districts", href: "/dashboard/districts", icon: MapPin },
      {
        name: "Connection Types",
        href: "/dashboard/connection-types",
        icon: Network,
      },
      {
        name: "Protocol Types",
        href: "/dashboard/protocol-types",
        icon: Settings2,
      },
    ],
  },
  { name: "Clients", href: "/dashboard/clients", icon: Users, type: "single" },
  {
    name: "Mikrotik Servers",
    href: "/dashboard/servers",
    icon: Server,
    type: "single",
  },
  { name: "Network", href: "/dashboard/network", icon: Wifi, type: "single" },
  {
    name: "Billing",
    href: "/dashboard/billing",
    icon: DollarSign,
    type: "single",
  },
  {
    name: "Reports",
    href: "/dashboard/reports",
    icon: Activity,
    type: "single",
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    type: "single",
  },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsedMenus, setCollapsedMenus] = useState<Set<string>>(new Set());

  // Auto-expand System Setup menu when on child pages
  useEffect(() => {
    if (
      pathname &&
      (pathname.startsWith("/dashboard/packages") ||
        pathname.startsWith("/dashboard/zones") ||
        pathname.startsWith("/dashboard/subzones") ||
        pathname.startsWith("/dashboard/districts") ||
        pathname.startsWith("/dashboard/connection-types") ||
        pathname.startsWith("/dashboard/protocol-types"))
    ) {
      setCollapsedMenus((prev) => {
        const newSet = new Set(prev);
        newSet.add("System Setup");
        return newSet;
      });
    }
  }, [pathname]);

  const toggleMenu = (menuName: string) => {
    setCollapsedMenus((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(menuName)) {
        newSet.delete(menuName);
      } else {
        newSet.add(menuName);
      }
      return newSet;
    });
  };

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isLoading, isAuthenticated, router]);

  const handleLogout = async () => {
    await logout();
    router.push("/auth/login");
  };

  if (isLoading || (!isAuthenticated && isLoading)) {
    return <PageLoader fullScreen message="Loading session..." />;
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 theme-transition">
      {/* Mobile sidebar */}
      <div
        className={classNames(
          sidebarOpen ? "fixed inset-0 flex z-40 md:hidden" : "hidden"
        )}
      >
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75"
          onClick={() => setSidebarOpen(false)}
        />
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-slate-800 theme-transition">
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
              <h1 className="text-xl font-bold text-gray-900">NexaBill</h1>
            </div>
            <nav className="mt-5 px-2 space-y-1">
              {navigationStructure.map((item) => {
                if (item.type === "single" && item.href) {
                  const isCurrent = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={classNames(
                        isCurrent
                          ? "bg-blue-100 text-blue-900"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                        "group flex items-center px-2 py-2 text-base font-medium rounded-md"
                      )}
                    >
                      <item.icon
                        className={classNames(
                          isCurrent
                            ? "text-blue-500"
                            : "text-gray-400 group-hover:text-gray-500",
                          "mr-4 h-6 w-6"
                        )}
                      />
                      {item.name}
                    </Link>
                  );
                } else if (item.type === "group") {
                  const isCollapsed = collapsedMenus.has(item.name);
                  return (
                    <div key={item.name} className="space-y-1">
                      <button
                        onClick={() => toggleMenu(item.name)}
                        className="w-full flex items-center justify-between px-2 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors duration-200"
                      >
                        <div className="flex items-center flex-1">
                          <item.icon className="mr-3 h-4 w-4 text-gray-400" />
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            {item.name}
                          </span>
                        </div>
                        <ChevronRight
                          className={classNames(
                            "h-4 w-4 text-gray-400 transition-transform duration-200 flex-shrink-0",
                            isCollapsed ? "rotate-90" : ""
                          )}
                        />
                      </button>
                      <div
                        className={classNames(
                          "overflow-hidden transition-all duration-300 ease-in-out",
                          isCollapsed
                            ? "max-h-96 opacity-100"
                            : "max-h-0 opacity-0"
                        )}
                      >
                        <div className="space-y-1 pl-4">
                          {item.children?.map((child) => {
                            const isCurrent = pathname === child.href;
                            return (
                              <Link
                                key={child.name}
                                href={child.href}
                                className={classNames(
                                  isCurrent
                                    ? "bg-blue-100 text-blue-900"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                                  "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200"
                                )}
                              >
                                <child.icon
                                  className={classNames(
                                    isCurrent
                                      ? "text-blue-500"
                                      : "text-gray-400 group-hover:text-gray-500",
                                    "mr-3 h-4 w-4 transition-colors duration-200"
                                  )}
                                />
                                {child.name}
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-50">
        <div className="flex-1 flex flex-col min-h-0 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 theme-transition">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                NexaBill
              </h1>
            </div>
            <nav className="mt-5 flex-1 px-2 bg-white dark:bg-slate-800 space-y-1 theme-transition">
              {navigationStructure.map((item) => {
                if (item.type === "single" && item.href) {
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
                } else if (item.type === "group") {
                  const isCollapsed = collapsedMenus.has(item.name);
                  return (
                    <div key={item.name} className="space-y-1">
                      <button
                        onClick={() => toggleMenu(item.name)}
                        className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-all duration-200"
                      >
                        <div className="flex items-center flex-1">
                          <item.icon className="mr-3 h-5 w-5 text-slate-400 dark:text-slate-500" />
                          <span className="text-sm font-medium">
                            {item.name}
                          </span>
                        </div>
                        <ChevronRight
                          className={classNames(
                            "h-4 w-4 text-slate-400 dark:text-slate-500 transition-transform duration-200 flex-shrink-0",
                            isCollapsed ? "rotate-90" : ""
                          )}
                        />
                      </button>
                      <div
                        className={classNames(
                          "overflow-hidden transition-all duration-300 ease-in-out",
                          isCollapsed
                            ? "max-h-96 opacity-100"
                            : "max-h-0 opacity-0"
                        )}
                      >
                        <div className="space-y-1 pl-6">
                          {item.children?.map((child) => {
                            const isCurrent = pathname === child.href;
                            return (
                              <Link
                                key={child.name}
                                href={child.href}
                                className={classNames(
                                  isCurrent
                                    ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-r-2 border-blue-600 dark:border-blue-400"
                                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white",
                                  "group flex items-center px-6 py-2.5 text-sm font-medium rounded-lg theme-transition-fast transition-all duration-200"
                                )}
                              >
                                <child.icon
                                  className={classNames(
                                    isCurrent
                                      ? "text-blue-600 dark:text-blue-400"
                                      : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300",
                                    "mr-3 h-4 w-4 transition-colors duration-200"
                                  )}
                                />
                                {child.name}
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
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
        <div className="sticky top-0 z-10 md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900 theme-transition">
          {children}
        </main>
      </div>
    </div>
  );
}
