import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export interface DonutItem {
  name: string;
  value: number;
  color: string;
  [key: string]: string | number;
}

interface DonutChartProps {
  title: string;
  data: DonutItem[];
  centerLabel?: string;
  centerValue?: string;
}

export default function DonutChart({ title, data, centerLabel, centerValue }: DonutChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h3 className="text-sm font-semibold text-slate-900 mb-4">{title}</h3>
      <div className="flex items-center gap-6">
        <div className="relative w-40 h-40 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={65}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [`${value} (${((Number(value) / total) * 100).toFixed(0)}%)`, '']}
              />
            </PieChart>
          </ResponsiveContainer>
          {centerValue && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-bold text-slate-900">{centerValue}</span>
              {centerLabel && <span className="text-[10px] text-slate-400">{centerLabel}</span>}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2">
          {data.map((item, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-600">{item.name}</span>
              </div>
              <span className="font-semibold text-slate-900">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
