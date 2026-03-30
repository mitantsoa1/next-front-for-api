'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Activity, Target } from 'lucide-react';

interface MetricsCardProps {
  title: string;
  value: string;
  change: number;
  target?: number;
  description: string;
  color?: 'blue' | 'green' | 'red' | 'yellow';
}

export default function UmamiMetricsCard({ 
  title, 
  value, 
  change, 
  target, 
  description, 
  color = 'blue' 
}: MetricsCardProps) {
  const getTrendIcon = () => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Activity className="h-4 w-4 text-gray-500" />;
  };

  const getColorClasses = () => {
    switch (color) {
      case 'green':
        return 'border-green-200 bg-green-50';
      case 'red':
        return 'border-red-200 bg-red-50';
      case 'yellow':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  const getTargetStatus = () => {
    if (!target) return null;
    
    const currentValue = parseFloat(value.replace(/[^0-9.-]/g, ''));
    const progress = (currentValue / target) * 100;
    
    return {
      progress,
      reached: progress >= 100,
      percentage: Math.min(progress, 100)
    };
  };

  const targetStatus = getTargetStatus();

  return (
    <Card className={`transition-all hover:shadow-md ${getColorClasses()}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        <CardDescription className="text-sm">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="text-3xl font-bold">{value}</div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getTrendIcon()}
              <span className={`text-sm font-medium ${
                change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-600'
              }`}>
                {change > 0 ? '+' : ''}{change.toFixed(1)}%
              </span>
            </div>
            
            {targetStatus && (
              <Badge 
                variant={targetStatus.reached ? "default" : "outline"}
                className={targetStatus.reached ? "bg-green-100 text-green-800" : ""}
              >
                <Target className="h-3 w-3 mr-1" />
                {targetStatus.percentage.toFixed(0)}%
              </Badge>
            )}
          </div>
          
          {targetStatus && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Objectif: {target}</span>
                <span>{targetStatus.reached ? 'Atteint!' : 'En cours'}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all ${
                    targetStatus.reached ? 'bg-green-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${targetStatus.percentage}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}