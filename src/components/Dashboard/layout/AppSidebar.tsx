"use client";
import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "@/i18n/navigation";
import { useSidebar } from "@/components/Dashboard/context/SidebarContext";
import { useTranslations } from "next-intl";

import { Box, Calendar, ChevronDown, CreditCard, Ellipsis, FileText, LayoutDashboard, ListTodo, Mail, Package2, PieChart, Plug, Table, UserCircle, Users, Search, Filter, X, ChartColumn, File, FileClock, HelpCircle } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: {
    name: string;
    path: string;
    pro?: boolean;
    new?: boolean;
    paymentStatus?: string;
    subtitle?: string;
    type?: 'link' | 'header' | 'separator' | 'custom';
    component?: React.ReactNode;
    packName?: string;
  }[];
};

const AppSidebar: React.FC = () => {

  const { isAdmin, isSuperAdmin } = useUserRole();
  const t = useTranslations("payment_status_badges");
  const tSidebar = useTranslations("sidebar");
  const tStatus = useTranslations("project_status");

  const othersItems = useMemo<NavItem[]>(() => [
    {
      icon: <Users size={20} />,
      name: tSidebar('users'),
      path: "/admin/users",
    },

    {
      icon: <ChartColumn size={20} />,
      name: tSidebar('analytics'),
      path: "/admin/analytics",
    },
    // {
    //   icon: <PieChart size={20} />,
    //   name: tSidebar('summary'),
    //   path: "/admin/summary",
    // },

    // {
    //   icon: <FileClock size={20} />,
    //   name: tSidebar('history'),
    //   path: "/admin/history",
    // },

  ], [tSidebar]);


  const navItems = useMemo<NavItem[]>(() => [
    {
      icon: <LayoutDashboard size={20} />,
      name: tSidebar('dashboard'),
      path: "/dashboard"
    },
    {
      icon: <UserCircle size={20} />,
      name: tSidebar('profile'),
      path: "/profile",
    },
    // {
    //   icon: <HelpCircle size={20} />,
    //   name: tSidebar('supports'),
    //   path: "/support",
    // },

  ], [tSidebar]);

  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  useEffect(() => {
    let foundSubmenu: { type: "main" | "others"; index: number } | null = null;

    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : othersItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          const hasActiveChild = nav.subItems.some((subItem) =>
            isActive(subItem.path)
          );
          if (hasActiveChild) {
            foundSubmenu = {
              type: menuType as "main" | "others",
              index,
            };
          }
        }
      });
    });

    if (!foundSubmenu && pathname?.startsWith('/pack/')) {
      const planIndex = navItems.findIndex(item =>
        item.subItems?.some(sub => sub.name === 'search-filter')
      );
      if (planIndex !== -1) {
        foundSubmenu = { type: 'main', index: planIndex };
      }
    }

    setOpenSubmenu(prev => {
      if (!foundSubmenu) return null;
      if (prev?.type === foundSubmenu.type && prev?.index === foundSubmenu.index) {
        return prev;
      }
      return foundSubmenu;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, isActive, navItems]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        const items = menuType === "main" ? navItems : othersItems;
        const hasActiveChild = items[index].subItems?.some((sub) =>
          isActive(sub.path)
        );
        if (hasActiveChild) return prevOpenSubmenu;

        return null;
      }
      return { type: menuType, index };
    });
  };

  const renderMenuItems = (
    navItems: NavItem[],
    menuType: "main" | "others"
  ) => (
    <ul className="flex flex-col gap-4">
      {navItems.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group ${openSubmenu?.type === menuType && openSubmenu?.index === index
                ? "menu-item-active"
                : "menu-item-inactive"
                } cursor-pointer ${!isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
                }`}
            >
              <span
                className={`${openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-icon-active"
                  : "menu-item-icon-inactive"
                  }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDown
                  className={`ml-auto w-5 h-5 transition-transform duration-200 ${openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                    ? "rotate-180 text-brand-500"
                    : ""
                    }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                href={nav.path}
                className={`menu-item group ${isActive(nav.path)
                  ? "menu-item-active border-r-4 border-brand-600 shadow-sm font-semibold"
                  : "menu-item-inactive"
                  }`}
              >
                <span
                  className={`${isActive(nav.path)
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                    }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className={`transition-all duration-300 custom-scrollbar ${openSubmenu?.type === menuType && openSubmenu?.index === index
                ? "overflow-y-auto max-h-[350px]"
                : "overflow-hidden"
                }`}
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem, idx) => {
                  if (subItem.type === 'custom' && subItem.component) {
                    return <li key={`custom-${idx}`}>{subItem.component}</li>;
                  }
                  if (subItem.type === 'separator') {
                    return <li key={`sep-${idx}`}><hr className="my-2 border-gray-200 dark:border-gray-700" /></li>;
                  }
                  if (subItem.type === 'header') {
                    return (
                      <li key={`header-${idx}`} className="px-3 mt-3 mb-1">
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          {subItem.name}
                        </span>
                      </li>
                    );
                  }

                  const itemStyle = '';

                  return (
                    <li key={`${subItem.name}-${idx}`}>
                      <Link
                        href={subItem.path}
                        className={`menu-dropdown-item ${isActive(subItem.path)
                          ? "menu-dropdown-item-active border-r-4 border-brand-600 shadow-sm font-semibold"
                          : "menu-dropdown-item-inactive"
                          } ${itemStyle}`}
                      >
                        <div className="flex flex-col">
                          <span>{subItem.name}</span>
                          {subItem.subtitle && (
                            <span className="text-[10px] text-gray-500 font-normal leading-tight dark:text-gray-400">
                              {subItem.subtitle}
                            </span>
                          )}
                        </div>
                        <span className="flex items-center gap-1 ml-auto">
                          {subItem.new && (
                            <span
                              className={`ml-auto ${isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                                } menu-dropdown-badge`}
                            >
                              new
                            </span>
                          )}
                          {subItem.pro && (
                            <span
                              className={`ml-auto ${isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                                } menu-dropdown-badge`}
                            >
                              pro
                            </span>
                          )}
                          {subItem.paymentStatus && (
                            <span
                              className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full font-medium ${subItem.paymentStatus === 'succeeded'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : subItem.paymentStatus === 'pending'
                                  ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                }`}
                            >
                              {t(subItem.paymentStatus)}
                            </span>
                          )}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 overflow-y-auto custom-scrollbar
        ${isExpanded || isMobileOpen
          ? "w-[320px]"
          : isHovered
            ? "w-[320px]"
            : "w-[120px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={` flex ${!isExpanded && !isHovered ? "lg:justify-center py-4" : "justify-start py-0"
          }`}
      >
        <Link href="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <Image
                className="dark:hidden"
                src="/images/logo/BVT-horizontal.webp"
                alt="Logo"
                width={200}
                height={40}
              />
              <Image
                className="hidden dark:block"
                src="/images/logo/BVT-horizontal.webp"
                alt="Logo"
                width={200}
                height={40}
              />
            </>
          ) : (
            <Image
              src="/images/logo/BVT-Monogram.webp"
              alt="Logo"
              width={150}
              height={150}
            />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear custom-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "justify-start"
                  }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  tSidebar('menu')
                ) : (
                  <Ellipsis className="w-5 h-5" />
                )}
              </h2>
              {renderMenuItems(navItems, "main")}
            </div>

            {(isAdmin || isSuperAdmin) && (<div className="">
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "justify-start"
                  }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  tSidebar('admin')
                ) : (
                  <Ellipsis className="w-5 h-5" />
                )}
              </h2>
              {renderMenuItems(othersItems, "others")}
            </div>)}
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;