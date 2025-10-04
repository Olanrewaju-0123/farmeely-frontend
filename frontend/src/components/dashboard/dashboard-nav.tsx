"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  PiggyBank,
  Wallet,
  Settings,
  LogOut,
  ChevronRight,
  ChevronLeft,
  Shield,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";

interface NavProps {
  isCollapsed: boolean;
  toggleCollapsed: () => void;
}

export function DashboardNav({ isCollapsed, toggleCollapsed }: NavProps) {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  const navItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      variant: "default",
    },
    {
      title: "My Groups",
      href: "/dashboard/groups",
      icon: Users,
      variant: "ghost",
    },
    {
      title: "Livestock",
      href: "/dashboard/livestock",
      icon: PiggyBank,
      variant: "ghost",
    },
    {
      title: "Wallet",
      href: "/dashboard/wallet",
      icon: Wallet,
      variant: "ghost",
    },
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
      variant: "ghost",
    },
  ];

  // Add admin link if user is admin
  if (user?.role === "admin") {
    navItems.push({
      title: "Admin Panel",
      href: "/admin",
      icon: Shield,
      variant: "ghost",
    });
  }

  return (
    <TooltipProvider>
      <div
        className={cn(
          "fixed top-0 left-0 h-full flex flex-col justify-between border-r bg-background py-4 transition-all duration-300 z-20",
          isCollapsed ? "w-[60px]" : "w-[240px]"
        )}
      >
        <nav className="grid items-start gap-2 px-2">
          {navItems.map((item, index) => (
            <Link key={index} href={item.href}>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Button
                    variant={pathname === item.href ? "default" : "ghost"}
                    className={cn(
                      "h-9 w-full justify-start",
                      isCollapsed && "h-9 w-9 p-0"
                    )}
                  >
                    <item.icon
                      className={cn("h-4 w-4", !isCollapsed && "mr-2")}
                    />
                    {!isCollapsed && item.title}
                    {isCollapsed && (
                      <span className="sr-only">{item.title}</span>
                    )}
                  </Button>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent side="right">{item.title}</TooltipContent>
                )}
              </Tooltip>
            </Link>
          ))}
        </nav>
        <div className="mt-auto px-2">
          <Separator className="my-2" />
          <div
            className={cn(
              "flex items-center mb-2",
              isCollapsed ? "justify-center" : "justify-between"
            )}
          >
            {!isCollapsed && (
              <span className="text-sm text-muted-foreground">Theme</span>
            )}
            <ThemeToggle />
          </div>
          <Button
            variant="ghost"
            className={cn(
              "h-9 w-full justify-start",
              isCollapsed && "h-9 w-9 p-0"
            )}
            onClick={logout}
          >
            <LogOut className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
            {!isCollapsed && "Logout"}
            {isCollapsed && <span className="sr-only">Logout</span>}
          </Button>
          <Button
            variant="ghost"
            className="mt-2 h-9 w-full justify-center"
            onClick={toggleCollapsed}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
            <span className="sr-only">Toggle Sidebar</span>
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
}
