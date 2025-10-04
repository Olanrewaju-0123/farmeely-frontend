"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { LoadingPage } from "@/components/loading-spinner";
import ErrorBoundary from "@/components/error-boundary";
import { AdminNav } from "@/components/admin/admin-nav";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      router.push("/dashboard");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <LoadingPage text="Loading admin dashboard..." />;
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <AdminNav
        isCollapsed={isCollapsed}
        toggleCollapsed={() => setIsCollapsed(!isCollapsed)}
      />
      <main
        className={`flex-1 overflow-auto transition-all duration-300 ${
          isCollapsed ? "ml-[60px]" : "ml-[240px]"
        }`}
      >
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <ErrorBoundary>{children}</ErrorBoundary>
        </div>
      </main>
    </div>
  );
}
