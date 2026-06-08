import { ASCVDResult, UserProfile } from '../types';
import { motion } from 'motion/react';
import { Activity, ShieldCheck, Heart, AlertTriangle, Lightbulb } from 'lucide-react';

interface RiskCardProps {
  result: ASCVDResult;
  profile: UserProfile;
}

export default function RiskCard({ result, profile }: RiskCardProps) {
  const { riskPercent, classification, message, color, guidance } = result;

  // Visual helper mapping
  const bgMapping = {
    low: 'bg-[#0f172a] shadow-[0_4px_30px_rgba(16,185,129,0.05)] border border-emerald-950/20',
    borderline: 'bg-[#0f172a] shadow-[0_4px_30px_rgba(56,189,248,0.05)] border border-sky-950/20',
    intermediate: 'bg-[#0f172a] shadow-[0_4px_30px_rgba(245,158,11,0.05)] border border-amber-950/20',
    high: 'bg-[#0f172a] shadow-[0_4px_30px_rgba(239,68,68,0.05)] border border-rose-950/20',
  };

  const currentBgClass = bgMapping[classification] || bgMapping.low;

  // Percentage slider track positioning
  const clampedPercent = Math.min(35, Math.max(0, riskPercent));
  const sliderPositionPercent = (clampedPercent / 35) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`rounded-3xl p-6 text-white ${currentBgClass} relative overflow-hidden`}
    >
      {/* Decorative pulse blur glow in background */}
      <div className={`absolute -right-16 -top-16 h-48 w-48 rounded-full blur-3xl opacity-15 transition-all duration-300 ${
        classification === 'low' ? 'bg-emerald-400' :
        classification === 'borderline' ? 'bg-sky-400' :
        classification === 'intermediate' ? 'bg-amber-400' : 'bg-rose-400'
      }`} />

      <div className="flex flex-col lg:flex-row gap-8 items-stretch relative z-10">
        
        {/* Left column: Mathematical percentage display details */}
        <div className="flex flex-col justify-between lg:w-2/5 border-b lg:border-b-0 lg:border-r border-slate-800 pb-6 lg:pb-0 lg:pr-8">
          <div>
            <div className="flex items-center space-x-2 text-slate-400 text-xs font-mono font-bold uppercase tracking-widest mb-3">
              <Activity className="h-3.5 w-3.5" />
              <span>10-Year ASCVD Risk Score</span>
            </div>
            
            <h3 className="text-xl font-bold tracking-tight text-white mb-1">
              ACC/AHA Clinician Model
            </h3>
            <p className="text-slate-400 text-xs leading-normal">
              Estimates the lifetime risk of cardiovascular incidents based on demographics, smoking history, systolic blood pressure, diabetes, and lipid chemistry.
            </p>
          </div>

          <div className="my-6">
            <div className="flex items-baseline space-x-2">
              <span className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300 font-sans tracking-tighter">
                {profile.age < 40 || profile.age > 79 ? 'N/A' : `${riskPercent.toFixed(1)}%`}
              </span>
              <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                Computed Risk
              </span>
            </div>

            {/* Custom Interactive Gauge Slider line */}
            {profile.age >= 40 && profile.age <= 79 && (
              <div className="mt-4">
                <div className="flex justify-between text-[10px] text-slate-500 font-mono mb-1.5">
                  <span>LOW (&lt;5%)</span>
                  <span>BORDERLINE</span>
                  <span>INTERMEDIATE (7.5%-20%)</span>
                  <span>HIGH (&ge;20%)</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full relative overflow-visible">
                  {/* Categorized colored bar backgrounds */}
                  <div className="absolute inset-0 flex rounded-full overflow-hidden">
                    <div className="h-full w-[14.2%] bg-emerald-500/40" />
                    <div className="h-full w-[7.1%] bg-sky-500/40" />
                    <div className="h-full w-[35.7%] bg-amber-500/40" />
                    <div className="h-full w-[43%] bg-rose-500/40" />
                  </div>
                  {/* Slider pin handle */}
                  <motion.div
                    initial={{ left: 0 }}
                    animate={{ left: `${sliderPositionPercent}%` }}
                    transition={{ type: "spring", stiffness: 40 }}
                    className="absolute -top-1 h-4 w-4 bg-white rounded-full shadow-lg border-2 border-slate-900 -ml-2 flex items-center justify-center cursor-default group"
                  >
                    <div className="h-1.5 w-1.5 bg-indigo-600 rounded-full" />
                  </motion.div>
                </div>
              </div>
            )}
          </div>

          <div className="text-xs font-medium text-slate-400 flex items-center space-x-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Validated under current AHA/ACC equations.</span>
          </div>
        </div>

        {/* Right column: Guideline insights & clinical steps */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <span className={`text-[11px] font-extrabold px-3 py-1 rounded-full border tracking-wide uppercase ${
                classification === 'low' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                classification === 'borderline' ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' :
                classification === 'intermediate' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                'bg-rose-500/10 text-rose-400 border-rose-500/20'
              }`}>
                {message}
              </span>
            </div>

            <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-widest font-mono flex items-center gap-1.5 mb-3">
              <Lightbulb className="h-4 w-4 text-yellow-400" />
              Clinical Guideline Recommendations
            </h4>

            <ul className="space-y-2.5">
              {guidance.map((bullet, idx) => (
                <li key={idx} className="flex items-start text-sm text-slate-300 leading-normal">
                  <span className="text-emerald-400 mr-2.5 select-none font-bold shrink-0">✓</span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Statin safety text alert footer row */}
          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center space-x-2 text-xs text-slate-400">
            <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
            <p>
              <strong>Disclaimer:</strong> This application serves purely as a clinical tracking reference tool and helper. Therapy changes must only be made under direct guidance of your personal attending cardiologist or physician.
            </p>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
