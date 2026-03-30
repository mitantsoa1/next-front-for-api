'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Download, FileSpreadsheet, FileText, Image } from 'lucide-react';
import { umamiAPI, getDateRange } from '@/components/umami/lib/umami';

interface ExportButtonProps {
  selectedPeriod: string;
  data?: any;
}

export default function UmamiExportButton({ selectedPeriod, data }: ExportButtonProps) {
  const t = useTranslations('analytics.export');
  const ts = useTranslations('analytics.dashboard.stats');
  const [exporting, setExporting] = useState(false);

  const exportToCSV = async () => {
    if (!umamiAPI || !data) return;

    setExporting(true);
    try {
      const { startAt, endAt } = getDateRange(selectedPeriod);

      // Récupérer les données détaillées
      const [stats, topPages, countries] = await Promise.all([
        umamiAPI.getStats(startAt, endAt),
        umamiAPI.getTopPages(startAt, endAt),
        umamiAPI.getCountryStats(startAt, endAt)
      ]);

      // Créer le CSV
      let csvContent = `${t('csvHeader')}\n`;

      // Ajouter les stats générales
      csvContent += `${t('csvStat')},${ts('visitors')},${stats.visitors},\n`;
      csvContent += `${t('csvStat')},${ts('pageViews')},${stats.pageviews},\n`;
      csvContent += `${t('csvStat')},${ts('visits')},${stats.visits},\n`;
      csvContent += `${t('csvStat')},${ts('bounceRate')},${stats.bounces},\n`;
      csvContent += `${t('csvStat')},${ts('avgDuration')},${stats.totaltime},\n`;

      // Ajouter les pages populaires
      topPages.forEach(page => {
        csvContent += `${t('csvPage')},"${page.name}",${page.visitors},\n`;
      });

      // Ajouter les pays
      const totalSessions = countries.reduce((sum, country) => sum + country.visitors, 0);
      countries.forEach(country => {
        const percentage = totalSessions > 0 ? (country.visitors / totalSessions * 100).toFixed(1) : '0';
        csvContent += `${t('csvCountry')},"${country.name}",${country.visitors},${percentage}%\n`;
      });

      // Télécharger le fichier
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `analytics-bluevaloris-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();

    } catch (error) {
      console.error(t('error'), error);
    } finally {
      setExporting(false);
    }
  };

  const exportToJSON = async () => {
    if (!data) return;

    const exportData = {
      period: selectedPeriod,
      exportDate: new Date().toISOString(),
      data: data
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json;charset=utf-8;'
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `analytics-bluevaloris-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const printReport = () => {
    window.print();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={exporting}>
          <Download className="h-4 w-4 mr-2" />
          {exporting ? t('exporting') : t('button')}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToCSV}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          {t('csv')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToJSON}>
          <FileText className="h-4 w-4 mr-2" />
          {t('json')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={printReport}>
          <Image className="h-4 w-4 mr-2" />
          {t('print')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}