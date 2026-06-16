import { useMemo, useState } from "react";
import CardSpotlight from "../ui/CardSpotlight";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  BarChart, Bar
} from "recharts";

// ==========================================
// 1. COMPONENT: ACTIVITY LINE CHART (RECHARTS)
// ==========================================

export function ActivityLineChart({ tickets = [] }) {
  const [timePeriod, setTimePeriod] = useState("6m");

  const currentData = useMemo(() => {
    const now = new Date();
    
    if (timePeriod === "1m") {
      // Last 30 days
      const days = [];
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        days.push(d);
      }
      
      const initial = days.reduce((acc, d) => {
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        acc[key] = { total: 0, resolved: 0, open: 0 };
        return acc;
      }, {});

      tickets.forEach((ticket) => {
        if (!ticket.created_at) return;
        const date = new Date(ticket.created_at);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
        if (initial[key] !== undefined) {
          initial[key].total += 1;
          if (ticket.status === "resolved" || ticket.status === "closed") {
            initial[key].resolved += 1;
          } else {
            initial[key].open += 1;
          }
        }
      });

      const dayLabels = days.map((d) => d.toLocaleDateString("en-US", { day: "numeric", month: "short" }));
      return {
        labels: dayLabels,
        lines: [
          { label: "Total", color: "#2563eb", values: days.map(d => {
              const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
              return initial[key].total;
            })
          },
          { label: "Resolved", color: "#10b981", values: days.map(d => {
              const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
              return initial[key].resolved;
            })
          },
          { label: "Open", color: "#f59e0b", values: days.map(d => {
              const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
              return initial[key].open;
            })
          }
        ]
      };
    } else if (timePeriod === "1y") {
      // Last 12 months
      const monthKeys = [];
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        monthKeys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
      }

      const initial = monthKeys.reduce((acc, key) => {
        acc[key] = { total: 0, resolved: 0, open: 0 };
        return acc;
      }, {});

      tickets.forEach((ticket) => {
        if (!ticket.created_at) return;
        const date = new Date(ticket.created_at);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        if (initial[key] !== undefined) {
          initial[key].total += 1;
          if (ticket.status === "resolved" || ticket.status === "closed") {
            initial[key].resolved += 1;
          } else {
            initial[key].open += 1;
          }
        }
      });

      const monthLabels = monthKeys.map((key) => {
        const [year, month] = key.split("-");
        return new Date(Number(year), Number(month) - 1, 1).toLocaleDateString("en-US", { month: "short" });
      });
      return {
        labels: monthLabels,
        lines: [
          { label: "Total", color: "#2563eb", values: monthKeys.map(key => initial[key].total) },
          { label: "Resolved", color: "#10b981", values: monthKeys.map(key => initial[key].resolved) },
          { label: "Open", color: "#f59e0b", values: monthKeys.map(key => initial[key].open) }
        ]
      };
    } else {
      // 6 months (default)
      const monthKeys = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        monthKeys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
      }

      const initial = monthKeys.reduce((acc, key) => {
        acc[key] = { total: 0, resolved: 0, open: 0 };
        return acc;
      }, {});

      tickets.forEach((ticket) => {
        if (!ticket.created_at) return;
        const date = new Date(ticket.created_at);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        if (initial[key] !== undefined) {
          initial[key].total += 1;
          if (ticket.status === "resolved" || ticket.status === "closed") {
            initial[key].resolved += 1;
          } else {
            initial[key].open += 1;
          }
        }
      });

      const monthLabels = monthKeys.map((key) => {
        const [year, month] = key.split("-");
        return new Date(Number(year), Number(month) - 1, 1).toLocaleDateString("en-US", { month: "short" });
      });
      return {
        labels: monthLabels,
        lines: [
          { label: "Total", color: "#2563eb", values: monthKeys.map(key => initial[key].total) },
          { label: "Resolved", color: "#10b981", values: monthKeys.map(key => initial[key].resolved) },
          { label: "Open", color: "#f59e0b", values: monthKeys.map(key => initial[key].open) }
        ]
      };
    }
  }, [tickets, timePeriod]);

  const { labels, lines } = currentData;

  const chartData = useMemo(() => {
    return labels.map((label, index) => {
      const dataPoint = { name: label };
      lines.forEach((line) => {
        dataPoint[line.label] = line.values[index];
      });
      return dataPoint;
    });
  }, [labels, lines]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-800/95 p-3 text-xs shadow-lg backdrop-blur-sm z-50">
          <p className="mb-2 font-semibold text-slate-800 dark:text-slate-200">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-4 py-0.5">
              <span className="flex items-center gap-1.5 font-medium" style={{ color: entry.color }}>
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
                {entry.name}
              </span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <CardSpotlight className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm dark:shadow-[0_4px_12px_-2px_rgba(0,0,0,0.3)]">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Ticket Activity</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Monitoring real-time data</p>
        </div>
        
        <select
          value={timePeriod}
          onChange={(e) => setTimePeriod(e.target.value)}
          className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 outline-none cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="1m">1 Bulan Terakhir</option>
          <option value="6m">6 Bulan Terakhir</option>
          <option value="1y">1 Tahun Terakhir</option>
        </select>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#94a3b8" opacity={0.25} />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }} 
              tickLine={false} 
              axisLine={false} 
              dy={10}
            />
            <YAxis 
              tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }} 
              tickLine={false} 
              axisLine={false}
              dx={-10}
            />
            <RechartsTooltip content={<CustomTooltip />} cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '4 4' }} />
            {lines.map((line) => (
              <Line
                key={line.label}
                type="monotone"
                dataKey={line.label}
                stroke={line.color}
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: line.color }}
                activeDot={{ r: 6, strokeWidth: 0, fill: line.color }}
                animationDuration={1000}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 flex flex-wrap items-center justify-center gap-5 text-xs font-medium">
        {lines.map((line) => (
          <span key={line.label} className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <span className="h-3 w-3 rounded-full shadow-sm" style={{ backgroundColor: line.color }} />
            {line.label}
          </span>
        ))}
      </div>
    </CardSpotlight>
  );
}

