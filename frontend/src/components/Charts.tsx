import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Conductor Premium Palette (Slate/Blue/Teal)
const COLORS = ['#334155', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'];
const GRID_COLOR = '#E2E8F0';
const TEXT_COLOR = '#64748B';

// Common Interactivity Props
interface ChartProps {
  data?: any[];
  onChartClick?: (data: any) => void;
}

interface RevenueChartProps extends ChartProps { }

export function RevenueChart({ data, onChartClick }: RevenueChartProps) {
  const defaultData = [
    { month: 'Ene', revenue: 85000, target: 80000 },
    { month: 'Feb', revenue: 92000, target: 90000 },
    { month: 'Mar', revenue: 125000, target: 100000 },
    { month: 'Abr', revenue: 110000, target: 120000 },
    { month: 'May', revenue: 135000, target: 130000 },
    { month: 'Jun', revenue: 145000, target: 150000 },
  ];

  const chartData = data || defaultData;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={chartData}
        onDoubleClick={() => onChartClick && onChartClick({ type: 'Revenue', view: 'Detailed' })}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
        <XAxis
          dataKey="month"
          stroke={TEXT_COLOR}
          axisLine={false}
          tickLine={false}
          dy={10}
          tick={{ fontSize: 12 }}
        />
        <YAxis
          stroke={TEXT_COLOR}
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => value >= 1_000_000 ? `$${(value / 1_000_000).toFixed(0)}M` : `$${(value / 1000).toFixed(0)}k`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1E293B',
            border: 'none',
            borderRadius: '8px',
            color: '#F8FAFC',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
          itemStyle={{ color: '#F8FAFC' }}
        />
        <Legend wrapperStyle={{ paddingTop: '20px' }} />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="#10B981"
          strokeWidth={3}
          name="Ingresos Reales"
          dot={{ fill: '#10B981', r: 4, strokeWidth: 2, stroke: '#fff' }}
          activeDot={{ r: 6, strokeWidth: 0, onClick: (e) => onChartClick && onChartClick(e) }}
        />
        <Line
          type="monotone"
          dataKey="target"
          stroke="#94A3B8"
          strokeWidth={2}
          strokeDasharray="4 4"
          name="Objetivo"
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

interface PipelineChartProps extends ChartProps { }

export function PipelineChart({ data, onChartClick }: PipelineChartProps) {
  const defaultData = [
    { stage: 'Calificación', value: 85000 },
    { stage: 'Propuesta', value: 120000 },
    { stage: 'Negociación', value: 50000 },
  ];

  const chartData = data || defaultData;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart onDoubleClick={() => onChartClick && onChartClick({ type: 'Pipeline', stage: 'All' })}>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          fill="#8884d8"
          paddingAngle={5}
          dataKey="value"
          nameKey="stage"
          onClick={(data) => onChartClick && onChartClick(data)}
        >
          {chartData.map((_entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} style={{ cursor: 'pointer' }} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: any) => `$${Number(value).toLocaleString()}`}
          contentStyle={{
            backgroundColor: '#1E293B',
            border: 'none',
            borderRadius: '8px',
            color: '#F8FAFC'
          }}
        />
        <Legend
          layout="vertical"
          verticalAlign="middle"
          align="right"
          wrapperStyle={{ fontSize: '12px' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

interface PerformanceChartProps extends ChartProps { }

export function PerformanceChart({ data, onChartClick }: PerformanceChartProps) {
  const defaultData = [
    { name: 'Freddy M.', deals: 8, revenue: 255000 },
    { name: 'María G.', deals: 6, revenue: 180000 },
    { name: 'Carlos R.', deals: 5, revenue: 150000 },
    { name: 'Ana S.', deals: 7, revenue: 210000 },
  ];

  const chartData = data || defaultData;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={chartData}
        layout="vertical"
        barSize={20}
        onDoubleClick={() => onChartClick && onChartClick({ type: 'Performance', view: 'Team' })}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} horizontal={true} vertical={false} />
        <XAxis type="number" hide />
        <YAxis
          dataKey="name"
          type="category"
          stroke={TEXT_COLOR}
          axisLine={false}
          tickLine={false}
          width={80}
          tick={{ fontSize: 12 }}
        />
        <Tooltip
          cursor={{ fill: '#F1F5F9' }}
          contentStyle={{
            backgroundColor: '#1E293B',
            border: 'none',
            borderRadius: '8px',
            color: '#F8FAFC'
          }}
        />
        <Legend />
        <Bar
          dataKey="revenue"
          fill="#3B82F6"
          name="Ingresos ($)"
          radius={[0, 4, 4, 0]}
          onClick={(data) => onChartClick && onChartClick(data)}
          cursor="pointer"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

interface ActivityChartProps extends ChartProps { }

export function ActivityChart({ data, onChartClick }: ActivityChartProps) {
  const defaultData = [
    { day: 'Lun', calls: 12, meetings: 5, tasks: 28 },
    { day: 'Mar', calls: 15, meetings: 7, tasks: 32 },
    { day: 'Mié', calls: 10, meetings: 4, tasks: 25 },
    { day: 'Jue', calls: 18, meetings: 6, tasks: 35 },
    { day: 'Vie', calls: 14, meetings: 8, tasks: 30 },
  ];

  const chartData = data || defaultData;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={chartData}
        barSize={32}
        onDoubleClick={() => onChartClick && onChartClick({ type: 'Activity', view: 'Weekly' })}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
        <XAxis
          dataKey="day"
          stroke={TEXT_COLOR}
          axisLine={false}
          tickLine={false}
          dy={10}
        />
        <Tooltip
          cursor={{ fill: '#F1F5F9' }}
          contentStyle={{
            backgroundColor: '#1E293B',
            border: 'none',
            borderRadius: '8px',
            color: '#F8FAFC'
          }}
        />
        <Legend wrapperStyle={{ paddingTop: '20px' }} />
        <Bar dataKey="calls" stackId="a" fill="#3B82F6" name="Llamadas" onClick={(d) => onChartClick && onChartClick(d)} />
        <Bar dataKey="meetings" stackId="a" fill="#10B981" name="Reuniones" onClick={(d) => onChartClick && onChartClick(d)} />
        <Bar dataKey="tasks" stackId="a" fill="#F59E0B" name="Tareas" radius={[4, 4, 0, 0]} onClick={(d) => onChartClick && onChartClick(d)} />
      </BarChart>
    </ResponsiveContainer>
  );
}

