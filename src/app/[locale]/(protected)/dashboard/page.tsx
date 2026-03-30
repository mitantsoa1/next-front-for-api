"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import Link from "next/link";
import { 
  Users, 
  TrendingUp, 
  Activity, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  UserPlus,
  ArrowRight
} from "lucide-react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";

const StatCard = ({ title, value, icon: Icon, trend, trendValue, delay }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="relative overflow-hidden group bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl border border-white/20 dark:border-gray-800/20 rounded-3xl p-6 shadow-2xl shadow-black/5"
  >
    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-500" />
    
    <div className="flex items-center justify-between mb-4">
      <div className="p-3 bg-primary/10 rounded-2xl">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-sm font-medium ${trend === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
          {trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
          {trendValue}%
        </div>
      )}
    </div>
    
    <div className="space-y-1">
      <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">{title}</h3>
      <div className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-gray-900 to-gray-500 dark:from-white dark:to-gray-400">
        {value}
      </div>
    </div>
  </motion.div>
);

const DashboardSkeleton = () => (
  <div className="space-y-8 pb-10 animate-pulse">
    {/* Header section skeleton */}
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <div className="h-10 w-64 bg-gray-200 dark:bg-gray-800 rounded-xl mb-2" />
        <div className="h-4 w-48 bg-gray-100 dark:bg-gray-800 rounded-lg" />
      </div>
      <div className="h-10 w-40 bg-gray-100 dark:bg-gray-800 rounded-2xl" />
    </div>

    {/* Stats Grid skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 h-[140px]" />
      ))}
    </div>

    {/* Charts skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 h-[400px]" />
      <div className="bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 h-[400px]" />
    </div>
  </div>
);

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get("/api/dashboard/stats");
        setStats(response.data);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const chartData = [
    { name: 'Mon', users: 400 },
    { name: 'Tue', users: 300 },
    { name: 'Wed', users: 600 },
    { name: 'Thu', users: 800 },
    { name: 'Fri', users: 500 },
    { name: 'Sat', users: 900 },
    { name: 'Sun', users: 1100 },
  ];

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-8 pb-10">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-black bg-clip-text text-transparent bg-linear-to-r from-gray-900 via-gray-700 to-gray-500 dark:from-white dark:via-gray-200 dark:to-gray-500"
          >
            Vitals Overview
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-500 dark:text-gray-400 mt-1"
          >
            Welcome back to your command center.
          </motion.p>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-2 p-1 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/20 rounded-2xl"
        >
          <div className="px-4 py-2 text-sm font-medium text-primary bg-primary/10 rounded-xl">
            Live Updates
          </div>
          <div className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400">
            {new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
          </div>
        </motion.div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Users" 
          value={stats?.stats?.total_users || 0} 
          icon={Users} 
          trend="up" 
          trendValue={stats?.stats?.weekly_growth || 0}
          delay={0.1}
        />
        <StatCard 
          title="Daily New" 
          value={stats?.stats?.new_users_today || 0} 
          icon={UserPlus} 
          trend="up" 
          trendValue={12}
          delay={0.2}
        />
        <StatCard 
          title="Active Sessions" 
          value={stats?.stats?.active_sessions || 0} 
          icon={Activity} 
          trend="down" 
          trendValue={3}
          delay={0.3}
        />
        <StatCard 
          title="Growth Rate" 
          value={`${stats?.stats?.weekly_growth || 0}%`} 
          icon={TrendingUp} 
          trend="up" 
          trendValue={stats?.stats?.weekly_growth || 0}
          delay={0.4}
        />
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-8 shadow-xl shadow-black/2"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold">User Acquisition</h3>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
              <Calendar className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888820" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#888', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#888', fontSize: 12 }} 
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                    background: 'rgba(255,255,255,0.9)',
                    backdropFilter: 'blur(10px)'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="users" 
                  stroke="var(--color-primary)" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorUsers)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-8 shadow-xl shadow-black/2"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold">Recent Registration</h3>
            <Link href="/admin/users" className="text-primary hover:underline flex items-center gap-1 text-sm font-medium">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="space-y-6">
            {stats?.recent_users?.map((user: any, index: number) => (
              <div key={user.id} className="flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center font-bold text-gray-400 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">{user.name}</h4>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
                <div className="text-xs text-gray-400 font-medium">
                  {new Date(user.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
