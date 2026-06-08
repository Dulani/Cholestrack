import { LifestyleLog } from '../types';
import { Activity, Salad, Flame, Heart, Pill } from 'lucide-react';
import { describeProjectionFactors } from '../utils/projection';

interface LifestyleCardProps {
  lifeLogs: LifestyleLog[];
}

export default function LifestyleCard({ lifeLogs }: LifestyleCardProps) {
  const { weeklyMetHours, avgSatFatG, avgFiberG, hasData } = describeProjectionFactors(lifeLogs);

  // Today's logs
  const todayStr = new Date().toDateString();
  const todayLogs = lifeLogs.filter(l => new Date(l.date).toDateString() === todayStr);
  const todayCalories = todayLogs.reduce((s, l) => s + (l.activeCalories || 0), 0);
  const todayDuration = todayLogs.reduce((s, l) => s + (l.duration || 0), 0);
  const todaySatFat = todayLogs.reduce((s, l) => s + (l.satFat || 0), 0);
  const todayFiber = todayLogs.reduce((s, l) => s + (l.solubleFiber || 0), 0);
  const todaySupplements = [...new Set(todayLogs.flatMap(l => l.supplements || []))];

  // Projection impact labels
  const ldlExerciseDelta = -(weeklyMetHours * 0.3);
  const hdlExerciseDelta = weeklyMetHours * 0.1;

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
        <div>
          <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
            <Activity className="h-4 w-4 text-indigo-500" />
            <span>Lifestyle & Activity Summary</span>
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Today's intake · 7-day projection inputs</p>
        </div>
        {!hasData && (
          <span className="text-[10px] bg-amber-50 text-amber-600 border border-amber-100 px-2 py-1 rounded-lg font-mono">
            No logs yet
          </span>
        )}
      </div>

      <div className="p-5 space-y-4">
        {/* Today's stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-indigo-50 rounded-2xl p-3 text-center">
            <Flame className="h-4 w-4 text-indigo-500 mx-auto mb-1" />
            <p className="text-xl font-bold text-indigo-700">{todayCalories}</p>
            <p className="text-[10px] text-indigo-500 font-mono uppercase">Active kcal</p>
          </div>
          <div className="bg-emerald-50 rounded-2xl p-3 text-center">
            <Activity className="h-4 w-4 text-emerald-500 mx-auto mb-1" />
            <p className="text-xl font-bold text-emerald-700">{todayDuration}</p>
            <p className="text-[10px] text-emerald-500 font-mono uppercase">Minutes</p>
          </div>
          <div className="bg-amber-50 rounded-2xl p-3 text-center">
            <Salad className="h-4 w-4 text-amber-500 mx-auto mb-1" />
            <p className="text-xl font-bold text-amber-700">{todaySatFat.toFixed(1)}<span className="text-xs font-normal">g</span></p>
            <p className="text-[10px] text-amber-500 font-mono uppercase">Sat Fat</p>
          </div>
          <div className="bg-teal-50 rounded-2xl p-3 text-center">
            <Heart className="h-4 w-4 text-teal-500 mx-auto mb-1" />
            <p className="text-xl font-bold text-teal-700">{todayFiber.toFixed(1)}<span className="text-xs font-normal">g</span></p>
            <p className="text-[10px] text-teal-500 font-mono uppercase">Sol. Fiber</p>
          </div>
        </div>

        {/* 7-day projection inputs */}
        {hasData && (
          <div className="bg-slate-50 rounded-2xl p-4 space-y-2.5">
            <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
              30-Day Projection Inputs (7-day rolling avg)
            </p>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-sm font-bold text-slate-800">{weeklyMetHours.toFixed(1)}</p>
                <p className="text-[10px] text-slate-500">MET-hrs/wk</p>
                <p className={`text-[10px] font-bold mt-0.5 ${ldlExerciseDelta < 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                  LDL {ldlExerciseDelta < 0 ? `${ldlExerciseDelta.toFixed(1)}` : '±0'} mg/dL
                </p>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">{avgSatFatG.toFixed(1)}g</p>
                <p className="text-[10px] text-slate-500">Sat fat/day</p>
                <p className="text-[10px] text-slate-400 mt-0.5 font-mono">Hegsted eq.</p>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">{avgFiberG.toFixed(1)}g</p>
                <p className="text-[10px] text-slate-500">Sol. fiber/day</p>
                <p className="text-[10px] text-slate-400 mt-0.5 font-mono">Anderson eq.</p>
              </div>
            </div>
            {hdlExerciseDelta > 0 && (
              <p className="text-[10px] text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                ↑ HDL projected +{hdlExerciseDelta.toFixed(1)} mg/dL from aerobic activity (Kodama et al.)
              </p>
            )}
          </div>
        )}

        {/* Today's supplements */}
        {todaySupplements.length > 0 && (
          <div className="flex items-center space-x-2 flex-wrap gap-1.5">
            <Pill className="h-3.5 w-3.5 text-violet-400 shrink-0" />
            {todaySupplements.map(s => (
              <span key={s} className="text-[10px] bg-violet-50 text-violet-700 border border-violet-100 px-2 py-0.5 rounded-md font-mono">
                {s}
              </span>
            ))}
          </div>
        )}

        {!hasData && (
          <p className="text-xs text-slate-400 text-center py-2">
            Log activity and diet entries to see projection inputs and today's summary.
          </p>
        )}
      </div>
    </div>
  );
}
