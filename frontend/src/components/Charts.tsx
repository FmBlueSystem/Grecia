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

const COLORS = ['#0067B2', '#3385C2', '#66A3D2', '#99C1E2', '#CCDFF1'];

interface RevenueChartProps {
  data?: Array<{ month: string; revenue: number; target: number }>;
}

export function RevenueChart({ data }: RevenueChartProps) {
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
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis dataKey="month" stroke="#6B7280" />
          <YAxis stroke="#6B7280" />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#0067B2"
            strokeWidth={3}
            name="Revenue Actual"
            dot={{ fill: '#0067B2', r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="target"
            stroke="#ABB8C3"
            strokeWidth={2}
            strokeDasharray="5 5"
            name="Target"
            dot={{ fill: '#ABB8C3', r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

interface PipelineChartProps {
  data?: Array<{ stage: string; value: number }>;
}

export function PipelineChart({ data }: PipelineChartProps) {
  const defaultData = [
    { stage: 'Qualification', value: 85000 },
    { stage: 'Proposal', value: 120000 },
    { stage: 'Negotiation', value: 50000 },
  ];

  const chartData = data || defaultData;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Pipeline por Etapa</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ stage, percent }) => `${stage}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

interface PerformanceChartProps {
  data?: Array<{ name: string; deals: number; revenue: number }>;
}

export function PerformanceChart({ data }: PerformanceChartProps) {
  const defaultData = [
    { name: 'Freddy M.', deals: 8, revenue: 255000 },
    { name: 'María G.', deals: 6, revenue: 180000 },
    { name: 'Carlos R.', deals: 5, revenue: 150000 },
    { name: 'Ana S.', deals: 7, revenue: 210000 },
  ];

  const chartData = data || defaultData;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance por Vendedor</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis dataKey="name" stroke="#6B7280" />
          <YAxis stroke="#6B7280" />
          <Tooltip />
          <Legend />
          <Bar dataKey="deals" fill="#3385C2" name="Deals Cerrados" />
          <Bar dataKey="revenue" fill="#0067B2" name="Revenue ($)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

interface ActivityChartProps {
  data?: Array<{ day: string; calls: number; meetings: number; emails: number }>;
}

export function ActivityChart({ data }: ActivityChartProps) {
  const defaultData = [
    { day: 'Lun', calls: 12, meetings: 5, emails: 28 },
    { day: 'Mar', calls: 15, meetings: 7, emails: 32 },
    { day: 'Mié', calls: 10, meetings: 4, emails: 25 },
    { day: 'Jue', calls: 18, meetings: 6, emails: 35 },
    { day: 'Vie', calls: 14, meetings: 8, emails: 30 },
  ];

  const chartData = data || defaultData;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividades de la Semana</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis dataKey="day" stroke="#6B7280" />
          <YAxis stroke="#6B7280" />
          <Tooltip />
          <Legend />
          <Bar dataKey="calls" stackId="a" fill="#0067B2" name="Llamadas" />
          <Bar dataKey="meetings" stackId="a" fill="#3385C2" name="Reuniones" />
          <Bar dataKey="emails" stackId="a" fill="#66A3D2" name="Emails" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
