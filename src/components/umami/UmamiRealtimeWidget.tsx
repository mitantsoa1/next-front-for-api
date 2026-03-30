'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { umamiAPI } from '@/components/umami/lib/umami';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Users, Clock, MapPin } from 'lucide-react';

interface RealtimeSession {
  id: string;
  country: string;
  browser: string;
  os: string;
  device: string;
  url: string;
  timestamp: number;
}

export default function UmamiRealtimeWidget() {
  const t = useTranslations('analytics.realtime');
  const [activeVisitors, setActiveVisitors] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRealtimeData = async () => {
    if (!umamiAPI) {
      setError(t('configMissing'));
      setLoading(false);
      return;
    }

    try {
      // Utiliser getActiveSessions qui retourne un nombre
      const activeCount = await umamiAPI.getActiveSessions();
      setActiveVisitors(activeCount);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRealtimeData();

    // Actualiser toutes les 30 secondes
    const interval = setInterval(loadRealtimeData, 30000);

    return () => clearInterval(interval);
  }, []);

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = Math.floor((now - timestamp) / 1000);

    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    return `${Math.floor(diff / 3600)}h`;
  };

  const getDeviceIcon = (device: string) => {
    if (device.toLowerCase().includes('mobile')) return '📱';
    if (device.toLowerCase().includes('tablet')) return '📱';
    return '💻';
  };

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-800 flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            {t('error')}
          </CardTitle>
          <CardDescription className="text-red-600">{error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-0 bg-linear-to-br from-emerald-50 to-green-50">
      <CardHeader className="bg-linear-to-r from-emerald-600 to-green-600 text-white rounded-t-lg py-2">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Activity className={`h-5 w-5 mr-2 ${activeVisitors > 0 ? 'text-green-200 animate-pulse' : 'text-gray-300'}`} />
            {t('title')}
          </div>
          <Badge variant="outline" className="bg-white/20 text-white border-white/30">
            <Users className="h-3 w-3 mr-1" />
            {loading ? '...' : activeVisitors}
          </Badge>
        </CardTitle>
        <CardDescription className="text-emerald-100 text-xs">
          {t('subtitle')}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {loading ? (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 animate-pulse mx-auto mb-3 text-emerald-500" />
            <p className="text-emerald-700 font-medium">{t('loading')}</p>
          </div>
        ) : (
          <div className="text-center py-4">
            <div className={`text-6xl font-bold mb-4 ${activeVisitors > 0 ? 'text-emerald-600' : 'text-gray-400'}`}>
              {activeVisitors}
            </div>
            {activeVisitors > 0 ? (
              <div className="space-y-2">
                <p className="text-emerald-700 font-semibold">
                  🟢 {activeVisitors === 1 ? t('visitorConnected') : t('visitorsConnected')}
                </p>
                <p className="text-emerald-600 text-sm">
                  {t('updateFrequency')}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-gray-600 font-medium">
                  💤 {t('noVisitor')}
                </p>
                <p className="text-gray-500 text-sm">
                  {t('noVisitorDesc')}
                </p>
              </div>
            )}

            {/* Indicateur de dernière mise à jour */}
            <div className="mt-6 pt-4 border-t border-emerald-100">
              <div className="flex items-center justify-center text-xs text-emerald-600">
                <Clock className="h-3 w-3 mr-1" />
                {t('lastUpdate')}: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}