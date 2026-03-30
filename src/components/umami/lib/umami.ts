import { authApiClient } from '@/lib/axios';

// Types pour l'API Umami (adaptés aux vraies données)
export interface UmamiStats {
  pageviews: number;
  visitors: number;
  visits: number;
  bounces: number;
  totaltime: number;
  comparison?: {
    pageviews: number;
    visitors: number;
    visits: number;
    bounces: number;
    totaltime: number;
  };
}

// Types pour les métriques étendues (vraie structure)
export interface UmamiExpandedMetric {
  name: string;
  visitors: number;
  pageviews: number;
  visits: number;
  bounces: number;
  totaltime: number;
}

// Type pour les données temporelles
export interface UmamiPageViewData {
  pageviews: Array<{ x: string; y: number }>;
  sessions: Array<{ x: string; y: number }>;
}

// Type pour les sessions actives
export interface UmamiActiveData {
  visitors: number;
}

export interface UmamiPageView {
  x: string;
  y: number;
}

export interface UmamiTopPage {
  x: string;
  y: number;
}

export interface UmamiCountryData {
  x: string;
  y: number;
}

export interface UmamiDeviceData {
  x: string;
  y: number;
}

export interface UmamiReferrerData {
  x: string;
  y: number;
}

export interface UmamiEventData {
  x: string;
  y: number;
}

export interface UmamiRealtimeData {
  timestamp: number;
  __id: string;
  website_id: string;
  session_id: string;
  created_at: string;
  url: string;
  referrer: string;
  title: string;
  query: string;
  event: string;
  browser: string;
  os: string;
  device: string;
  screen: string;
  language: string;
  country: string;
}

class UmamiAPI {
  private async request(endpoint: string, params: any = {}) {
    try {
      const response = await authApiClient.get(`/analytics/umami${endpoint}`, {
        params,
        timeout: 60000, // 60 secondes de timeout
      });

      return response.data;
    } catch (error: any) {
      if (error.response) {
        // Erreur de densité du serveur
        const status = error.response.status;
        const message = error.response.data?.message || error.response.statusText;

        switch (status) {
          case 401:
            throw new Error(`Session expirée ou non autorisée. Veuillez vous reconnecter.`);
          case 403:
            throw new Error(`Accès refusé aux statistiques. Droits administrateur requis.`);
          case 404:
            throw new Error(`Service analytics non disponible (404).`);
          default:
            throw new Error(`Erreur API Backend (${status}): ${message}`);
        }
      } else if (error.request) {
        throw new Error(`Impossible de joindre le serveur. Vérifiez votre connexion.`);
      }

      console.error('Umami Proxy API Error:', error);
      throw new Error(`Erreur Analytics: ${error.message}`);
    }
  }

  // Obtenir les statistiques générales
  async getStats(startAt: number, endAt: number): Promise<UmamiStats> {
    return this.request('/stats', {
      startAt,
      endAt,
    });
  }

  // Obtenir les pages vues dans le temps
  async getPageViews(startAt: number, endAt: number, unit: string = 'day'): Promise<UmamiPageView[]> {
    const response = await this.request('/pageviews', {
      startAt,
      endAt,
      unit,
    });
    return response.pageviews || [];
  }

  // Obtenir les pages les plus visitées (avec métriques étendues)
  async getTopPages(startAt: number, endAt: number): Promise<UmamiExpandedMetric[]> {
    const response = await this.request('/metrics/expanded', {
      startAt,
      endAt,
      type: 'url',
      metric: 'pageviews',
    });
    return response || [];
  }

  // Obtenir les données par pays (avec métriques étendues)
  async getCountryStats(startAt: number, endAt: number): Promise<UmamiExpandedMetric[]> {
    const response = await this.request('/metrics/expanded', {
      startAt,
      endAt,
      type: 'country',
      metric: 'visitors',
    });
    return response || [];
  }

  // Obtenir les données par appareil (avec métriques étendues)
  async getDeviceStats(startAt: number, endAt: number): Promise<UmamiExpandedMetric[]> {
    const response = await this.request('/metrics/expanded', {
      startAt,
      endAt,
      type: 'device',
      metric: 'visitors',
    });
    return response || [];
  }

  // Obtenir les données par navigateur (avec métriques étendues)
  async getBrowserStats(startAt: number, endAt: number): Promise<UmamiExpandedMetric[]> {
    const response = await this.request('/metrics/expanded', {
      startAt,
      endAt,
      type: 'browser',
      metric: 'visitors',
    });
    return response || [];
  }

