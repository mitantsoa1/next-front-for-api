// "use client";
// import Image from "next/image";
// import Link from "next/link";
// import React, { useState } from "react";
// import { Dropdown } from "../dropdown/Dropdown";
// import { DropdownItem } from "../dropdown/DropdownItem";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { authApiClient } from "@/lib/axios";
// import { INotification, INotificationResponse } from "@/types/notification.d";
// import { formatDistanceToNow } from "date-fns";
// import { fr } from "date-fns/locale/fr";
// import { enUS } from "date-fns/locale/en-US";
// import { Bell, MessageSquare, UserPlus, Info, Loader2, Check, Trash2, FileText, Activity, ExternalLink } from "lucide-react";
// import { useRouter } from "next/navigation";
// import { useLocale, useTranslations } from "next-intl";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
//   DialogFooter,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";

// export default function NotificationDropdown() {
//   const [isOpen, setIsOpen] = useState(false);
//   const queryClient = useQueryClient();
//   const router = useRouter();
//   const locale = useLocale();
//   const t = useTranslations("notifications");
//   const [selectedNotification, setSelectedNotification] = useState<INotification | null>(null);

//   // Get date-fns locale
//   const dateLocale = locale === "fr" ? fr : enUS;

//   const { data: notificationData, isLoading } = useQuery({
//     queryKey: ["notifications"],
//     queryFn: async () => {
//       const res = await authApiClient.get("/notifications");
//       return res.data as INotificationResponse;
//     },
//     refetchInterval: 60000, // Refetch every minute
//   });

//   const markAsReadMutation = useMutation({
//     mutationFn: async (id: string) => {
//       return authApiClient.post(`/notifications/${id}/read`);
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["notifications"] });
//     },
//   });

//   const markAllAsReadMutation = useMutation({
//     mutationFn: async () => {
//       return authApiClient.post("/notifications/read-all");
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["notifications"] });
//     },
//   });

//   const deleteMutation = useMutation({
//     mutationFn: async (id: string) => {
//       return authApiClient.delete(`/notifications/${id}`);
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["notifications"] });
//     },
//   });

//   function toggleDropdown() {
//     setIsOpen(!isOpen);
//   }

//   function closeDropdown() {
//     setIsOpen(false);
//   }

//   const getNotificationIcon = (type: string) => {
//     switch (type) {
//       case "App\\Notifications\\NewUserRegistered":
//         return <UserPlus className="w-5 h-5 text-blue-500" />;
//       case "message":
//         return <MessageSquare className="w-5 h-5 text-green-500" />;
//       case "App\\Notifications\\DatabaseChangeNotification":
//         return <Bell className="w-5 h-5 text-orange-500" />;
//       case "App\\Notifications\\ProjectActivityNotification":
//       case "App\\Notifications\\OrderUpdated":
//         return <Activity className="w-5 h-5 text-purple-500" />;
//       case "App\\Notifications\\SupportTicketNotification":
//       case "App\\Notifications\\GeneralSupportNotification":
//         return <MessageSquare className="w-5 h-5 text-orange-500" />;
//       default:
//         return <Info className="w-5 h-5 text-gray-500" />;
//     }
//   };

//   const notifications = notificationData?.notifications.data || [];
//   const unreadCount = notificationData?.unread_count || 0;

//   return (
//     <div className="relative">
//       <button
//         className="relative dropdown-toggle flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full hover:text-gray-700 h-10 w-10 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
//         onClick={toggleDropdown}
//       >
//         {unreadCount > 0 && (
//           <span
//             className={`absolute right-0 top-0.5 z-10 h-2 w-2 rounded-full bg-orange-400 flex`}
//           >
//             <span className="absolute inline-flex w-full h-full bg-orange-400 rounded-full opacity-75 animate-ping"></span>
//           </span>
//         )}
//         <svg
//           className="fill-current"
//           width="20"
//           height="20"
//           viewBox="0 0 20 20"
//           xmlns="http://www.w3.org/2000/svg"
//         >
//           <path
//             fillRule="evenodd"
//             clipRule="evenodd"
//             d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z"
//             fill="currentColor"
//           />
//         </svg>
//       </button>
//       <Dropdown
//         isOpen={isOpen}
//         onClose={closeDropdown}
//         className="absolute -right-[240px] mt-[17px] flex h-[480px] w-[350px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark sm:w-[361px] lg:right-0"
//       >
//         <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 dark:border-gray-700">
//           <div className="flex items-center gap-2">
//             <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
//               {t('title')}
//             </h5>
//             {unreadCount > 0 && (
//               <span className="flex items-center justify-center h-5 px-1.5 text-xs font-medium text-white bg-orange-400 rounded-full">
//                 {unreadCount}
//               </span>
//             )}
//           </div>
//           <div className="flex items-center gap-2">
//             {unreadCount > 0 && (
//               <button
//                 onClick={() => markAllAsReadMutation.mutate()}
//                 className="text-xs text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
//                 title={t('markAllAsRead')}
//               >
//                 {t('markAllAsRead').split(' ').slice(-2).join(' ')}
//               </button>
//             )}
//             <button
//               onClick={toggleDropdown}
//               className="text-gray-500 transition dropdown-toggle dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
//             >
//               <svg
//                 className="fill-current"
//                 width="24"
//                 height="24"
//                 viewBox="0 0 24 24"
//                 xmlns="http://www.w3.org/2000/svg"
//               >
//                 <path
//                   fillRule="evenodd"
//                   clipRule="evenodd"
//                   d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
//                   fill="currentColor"
//                 />
//               </svg>
//             </button>
//           </div>
//         </div>
//         <ul className="flex flex-col h-auto overflow-y-auto custom-scrollbar">
//           {isLoading ? (
//             <div className="flex items-center justify-center p-8">
//               <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
//             </div>
//           ) : notifications.length === 0 ? (
//             <div className="flex flex-col items-center justify-center p-8 text-center">
//               <Bell className="w-12 h-12 mb-3 text-gray-200" />
//               <p className="text-sm text-gray-500">{t('emptyTitle')}</p>
//             </div>
//           ) : (
//             notifications.map((notification) => (
//               <li key={notification.id} className="relative group">
//                 <DropdownItem
//                   onItemClick={() => {
//                     if (!notification.read_at) markAsReadMutation.mutate(notification.id);
//                     setSelectedNotification(notification);
//                   }}
//                   className={`flex gap-3 rounded-lg border-b border-gray-100 p-3 px-4.5 py-3 hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-white/5 ${!notification.read_at ? "bg-blue-50/50 dark:bg-blue-900/10" : ""
//                     }`}
//                 >
//                   <span className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 shrink-0">
//                     {getNotificationIcon(notification.type)}
//                     {!notification.read_at && (
//                       <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-white dark:border-gray-900"></span>
//                     )}
//                   </span>

