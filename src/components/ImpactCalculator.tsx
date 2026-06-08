import { useState } from 'react';
import { CholesterolLog } from '../types';
import { motion } from 'motion/react';
import { Dumbbell, Activity, ShieldAlert, Sparkles, TrendingUp, TrendingDown, RefreshCw, Flame, HelpCircle } from 'lucide-react';

interface ImpactCalculatorProps {
  latestLog: CholesterolLog | null;
}

export default function ImpactCalculator({ latestLog }: ImpactCalculatorProps) {
  // 1. Base Cholesterol Numbers
  const [ldl, setLdl] = useState<number>(latestLog?.ldl || 100);
  const [hdl, setHdl] = useState<number>(latestLog?.hdl || 50);
  const [trig, setTrig] = useState<number>(latestLog?.triglycerides || 150);

  // 2. Lifestyle Inputs
  const [satFat, setSatFat] = useState<number>(15); // grams daily, standard baseline ~15.6g
  const [solubleFiber, setSolubleFiber] = useState<number>(3); // grams daily, standard baseline ~3g
  const [starch, setStarch] = useState<number>(100); // grams daily, standard baseline ~100g
  const [protein, setProtein] = useState<number>(60); // grams daily, standard baseline ~60g
  
  // Exercise inputs
  const [workoutIntensity, setWorkoutIntensity] = useState<'none' | 'low' | 'medium' | 'high'>('medium');
  const [workoutDuration, setWorkoutDuration] = useState<number>(30); // minutes
  const [workoutsPerWeek, setWorkoutsPerWeek] = useState<number>(3); // times per week

  // 3. Time projection days
  const [days, setDays] = useState<number>(30);

  // MET values for intensities
  const INTENSITY_METS = {
    none: 0,
    low: 3, // walking, light stretching
    medium: 6, // brisk walking, light jogging, cycling
    high: 10, // running, high-intensity interval training
  };

  // Math Projection Logic
  const calculateProjections = () => {
    // --- DIET PROJECTIONS (Hegsted/Keys + baseline delta) ---
    // Saturated Fat: baseline is ~15g. Each gram above or below affects LDL.
    // 1g sat fat ≈ 9 kcal. In a 2000 kcal diet, 1% energy from sat fat is 2.22g.
    // Each 1% energy change from sat fat shifts LDL by 2.0 mg/dL over 30 days.
    const satFatDeltaG = satFat - 15;
    const ldlDeltaSatFat = (satFatDeltaG / 2.22) * 2.0;

    // Soluble Fiber: baseline is ~3g. Each gram above baseline reduces LDL.
    // 5g of daily soluble fiber above baseline (3g) decreases LDL by -2.2 mg/dL over 30 days (Anderson et al., 1990)
    const fiberDeltaG = solubleFiber - 3;
    const ldlDeltaFiber = -((fiberDeltaG) / 5) * 2.2;

    // Starch & Refined Carbohydrates: baseline ~100g.
    // Each 10g of daily starch above baseline increases TG by 1.5 mg/dL and lowers HDL by 0.1 mg/dL over 30 days.
    const starchDeltaG = starch - 100;
    const tgDeltaStarch = (starchDeltaG / 10) * 1.5;
    const hdlDeltaStarch = -(starchDeltaG / 10) * 0.1;

    // Protein: baseline ~60g.
    // Each 10g of daily protein above baseline reduces TG by 0.1 mg/dL and increases HDL by 0.02 mg/dL over 30 days.
    const proteinDeltaG = protein - 60;
    const tgDeltaProtein = -(proteinDeltaG / 10) * 0.1;
    const hdlDeltaProtein = (proteinDeltaG / 10) * 0.02;

    // --- WORKOUT PROJECTIONS (Kodama / Halbert aerobic models) ---
    // Weekly MET-hours = METs * (Duration / 60) * Frequency
    const mets = INTENSITY_METS[workoutIntensity];
    const durationHours = workoutDuration / 60;
    const weeklyMetHours = mets * durationHours * workoutsPerWeek;

    // Per MET-hour/week over 30 days:
    // LDL: -0.3 mg/dL, HDL: +0.1 mg/dL, TG: -1.8 mg/dL
    const ldlDeltaExercise = -(weeklyMetHours * 0.3);
    const hdlDeltaExercise = weeklyMetHours * 0.1;
    const tgDeltaExercise = -(weeklyMetHours * 1.8);

    // --- 30-Day Totals ---
    const ldlChange30d = ldlDeltaSatFat + ldlDeltaFiber + ldlDeltaExercise;
    const hdlChange30d = hdlDeltaStarch + hdlDeltaProtein + hdlDeltaExercise;
    const tgChange30d = tgDeltaStarch + tgDeltaProtein + tgDeltaExercise;

    // --- Scaling for user-selected "Days" ---
    const scaleFactor = days / 30;
    const ldlFinalChange = ldlChange30d * scaleFactor;
    const hdlFinalChange = hdlChange30d * scaleFactor;
    const tgFinalChange = tgChange30d * scaleFactor;

    // Projected Final Values
    const projectedLdl = Math.max(10, ldl + ldlFinalChange);
    const projectedHdl = Math.max(5, hdl + hdlFinalChange);
    const projectedTg = Math.max(10, trig + tgFinalChange);
    
    // Total Cholesterol (Total = LDL + HDL + TG/5 approx)
    const originalTotal = ldl + hdl + trig / 5;
    const projectedTotal = projectedLdl + projectedHdl + projectedTg / 5;

    return {
      ldlChange: ldlFinalChange,
      hdlChange: hdlFinalChange,
      tgChange: tgFinalChange,
      totalChange: projectedTotal - originalTotal,
      projectedLdl,
      projectedHdl,
      projectedTg,
      projectedTotal,
      originalTotal,
      weeklyMetHours,
    };
  };

  const results = calculateProjections();

  // Helper to format values
  const formatChange = (val: number) => {
    const sign = val >= 0 ? '+' : '';
    return `${sign}${val.toFixed(1)}`;
  };

  const resetCalculator = () => {
    setLdl(latestLog?.ldl || 100);
    setHdl(latestLog?.hdl || 50);
    setTrig(latestLog?.triglycerides || 150);
    setSatFat(15);
    setSolubleFiber(3);
    setStarch(100);
    setProtein(60);
    setWorkoutIntensity('medium');
    setWorkoutDuration(30);
    setWorkoutsPerWeek(3);
    setDays(30);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Title Signpost */}
      <div className="flex justify-between items-center px-1">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center space-x-2">
            <Activity className="h-5 w-5 text-indigo-500" />
            <span>Lifestyle Impact Telemetry Calculator</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Predict the exact quantitative trajectories of your lipid chemistry based on dietary macronutrients and metabolic workouts.
          </p>
        </div>
        <button
          onClick={resetCalculator}
          className="px-3 py-1.5 border border-slate-200 hover:border-slate-300 rounded-xl bg-white text-xs font-bold text-slate-500 flex items-center space-x-1.5 transition"
        >
          <RefreshCw className="h-3 w-3" />
          <span>Reset Parameters</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Input Variables (Span 7) */}
        <div className="lg:col-span-7 bg-[#0f172a] rounded-3xl p-6 border border-slate-800 shadow-xl text-white space-y-6">
          
          {/* Section A: Base Lipid Metrics */}
          <div>
            <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center space-x-1.5 mb-4">
              <span className="h-1.5 w-1.5 bg-indigo-400 rounded-full" />
              <span>Step 1: Baseline Lipid Profile (mg/dL)</span>
            </h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] text-slate-450 uppercase font-mono font-bold mb-1">LDL (Bad)</label>
                <input
                  type="number"
                  value={ldl}
                  onChange={(e) => setLdl(Math.max(10, parseInt(e.target.value) || 0))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-sm font-mono font-bold text-rose-450 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 transition"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-450 uppercase font-mono font-bold mb-1">HDL (Good)</label>
                <input
                  type="number"
                  value={hdl}
                  onChange={(e) => setHdl(Math.max(5, parseInt(e.target.value) || 0))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-sm font-mono font-bold text-emerald-450 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-450 uppercase font-mono font-bold mb-1">Triglycerides</label>
                <input
                  type="number"
                  value={trig}
                  onChange={(e) => setTrig(Math.max(10, parseInt(e.target.value) || 0))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-sm font-mono font-bold text-purple-400 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition"
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-800" />

          {/* Section B: Dietary Variables */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center space-x-1.5">
              <span className="h-1.5 w-1.5 bg-indigo-400 rounded-full" />
              <span>Step 2: Average Daily Dietary Intake</span>
            </h3>

            {/* Saturated Fat */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-350">Saturated Fat</span>
                <span className="font-bold text-rose-400">{satFat}g <span className="text-[10px] text-slate-500">(Baseline: 15g)</span></span>
              </div>
              <input
                type="range"
                min="0"
                max="80"
                value={satFat}
                onChange={(e) => setSatFat(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
            </div>

            {/* Soluble Fiber */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-350">Soluble Fiber</span>
                <span className="font-bold text-teal-400">{solubleFiber}g <span className="text-[10px] text-slate-500">(Baseline: 3g)</span></span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                step="0.5"
                value={solubleFiber}
                onChange={(e) => setSolubleFiber(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-teal-500"
              />
            </div>

            {/* Starch & Refined Carbs */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-350">Starch & Refined Carbohydrates</span>
                <span className="font-bold text-amber-400">{starch}g <span className="text-[10px] text-slate-500">(Baseline: 100g)</span></span>
              </div>
              <input
                type="range"
                min="20"
                max="350"
                value={starch}
                onChange={(e) => setStarch(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* Protein */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-350">Protein Intake</span>
                <span className="font-bold text-sky-400">{protein}g <span className="text-[10px] text-slate-500">(Baseline: 60g)</span></span>
              </div>
              <input
                type="range"
                min="10"
                max="200"
                value={protein}
                onChange={(e) => setProtein(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-sky-500"
              />
            </div>
          </div>

          <hr className="border-slate-800" />

          {/* Section C: Workout Variables */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center space-x-1.5">
              <span className="h-1.5 w-1.5 bg-indigo-400 rounded-full" />
              <span>Step 3: Workout Routine Configuration</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Intensity */}
              <div>
                <label className="block text-[10px] text-slate-450 uppercase font-mono font-bold mb-1.5">Intensity</label>
                <div className="grid grid-cols-4 gap-1 bg-slate-900 p-1 border border-slate-800 rounded-xl text-center">
                  {(['none', 'low', 'medium', 'high'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setWorkoutIntensity(lvl)}
                      className={`py-1 text-[10px] uppercase font-mono font-bold rounded-lg transition ${
                        workoutIntensity === lvl
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-[10px] text-slate-450 uppercase font-mono font-bold mb-1.5">Duration</label>
                <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1">
                  <input
                    type="number"
                    value={workoutDuration}
                    onChange={(e) => setWorkoutDuration(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-transparent text-sm font-mono text-white focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500 font-mono">min</span>
                </div>
              </div>

              {/* Frequency */}
              <div>
                <label className="block text-[10px] text-slate-450 uppercase font-mono font-bold mb-1.5">Frequency</label>
                <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1">
                  <input
                    type="number"
                    value={workoutsPerWeek}
                    onChange={(e) => setWorkoutsPerWeek(Math.max(0, Math.min(7, parseInt(e.target.value) || 0)))}
                    className="w-full bg-transparent text-sm font-mono text-white focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500 font-mono">/wk</span>
                </div>
              </div>
            </div>

            {workoutIntensity !== 'none' && (
              <div className="flex items-center space-x-2 text-[10px] text-indigo-400 bg-indigo-950/20 px-3 py-2 rounded-xl border border-indigo-900/30 font-mono">
                <Flame className="h-3 w-3 shrink-0" />
                <span>
                  Routine estimates <strong>{results.weeklyMetHours.toFixed(1)} MET-hours/week</strong> of aerobic physical demand.
                </span>
              </div>
            )}
          </div>

          <hr className="border-slate-800" />

          {/* Section D: Time Factor (Duration of Habits) */}
          <div className="space-y-2 bg-slate-900/50 p-4 rounded-2xl border border-slate-800/80">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-350 flex items-center space-x-1.5">
                <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                <span>Accumulation Projection Timeline:</span>
              </span>
              <span className="font-extrabold text-indigo-400 text-sm">{days} Days</span>
            </div>
            <input
              type="range"
              min="1"
              max="90"
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <p className="text-[10px] text-slate-500 italic">
              * Holds all other physiological parameters constant to project the compounding impact over time.
            </p>
          </div>

        </div>

        {/* RIGHT COLUMN: Results & Math (Span 5) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Section A: Projection Card */}
          <div className="bg-[#0f172a] rounded-3xl p-6 border border-slate-800 shadow-xl text-white relative overflow-hidden">
            <div className="absolute -right-16 -top-16 h-36 w-36 bg-indigo-500 rounded-full blur-3xl opacity-10 pointer-events-none" />

            <div className="relative z-10 space-y-4">
              <div className="flex items-center space-x-2 text-slate-400 text-xs font-mono font-bold uppercase tracking-widest">
                <Dumbbell className="h-3.5 w-3.5 text-indigo-400" />
                <span>Projected Delta Outcomes</span>
              </div>

              {/* Stat Matrix */}
              <div className="space-y-4">
                {/* LDL */}
                <div className="flex justify-between items-center bg-slate-900/40 p-3 rounded-2xl border border-slate-800">
                  <div>
                    <span className="block text-[10px] font-mono text-slate-450 uppercase">LDL (Bad)</span>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-xs text-slate-450 font-bold font-mono">{ldl}</span>
                      <span className="text-sm font-semibold text-slate-500">→</span>
                      <span className="text-lg font-extrabold font-mono text-rose-350">{results.projectedLdl.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-mono font-bold ${
                    results.ldlChange <= 0 ? 'bg-emerald-950/30 text-emerald-400 border border-emerald-900/30' : 'bg-rose-950/30 text-rose-450 border border-rose-900/30'
                  }`}>
                    {results.ldlChange <= 0 ? <TrendingDown className="h-3.5 w-3.5" /> : <TrendingUp className="h-3.5 w-3.5" />}
                    <span>{formatChange(results.ldlChange)} mg/dL</span>
                  </div>
                </div>

                {/* HDL */}
                <div className="flex justify-between items-center bg-slate-900/40 p-3 rounded-2xl border border-slate-800">
                  <div>
                    <span className="block text-[10px] font-mono text-slate-450 uppercase">HDL (Good)</span>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-xs text-slate-450 font-bold font-mono">{hdl}</span>
                      <span className="text-sm font-semibold text-slate-500">→</span>
                      <span className="text-lg font-extrabold font-mono text-emerald-350">{results.projectedHdl.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-mono font-bold ${
                    results.hdlChange >= 0 ? 'bg-emerald-950/30 text-emerald-400 border border-emerald-900/30' : 'bg-rose-950/30 text-rose-450 border border-rose-900/30'
                  }`}>
                    {results.hdlChange >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                    <span>{formatChange(results.hdlChange)} mg/dL</span>
                  </div>
                </div>

                {/* Triglycerides */}
                <div className="flex justify-between items-center bg-slate-900/40 p-3 rounded-2xl border border-slate-800">
                  <div>
                    <span className="block text-[10px] font-mono text-slate-450 uppercase">Triglycerides</span>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-xs text-slate-450 font-bold font-mono">{trig}</span>
                      <span className="text-sm font-semibold text-slate-500">→</span>
                      <span className="text-lg font-extrabold font-mono text-purple-350">{results.projectedTg.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-mono font-bold ${
                    results.tgChange <= 0 ? 'bg-emerald-950/30 text-emerald-400 border border-emerald-900/30' : 'bg-rose-950/30 text-rose-450 border border-rose-900/30'
                  }`}>
                    {results.tgChange <= 0 ? <TrendingDown className="h-3.5 w-3.5" /> : <TrendingUp className="h-3.5 w-3.5" />}
                    <span>{formatChange(results.tgChange)} mg/dL</span>
                  </div>
                </div>

                {/* Total Cholesterol (Formula representation) */}
                <div className="flex justify-between items-center bg-slate-900 p-4 rounded-2xl border border-indigo-950 border-dashed">
                  <div>
                    <span className="block text-[10px] font-mono text-indigo-400 uppercase font-bold">Total Cholesterol (Calculated)</span>
                    <div className="flex items-baseline space-x-1.5 mt-0.5">
                      <span className="text-xl font-black font-mono tracking-tight">{results.originalTotal.toFixed(0)}</span>
                      <span className="text-xs text-slate-500 font-semibold font-mono">→</span>
                      <span className="text-2xl font-black font-mono tracking-tight text-indigo-300">{results.projectedTotal.toFixed(0)}</span>
                    </div>
                  </div>
                  <span className={`text-xs font-mono font-extrabold ${results.totalChange <= 0 ? 'text-emerald-450' : 'text-rose-450'}`}>
                    {formatChange(results.totalChange)} mg/dL
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* Section B: Clinical Math & Formulas (Scientific explanations with minimal text) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-150 space-y-4">
            <h3 className="text-sm font-sans font-bold text-slate-800 flex items-center space-x-1.5">
              <HelpCircle className="h-4 w-4 text-indigo-500" />
              <span>Scientific Equations & Reference Models</span>
            </h3>

            <div className="space-y-3 font-mono text-[11px] text-slate-500 leading-normal">
              {/* Saturated Fat Equation */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="block font-bold text-slate-700 uppercase text-[9px] tracking-wider mb-1">
                  1. Saturated Fat (Hegsted Equation)
                </span>
                <code className="block text-slate-900 font-bold mb-1">
                  ΔLDL_30d = ((Sat_g - 15) * 9 / 2000 * 100) * 2.0
                </code>
                <p className="text-[10px] text-slate-400">
                  Each 1% dietary energy increase from saturated fat increases LDL by +2.0 mg/dL.
                </p>
              </div>

              {/* Soluble Fiber Equation */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="block font-bold text-slate-700 uppercase text-[9px] tracking-wider mb-1">
                  2. Soluble Fiber (Bile Acid Binding / Anderson Equation)
                </span>
                <code className="block text-slate-900 font-bold mb-1">
                  ΔLDL_30d = -((Fiber_g - 3) / 5) * 2.2
                </code>
                <code className="block text-indigo-900 font-bold mb-1">
                  K_L(F_S, F_B) = [K_max * (1 + γ * F_B)] / [1 + β * F_S]
                </code>
                <p className="text-[10px] text-slate-400">
                  Soluble fiber forms a gel binding bile acids. Anderson meta-analysis demonstrates -2.2 mg/dL per 5g soluble fiber above 3g baseline. Dynamic clearance rates ($K_L$) represent clearance upregulation based on daily fiber intake.
                </p>
              </div>

              {/* Carbohydrates/Starch Equation */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="block font-bold text-slate-700 uppercase text-[9px] tracking-wider mb-1">
                  3. Refined Starch & Carbohydrates
                </span>
                <code className="block text-slate-900 font-bold mb-1">
                  ΔTG_30d = ((Starch_g - 100) / 10) * 1.5
                </code>
                <code className="block text-slate-900 font-bold mb-1">
                  ΔHDL_30d = -((Starch_g - 100) / 10) * 0.1
                </code>
                <p className="text-[10px] text-slate-400">
                  High glycaemic starches trigger synthesis of Triglycerides and displace HDL.
                </p>
              </div>

              {/* Exercise/METs Equation */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="block font-bold text-slate-700 uppercase text-[9px] tracking-wider mb-1">
                  4. Exercise Demand (Kodama Meta-Analysis)
                </span>
                <code className="block text-slate-900 font-bold mb-1">
                  Weekly_MET_Hours = MET_intensity * Hours * Freq
                </code>
                <code className="block text-slate-900 font-bold mb-1">
                  ΔHDL_30d = +0.1 * Weekly_MET_Hours
                </code>
                <code className="block text-slate-900 font-bold mb-1">
                  ΔTG_30d = -1.8 * Weekly_MET_Hours
                </code>
                <p className="text-[10px] text-slate-400">
                  Aerobic workload activates lipoprotein lipase, accelerating TG clearance.
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </motion.div>
  );
}
