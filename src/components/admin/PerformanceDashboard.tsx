import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, TrendingUp, AlertTriangle, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend
} from "recharts";

interface PerformanceMetric {
  id: string;
  request_id: string;
  operation: string;
  total_duration_ms: number;
  checkpoints: Record<string, number> | null;
  metadata: Record<string, any> | null;
  created_at: string;
}

interface OperationStats {
  operation: string;
  avgDuration: number;
  maxDuration: number;
  minDuration: number;
  count: number;
  errorRate: number;
}

export const PerformanceDashboard = () => {
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d'>('24h');

  // Fetch performance metrics
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['performance-metrics', timeRange],
    queryFn: async () => {
      const now = new Date();
      const since = new Date(now.getTime() - (
        timeRange === '1h' ? 60 * 60 * 1000 :
        timeRange === '24h' ? 24 * 60 * 60 * 1000 :
        7 * 24 * 60 * 60 * 1000
      ));

      const { data, error } = await supabase
        .from('performance_metrics')
        .select('*')
        .gte('created_at', since.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PerformanceMetric[];
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Calculate statistics
  const stats: OperationStats[] = metrics
    ? Object.entries(
        metrics.reduce((acc, m) => {
          const baseOp = m.operation.split(':')[0]; // Group by base operation
          if (!acc[baseOp]) {
            acc[baseOp] = {
              operation: baseOp,
              durations: [],
              errors: 0,
              total: 0,
            };
          }
          acc[baseOp].durations.push(m.total_duration_ms);
          acc[baseOp].total++;
          if (m.operation.includes(':error') || m.operation.includes(':failed')) {
            acc[baseOp].errors++;
          }
          return acc;
        }, {} as Record<string, any>)
      ).map(([_, group]) => ({
        operation: group.operation,
        avgDuration: Math.round(
          group.durations.reduce((a: number, b: number) => a + b, 0) / group.durations.length
        ),
        maxDuration: Math.max(...group.durations),
        minDuration: Math.min(...group.durations),
        count: group.total,
        errorRate: (group.errors / group.total) * 100,
      }))
    : [];

  const sortedByDuration = [...stats].sort((a, b) => b.avgDuration - a.avgDuration);
  const slowestOperations = sortedByDuration.slice(0, 5);
  
  const totalRequests = metrics?.length || 0;
  const avgResponseTime = stats.length > 0
    ? Math.round(stats.reduce((sum, s) => sum + s.avgDuration, 0) / stats.length)
    : 0;
  const slowRequests = metrics?.filter(m => m.total_duration_ms > 5000).length || 0;
  const errorCount = metrics?.filter(m => 
    m.operation.includes(':error') || m.operation.includes(':failed')
  ).length || 0;

  // Time series data for the chart
  const timeSeriesData = metrics
    ? metrics
        .slice(0, 50) // Last 50 requests
        .reverse()
        .map((m, idx) => ({
          index: idx + 1,
          duration: m.total_duration_ms,
          operation: m.operation.split(':')[0],
          timestamp: new Date(m.created_at).toLocaleTimeString(),
        }))
    : [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-muted rounded-lg" />
          <div className="h-64 bg-muted rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with time range selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Performance Metrics</h2>
          <p className="text-muted-foreground">
            Edge function execution monitoring and bottleneck identification
          </p>
        </div>
        <div className="flex gap-2">
          {(['1h', '24h', '7d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                timeRange === range
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              {range === '1h' ? 'Last Hour' : range === '24h' ? '24 Hours' : '7 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRequests}</div>
            <p className="text-xs text-muted-foreground">
              Across {stats.length} operations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgResponseTime}ms</div>
            <p className="text-xs text-muted-foreground">
              Mean execution time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Slow Requests</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{slowRequests}</div>
            <p className="text-xs text-muted-foreground">
              Over 5 seconds ({((slowRequests / totalRequests) * 100).toFixed(1)}%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Errors</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{errorCount}</div>
            <p className="text-xs text-muted-foreground">
              Failed operations ({((errorCount / totalRequests) * 100).toFixed(1)}%)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Response Time Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Response Time Timeline</CardTitle>
          <CardDescription>
            Last 50 requests showing execution duration over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="index" 
                label={{ value: 'Request #', position: 'insideBottom', offset: -5 }}
                className="text-xs"
              />
              <YAxis 
                label={{ value: 'Duration (ms)', angle: -90, position: 'insideLeft' }}
                className="text-xs"
              />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-background border rounded-lg p-3 shadow-lg">
                        <p className="font-semibold">{payload[0].payload.operation}</p>
                        <p className="text-sm">Duration: {payload[0].value}ms</p>
                        <p className="text-xs text-muted-foreground">{payload[0].payload.timestamp}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line 
                type="monotone" 
                dataKey="duration" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))', r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Slowest Operations - Bottleneck Identification */}
      <Card>
        <CardHeader>
          <CardTitle>Slowest Operations</CardTitle>
          <CardDescription>
            Operations with highest average execution time - potential bottlenecks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={slowestOperations} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis type="number" label={{ value: 'Avg Duration (ms)', position: 'insideBottom', offset: -5 }} />
              <YAxis dataKey="operation" type="category" width={180} className="text-xs" />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-background border rounded-lg p-3 shadow-lg">
                        <p className="font-semibold">{data.operation}</p>
                        <p className="text-sm">Avg: {data.avgDuration}ms</p>
                        <p className="text-sm">Max: {data.maxDuration}ms</p>
                        <p className="text-sm">Min: {data.minDuration}ms</p>
                        <p className="text-sm">Calls: {data.count}</p>
                        {data.errorRate > 0 && (
                          <p className="text-sm text-destructive">Errors: {data.errorRate.toFixed(1)}%</p>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar 
                dataKey="avgDuration" 
                fill="hsl(var(--primary))"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* All Operations Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Operations</CardTitle>
          <CardDescription>
            Complete performance breakdown by operation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium">Operation</th>
                  <th className="text-right p-2 font-medium">Avg (ms)</th>
                  <th className="text-right p-2 font-medium">Max (ms)</th>
                  <th className="text-right p-2 font-medium">Min (ms)</th>
                  <th className="text-right p-2 font-medium">Calls</th>
                  <th className="text-right p-2 font-medium">Error Rate</th>
                </tr>
              </thead>
              <tbody>
                {sortedByDuration.map((stat) => (
                  <tr key={stat.operation} className="border-b hover:bg-muted/50">
                    <td className="p-2 font-mono text-xs">{stat.operation}</td>
                    <td className="text-right p-2">
                      <span className={stat.avgDuration > 3000 ? 'text-destructive font-semibold' : ''}>
                        {stat.avgDuration}
                      </span>
                    </td>
                    <td className="text-right p-2 text-muted-foreground">{stat.maxDuration}</td>
                    <td className="text-right p-2 text-muted-foreground">{stat.minDuration}</td>
                    <td className="text-right p-2">{stat.count}</td>
                    <td className="text-right p-2">
                      <span className={stat.errorRate > 5 ? 'text-destructive font-semibold' : 'text-muted-foreground'}>
                        {stat.errorRate.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};