// ==========================================
// COMPONENT REST (Donut & Bar Charts)
// ==========================================

export function CategoryDonutChart({ title = "Category Analytics", values }) {
  const total = values.reduce((sum, item) => sum + item.value, 0);
  const [activeIndex, setActiveIndex] = useState(null);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percent = total ? Math.round((data.value / total) * 100) : 0;
      return (
        <div className="rounded-xl border border-slate-600/50 dark:border-slate-500/50 bg-slate-900/95 dark:bg-slate-950/95 px-3 py-2 text-xs text-slate-100 dark:text-slate-200 shadow-xl backdrop-blur-sm z-50">
          <p className="font-semibold mb-1">{data.label}</p>
          <p className="text-slate-300 dark:text-slate-400">Total: <span className="font-semibold text-white">{data.value}</span> kali</p>
          <p className="text-slate-300 dark:text-slate-400">Persentase: <span className="font-semibold text-white">{percent}%</span></p>
        </div>
      );
    }
    return null;
  };

  return (
    <CardSpotlight className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm dark:shadow-[0_4px_12px_-2px_rgba(0,0,0,0.3)]">
      <h3 className="mb-4 text-sm font-semibold text-slate-800 dark:text-slate-200">{title}</h3>
      <div className="mx-auto grid justify-items-center gap-6">
        <div className="relative h-56 w-full max-w-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={values}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={95}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                animationDuration={1000}
              >
                {values.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color} 
                    opacity={activeIndex === null || activeIndex === index ? 1 : 0.4}
                    className="transition-opacity duration-300 cursor-pointer outline-none"
                  />
                ))}
              </Pie>
              <RechartsTooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center mt-1">
            {activeIndex !== null ? (
              <>
                <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400 mb-0.5">
                  {values[activeIndex].label}
                </p>
                <p className="text-3xl font-bold text-slate-800 dark:text-slate-200 leading-none">
                  {values[activeIndex].value}
                </p>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
                  {total ? Math.round((values[activeIndex].value / total) * 100) : 0}%
                </p>
              </>
            ) : (
              <>
                <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400 mb-0.5">Total</p>
                <p className="text-3xl font-bold text-slate-800 dark:text-slate-200 leading-none">{total}</p>
              </>
            )}
          </div>
        </div>

        <div className="grid w-full gap-2.5 text-xs">
          {values.map((item, index) => (
            <div
              key={item.label}
              className="flex items-center justify-between text-slate-600 dark:text-slate-400 cursor-pointer hover:text-slate-900 dark:hover:text-slate-100 transition-colors bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 px-3 py-2 rounded-lg"
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <span className="inline-flex items-center gap-2.5 font-medium">
                <span className="h-3 w-3 rounded-full shadow-sm" style={{ backgroundColor: item.color }} />
                {item.label}
              </span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </CardSpotlight>
  );
}

export function DepartmentBarChart({ title = "Department Analytics", values }) {
  const palette = ["#2563eb", "#38bdf8", "#a78bfa", "#f59e0b", "#10b981", "#0ea5e9", "#ec4899", "#6366f1"];
  const [activeIndex, setActiveIndex] = useState(null);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-800/95 p-3 text-xs shadow-lg backdrop-blur-sm z-50">
          <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">{data.department}</p>
          <p className="text-slate-600 dark:text-slate-400 font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            Tickets: <span className="font-semibold text-slate-800 dark:text-slate-200">{data.tickets}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <CardSpotlight className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm dark:shadow-[0_4px_12px_-2px_rgba(0,0,0,0.3)]">
      <h3 className="mb-6 text-sm font-semibold text-slate-800 dark:text-slate-200">{title}</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={values} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={32}>
            <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#94a3b8" opacity={0.25} />
            <XAxis 
              dataKey="department" 
              tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }} 
              tickLine={false} 
              axisLine={false} 
              tickFormatter={(val) => val.length > 10 ? val.substring(0, 10) + '...' : val} 
              dy={10}
            />
            <YAxis 
              tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }} 
              tickLine={false} 
              axisLine={false}
              dx={-10}
            />
            <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: '#e2e8f0', opacity: 0.4 }} />
            <Bar 
              dataKey="tickets" 
              radius={[6, 6, 0, 0]}
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              animationDuration={1000}
            >
              {values.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={palette[index % palette.length]} 
                  opacity={activeIndex === null || activeIndex === index ? 1 : 0.6}
                  className="transition-opacity duration-300 cursor-pointer outline-none"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-5 grid gap-2.5 text-xs">
        {values.length === 0 ? (
          <p className="text-slate-500 dark:text-slate-400 text-center py-2">No data available</p>
        ) : (
          values.map((item, index) => (
            <div
              key={item.department}
              className="flex items-center justify-between text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 cursor-pointer transition-colors bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 px-3 py-2 rounded-lg"
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <span className="inline-flex items-center gap-2.5 font-medium">
                <span className="h-3 w-3 rounded-sm shadow-sm" style={{ backgroundColor: palette[index % palette.length] }} />
                {item.department}
              </span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">{item.tickets}</span>
            </div>
          ))
        )}
      </div>
    </CardSpotlight>
  );
}

export function ResponseTimeBarChart({ title = "Response Time by IT Employee", values }) {
  const [hoveredBar, setHoveredBar] = useState(null);
  const maxValue = useMemo(() => Math.max(...values.map((item) => item.avg_response_hours), 1), [values]);

  const getColor = (hours) => {
    if (hours <= 2) return "#10b981";
    if (hours <= 4) return "#f59e0b";
    if (hours <= 8) return "#ef4444";
    return "#dc2626";
  };

  return (
    <CardSpotlight className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm dark:shadow-[0_4px_12px_-2px_rgba(0,0,0,0.3)]">
      <h3 className="mb-6 text-sm font-semibold text-slate-800 dark:text-slate-200">{title}</h3>
      <div className="space-y-4">
        {values.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">No data available</p>
        ) : (
          values.map((item, index) => {
            const percentage = (item.avg_response_hours / maxValue) * 100;
            const isHovered = hoveredBar === index;
            const color = getColor(item.avg_response_hours);

            return (
              <div
                key={item.employee}
                className="space-y-1.5"
                onMouseEnter={() => setHoveredBar(index)}
                onMouseLeave={() => setHoveredBar(null)}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700 dark:text-slate-300 truncate">{item.employee}</span>
                  <span className="ml-2 flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                    <span className="font-semibold" style={{ color }}>{item.avg_response_hours}h</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md">{item.ticket_count} tickets</span>
                  </span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-900/80 shadow-inner">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${isHovered ? "opacity-100 brightness-110" : "opacity-90"}`}
                    style={{
                      width: `${Math.max(percentage, 5)}%`,
                      backgroundColor: color,
                    }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-6 flex flex-wrap gap-4 border-t border-slate-100 dark:border-slate-700/50 pt-4 text-[11px] font-medium">
        <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: "#10b981" }} />
          Fast (≤2h)
        </span>
        <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: "#f59e0b" }} />
          Medium (≤4h)
        </span>
        <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: "#ef4444" }} />
          Slow (≤8h)
        </span>
        <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: "#dc2626" }} />
          Critical ({'>'}8h)
        </span>
      </div>
    </CardSpotlight>
  );
}
