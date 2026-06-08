import { CholesterolLog } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, Activity, HelpCircle } from 'lucide-react';

interface AnalyticsChartsProps {
  logs: CholesterolLog[];
}

export default function AnalyticsCharts({ logs }: AnalyticsChartsProps) {
  if (logs.length < 2) {
    return (
      <div className="bg-white rounded-3xl p-6 border border-gray-100 flex flex-col items-center justify-center text-center py-12">
        <div className="h-12 w-12 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center mb-3">
          <TrendingUp className="h-6 w-6" />
        </div>
        <h4 className="text-sm font-bold text-slate-800">Telemetry History Insufficient</h4>
        <p className="text-xs text-slate-400 mt-1 max-w-xs leading-normal">
          Log at least 2 logs to activate the timeline trends graph.
        </p>
      </div>
    );
  }

  // Format and sort logs chronologically (date ascending)
  const sortedLogs = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const initialChartData: any[] = sortedLogs.map((log) => {
    const formattedDate = new Date(log.date).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
    return {
      formattedDate,
      'Total Cholesterol': log.totalChol,
      'LDL (Bad)': log.ldl,
      'HDL (Good)': log.hdl,
      'Triglycerides': log.triglycerides,
      isProjection: false,
    };
  });

  // Calculate 30-day linear projections based on the recent 7 logs trend slope (from original app.js math)
  const projectionsList: any[] = [];
  if (sortedLogs.length >= 2) {
    const recentDays = sortedLogs.slice(-7);
    const ldlStart = recentDays[0].ldl;
    const ldlEnd = recentDays[recentDays.length - 1].ldl;
    const hdlStart = recentDays[0].hdl;
    const hdlEnd = recentDays[recentDays.length - 1].hdl;
    const totalStart = recentDays[0].totalChol;
    const totalEnd = recentDays[recentDays.length - 1].totalChol;
    const trigStart = recentDays[0].triglycerides;
    const trigEnd = recentDays[recentDays.length - 1].triglycerides;

    const divisions = Math.max(1, recentDays.length - 1);
    const ldlSlope = (ldlEnd - ldlStart) / divisions;
    const hdlSlope = (hdlEnd - hdlStart) / divisions;
    const totalSlope = (totalEnd - totalStart) / divisions;
    const trigSlope = (trigEnd - trigStart) / divisions;

    const lastLog = sortedLogs[sortedLogs.length - 1];
    const lastDate = new Date(lastLog.date);

    for (let i = 0; i <= 30; i++) {
      const nextDate = new Date(lastDate);
      nextDate.setDate(nextDate.getDate() + i);
      const pLdl = Math.max(10, ldlEnd + ldlSlope * i);
      const pHdl = Math.max(5, hdlEnd + hdlSlope * i);
      const pTotal = Math.max(20, totalEnd + totalSlope * i);
      const pTrig = Math.max(10, trigEnd + trigSlope * i);

      projectionsList.push({
        formattedDate: nextDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        'Projected Total': parseFloat(pTotal.toFixed(1)),
        'Projected LDL': parseFloat(pLdl.toFixed(1)),
        'Projected HDL': parseFloat(pHdl.toFixed(1)),
        'Projected Triglycerides': parseFloat(pTrig.toFixed(1)),
        isProjection: i > 0,
      });
    }

    // Connect standard line end point to prediction start point exactly
    const lastIdx = initialChartData.length - 1;
    initialChartData[lastIdx]['Projected Total'] = initialChartData[lastIdx]['Total Cholesterol'];
    initialChartData[lastIdx]['Projected LDL'] = initialChartData[lastIdx]['LDL (Bad)'];
    initialChartData[lastIdx]['Projected HDL'] = initialChartData[lastIdx]['HDL (Good)'];
    initialChartData[lastIdx]['Projected Triglycerides'] = initialChartData[lastIdx]['Triglycerides'];
  }

  const chartData = [
    ...initialChartData,
    ...projectionsList.slice(1),
  ];

  // Custom tooltip renderer for a luxury vibe
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-3.5 rounded-xl border border-slate-800 shadow-xl text-xs font-mono space-y-1.5">
          <p className="font-sans font-bold text-slate-300">{label}</p>
          <div className="divider border-b border-slate-800 my-1" />
          {payload.map((entry: any, index: number) => {
            if (entry.value === undefined || entry.value === null) return null;
            return (
              <p key={index} style={{ color: entry.color }} className="flex justify-between space-x-4">
                <span>{entry.name}:</span>
                <span className="font-bold">{entry.value} mg/dL</span>
              </p>
            );
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* Chart 1: Core lipids cholesterol variables */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-sm font-sans font-bold text-slate-900 flex items-center space-x-1.5">
              <Activity className="h-4 w-4 text-rose-500" />
              <span>Target Lipids Timeline & Predictions (30D)</span>
            </h3>
            <p className="text-[11px] text-slate-400">Solid lines: Measured profiles | Dashed lines: Computed linear projection trends</p>
          </div>
          <span className="text-[10px] bg-slate-50 border px-2 py-0.5 rounded-md font-mono text-slate-500">
            mg/dL
          </span>
        </div>

        <div className="h-64 sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#c084fc" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#c084fc" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="colorLdl" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="colorHdl" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="formattedDate" stroke="#94a3b8" fontSize={10} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              
              {/* Historical Area Lines */}
              <Area type="monotone" dataKey="Total Cholesterol" stroke="#c084fc" strokeWidth={2.5} fillOpacity={1} fill="url(#colorTotal)" dot={false} />
              <Area type="monotone" dataKey="LDL (Bad)" stroke="#f43f5e" strokeWidth={2.5} fillOpacity={1} fill="url(#colorLdl)" dot={false} />
              <Area type="monotone" dataKey="HDL (Good)" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorHdl)" dot={false} />
              
              {/* Prediction Dashed Lines */}
              <Area type="monotone" dataKey="Projected Total" stroke="#c084fc" strokeWidth={1.5} strokeDasharray="4 4" fill="none" dot={false} />
              <Area type="monotone" dataKey="Projected LDL" stroke="#f43f5e" strokeWidth={1.5} strokeDasharray="4 4" fill="none" dot={false} />
              <Area type="monotone" dataKey="Projected HDL" stroke="#10b981" strokeWidth={1.5} strokeDasharray="4 4" fill="none" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Serum Triglyceride predictions */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-sm font-sans font-bold text-slate-900 flex items-center space-x-1.5">
              <Activity className="h-4 w-4 text-amber-500" />
              <span>Serum Triglycerides Timeline & Trends</span>
            </h3>
            <p className="text-[11px] text-slate-400">Triglyceride levels with forward projections</p>
          </div>
          <span className="text-[10px] bg-slate-50 border px-2 py-0.5 rounded-md font-mono text-slate-500">
            mg/dL
          </span>
        </div>

        <div className="h-64 sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="formattedDate" stroke="#94a3b8" fontSize={10} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="Triglycerides" stroke="#f59e0b" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="Projected Triglycerides" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
