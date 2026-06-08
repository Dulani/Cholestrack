import { classifyLipids } from '../utils/ascvd';
import { CholesterolLog } from '../types';
import { Shield, Info, Activity, TrendingDown, TrendingUp, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface MetricCardsProps {
  logs: CholesterolLog[];
  gender: 'male' | 'female';
}

// Custom relative calculator to scale absolute metric values to visual percentages [0-100]
function getGaugeConfig(type: 'total' | 'ldl' | 'hdl' | 'trig', value: number, gender: 'male' | 'female') {
  let percentage = 0;
  let zones: { width: string; color: string }[] = [];
  let labels: { label: string; offset: string }[] = [];

  if (type === 'total') {
    // Total Cholesterol Range: 100 to 300 mg/dL
    if (value <= 200) {
      // 100 to 200 matches 0% to 50%
      percentage = 50 * (value - 100) / (200 - 100);
    } else if (value <= 240) {
      // 200 to 240 matches 50% to 75%
      percentage = 50 + 25 * (value - 200) / (240 - 200);
    } else {
      // 240 to 300+ matches 75% to 100%
      percentage = 75 + 25 * (value - 240) / (300 - 240);
    }
    percentage = Math.max(2, Math.min(98, percentage));

    zones = [
      { width: '50%', color: 'bg-emerald-500' },
      { width: '25%', color: 'bg-amber-500' },
      { width: '25%', color: 'bg-rose-500' },
    ];

    labels = [
      { label: 'OPTIMAL (<200)', offset: '25%' },
      { label: 'BORDERLINE', offset: '62.5%' },
      { label: 'HIGH (≥240)', offset: '87.5%' },
    ];
  } else if (type === 'ldl') {
    // LDL Range: 50 to 210 mg/dL
    if (value <= 100) {
      // 50 to 100 matches 0% to 35%
      percentage = 35 * (value - 50) / (100 - 50);
    } else if (value <= 130) {
      // 100 to 130 matches 35% to 55%
      percentage = 35 + 20 * (value - 100) / (130 - 100);
    } else if (value <= 160) {
      // 130 to 160 matches 55% to 75%
      percentage = 55 + 20 * (value - 130) / (160 - 130);
    } else {
      // 160 to 210+ matches 75% to 100%
      percentage = 75 + 25 * (value - 160) / (210 - 160);
    }
    percentage = Math.max(2, Math.min(98, percentage));

    zones = [
      { width: '35%', color: 'bg-emerald-500' },
      { width: '20%', color: 'bg-teal-400' },
      { width: '20%', color: 'bg-amber-500' },
      { width: '25%', color: 'bg-rose-500' },
    ];

    labels = [
      { label: 'OPTIMAL', offset: '17.5%' },
      { label: 'NEAR OPT', offset: '45%' },
      { label: 'BORDERLINE', offset: '65%' },
      { label: 'HIGH (≥160)', offset: '87.5%' },
    ];
  } else if (type === 'hdl') {
    // HDL range: 20 to 80 mg/dL. Higher count is protective, lower is risk!
    const lowLimit = gender === 'female' ? 50 : 40;
    
    // Map 20 to lowLimit as Danger (rose)
    if (value <= lowLimit) {
      percentage = 40 * (value - 20) / (lowLimit - 20);
    } else if (value <= 60) {
      // lowLimit to 60 as acceptable (amber)
      percentage = 40 + 30 * (value - lowLimit) / (60 - lowLimit);
    } else {
      // 60 to 80+ as protective (emerald)
      percentage = 70 + 30 * (value - 60) / (80 - 60);
    }
    percentage = Math.max(2, Math.min(98, percentage));

    zones = [
      { width: '40%', color: 'bg-rose-500' },
      { width: '30%', color: 'bg-amber-500' },
      { width: '30%', color: 'bg-emerald-500' },
    ];

    labels = [
      { label: 'LOW', offset: '20%' },
      { label: 'NORMAL', offset: '55%' },
      { label: 'PROTECTIVE', offset: '85%' },
    ];
  } else {
    // Triglycerides (TG) range: 50 to 350 mg/dL
    if (value <= 150) {
      percentage = 45 * (value - 50) / (150 - 50);
    } else if (value <= 200) {
      percentage = 45 + 20 * (value - 150) / (200 - 150);
    } else {
      percentage = 65 + 35 * (value - 200) / (350 - 200);
    }
    percentage = Math.max(2, Math.min(98, percentage));

    zones = [
      { width: '45%', color: 'bg-emerald-500' },
      { width: '20%', color: 'bg-amber-500' },
      { width: '35%', color: 'bg-rose-500' },
    ];

    labels = [
      { label: 'OPTIMAL (<150)', offset: '22.5%' },
      { label: 'BORDERLINE', offset: '55%' },
      { label: 'HIGH (≥200)', offset: '82.5%' },
    ];
  }

  return { percentage, zones, labels };
}

export default function MetricCards({ logs, gender }: MetricCardsProps) {
  // Sort logs chronologically (date ascending) to accurately determine sequence
  const sortedLogs = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const latestLog = sortedLogs[sortedLogs.length - 1] || null;
  const previousLog = sortedLogs.length >= 2 ? sortedLogs[sortedLogs.length - 2] : null;

  if (!latestLog) {
    return (
      <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-8 text-center">
        <Shield className="h-10 w-10 text-slate-400 mx-auto mb-3" />
        <p className="text-sm font-medium text-slate-600">No cholesterol logs available yet.</p>
        <p className="text-xs text-slate-400 mt-1">Add your recent blood work results above to begin telemetry analysis.</p>
      </div>
    );
  }

  const { totalChol, hdl, ldl, triglycerides } = latestLog;

  // Friedewald Calculation check
  const calculatedLdl = totalChol - hdl - triglycerides / 5;
  const isTrigTooHighForFriedewald = triglycerides >= 400;

  // Delta Variance calculations (mimics original CholesTrack math)
  let ldlDelta = 0;
  let hdlDelta = 0;
  let totalDelta = 0;
  let hasDelta = false;

  if (previousLog) {
    ldlDelta = ((ldl - previousLog.ldl) / previousLog.ldl) * 100;
    hdlDelta = ((hdl - previousLog.hdl) / previousLog.hdl) * 100;
    totalDelta = ((totalChol - previousLog.totalChol) / previousLog.totalChol) * 100;
    hasDelta = true;
  }

  // Velocity indicator over the last rolling entries
  const recentLogs = sortedLogs.slice(-7);
  let weeklySlope = 0;
  let velocityText = 'Stable';
  let isVelocityDecreasing = true;

  if (recentLogs.length >= 2) {
    weeklySlope = recentLogs[recentLogs.length - 1].ldl - recentLogs[0].ldl;
    isVelocityDecreasing = weeklySlope <= 0;
    velocityText = isVelocityDecreasing ? 'LDL Decreasing' : 'LDL Increasing';
  }

  const cards = [
    {
      type: 'total' as const,
      name: 'Total Cholesterol',
      value: totalChol,
      unit: 'mg/dL',
      description: 'Sum of all cholesterol in your blood (LDL, HDL, and VLDL density).',
      target: '< 200 mg/dL',
      delta: totalDelta,
    },
    {
      type: 'ldl' as const,
      name: 'LDL (Atherogenic)',
      value: ldl,
      unit: 'mg/dL',
      description: 'Low-Density Lipoprotein: primary trigger of arterial plaque buildup.',
      target: '< 100 mg/dL',
      delta: ldlDelta,
    },
    {
      type: 'hdl' as const,
      name: 'HDL (Protective)',
      value: hdl,
      unit: 'mg/dL',
      description: 'High-Density Lipoprotein: returns excess cholesterol back to your liver.',
      target: gender === 'female' ? '≥ 50 mg/dL' : '≥ 40 mg/dL',
      delta: hdlDelta,
    },
    {
      type: 'trig' as const,
      name: 'Triglycerides',
      value: triglycerides,
      unit: 'mg/dL',
      description: 'Serum fat indices stored for quick cellular energy release.',
      target: '< 150 mg/dL',
      delta: null,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, idx) => {
          const { percentage, zones, labels } = getGaugeConfig(card.type, card.value, gender);

          return (
            <div
              key={idx}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow duration-200"
            >
              <div>
                <div className="flex justify-between items-start">
                  <span className="text-xs font-mono font-bold tracking-tight text-slate-500 uppercase">
                    {card.name}
                  </span>
                  
                  {/* Delta Variance percentage pill */}
                  {hasDelta && card.delta !== null && (
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                      card.type === 'hdl' 
                        ? (card.delta >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700')
                        : (card.delta <= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700')
                    }`}>
                      {card.delta > 0 ? '+' : ''}{card.delta.toFixed(1)}% {card.type === 'hdl' ? (card.delta >= 0 ? '▲' : '▼') : (card.delta <= 0 ? '▼' : '▲')}
                    </span>
                  )}
                </div>

                <div className="flex items-baseline space-x-1.5 my-2.5">
                  <span className="text-4xl font-sans font-extrabold text-slate-900 tracking-tight">
                    {card.value}
                  </span>
                  <span className="text-sm font-medium text-slate-400">
                    {card.unit}
                  </span>
                </div>
                
                <p className="text-xs text-slate-500 leading-normal mb-4">
                  {card.description}
                </p>

                {/* Custom Relative Dot-Bar Visualizer Scale */}
                <div className="mb-4 pt-1">
                  <div className="h-1.5 w-full bg-slate-100 rounded-full relative overflow-visible flex">
                    {/* Zones of color */}
                    {zones.map((zone, zIdx) => (
                      <div
                        key={zIdx}
                        style={{ width: zone.width }}
                        className={`h-full ${zone.color} opacity-40 first:rounded-l-full last:rounded-r-full`}
                      />
                    ))}

                    {/* Animated custom position pin handle */}
                    <motion.div
                      initial={{ left: 0 }}
                      animate={{ left: `${percentage}%` }}
                      transition={{ type: "spring", stiffness: 50, damping: 10 }}
                      className="absolute -top-1.25 h-4 w-4 bg-white rounded-full shadow-md border-2 border-slate-900 -ml-2 flex items-center justify-center cursor-default"
                    >
                      <div className="h-1.5 w-1.5 bg-indigo-600 rounded-full" />
                    </motion.div>
                  </div>

                  {/* Range Boundaries labels */}
                  <div className="relative h-4 mt-2">
                    {labels.map((lbl, lIdx) => (
                      <div
                        key={lIdx}
                        style={{ left: lbl.offset }}
                        className="absolute -translate-x-1/2 text-[9px] font-mono text-slate-400 whitespace-nowrap"
                      >
                        {lbl.label}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-50 pt-3 flex justify-between items-center text-[11px] text-slate-400">
                <span>Clinician Target</span>
                <span className="font-mono font-semibold text-slate-600">{card.target}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Diagnostics Banner Grid: Friedewald on Left, CholesTrack Variance & Velocity on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Banner 1: Friedewald Diagnostics */}
        <div className="bg-slate-50 rounded-2xl p-4.5 border border-slate-100 flex flex-col justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-start space-x-2.5">
            <Info className="h-4.5 w-4.5 text-indigo-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-800 flex items-center gap-1.5">
                Friedewald Formula Diagnostics
              </p>
              <p className="text-slate-500 leading-relaxed mt-0.5">
                Your mathematically derived Friedewald LDL is <strong className="font-mono text-indigo-600">{Math.round(calculatedLdl)} mg/dL</strong>.
                {isTrigTooHighForFriedewald 
                  ? " Caution: Triglycerides ≥ 400 mg/dL invalidate the Friedewald equation; rely strictly on direct lab tests."
                  : " Triglyceride levels are optimal: Calculated LDL coordinates with your reported value."}
              </p>
            </div>
          </div>
          <div className="flex justify-between items-center border-t border-slate-100 pt-2 text-[10px] text-slate-400 font-mono">
            <span>Formula Ratio Equation:</span>
            <span>LDL = TC - HDL - (TG / 5)</span>
          </div>
        </div>

        {/* Banner 2: Cellular Bio-Velocity & Trend indicator from CholesTrack original app.js */}
        <div className="bg-slate-50 rounded-2xl p-4.5 border border-slate-100 flex flex-col justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-start space-x-2.5">
            <Activity className="h-4.5 w-4.5 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-800">Mathematical Bio-Velocity Indicator</p>
              <p className="text-slate-500 leading-relaxed mt-0.5">
                Current 7-entry rolling velocity shows 
                <strong className={`font-semibold ml-1 ${isVelocityDecreasing ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {velocityText} ({weeklySlope > 0 ? '+' : ''}{weeklySlope.toFixed(1)} mg/dL/interval)
                </strong>.
                {hasDelta 
                  ? ` Your latest Total Cholesterol altered by ${totalDelta > 0 ? '+' : ''}${totalDelta.toFixed(1)}% compared to the previous lab.`
                  : " Log another laboratory register to compute active rolling delta variance trends."}
              </p>
            </div>
          </div>
          <div className="flex justify-between items-center border-t border-slate-100 pt-2 text-[10px] text-slate-400 font-mono">
            <span>Velocity Assessment:</span>
            <span className="flex items-center gap-1 font-bold">
              {isVelocityDecreasing ? (
                <>
                  <TrendingDown className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-emerald-500">OPTIMIZING</span>
                </>
              ) : (
                <>
                  <TrendingUp className="h-3.5 w-3.5 text-rose-500 animate-pulse" />
                  <span className="text-rose-500">RISK TREND</span>
                </>
              )}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
