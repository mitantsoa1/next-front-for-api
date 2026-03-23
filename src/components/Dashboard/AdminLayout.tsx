"use client";

import React from "react";
import { useSidebar } from "./context/SidebarContext";
import AppSidebar from "./layout/AppSidebar";
import Backdrop from "./layout/Backdrop";
import AppHeader from "./layout/AppHeader";
import './styles/globals.css';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  // Dynamic class for main content margin based on sidebar state
  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
      ? "lg:ml-[320px]"
      : "lg:ml-[120px]";

  return (
    <div className="h-screen overflow-hidden xl:flex">
      {/* Sidebar and Backdrop */}
      <AppSidebar />
      <Backdrop />
      {/* Main Content Area */}
      <div
        className={`flex-1 h-full overflow-y-auto overflow-x-hidden transition-all duration-300 ease-in-out  custom-scrollbar ${mainContentMargin}`}
      >
        {/* Header */}
        <AppHeader />
        {/* Page Content */}
        <main className="p-2 md:p-4">
          <div className="mx-auto w-full max-w-(--breakpoint-2xl)">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
