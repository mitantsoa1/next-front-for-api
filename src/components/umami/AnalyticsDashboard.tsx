'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import {
  umamiAPI,
  getDateRange,
  processStats,
  processTopPages,
  processCountries,
  processDevices,
  formatDuration,
  calculatePercentageChange,
  type ProcessedStats,
  type ProcessedTopPage,
  type ProcessedCountry,
  type ProcessedDevice,
  type UmamiPageView,
  type UmamiExpandedMetric
} from '@/components/umami/lib/umami';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ComposedChart,
  ReferenceLine,
  RadialBarChart,
  RadialBar,
  Legend
} from 'recharts';
import {
  Users,
  Eye,
  MousePointer,
  Timer,
  TrendingUp,
  TrendingDown,
  Activity,
  Globe,
  Smartphone,
  Monitor,
  RefreshCw,
  Calendar,
  BarChart3,
  Clock,
  Target,
  Zap,
  Award,
  Star,
  MapPin,
  Chrome,
  Cpu
} from 'lucide-react';
import UmamiRealtimeWidget from './UmamiRealtimeWidget';
import UmamiExportButton from './UmamiExportButton';

interface StatCardProps {
  title: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  description?: string;
  gradient?: string;
}

function StatCard({ title, value, change, trend, icon, description, gradient }: StatCardProps) {
  const t = useTranslations('analytics.dashboard');
  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Target className="h-4 w-4 text-gray-400" />;
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'text-green-600 font-semibold';
    if (trend === 'down') return 'text-red-600 font-semibold';
    return 'text-gray-500';
  };

  const gradientClass = gradient || 'from-blue-50 to-indigo-50 border-blue-200';

  return (
    <Card className={`bg-linear-to-br ${gradientClass} shadow-lg hover:shadow-xl transition-all duration-300 border-l-4`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-700">{title}</CardTitle>
        <div className="p-2 rounded-full bg-white shadow-sm">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
        {description && (
          <p className="text-xs text-gray-600 mb-2">{description}</p>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1 text-xs">
            {getTrendIcon()}
            <span className={getTrendColor()}>
              {change !== 0 ? `${change > 0 ? '+' : ''}${change.toFixed(1)}%` : '0%'}
            </span>
          </div>
          <span className="text-xs text-gray-500">{t('previousPeriod')}</span>
        </div>
      </CardContent>
    </Card>
  );
}

// Nouveau composant pour les métriques avancées
interface AdvancedMetricCardProps {
  title: string;
  data: any[];
  icon: React.ReactNode;
  gradient: string;
}

function AdvancedMetricCard({ title, data, icon, gradient }: AdvancedMetricCardProps) {
  const t = useTranslations('analytics.dashboard');
  const total = data.reduce((sum, item) => sum + (item.visitors || item.sessions || item.views || item.y || 0), 0);
  const topItem = data[0];

  return (
    <Card className={`bg-linear-to-br ${gradient} shadow-lg hover:shadow-xl transition-all duration-300`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-gray-700">
          <div className="p-2 rounded-full bg-white shadow-sm">
            {icon}
          </div>
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold text-gray-900">{total.toLocaleString()}</span>
            <Badge variant="secondary" className="bg-white/80">
              {data.length} {t('elements')}
            </Badge>
          </div>

          {topItem && (
            <div className="bg-white/60 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700 truncate max-w-[120px]">
                  {topItem.name || topItem.page || topItem.country || topItem.device || topItem.x || t('topElement')}
                </span>
                <div className="text-right">
                  <div className="font-bold text-gray-900">
                    {(topItem.visitors || topItem.sessions || topItem.y || topItem.views || 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-600">
                    {((topItem.visitors || topItem.sessions || topItem.y || topItem.views || 0) / total * 100).toFixed(1)} %
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-1">
            {data.slice(1, 4).map((item, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <span className="text-gray-600 truncate max-w-[100px]">
                  {item.name || item.page || item.country || item.device || item.x || `${t('element')} ${index + 2}`}
                </span>
                <span className="font-medium text-gray-700">
                  {(item.visitors || item.sessions || item.y || item.views || 0).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AnalyticsDashboard() {
  const t = useTranslations('analytics.dashboard');

  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [stats, setStats] = useState<ProcessedStats | null>(null);
  const [pageViews, setPageViews] = useState<UmamiPageView[]>([]);
  const [topPages, setTopPages] = useState<ProcessedTopPage[]>([]);
  const [countries, setCountries] = useState<ProcessedCountry[]>([]);
  const [devices, setDevices] = useState<ProcessedDevice[]>([]);
  const [browsers, setBrowsers] = useState<ProcessedDevice[]>([]);
  const [os, setOs] = useState<ProcessedDevice[]>([]);
  const [activeSessions, setActiveSessions] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);



  // // Debug useEffect pour surveiller les changements de topPages
  // useEffect(() => {
  //   console.log('🔄 topPages state updated:', topPages);
  //   console.log('📊 topPages.length:', topPages.length);
  // }, [topPages]);


  const loadAnalytics = async (period: string) => {
    try {
      setLoading(true);
      setError(null);

      const { startAt, endAt } = getDateRange(period);

      // Charger toutes les données avec gestion d'erreur individuelle
      const promises = [
        { name: 'stats', promise: umamiAPI.getStats(startAt, endAt) },
        { name: 'pageViews', promise: umamiAPI.getPageViews(startAt, endAt, period === '7d' ? 'day' : period === '30d' ? 'day' : 'week') },
        { name: 'topPages', promise: umamiAPI.getTopPages(startAt, endAt) },
        { name: 'countries', promise: umamiAPI.getCountryStats(startAt, endAt) },
        { name: 'devices', promise: umamiAPI.getDeviceStats(startAt, endAt) },
        { name: 'browsers', promise: umamiAPI.getBrowserStats(startAt, endAt) },
        { name: 'os', promise: umamiAPI.getOSStats(startAt, endAt) },
        { name: 'activeSessions', promise: umamiAPI.getActiveSessions() }
      ];

      const results = await Promise.allSettled(promises.map(p => p.promise));

      // Traiter les résultats et identifier les erreurs
      const errors: string[] = [];
      let statsData = null;
      let pageViewsData = null;
      let topPagesData = null;
      let countriesData = null;
      let devicesData = null;
      let browsersData = null;
      let osData = null;
      let activeSessionsData = null;

      results.forEach((result, index) => {
        const promiseName = promises[index].name;

        if (result.status === 'fulfilled') {
          switch (promiseName) {
            case 'stats': statsData = result.value; break;
            case 'pageViews': pageViewsData = result.value; break;
            case 'topPages': topPagesData = result.value; break;
            case 'countries': countriesData = result.value; break;
            case 'devices': devicesData = result.value; break;
            case 'browsers': browsersData = result.value; break;
            case 'os': osData = result.value; break;
            case 'activeSessions': activeSessionsData = result.value; break;
          }
        } else {
          const errorMessage = result.reason?.message || t('unknownError');
          errors.push(`${promiseName}: ${errorMessage}`);
          console.error(`Erreur lors du chargement de ${promiseName}:`, result.reason);

          // Valeurs par défaut pour éviter les erreurs de rendu
          switch (promiseName) {
            case 'stats':
              statsData = { visitors: 0, pageviews: 0, visits: 0, bounces: 0, totaltime: 0 };
              break;
            case 'pageViews': pageViewsData = []; break;
            case 'topPages': topPagesData = []; break;
            case 'countries': countriesData = []; break;
            case 'devices': devicesData = []; break;
            case 'browsers': browsersData = []; break;
            case 'os': osData = []; break;
            case 'activeSessions': activeSessionsData = 0; break;
          }
        }
      });

      // Si toutes les données principales ont échoué, afficher l'erreur globale
      if (!statsData || errors.length >= 6) {
        throw new Error(`${t('loadingFailed')}: ${errors.slice(0, 3).join(', ')}${errors.length > 3 ? '...' : ''}`);
      }

      // Si certaines données ont échoué, afficher un avertissement mais continuer
      if (errors.length > 0) {
        console.warn(`${t('someDataFailed')}: ${errors.join(', ')}`);
        setWarnings(errors);
      } else {
        setWarnings([]);
      }

      setStats(processStats(statsData || { visitors: 0, pageviews: 0, visits: 0, bounces: 0, totaltime: 0 }));
      setPageViews(pageViewsData || []);
      setTopPages(processTopPages(topPagesData || []));
      setCountries(processCountries(countriesData || []));
      setDevices(processDevices(devicesData || []));
      setBrowsers(processDevices(browsersData || []));
      setOs(processDevices(osData || []));
      setActiveSessions(activeSessionsData || 0);


    } catch (err: any) {
      setError(err.message || t('loadingFailed'));
      console.error('Analytics error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics(selectedPeriod);
  }, [selectedPeriod]);

  const formatChartData = (data: UmamiPageView[]) => {
    return data.map(item => ({
      date: new Date(item.x).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric'
      }),
      views: item.y
    }));
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">{t('errorTitle')}</CardTitle>
            <CardDescription className="text-red-600">{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Warnings */}
      {warnings.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800 text-sm flex items-center gap-2">
              {t('warningsTitle')}
            </CardTitle>
            <CardDescription className="text-yellow-700 text-xs">
              {t('warningsSome')}
              <ul className="mt-1 ml-4 space-y-1">
                {warnings.map((warning, index) => (
                  <li key={index} className="list-disc">{warning}</li>
                ))}
              </ul>
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t('title')}</h2>
          <p className="text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Activity className="h-3 w-3 mr-1" />
            {activeSessions} {t('onlineUsers')}
          </Badge>
          <UmamiExportButton
            selectedPeriod={selectedPeriod}
            data={{ stats, pageViews, topPages, countries, devices, browsers, os }}
          />
          <button
            onClick={() => loadAnalytics(selectedPeriod)}
            disabled={loading}
            className="p-2 rounded-md border hover:bg-gray-50 disabled:opacity-50"
            title={t('refreshData')}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Period Selection */}
      <div className="flex space-x-2">
        {[
          { value: '7d', label: t('periods.7d') },
          { value: '30d', label: t('periods.30d') },
          { value: '90d', label: t('periods.90d') },
          { value: '1y', label: t('periods.1y') }
        ].map((period) => (
          <button
            key={period.value}
            onClick={() => setSelectedPeriod(period.value)}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${selectedPeriod === period.value
              ? 'bg-blue-100 text-blue-700 border border-blue-200'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            <Calendar className="h-3 w-3 mr-1 inline" />
            {period.label}
          </button>
        ))}
      </div>

      {/* Stats Cards Enhanced */}
      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="animate-pulse bg-linear-to-br from-gray-50 to-gray-100">
              <CardHeader className="space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : stats ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
          <StatCard
            title={t('stats.visitors')}
            value={stats.visitors?.current?.toLocaleString() || '0'}
            change={stats.visitors?.change || 0}
            trend={stats.visitors?.trend || 'neutral'}
            icon={<Users className="h-5 w-5 text-blue-600" />}
            description={t('stats.visitorsDesc')}
            gradient="from-blue-50 to-cyan-50 border-blue-300"
          />
          <StatCard
            title={t('stats.pageViews')}
            value={stats.pageViews?.current?.toLocaleString() || '0'}
            change={stats.pageViews?.change || 0}
            trend={stats.pageViews?.trend || 'neutral'}
            icon={<Eye className="h-5 w-5 text-green-600" />}
            description={t('stats.pageViewsDesc')}
            gradient="from-green-50 to-emerald-50 border-green-300"
          />
          <StatCard
            title={t('stats.visits')}
            value={stats.visits?.current?.toLocaleString() || '0'}
            change={stats.visits?.change || 0}
            trend={stats.visits?.trend || 'neutral'}
            icon={<MousePointer className="h-5 w-5 text-purple-600" />}
            description={t('stats.visitsDesc')}
            gradient="from-purple-50 to-violet-50 border-purple-300"
          />
          <StatCard
            title={t('stats.bounceRate')}
            value={`${(stats.bounceRate?.current || 0).toFixed(1)}%`}
            change={stats.bounceRate?.change || 0}
            trend={stats.bounceRate?.trend || 'neutral'}
            icon={<Target className="h-5 w-5 text-orange-600" />}
            description={t('stats.bounceRateDesc')}
            gradient="from-orange-50 to-amber-50 border-orange-300"
          />
          <StatCard
            title={t('stats.avgDuration')}
            value={stats.avgSession?.current || '0min'}
            change={stats.avgSession?.change || 0}
            trend={stats.avgSession?.trend || 'neutral'}
            icon={<Clock className="h-5 w-5 text-indigo-600" />}
            description={t('stats.avgDurationDesc')}
            gradient="from-indigo-50 to-blue-50 border-indigo-300"
          />
        </div>
      ) : null}

      {/* Quick Insights Cards */}
      {!loading && (topPages.length > 0 || countries.length > 0 || devices.length > 0) && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* { console.log('ici', topPages)} */}
          {topPages.length > 0 && (
            <AdvancedMetricCard
              title={t('quickInsights.popularPages')}
              data={topPages}
              icon={<BarChart3 className="h-5 w-5 text-blue-600" />}
              gradient="from-blue-50 via-indigo-50 to-purple-50"
            />
          )}
          {countries.length > 0 && (
            <AdvancedMetricCard
              title={t('quickInsights.topCountries')}
              data={countries}
              icon={<MapPin className="h-5 w-5 text-green-600" />}
              gradient="from-green-50 via-emerald-50 to-teal-50"
            />
          )}
          {browsers.length > 0 && (
            <AdvancedMetricCard
              title={t('quickInsights.browsers')}
              data={browsers}
              icon={<Chrome className="h-5 w-5 text-orange-600" />}
              gradient="from-orange-50 via-amber-50 to-yellow-50"
            />
          )}
          {devices.length > 0 && (
            <AdvancedMetricCard
              title={t('quickInsights.devices')}
              data={devices}
              icon={<Smartphone className="h-5 w-5 text-purple-600" />}
              gradient="from-purple-50 via-violet-50 to-pink-50"
            />
          )}
        </div>
      )}

      {/* Charts and Data */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">{t('tabs.overview')}</TabsTrigger>
          <TabsTrigger value="pages">{t('tabs.pages')}</TabsTrigger>
          <TabsTrigger value="audience">{t('tabs.audience')}</TabsTrigger>
          <TabsTrigger value="technology">{t('tabs.technology')}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2">
              <Card className="shadow-lg border-0 bg-linear-to-br from-white to-gray-50">
                <CardHeader className="bg-primary  text-white rounded-t-lg py-2">
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-6 w-6" />
                    <span>{t('overview.pageViewsEvolution')}</span>
                  </CardTitle>
                  <CardDescription className="text-blue-100 text-xs">
                    {t('overview.pageViewsAnalysis')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  {loading ? (
                    <Skeleton className="h-80 w-full rounded-lg" />
                  ) : (
                    <ResponsiveContainer width="100%" height={350}>
                      <ComposedChart data={formatChartData(pageViews)}>
                        <defs>
                          <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.2} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 12, fill: '#6B7280' }}
                          axisLine={{ stroke: '#D1D5DB' }}
                        />
                        <YAxis
                          tick={{ fontSize: 12, fill: '#6B7280' }}
                          axisLine={{ stroke: '#D1D5DB' }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                          labelFormatter={(label) => `📅 ${label}`}
                          formatter={(value) => [
                            `${value?.toLocaleString()} ${t('pages.views')}`,
                            `👁️ ${t('stats.pageViews')}`
                          ]}
                        />
                        <Area
                          type="monotone"
                          dataKey="views"
                          stroke="#3B82F6"
                          strokeWidth={3}
                          fill="url(#colorViews)"
                        />
                        <Line
                          type="monotone"
                          dataKey="views"
                          stroke="#1D4ED8"
                          strokeWidth={2}
                          dot={{ fill: '#1D4ED8', strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, fill: '#1D4ED8' }}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>
            <div className="space-y-4">
              <UmamiRealtimeWidget />

              {/* Mini Performance Card */}
              {stats && (
                <Card className="shadow-lg border-0 bg-linear-to-br from-emerald-50 to-teal-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center space-x-2 text-emerald-700">
                      <Zap className="h-5 w-5" />
                      <span>{t('overview.performance')}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{t('overview.engagementRate')}</span>
                        <span className="font-bold text-emerald-700">
                          {(100 - (stats.bounceRate?.current || 0)).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-emerald-100 rounded-full h-2">
                        <div
                          className="bg-linear-to-r from-emerald-400 to-teal-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(0, Math.min(100, 100 - (stats.bounceRate?.current || 0)))}%` }}
                        ></div>
                      </div>

                      <div className="flex justify-between items-center pt-2">
                        <span className="text-sm text-gray-600">{t('overview.pagesPerSession')}</span>
                        <span className="font-bold text-emerald-700">
                          {stats.visits?.current && stats.visits.current > 0
                            ? ((stats.pageViews?.current || 0) / stats.visits.current).toFixed(1)
                            : '0'
                          }
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="pages" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2">
              <Card className="shadow-lg border-0 bg-linear-to-br from-white to-gray-50">
                <CardHeader className="bg-linear-to-r from-indigo-600 to-blue-600 text-white rounded-t-lg py-2">
                  <CardTitle className="flex items-center space-x-2">
                    <Award className="h-6 w-6" />
                    <span>{t('pages.mostVisited')}</span>
                  </CardTitle>
                  <CardDescription className="text-indigo-100 text-xs">
                    {t('pages.detailedAnalysis')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  {loading ? (
                    <div className="space-y-4">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Skeleton key={i} className="h-16 w-full rounded-lg" />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {topPages.map((page, index) => {
                        const isTop3 = index < 3;
                        const getRankColor = (rank: number) => {
                          if (rank === 0) return 'from-yellow-400 to-orange-500 text-white';
                          if (rank === 1) return 'from-gray-300 to-gray-400 text-gray-700';
                          if (rank === 2) return 'from-amber-600 to-yellow-600 text-white';
                          return 'from-blue-100 to-indigo-100 text-blue-700';
                        };

                        const maxViews = Math.max(...topPages.map(p => p.views || 0)) || 1;
                        const percentage = ((page.views || 0) / maxViews) * 100;

                        return (
                          <div
                            key={`${page.page}-${index}`}
                            className={`relative p-4 rounded-xl ${isTop3 ? 'bg-linear-to-r from-white to-blue-50 border-l-4 border-blue-400 shadow-md' : 'bg-gray-50 hover:bg-gray-100'} transition-all duration-300 hover:shadow-lg`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4 flex-1">
                                <div className={`w-10 h-10 rounded-full bg-linear-to-r ${getRankColor(index)} flex items-center justify-center text-sm font-bold shadow-lg`}>
                                  {isTop3 ? ['🥇', '🥈', '🥉'][index] : index + 1}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2">
                                    <p className="font-semibold text-gray-900 truncate max-w-xs">
                                      {page.page === '/' ? t('pages.home') : page.page || '/'}
                                    </p>
                                    {isTop3 && <Star className="h-4 w-4 text-yellow-500" />}
                                  </div>
                                  <div className="flex items-center space-x-4 mt-1">
                                    <span className="text-sm font-medium text-indigo-600">
                                      👁️ {(page.views || 0).toLocaleString()} {t('pages.views')}
                                    </span>
                                    <div className="flex-1 max-w-32">
                                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                                        <div
                                          className="bg-linear-to-r from-indigo-400 to-blue-500 h-1.5 rounded-full transition-all duration-500"
                                          style={{ width: `${percentage}%` }}
                                        ></div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center space-x-3">
                                {(page.change || 0) !== 0 && (
                                  <Badge
                                    variant={(page.change || 0) > 0 ? 'default' : 'destructive'}
                                    className="font-medium"
                                  >
                                    {(page.change || 0) > 0 ? '📈 +' : '📉 '}{Math.abs(page.change || 0).toFixed(1)}%
                                  </Badge>
                                )}
                                <span className="text-xs text-gray-500 min-w-12 text-right">
                                  {percentage.toFixed(1)}%
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Pages Performance Chart */}
            <div>
              <Card className="shadow-lg border-0 bg-linear-to-br from-purple-50 to-pink-50">
                <CardHeader className="bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-t-lg py-2">
                  <CardTitle className="flex items-center space-x-2 text-sm">
                    <BarChart3 className="h-5 w-5" />
                    <span>{t('pages.distribution')}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  {loading ? (
                    <Skeleton className="h-64 w-full" />
                  ) : (
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={topPages.slice(0, 5)} layout="horizontal">
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis type="number" tick={{ fontSize: 10 }} />
                        <YAxis
                          type="category"
                          dataKey="page"
                          tick={{ fontSize: 10 }}
                          width={60}
                          tickFormatter={(value) => value === '/' ? t('pages.home') : value.slice(0, 8) + '...'}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                          formatter={(value, name) => [`${value?.toLocaleString()} ${t('pages.views')}`, t('pages.pages')]}
                        />
                        <Bar
                          dataKey="views"
                          fill="url(#colorPages)"
                          radius={[0, 4, 4, 0]}
                        >
                          <defs>
                            <linearGradient id="colorPages" x1="0" y1="0" x2="1" y2="0">
                              <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
                              <stop offset="95%" stopColor="#EC4899" stopOpacity={0.8} />
                            </linearGradient>
                          </defs>
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="audience" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="shadow-lg border-0 bg-linear-to-br from-green-50 to-emerald-50">
              <CardHeader className="bg-linear-to-r from-green-600 to-emerald-600 text-white rounded-t-lg py-2">
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-6 w-6" />
                  <span>{t('audience.globalAudience')}</span>
                </CardTitle>
                <CardDescription className="text-green-100 text-xs">
                  {t('audience.geographicDistribution')}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="h-12 w-full rounded-lg" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {countries.slice(0, 8).map((country, index) => {
                      const maxSessions = countries[0]?.sessions || 1;
                      const percentage = ((country.sessions || 0) / maxSessions) * 100;

                      return (
                        <div
                          key={`${country.country}-${index}`}
                          className="relative p-3 rounded-xl bg-white/80 hover:bg-white border border-green-100 transition-all duration-300 hover:shadow-md"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="text-2xl">{country.flag}</div>
                              <div>
                                <p className="font-semibold text-gray-900">{country.country}</p>
                                <div className="w-32 bg-green-100 rounded-full h-1.5 mt-1">
                                  <div
                                    className="bg-linear-to-r from-green-400 to-emerald-500 h-1.5 rounded-full transition-all duration-500"
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-gray-900 text-lg">
                                {(country.sessions || 0).toLocaleString()}
                              </div>
                              <div className="text-sm font-medium text-green-600">
                                {(country.percentage || 0).toFixed(1)}%
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-linear-to-br from-purple-50 to-pink-50">
              <CardHeader className="bg-linear-to-r from-primary to-[#1C74BC] text-white rounded-t-lg py-2">
                <CardTitle className="flex items-center space-x-2">
                  <Smartphone className="h-6 w-6" />
                  <span>{t('audience.deviceTypes')}</span>
                </CardTitle>
                <CardDescription className="text-purple-100 text-xs">
                  {t('audience.techPreferences')}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {loading ? (
                  <Skeleton className="h-80 w-full rounded-lg" />
                ) : (
                  <div className="space-y-4">
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <defs>
                          <linearGradient id="device1" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#00367d" />
                            <stop offset="100%" stopColor="#0040ff" />
                          </linearGradient>
                          <linearGradient id="device2" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#0033cc" />
                            <stop offset="100%" stopColor="#1a53ff" />
                          </linearGradient>
                          <linearGradient id="device3" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#0039e6" />
                            <stop offset="100%" stopColor="#3366ff" />
                          </linearGradient>
                        </defs>
                        <Pie
                          data={devices.map((device, index) => ({
                            name: device.device,
                            value: device.sessions,
                            percentage: device.percentage,
                            fill: [`url(#device1)`, `url(#device2)`, `url(#device3)`, '#F59E0B', '#EF4444'][index % 5]
                          }))}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={90}
                          innerRadius={40}
                          paddingAngle={5}
                          label={(entry: any) => `${entry.name}\n${entry.percentage?.toFixed(1) || 0}%`}
                          labelLine={false}
                        >
                          {devices.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={[`url(#device1)`, `url(#device2)`, `url(#device3)`, '#F59E0B', '#EF4444'][index % 5]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                          formatter={(value, name) => [
                            `${value?.toLocaleString()} ${t('stats.visits')}`,
                            name
                          ]}
                        />
                        <Legend
                          verticalAlign="bottom"
                          height={36}
                          formatter={(value, entry) => (
                            <span style={{ color: entry.color, fontWeight: 'bold' }}>
                              {value}
                            </span>
                          )}
                        />
                      </PieChart>
                    </ResponsiveContainer>

                    {/* Device Stats Summary */}
                    <div className="grid grid-cols-3 gap-3 mt-4">
                      {devices.slice(0, 3).map((device, index) => (
                        <div key={device.device} className="text-center p-3 bg-white/80 rounded-lg border border-purple-100">
                          <div className="text-2xl mb-1">
                            {device.device === 'desktop' ? '🖥️' :
                              device.device === 'mobile' ? '📱' :
                                device.device === 'tablet' ? '📊' : '💻'}
                          </div>
                          <div className="font-bold text-primary">
                            {device.percentage.toFixed(1)}%
                          </div>
                          <div className="text-xs text-gray-600 capitalize">
                            {device.device === 'desktop' ? t('technology.desktop') :
                              device.device === 'mobile' ? t('technology.mobile') :
                                device.device === 'tablet' ? t('technology.tablet') : device.device}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="technology" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="shadow-lg border-0 bg-linear-to-br from-orange-50 to-red-50">
              <CardHeader className="bg-linear-to-r from-orange-600 to-red-600 text-white rounded-t-lg py-2">
                <CardTitle className="flex items-center space-x-2">
                  <Chrome className="h-6 w-6" />
                  <span>{t('technology.webBrowsers')}</span>
                </CardTitle>
                <CardDescription className="text-orange-100 text-xs">
                  {t('technology.browsingTechnologies')}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="h-12 w-full rounded-lg" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {browsers.slice(0, 6).map((browser, index) => {
                      const getBrowserIcon = (name: string) => {
                        const lowerName = name.toLowerCase();
                        if (lowerName.includes('chrome')) return '🌐';
                        if (lowerName.includes('firefox')) return '🦊';
                        if (lowerName.includes('safari')) return '🧭';
                        if (lowerName.includes('edge')) return '🌊';
                        if (lowerName.includes('opera')) return '🎭';
                        return '💻';
                      };

                      const maxSessions = browsers[0]?.sessions || 1;
                      const relativePercentage = ((browser.sessions || 0) / maxSessions) * 100;

                      return (
                        <div
                          key={`${browser.device}-${index}`}
                          className="relative p-4 rounded-xl bg-white/80 hover:bg-white border border-orange-100 transition-all duration-300 hover:shadow-md group"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="text-2xl group-hover:scale-110 transition-transform duration-200">
                                {getBrowserIcon(browser.device)}
                              </div>
                              <div className="flex-1">
                                <p className="font-semibold text-gray-900">{browser.device}</p>
                                <div className="w-40 bg-orange-100 rounded-full h-2 mt-1">
                                  <div
                                    className="bg-linear-to-r from-orange-400 to-red-500 h-2 rounded-full transition-all duration-700"
                                    style={{ width: `${relativePercentage}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-gray-900 text-lg">
                                {(browser.sessions || 0).toLocaleString()}
                              </div>
                              <div className="text-sm font-medium text-orange-600">
                                {(browser.percentage || 0).toFixed(1)}%
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-linear-to-br from-cyan-50 to-blue-50">
              <CardHeader className="bg-linear-to-r from-cyan-600 to-blue-600 text-white rounded-t-lg py-2">
                <CardTitle className="flex items-center space-x-2">
                  <Cpu className="h-6 w-6" />
                  <span>{t('technology.operatingSystems')}</span>
                </CardTitle>
                <CardDescription className="text-cyan-100 text-xs">
                  {t('technology.systemPreferences')}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="h-12 w-full rounded-lg" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* OS List */}
                    <div className="space-y-3">
                      {os.slice(0, 6).map((osItem, index) => {
                        const getOSIcon = (name: string) => {
                          const lowerName = name.toLowerCase();
                          if (lowerName.includes('windows')) return '🪟';
                          if (lowerName.includes('mac') || lowerName.includes('darwin')) return '🍎';
                          if (lowerName.includes('linux')) return '🐧';
                          if (lowerName.includes('android')) return '🤖';
                          if (lowerName.includes('ios')) return '📱';
                          return '💾';
                        };

                        const maxSessions = os[0]?.sessions || 1;
                        const relativePercentage = ((osItem.sessions || 0) / maxSessions) * 100;

                        return (
                          <div
                            key={`${osItem.device}-${index}`}
                            className="relative p-3 rounded-xl bg-white/80 hover:bg-white border border-cyan-100 transition-all duration-300 hover:shadow-md group"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="text-2xl group-hover:scale-110 transition-transform duration-200">
                                  {getOSIcon(osItem.device)}
                                </div>
                                <div className="flex-1">
                                  <p className="font-semibold text-gray-900">{osItem.device}</p>
                                  <div className="w-32 bg-cyan-100 rounded-full h-1.5 mt-1">
                                    <div
                                      className="bg-linear-to-r from-cyan-400 to-blue-500 h-1.5 rounded-full transition-all duration-700"
                                      style={{ width: `${relativePercentage}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-gray-900">
                                  {(osItem.sessions || 0).toLocaleString()}
                                </div>
                                <div className="text-sm font-medium text-cyan-600">
                                  {(osItem.percentage || 0).toFixed(1)}%
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* OS Summary Cards */}
                    {os.length >= 2 && (
                      <div className="mt-6 grid grid-cols-2 gap-3">
                        <div className="text-center p-3 bg-linear-to-br from-white to-cyan-50 rounded-lg border border-cyan-200">
                          <div className="text-lg font-bold text-cyan-700">
                            {(os.filter(item => item.device?.toLowerCase().includes('windows')).reduce((sum, item) => sum + (item.percentage || 0), 0) +
                              os.filter(item => item.device?.toLowerCase().includes('mac')).reduce((sum, item) => sum + (item.percentage || 0), 0)).toFixed(1)}%
                          </div>
                          <div className="text-xs text-gray-600">{t('technology.desktop')}</div>
                        </div>
                        <div className="text-center p-3 bg-linear-to-br from-white to-cyan-50 rounded-lg border border-cyan-200">
                          <div className="text-lg font-bold text-cyan-700">
                            {(os.filter(item => item.device?.toLowerCase().includes('android')).reduce((sum, item) => sum + (item.percentage || 0), 0) +
                              os.filter(item => item.device?.toLowerCase().includes('ios')).reduce((sum, item) => sum + (item.percentage || 0), 0)).toFixed(1)}%
                          </div>
                          <div className="text-xs text-gray-600">{t('technology.mobile')}</div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}