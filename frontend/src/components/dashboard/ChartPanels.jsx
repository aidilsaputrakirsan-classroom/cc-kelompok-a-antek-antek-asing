function asPoints(series) {
  const max = Math.max(...series, 1);
  return series
    .map((value, index) => {
      const x = (index / (series.length - 1 || 1)) * 100;
      const y = 100 - (value / max) * 100;
      return `${x},${y}`;
    })
    .join(" ");
}

export function ActivityLineChart({ labels, lines }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800">Ticket Activity</h3>
        <p className="text-xs text-slate-500">Last 6 months</p>
      </div>

      <div className="h-56 rounded-xl bg-slate-50 p-3">
        <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="none">
          {[20, 40, 60, 80].map((y) => (
            <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#dce6f3" strokeWidth="0.6" />
          ))}
          {lines.map((line) => (
            <polyline
              key={line.label}
              points={asPoints(line.values)}
              fill="none"
              stroke={line.color}
              strokeWidth="1.8"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          ))}
        </svg>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
        {lines.map((line) => (
          <span key={line.label} className="inline-flex items-center gap-1 text-slate-600">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: line.color }} />
            {line.label}
          </span>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-6 gap-1 text-center text-[11px] text-slate-500">
        {labels.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
    </div>
  );
}

export function CategoryDonutChart({ title = "Category Analytics", values }) {
  const total = values.reduce((sum, item) => sum + item.value, 0);
  const background = values.length
    ? `conic-gradient(${values
        .map((item, index) => {
          const prev = values.slice(0, index).reduce((acc, cur) => acc + cur.value, 0);
          const start = (prev / total) * 360;
          const end = ((prev + item.value) / total) * 360;
          return `${item.color} ${start}deg ${end}deg`;
        })
        .join(",")})`
    : "conic-gradient(#cbd5e1 0deg 360deg)";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-slate-800">{title}</h3>
      <div className="mx-auto grid max-w-[280px] justify-items-center gap-4">
        <div
          className="relative h-44 w-44 rounded-full"
          style={{ background }}
          role="img"
          aria-label="Category chart"
        >
          <div className="absolute inset-6 rounded-full bg-white" />
          <div className="absolute inset-0 grid place-items-center text-xl font-semibold text-slate-800">
            {total || 0}
          </div>
        </div>
        <div className="grid w-full gap-2 text-xs">
          {values.map((item) => (
            <div key={item.label} className="flex items-center justify-between text-slate-600">
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
