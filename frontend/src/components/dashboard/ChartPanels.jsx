import { useMemo, useState } from "react";

function buildPoints(series, maxValue) {
  return series.map((value, index) => {
    const x = (index / (series.length - 1 || 1)) * 100;
    const y = 100 - (value / Math.max(maxValue, 1)) * 100;
    return { x, y, value, index };
  });
}

function asPolyline(points) {
  return points.map((point) => `${point.x},${point.y}`).join(" ");
}

function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function describeArc(centerX, centerY, radius, startAngle, endAngle) {
  const start = polarToCartesian(centerX, centerY, radius, endAngle);
  const end = polarToCartesian(centerX, centerY, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return ["M", start.x, start.y, "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y].join(" ");
}

function describeDonutSegment(centerX, centerY, outerRadius, innerRadius, startAngle, endAngle) {
  const outerStart = polarToCartesian(centerX, centerY, outerRadius, startAngle);
  const outerEnd = polarToCartesian(centerX, centerY, outerRadius, endAngle);
  const innerStart = polarToCartesian(centerX, centerY, innerRadius, startAngle);
  const innerEnd = polarToCartesian(centerX, centerY, innerRadius, endAngle);
  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

  return [
    "M",
    outerStart.x,
    outerStart.y,
    "A",
    outerRadius,
    outerRadius,
    0,
    largeArcFlag,
    1,
    outerEnd.x,
    outerEnd.y,
    "L",
    innerEnd.x,
    innerEnd.y,
    "A",
    innerRadius,
    innerRadius,
    0,
    largeArcFlag,
    0,
    innerStart.x,
    innerStart.y,
    "Z",
  ].join(" ");
}

export function ActivityLineChart({ labels, lines }) {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const maxValue = useMemo(
    () => Math.max(...lines.flatMap((line) => line.values), 1),
    [lines]
  );

  const normalizedLines = useMemo(
    () => lines.map((line) => ({ ...line, points: buildPoints(line.values, maxValue) })),
    [lines, maxValue]
  );

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm dark:shadow-[0_4px_12px_-2px_rgba(0,0,0,0.3)]">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Ticket Activity</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">Last 6 months</p>
      </div>

      <div className="relative h-56 rounded-xl bg-slate-50 dark:bg-slate-900/50 p-3">
        <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="none">
          {[20, 40, 60, 80].map((y) => (
            <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#e2e8f0" strokeOpacity="0.2" strokeWidth="0.6" />
          ))}
          {hoveredPoint && (
            <line
              x1={hoveredPoint.x}
              y1="0"
              x2={hoveredPoint.x}
              y2="100"
              stroke="#94a3b8"
              strokeWidth="0.8"
              strokeDasharray="2 2"
            />
          )}
          {normalizedLines.map((line) => (
            <g key={line.label}>
              <polyline
                points={asPolyline(line.points)}
                fill="none"
                stroke={line.color}
                strokeWidth="1.8"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {line.points.map((point) => {
                const isHovered =
                  hoveredPoint?.lineLabel === line.label && hoveredPoint?.index === point.index;

                return (
                  <circle
                    key={`${line.label}-${point.index}`}
                    cx={point.x}
                    cy={point.y}
                    r={isHovered ? "1.8" : "1.3"}
                    fill={line.color}
                    stroke="#ffffff"
                    strokeWidth="0.7"
                    className="cursor-pointer transition-all duration-150"
                    onMouseEnter={() =>
                      setHoveredPoint({
                        lineLabel: line.label,
                        index: point.index,
                        x: point.x,
                        y: point.y,
                        value: point.value,
                        color: line.color,
                        month: labels[point.index] || `Point ${point.index + 1}`,
                      })
                    }
                    onMouseLeave={() => setHoveredPoint(null)}
                  >
                    <title>{`${line.label} - ${labels[point.index] || ""}: ${point.value}`}</title>
                  </circle>
                );
              })}
            </g>
          ))}
        </svg>

        {hoveredPoint && (
          <div
            className="pointer-events-none absolute z-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-xs shadow-md dark:shadow-[0_8px_16px_-2px_rgba(0,0,0,0.4)]"
            style={{
              left: `calc(${hoveredPoint.x}% + 8px)`,
              top: `calc(${hoveredPoint.y}% - 8px)`,
              transform: "translateY(-100%)",
            }}
          >
            <p className="font-semibold text-slate-800 dark:text-slate-200">{hoveredPoint.lineLabel}</p>
            <p className="text-slate-500 dark:text-slate-400">{hoveredPoint.month}</p>
            <p className="font-medium" style={{ color: hoveredPoint.color }}>
              {hoveredPoint.value}
            </p>
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
        {normalizedLines.map((line) => (
          <span key={line.label} className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-400">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: line.color }} />
            {line.label}
          </span>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-6 gap-1 text-center text-[11px] text-slate-500 dark:text-slate-400">
        {labels.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
    </div>
  );
}

export function CategoryDonutChart({ title = "Category Analytics", values }) {
  const [hoveredSegment, setHoveredSegment] = useState(null);
  const total = values.reduce((sum, item) => sum + item.value, 0);
  const center = 100;
  const outerRadius = 92;
  const innerRadius = 56;

  const segments = useMemo(() => {
    if (!values.length || total === 0) return [];

    let running = 0;
    return values.map((item, index) => {
      const start = (running / total) * 360;
      const end = ((running + item.value) / total) * 360;
      const percent = total ? Math.round((item.value / total) * 100) : 0;
      const span = Math.max(end - start, 0);
      const gap = Math.min(2.8, span * 0.18);
      const safeStart = start + gap / 2;
      const safeEnd = end - gap / 2;
      const mid = (safeStart + safeEnd) / 2;
      const labelPoint = polarToCartesian(center, center, (outerRadius + innerRadius) / 2, mid);

      running += item.value;

      return {
        ...item,
        index,
        start: safeStart,
        end: safeEnd,
        mid,
        percent,
        path: describeDonutSegment(center, center, outerRadius, innerRadius, safeStart, safeEnd),
        labelX: labelPoint.x,
        labelY: labelPoint.y,
      };
    });
  }, [total, values]);

  const activeSegment = hoveredSegment ?? null;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm dark:shadow-[0_4px_12px_-2px_rgba(0,0,0,0.3)]">
      <h3 className="mb-4 text-sm font-semibold text-slate-800 dark:text-slate-200">{title}</h3>
      <div className="mx-auto grid max-w-[300px] justify-items-center gap-4">
        <div className="relative h-56 w-56" role="img" aria-label="Category chart">
          <svg viewBox="0 0 200 200" className="h-full w-full">
            {segments.length === 0 && (
              <path
                d={describeDonutSegment(center, center, outerRadius, innerRadius, 0, 359.99)}
                fill="#e2e8f0"
                opacity="0.3"
              />
            )}

            {segments.map((segment) => {
              const isActive = activeSegment?.index === segment.index;
              const offset = isActive ? 4 : 0;
              const offsetX = offset * Math.cos(((segment.mid - 90) * Math.PI) / 180);
              const offsetY = offset * Math.sin(((segment.mid - 90) * Math.PI) / 180);

              return (
                <g
                  key={segment.label}
                  transform={`translate(${offsetX} ${offsetY})`}
                  className="cursor-pointer transition-transform duration-200"
                  onMouseEnter={() => setHoveredSegment(segment)}
                  onMouseLeave={() => setHoveredSegment(null)}
                >
                  <path d={segment.path} fill={segment.color} opacity={isActive ? 1 : 0.95}>
                    <title>{`${segment.label}: ${segment.value} (${segment.percent}%)`}</title>
                  </path>
                  <text
                    x={segment.labelX}
                    y={segment.labelY}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#f8fafc"
                    fontSize="12"
                    fontWeight="700"
                  >
                    {segment.index + 1}
                  </text>
                </g>
              );
            })}
          </svg>

          <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
            <p className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {activeSegment ? activeSegment.label : "Total"}
            </p>
            <p className="text-2xl font-semibold text-slate-800 dark:text-slate-200">
              {activeSegment ? activeSegment.value : total || 0}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{activeSegment ? `${activeSegment.percent}%` : "100%"}</p>
          </div>

          {activeSegment && (
            <div
              className="pointer-events-none absolute z-10 rounded-xl border border-slate-600/50 dark:border-slate-500/50 bg-slate-900/95 dark:bg-slate-950/95 px-3 py-2 text-xs text-slate-100 dark:text-slate-200 shadow-lg dark:shadow-[0_8px_16px_-2px_rgba(0,0,0,0.4)]"
              style={{
                left: `${(activeSegment.labelX / 200) * 100}%`,
                top: `${(activeSegment.labelY / 200) * 100}%`,
                transform: "translate(-50%, -120%)",
              }}
            >
              <p className="font-semibold">{activeSegment.label}</p>
              <p className="text-slate-300 dark:text-slate-400">Total: {activeSegment.value} kali</p>
              <p className="text-slate-300 dark:text-slate-400">Persentase: {activeSegment.percent}%</p>
            </div>
          )}
        </div>

        <div className="grid w-full gap-2 text-xs">
          {values.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between text-slate-600 dark:text-slate-400"
              onMouseEnter={() => {
                const segment = segments.find((entry) => entry.label === item.label);
                if (segment) setHoveredSegment(segment);
              }}
              onMouseLeave={() => setHoveredSegment(null)}
            >
              <span className="inline-flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                {item.label}
              </span>
              <span>{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
