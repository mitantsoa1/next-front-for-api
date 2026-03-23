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
  const [packsApi, setPacksApi] = useState<{ id: number; pack_name: string; status: string, order_name: string, payment_status: string, user_email?: string }[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedPayment, setSelectedPayment] = useState<string>("all");

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
      icon: <Package2 size={20} />,
      name: tSidebar('packages'),
      path: "/admin/packages",
    },
    {
      icon: <CreditCard size={20} />,
      name: tSidebar('payments'),
      path: "/admin/payments",
    },
    {
      icon: <Mail size={20} />,
      name: tSidebar('contact'),
      path: "/admin/contacts",
    },
    {
      icon: <ChartColumn size={20} />,
      name: tSidebar('analytics'),
      path: "/admin/analytics",
    },
    {
      icon: <PieChart size={20} />,
      name: tSidebar('summary'),
      path: "/admin/summary",
    },
    {
      icon: <File size={20} />,
      name: tSidebar('legal'),
      subItems: [
        {
          name: 'CGU',
          path: '/admin/cgu',
        },
        {
          name: 'RGPD',
          path: '/admin/rgpd',
        },
        {
          name: 'CGV',
          path: '/admin/cgv',
        },
      ]

    },
    {
      icon: <FileClock size={20} />,
      name: tSidebar('history'),
      path: "/admin/history",
    },
    {
      icon: <Box size={20} />, // Using Box as a temporary icon, will change to Database if available or keep fallback
      name: tSidebar('backups'),
      path: "/admin/backups",
    },
  ], [tSidebar]);

  const fetchPacks = useCallback(async () => {
    try {
      const response = await fetch('/api/user/packs');
      if (!response.ok) {
        throw new Error('Failed to fetch packs');
      }
      const data = await response.json();
      setPacksApi(data);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    fetchPacks();

    // Listen for pack updates from other components
    window.addEventListener('packUpdated', fetchPacks);
    return () => {
      window.removeEventListener('packUpdated', fetchPacks);
    };
  }, [fetchPacks]);

  const navItems = useMemo(() => [
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
    {
      icon: <HelpCircle size={20} />,
      name: tSidebar('supports'),
      path: "/support",
    },
    {
      name: tSidebar('plan'),
      icon: <Package2 size={20} />,
      subItems: (() => {
        const items: any[] = [];
        const hasActiveFilters = searchQuery !== "" || selectedUser !== "all" || selectedStatus !== "all" || selectedPayment !== "all";

        // Extraire les options uniques pour les filtres
        const uniqueUsers = Array.from(new Set(packsApi.map(p => p.user_email).filter(Boolean))) as string[];
        const uniqueStatuses = Array.from(new Set(packsApi.map(p => p.status).filter(Boolean))) as string[];
        const uniquePayments = Array.from(new Set(packsApi.map(p => p.payment_status).filter(Boolean))) as string[];

        // Widget de recherche et filtre
        items.push({
          type: 'custom',
          name: 'search-filter',
          path: '',
          component: (
            <div className="px-5 pb-3 pt-1 space-y-2 sticky top-0 bg-white dark:bg-gray-900 z-10" onClick={(e) => e.stopPropagation()}>
              <div className="relative">
                <input
                  type="text"
                  placeholder={tSidebar('search_placeholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-2 pr-7 py-1.5 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
                {hasActiveFilters && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedUser("all");
                      setSelectedStatus("all");
                      setSelectedPayment("all");
                    }}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-red-500 hover:text-red-700 transition-colors"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              <div className="space-y-1.5">
                {/* User Filter */}
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full px-2 py-1 text-[10px] bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-500 text-gray-600 dark:text-gray-300"
                >
                  <option value="all">{tSidebar('all_users')}</option>
                  {uniqueUsers.map(email => (
                    <option key={email} value={email}>{email}</option>
                  ))}
                </select>

                {/* Status Filter */}
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-2 py-1 text-[10px] bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-500 text-gray-600 dark:text-gray-300"
                >
                  <option value="all">{tSidebar('all_statuses')}</option>
                  {uniqueStatuses.map(status => {
                    const statusKey = status.toLowerCase();
                    let translatedStatus = status;
                    try {
                      translatedStatus = tStatus(statusKey);
                    } catch (e) {
                      translatedStatus = status;
                    }
                    return (
                      <option key={status} value={status}>{translatedStatus}</option>
                    );
                  })}
                </select>

                {/* Payment Status Filter */}
                <select
                  value={selectedPayment}
                  onChange={(e) => setSelectedPayment(e.target.value)}
                  className="w-full px-2 py-1 text-[10px] bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-500 text-gray-600 dark:text-gray-300"
                >
                  <option value="all">{tSidebar('all_payments')}</option>
                  {uniquePayments.map(status => (
                    <option key={status} value={status}>{t(status)}</option>
                  ))}
                </select>
              </div>
            </div>
          )
        });

        const packGroups: Record<string, typeof packsApi> = {};

        // Filtrage
        const filteredPacks = packsApi.filter(pack => {
          // Filtre recherche
          if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const matchesName = (pack.order_name || pack.pack_name || pack.status || pack.payment_status || '').toLowerCase().includes(query);
            const matchesEmail = (pack.user_email || '').toLowerCase().includes(query);
            if (!matchesName && !matchesEmail) return false;
          }

          // Filtre User
          if (selectedUser !== 'all' && pack.user_email !== selectedUser) {
            return false;
          }

          // Filtre Status
          if (selectedStatus !== 'all' && pack.status !== selectedStatus) {
            return false;
          }

          // Filtre Payment
          if (selectedPayment !== 'all' && pack.payment_status !== selectedPayment) {
            return false;
          }

          return true;
        });

        // Grouper les packs filtrés par nom (pack_name)
        filteredPacks.forEach(pack => {
          const key = pack.pack_name || 'Autre';
          if (!packGroups[key]) {
            packGroups[key] = [];
          }
          packGroups[key].push(pack);
        });

        const sortedPackNames = Object.keys(packGroups).sort();

        sortedPackNames.forEach((packName, index) => {
          const group = packGroups[packName];

          if (group.length > 0) {
            // Ajouter un séparateur avant chaque groupe
            items.push({ name: 'separator', path: '', type: 'separator' });

            // Ajouter l'en-tête du groupe (Nom du pack)
            items.push({ name: packName, path: '', type: 'header' });

            // Ajouter les packs du groupe
            group.forEach(pack => {
              const itemName = pack.order_name || pack.pack_name;
              items.push({
                name: itemName,
                path: `/pack/${pack.id}`,
                pro: false,
                paymentStatus: pack.payment_status,
                subtitle: pack.user_email,
                packName: pack.pack_name
              });
            });
          }
        });

        return items;
      })()
    },
  ], [packsApi, searchQuery, selectedUser, selectedStatus, selectedPayment, tSidebar, tStatus, t]);

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