//                   <span className="block flex-1">
//                     <span className="mb-1.5 block text-theme-sm text-gray-500 dark:text-gray-400">
//                       <span className="font-medium text-gray-800 dark:text-white/90">
//                         {notification.data.title || t('defaultTitle')}
//                       </span>
//                       <p className="mt-0.5 line-clamp-2">
//                         {notification.data.message || t('defaultMessage')}
//                       </p>
//                     </span>

//                     <span className="flex items-center gap-2 text-gray-500 text-theme-xs dark:text-gray-400">
//                       <span>
//                         {formatDistanceToNow(new Date(notification.created_at || ''), { addSuffix: true, locale: dateLocale })}
//                       </span>
//                     </span>
//                   </span>
//                 </DropdownItem>
//                 <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity pr-2">
//                   {!notification.read_at && (
//                     <button
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         markAsReadMutation.mutate(notification.id);
//                       }}
//                       className="p-1 text-blue-500 hover:bg-blue-100 rounded-md dark:hover:bg-blue-900/30"
//                       title={t('markAsRead')}
//                     >
//                       <Check className="w-4 h-4" />
//                     </button>
//                   )}
//                   <button
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       deleteMutation.mutate(notification.id);
//                     }}
//                     className="p-1 text-red-500 hover:bg-red-100 rounded-md dark:hover:bg-red-900/30"
//                     title={t('delete')}
//                   >
//                     <Trash2 className="w-4 h-4" />
//                   </button>
//                 </div>
//               </li>
//             ))
//           )}
//         </ul>
//         <Link
//           href="/notifications"
//           className="block px-4 py-2 mt-3 text-sm font-medium text-center text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
//         >
//           {t('viewAll')}
//         </Link>
//       </Dropdown>

//       {/* Full Notification Modal */}
//       <Dialog open={!!selectedNotification} onOpenChange={(open) => !open && setSelectedNotification(null)}>
//         <DialogContent className="sm:max-w-[500px] z-99999">
//           <DialogHeader>
//             <div className="flex items-center gap-3 mb-2">
//               <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
//                 {selectedNotification && getNotificationIcon(selectedNotification.type)}
//               </div>
//               <DialogTitle className="text-xl">
//                 {selectedNotification?.data.title || t('defaultTitle')}
//               </DialogTitle>
//             </div>
//             <DialogDescription className="text-sm text-gray-500">
//               {selectedNotification && formatDistanceToNow(new Date(selectedNotification.created_at || ''), { addSuffix: true, locale: dateLocale })}
//             </DialogDescription>
//           </DialogHeader>

//           <div className="py-4">
//             <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
//               {selectedNotification?.data.message || t('defaultMessage')}
//             </p>
//           </div>

//           <DialogFooter className="flex flex-col sm:flex-row gap-3">
//             <Button
//               variant="outline"
//               onClick={() => setSelectedNotification(null)}
//               className="flex-1"
//             >
//               {t("close")}
//             </Button>
//             {(selectedNotification?.data.action_url || selectedNotification?.data.url) && (
//               <Button
//                 onClick={() => {
//                   const actionUrl = selectedNotification.data.action_url || selectedNotification.data.url;
//                   router.push(`/${locale}${actionUrl}`);
//                   setSelectedNotification(null);
//                   closeDropdown();
//                 }}
//                 className="flex-1 gap-2"
//               >
//                 <ExternalLink className="w-4 h-4" />
//                 {t("viewDetails")}
//               </Button>
//             )}
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }
