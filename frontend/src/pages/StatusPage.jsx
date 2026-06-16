import { useState, useEffect, useCallback, useRef } from 'react';
import CardSpotlight from '../components/ui/CardSpotlight';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost';

const SERVICES = [
  { name: 'Auth Service', icon: '', healthUrl: `${API_URL}/auth/health`, metricsUrl: `${API_URL}/auth/metrics` },
  { name: 'Item Service', icon: '', healthUrl: `${API_URL}/items/health`, metricsUrl: `${API_URL}/items/metrics` },
  { name: 'API Gateway', icon: '', healthUrl: `${API_URL}/health`, metricsUrl: null },
];

const REFRESH_INTERVAL = 10000; // 10 seconds

const STATUS_CONFIG = {
  healthy: { color: '#22c55e', bg: 'rgba(34,197,94,0.12)', label: 'Healthy' },
  degraded: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', label: 'Degraded' },
  unhealthy: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', label: 'Unhealthy' },
  unreachable: { color: '#6b7280', bg: 'rgba(107,114,128,0.12)', label: 'Unreachable' },
};

/* ── Countdown ring that visually shows time until next auto-refresh ─── */
function AutoRefreshIndicator({ intervalMs, lastRefresh }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const tick = setInterval(() => {
      setElapsed(Date.now() - lastRefresh);
    }, 100);
    return () => clearInterval(tick);
  }, [lastRefresh]);

  const progress = Math.min(elapsed / intervalMs, 1);
  const remaining = Math.max(0, Math.ceil((intervalMs - elapsed) / 1000));
  const circumference = 2 * Math.PI * 14;
  const dashOffset = circumference * (1 - progress);

  return (
    <div className="flex items-center gap-2.5">
      <div className="relative h-9 w-9">
        <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
          <circle cx="18" cy="18" r="14" fill="none" stroke="currentColor"
            className="text-slate-200 dark:text-slate-700" strokeWidth="2.5" />
          <circle cx="18" cy="18" r="14" fill="none"
            stroke="#2592ea" strokeWidth="2.5" strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={dashOffset}
            className="transition-[stroke-dashoffset] duration-100 ease-linear" />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-300">
          {remaining}s
        </span>
      </div>
      <div className="flex flex-col">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          Auto-refresh ON
        </span>
        <span className="text-[10px] text-slate-500 dark:text-slate-400">
          Every {intervalMs / 1000}s
        </span>
      </div>
    </div>
  );
}

/* ── Animated bar chart showing error rate per service ─────────────── */
function ErrorRateChart({ services }) {
  const maxRate = Math.max(...services.map((s) => s.errorRate ?? 0), 1);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-800/60">
      <h3 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-200">
        Error Rate by Service
      </h3>
      <div className="space-y-3">
        {services.map((s) => {
          const pct = maxRate > 0 ? ((s.errorRate ?? 0) / maxRate) * 100 : 0;
          const barColor =
            (s.errorRate ?? 0) === 0
              ? '#22c55e'
              : (s.errorRate ?? 0) < 5
                ? '#f59e0b'
                : '#ef4444';

          return (
            <div key={s.name}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="font-medium text-slate-600 dark:text-slate-300">
                  {s.icon} {s.name}
                </span>
                <span className="font-mono font-semibold" style={{ color: barColor }}>
                  {(s.errorRate ?? 0).toFixed(1)}%
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: barColor,
                    minWidth: (s.errorRate ?? 0) > 0 ? '8px' : '0px',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Individual service status card ────────────────────────────────── */
function ServiceCard({ name, icon, healthUrl, metricsUrl, onData }) {
  const [health, setHealth] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = useCallback(async () => {
    try {
      const healthRes = await fetch(healthUrl);
      const healthData = await healthRes.json();
      setHealth(healthData);
    } catch {
      setHealth({ status: 'unreachable' });
    }

    if (metricsUrl) {
      try {
        const metricsRes = await fetch(metricsUrl);
        const metricsData = await metricsRes.json();
        setMetrics(metricsData);
      } catch {
        setMetrics(null);
      }
    }

    setLoading(false);
  }, [healthUrl, metricsUrl]);

  /* Expose data upward for chart */
  useEffect(() => {
    if (onData) {
      onData({
        name,
        icon,
        errorRate: metrics?.error_rate_percent ?? 0,
      });
    }
  }, [metrics, name, icon]); // eslint-disable-line react-hooks/exhaustive-deps

  /* Fetch is driven by parent interval — but we also do an initial fetch */
  useEffect(() => {
    fetchStatus();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* Expose fetchStatus so parent can call it */
  useEffect(() => {
    if (onData) {
      onData({ name, icon, errorRate: metrics?.error_rate_percent ?? 0, refetch: fetchStatus });
    }
  }, [fetchStatus]); // eslint-disable-line react-hooks/exhaustive-deps

  const status = health?.status || 'unreachable';
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.unreachable;

  return (
    <CardSpotlight
      className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 dark:border-slate-700 dark:bg-slate-800/60"
    >
      <div className="relative flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">
          {icon} {name}
        </h3>
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide"
          style={{ backgroundColor: cfg.bg, color: cfg.color }}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: cfg.color }} />
          {loading ? '...' : cfg.label}
        </span>
      </div>

      {metrics && (
        <div className="relative mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-3">
          <Metric label="Requests" value={metrics.request_count ?? 0} />
          <Metric label="Errors" value={metrics.error_count ?? 0} alert={(metrics.error_count ?? 0) > 0} />
          <Metric label="Error Rate" value={`${(metrics.error_rate_percent ?? 0).toFixed(1)}%`} alert={(metrics.error_rate_percent ?? 0) > 0} />
          <Metric label="Avg Latency" value={`${metrics.latencies_ms?.avg ?? 0}ms`} />
          <Metric label="p95 Latency" value={`${metrics.latencies_ms?.p95 ?? 0}ms`} />
          <Metric label="Uptime" value={formatUptime(metrics.uptime_seconds ?? 0)} />
        </div>
      )}
    </CardSpotlight>
  );
}

function formatUptime(seconds) {
  const total = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes} min`;
}

function Metric({ label, value, alert }) {
  return (
    <div>
      <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>
      <p className={`text-sm font-semibold ${alert ? 'text-red-500' : 'text-slate-700 dark:text-slate-200'}`}>
        {value}
      </p>
    </div>
  );
}

/* ── Main Status Page ──────────────────────────────────────────────── */
export default function StatusPage() {
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const [lastCheckedTime, setLastCheckedTime] = useState(new Date());
  const [serviceData, setServiceData] = useState({});
  const refetchFns = useRef({});

  /* Central auto-refresh loop */
  useEffect(() => {
    const interval = setInterval(() => {
      Object.values(refetchFns.current).forEach((fn) => fn?.());
      setLastRefresh(Date.now());
      setLastCheckedTime(new Date());
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  const handleServiceData = useCallback((data) => {
    if (data.refetch) {
      refetchFns.current[data.name] = data.refetch;
    }
    setServiceData((prev) => ({ ...prev, [data.name]: data }));
  }, []);

  const chartData = SERVICES.map((s) => ({
    name: s.name,
    icon: s.icon,
    errorRate: serviceData[s.name]?.errorRate ?? 0,
  }));

  /* Overall status summary */
  const allStatuses = Object.values(serviceData);
  const healthyCount = allStatuses.filter((s) => s.errorRate === 0 || s.errorRate === null).length;
  const overallHealthy = healthyCount === SERVICES.length;

  return (
    <div className="space-y-5">
      {/* ── Header ─────────────────────────────────────────────── */}
      <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            System Status
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Real-time health monitoring for all services.
          </p>
        </div>

        <AutoRefreshIndicator intervalMs={REFRESH_INTERVAL} lastRefresh={lastRefresh} />
      </section>

      {/* ── Overall Status Banner ──────────────────────────────── */}
      <div
        className={`flex items-center gap-3 rounded-2xl border px-5 py-3 text-sm font-medium backdrop-blur transition-colors duration-500 ${overallHealthy
            ? 'border-emerald-200 bg-emerald-50/80 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300'
            : 'border-amber-200 bg-amber-50/80 text-amber-700 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300'
          }`}
      >
        <span className="text-lg">{overallHealthy ? '✅' : '⚠️'}</span>
        {overallHealthy
          ? 'All systems operational'
          : 'Some services may be experiencing issues'}
      </div>

      {/* ── Service Cards Grid ─────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map((svc) => (
          <ServiceCard
            key={svc.name}
            name={svc.name}
            icon={svc.icon}
            healthUrl={svc.healthUrl}
            metricsUrl={svc.metricsUrl}
            onData={handleServiceData}
          />
        ))}
      </div>

      {/* ── Error Rate Bar Chart ───────────────────────────────── */}
      <ErrorRateChart services={chartData} />

      {/* ── Last Checked Timestamp ─────────────────────────────── */}
      <div className="flex flex-col items-center gap-1 pb-2 text-center">
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Last checked
        </p>
        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
          {lastCheckedTime.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}{' '}
          —{' '}
          {lastCheckedTime.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })}
        </p>
      </div>
    </div>
  );
}