  // Obtenir les données par OS (avec métriques étendues)
  async getOSStats(startAt: number, endAt: number): Promise<UmamiExpandedMetric[]> {
    const response = await this.request('/metrics/expanded', {
      startAt,
      endAt,
      type: 'os',
      metric: 'visitors',
    });
    return response || [];
  }

  // Obtenir les référents
  async getReferrerStats(startAt: number, endAt: number): Promise<UmamiReferrerData[]> {
    const response = await this.request('/metrics', {
      startAt,
      endAt,
      type: 'referrer',
    });
    return response || [];
  }

  // Obtenir les événements
  async getEventStats(startAt: number, endAt: number): Promise<UmamiEventData[]> {
    const response = await this.request('/events', {
      startAt,
      endAt,
    });
    return response || [];
  }

  // Obtenir les séries temporelles d'événements
  async getEventSeries(startAt: number, endAt: number, unit: string = 'day', eventName?: string): Promise<any[]> {
    const params: any = { startAt, endAt, unit };
    if (eventName) {
      params.eventName = eventName;
    }
    const response = await this.request('/events/series', params);
    return response || [];
  }

  // Obtenir les métriques étendues
  async getExpandedMetrics(startAt: number, endAt: number, type: string, metric: string): Promise<any[]> {
    const response = await this.request('/metrics/expanded', {
      startAt,
      endAt,
      type,
      metric,
    });
    return response || [];
  }

  // Obtenir les données en temps réel
  async getRealtimeData(): Promise<UmamiRealtimeData[]> {
    const response = await this.request('/active');
    return response || [];
  }

  // Obtenir les sessions actives
  async getActiveSessions(): Promise<number> {
    try {
      const response: UmamiActiveData = await this.request('/active');
      return response?.visitors || 0;
    } catch (error) {
      console.error('Error fetching active sessions:', error);
      return 0;
    }
  }
}

// Instance singleton
export const umamiAPI = new UmamiAPI();



// Utilitaires pour les dates

export const getDateRange = (period: string) => {

  const now = new Date();

  const endAt = now.getTime();

  let startAt: number;



  switch (period) {

    case '7d':

      startAt = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).getTime();

      break;

    case '30d':

      startAt = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).getTime();

      break;

    case '90d':

      startAt = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).getTime();

      break;

    case '1y':

      startAt = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).getTime();

      break;

    default:

      startAt = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).getTime();

  }



  return { startAt, endAt };

};



// Fonction pour formater la durée

export const formatDuration = (seconds: number): string => {

  const minutes = Math.floor(seconds / 60);

  const remainingSeconds = seconds % 60;

  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;

};



// Fonction pour calculer le changement en pourcentage

export const calculatePercentageChange = (current: number, previous: number): number => {

  if (previous === 0) return current > 0 ? 100 : 0;

  return ((current - previous) / previous) * 100;

};



// Mapping des codes pays vers les drapeaux

export const countryFlags: { [key: string]: string } = {
  'FR': '🇫🇷',
  'MU': '🇲🇺',
  'MG': '🇲🇬', // Madagascar
  'AE': '🇦🇪',
  'GB': '🇬🇧',
  'DE': '🇩🇪',
  'US': '🇺🇸',
  'CA': '🇨🇦',
  'AU': '🇦🇺',
  'IN': '🇮🇳',
  'SG': '🇸🇬',
  'BE': '🇧🇪',
  'CH': '🇨🇭',
  'IT': '🇮🇹',
  'ES': '🇪🇸',
  'NL': '🇳🇱',
};



export const getCountryFlag = (countryCode: string): string => {

  return countryFlags[countryCode?.toUpperCase()] || '🌍';

};



// --- Data Processing ---



export interface ProcessedStats {

  visitors: {

    current: number;

    previous: number;

    change: number;

    trend: 'up' | 'down' | 'neutral';

  };

  pageViews: {

    current: number;

    previous: number;

    change: number;

    trend: 'up' | 'down' | 'neutral';

  };

  visits: {

    current: number;

    previous: number;

    change: number;

    trend: 'up' | 'down' | 'neutral';

  };

  bounceRate: {

    current: number;

    previous: number;

    change: number;

    trend: 'up' | 'down' | 'neutral';

  };

  avgSession: {

    current: string;

    previous: string;

    change: number;

    trend: 'up' | 'down' | 'neutral';

  };

}



export interface ProcessedTopPage {

  page: string;

  views: number;

  change: number;

}



export interface ProcessedCountry {

  country: string;

  flag: string;

  sessions: number;

  percentage: number;

}



export interface ProcessedDevice {

  device: string;

  sessions: number;

  percentage: number;

}



