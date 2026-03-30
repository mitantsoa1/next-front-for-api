"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Search,
  UserPlus,
  Trash2,
  Edit3,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  Mail,
  Calendar,
  X,
  CheckCircle2,
  Lock,
  Activity
} from "lucide-react";
import axios from "axios";
import { useSidebar } from "@/components/Dashboard/context/SidebarContext";
import { toast } from "sonner";

const Badge = ({ children, variant = "default" }: any) => {
  const styles = {
    admin: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800",
    user: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    default: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700"
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${styles[variant as keyof typeof styles] || styles.default}`}>
      {children}
    </span>
  );
};

const UsersSkeleton = () => (
  <div className="space-y-8 pb-20 animate-pulse">
    {/* Header Skeleton */}
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div>
        <div className="h-10 w-72 bg-gray-200 dark:bg-gray-800 rounded-xl mb-2" />
        <div className="h-4 w-48 bg-gray-100 dark:bg-gray-800 rounded-lg" />
      </div>
      <div className="flex items-center gap-3 w-full md:w-auto">
        <div className="h-12 w-full md:w-64 bg-gray-100 dark:bg-gray-800 rounded-2xl" />
        <div className="h-12 w-32 bg-gray-100 dark:bg-gray-800 rounded-2xl" />
      </div>
    </div>

    {/* Table Skeleton */}
    <div className="bg-white/40 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800/50 rounded-[32px] overflow-hidden space-y-4 pt-4">
      <div className="h-8 w-full bg-gray-100/50 dark:bg-gray-800/50 mb-6" />
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex px-8 py-4 items-center gap-6 border-b border-gray-100/50 dark:border-gray-800/50">
           <div className="w-12 h-12 rounded-2xl bg-gray-200 dark:bg-gray-800" />
           <div className="space-y-2 flex-1">
             <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded-md" />
             <div className="h-3 w-48 bg-gray-200 dark:bg-gray-800 rounded-md" />
           </div>
           <div className="h-6 w-24 bg-gray-200 dark:bg-gray-800 rounded-full flex-shrink-0" />
           <div className="h-8 w-32 bg-gray-200 dark:bg-gray-800 rounded-lg flex-shrink-0" />
        </div>
      ))}
      <div className="h-16 bg-gray-100/50 dark:bg-gray-800/50" />
    </div>
  </div>
);

export default function UserManagementPage() {
  const { user } = useSidebar();
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Security check: Only admins can access this page
  useEffect(() => {
    if (user && user.role !== 'admin' && user.role !== 'superadmin') {
      toast.error("Access Prohibited: Identity verification failed");
      router.push("/dashboard");
    }
  }, [user, router]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/users");
      // The API returns paginated data: UserResource::collection($users)
      setUsers(response.data.data || response.data);
    } catch (error) {
      toast.error("Failed to retrieve citizen logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to terminate this identity?")) return;
    try {
      await axios.delete(`/api/users/${id}`);
      toast.success("Identity Purged Successfully");
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (error) {
      toast.error("Termination failed: Data redundancy detected");
    }
  };

  if (loading && users.length === 0) return <UsersSkeleton />;

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">
            User Administration
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" />
            Authorized Level: Super-Admin Access
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search Identity..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-md border border-gray-100 dark:border-gray-700 rounded-2xl py-3 pl-12 pr-6 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all w-full md:w-64"
            />
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 transition-all">
            <UserPlus className="w-4 h-4" />
            <span>ENROLL</span>
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl border border-white/20 dark:border-gray-800/20 rounded-[32px] overflow-hidden shadow-2xl shadow-black/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800/50">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">User Profile</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Role & Security</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Activity Logs</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-right">Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50">
              <AnimatePresence mode="popLayout">
                {filteredUsers.map((u, i) => (
                  <motion.tr
                    key={u.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.05 }}
                    className="group hover:bg-white/40 dark:hover:bg-white/5 transition-colors cursor-default"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-bold text-gray-400 group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-inner">
                          {u.name.charAt(0)}
                        </div>
                        <div className="space-y-0.5">
                          <p className="font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">{u.name}</p>
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                            <Mail className="w-3 h-3" />
                            {u.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-2 items-start">
                        <Badge variant={u.role}>{u.role || 'user'}</Badge>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500/80 uppercase">
                          <CheckCircle2 className="w-3 h-3" />
                          Verified
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          Created: {new Date(u.created_at).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-mono text-gray-400 opacity-60">
                          <Activity className="w-3.5 h-3.5" />
                          ID: #{u.id?.toString().padStart(5, '0')}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-end gap-2 pr-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setSelectedUser(u)}
                          className="p-3 text-blue-500 bg-blue-500/10 rounded-xl hover:bg-blue-500 hover:text-white transition-all shadow-sm"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(u.id)}
                          className="p-3 text-rose-500 bg-rose-500/10 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Pagination placeholder */}
        <div className="px-8 py-6 border-t border-gray-100 dark:border-gray-800/50 flex items-center justify-between">
          <p className="text-xs font-mono text-gray-400 uppercase tracking-widest">
            Showing {filteredUsers.length} active nodes
          </p>
          <div className="flex items-center gap-2">
            {[1, 2, 3].map(p => (
              <button key={p} className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${p === 1 ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* User Detail Sidebar (Mock) */}
      <AnimatePresence>
        {selectedUser && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedUser(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white dark:bg-gray-950 border-l border-white/10 z-60 p-10 shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between mb-12">
                <h2 className="text-2xl font-black tracking-tighter">NODE DETAILS</h2>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:rotate-90 transition-transform"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="flex flex-col items-center mb-10">
                <div className="w-32 h-32 rounded-[40px] bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 shadow-2xl shadow-primary/10">
                  <span className="text-4xl font-black text-primary">{selectedUser.name.charAt(0)}</span>
                </div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{selectedUser.name}</h3>
                <p className="text-sm font-bold text-gray-400 mt-1">{selectedUser.email}</p>
              </div>

              <div className="space-y-6 flex-1">
                <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Security Credentials</p>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-500">Access Role</span>
                      <Badge variant={selectedUser.role}>{selectedUser.role || 'user'}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-500">Email Status</span>
                      <span className="text-xs font-black text-emerald-500 uppercase">Confirmed</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Action Center</p>
                  <div className="space-y-3">
                    <button className="w-full flex items-center gap-3 p-4 bg-white dark:bg-black/20 rounded-2xl border border-gray-100 dark:border-white/5 text-xs font-bold uppercase tracking-widest hover:border-primary transition-all">
                      <Lock className="w-4 h-4 text-primary" />
                      Force Password Reset
                    </button>
                    <button className="w-full flex items-center gap-3 p-4 bg-white dark:bg-black/20 rounded-2xl border border-gray-100 dark:border-white/5 text-xs font-bold uppercase tracking-widest hover:border-amber-500 transition-all">
                      <ShieldAlert className="w-4 h-4 text-amber-500" />
                      Suspend Access
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-8 mt-auto flex gap-4">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-gray-500 bg-gray-100 dark:bg-gray-900 rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-800 transition-all"
                >
                  Close
                </button>
                <button
                  className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-white bg-primary rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Update
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