export const processStats = (currentStats: UmamiStats): ProcessedStats => {

  const calculateTrend = (change: number): 'up' | 'down' | 'neutral' => {

    if (change > 0) return 'up';

    if (change < 0) return 'down';

    return 'neutral';

  };



  // Utiliser les données de comparaison si disponibles, sinon 0
  const comparison = currentStats.comparison || {
    pageviews: 0,
    visitors: 0,
    visits: 0,
    bounces: 0,
    totaltime: 0
  };

  const visitorsChange = calculatePercentageChange(currentStats.visitors, comparison.visitors);
  const pageViewsChange = calculatePercentageChange(currentStats.pageviews, comparison.pageviews);
  const visitsChange = calculatePercentageChange(currentStats.visits, comparison.visits);

  const currentBounceRate = currentStats.visits > 0 ? (currentStats.bounces / currentStats.visits) * 100 : 0;
  const previousBounceRate = comparison.visits > 0 ? (comparison.bounces / comparison.visits) * 100 : 0;
  const bounceRateChange = calculatePercentageChange(currentBounceRate, previousBounceRate);

  const currentAvgSession = currentStats.visits > 0 ? currentStats.totaltime / currentStats.visits : 0;
  const previousAvgSession = comparison.visits > 0 ? comparison.totaltime / comparison.visits : 0;

  const sessionChange = calculatePercentageChange(currentAvgSession, previousAvgSession);



  return {
    visitors: {
      current: currentStats.visitors,
      previous: comparison.visitors,
      change: visitorsChange,
      trend: calculateTrend(visitorsChange),
    },
    pageViews: {
      current: currentStats.pageviews,
      previous: comparison.pageviews,
      change: pageViewsChange,
      trend: calculateTrend(pageViewsChange),
    },
    visits: {
      current: currentStats.visits,
      previous: comparison.visits,
      change: visitsChange,
      trend: calculateTrend(visitsChange),
    },
    bounceRate: {
      current: currentBounceRate,
      previous: previousBounceRate,
      change: bounceRateChange,
      trend: calculateTrend(-bounceRateChange), // Négatif car une baisse du taux de rebond est positive
    },
    avgSession: {
      current: formatDuration(Math.round(currentAvgSession)),
      previous: formatDuration(Math.round(previousAvgSession)),
      change: sessionChange,
      trend: calculateTrend(sessionChange),
    },
  };

};



export const processTopPages = (pages: UmamiExpandedMetric[], previousPages: UmamiExpandedMetric[] = []): ProcessedTopPage[] => {
  // console.log('🔍 processTopPages INPUT:', pages);
  // console.log('📊 pages.length:', pages.length);

  if (!Array.isArray(pages)) {
    console.error('❌ pages is not an array:', typeof pages, pages);
    return [];
  }

  if (pages.length === 0) {
    console.warn('⚠️ pages array is empty');
    return [];
  }

  const result = pages.slice(0, 10).map((page, index) => {
    // console.log(`📄 Processing page ${index}:`, page);

    if (!page || typeof page !== 'object') {
      console.error(`❌ Invalid page object at index ${index}:`, page);
      return null;
    }

    if (!page.name || typeof page.pageviews !== 'number') {
      console.error(`❌ Missing required fields in page ${index}:`, {
        name: page.name,
        pageviews: page.pageviews,
        type_pageviews: typeof page.pageviews
      });
      return null;
    }

    const previousPage = previousPages.find(p => p.name === page.name);
    const change = previousPage ? calculatePercentageChange(page.pageviews, previousPage.pageviews) : 0;

    const processedPage = {
      page: page.name,
      views: page.pageviews,
      change,
    };

    // console.log(`✅ Processed page ${index}:`, processedPage);
    return processedPage;
  }).filter(page => page !== null); // Filtrer les pages invalides

  // console.log('🎯 processTopPages OUTPUT:', result);
  // console.log('📊 result.length:', result.length);

  return result;
};



export const processCountries = (countryData: UmamiExpandedMetric[]): ProcessedCountry[] => {
  const total = countryData.reduce((sum, country) => sum + country.visitors, 0);

  return countryData.slice(0, 10).map(country => ({
    country: country.name || 'Unknown',
    flag: getCountryFlag(country.name),
    sessions: country.visitors,
    percentage: total > 0 ? (country.visitors / total) * 100 : 0,
  }));
};



export const processDevices = (deviceData: UmamiExpandedMetric[]): ProcessedDevice[] => {
  const total = deviceData.reduce((sum, device) => sum + device.visitors, 0);

  return deviceData.map(device => ({
    device: device.name || 'Unknown',
    sessions: device.visitors,
    percentage: total > 0 ? (device.visitors / total) * 100 : 0,
  }));
};