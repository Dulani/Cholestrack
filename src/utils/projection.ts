/**
 * CholesTrack – Scientific Cholesterol Projection Engine
 *
 * Applies evidence-based models to project how recent lifestyle logs
 * (diet + exercise) will shift LDL, HDL, and Triglycerides over 30 days.
 *
 * Sources:
 *  - Hegsted/Keys equation: sat fat → LDL (Hegsted DM et al., Am J Clin Nutr, 1965)
 *  - Anderson et al.: soluble fiber → LDL (Anderson JW et al., NEJM, 1990)
 *  - Kodama et al.: aerobic exercise → HDL, LDL, TG (Kodama S et al., Arch Intern Med, 2007)
 *  - Halbert et al.: exercise → LDL reduction (Halbert JA et al., Eur J Cardiovasc Prev Rehab, 2005)
 */

import { LifestyleLog, CholesterolLog } from '../types';

export interface ProjectedPoint {
  formattedDate: string;
  'Projected Total'?: number;
  'Projected LDL'?: number;
  'Projected HDL'?: number;
  'Projected Triglycerides'?: number;
  isLifestyleProjection: true;
}

/**
 * Compute average weekly MET-hours from recent lifestyle logs.
 * METs × duration_hours = MET-hours per session.
 */
function computeWeeklyMetHours(logs: LifestyleLog[]): number {
  if (logs.length === 0) return 0;

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 7);

  const recentSessions = logs.filter(l => new Date(l.date) >= cutoff);
  const totalMetHours = recentSessions.reduce((sum, l) => {
    const durationHours = (l.duration || 0) / 60;
    return sum + (l.mets || 0) * durationHours;
  }, 0);

  return totalMetHours;
}

/**
 * Compute average daily saturated fat intake (grams) from recent lifestyle logs.
 */
function computeAvgDailySatFat(logs: LifestyleLog[]): number {
  if (logs.length === 0) return 0;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 7);
  const recent = logs.filter(l => new Date(l.date) >= cutoff);
  if (recent.length === 0) return 0;
  const totalSatFat = recent.reduce((sum, l) => sum + (l.satFat || 0), 0);
  return totalSatFat / 7; // per day over 7-day window
}

/**
 * Compute average daily soluble fiber intake (grams) from recent lifestyle logs.
 */
function computeAvgDailySolubleFiber(logs: LifestyleLog[]): number {
  if (logs.length === 0) return 0;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 7);
  const recent = logs.filter(l => new Date(l.date) >= cutoff);
  if (recent.length === 0) return 0;
  const totalFiber = recent.reduce((sum, l) => sum + (l.solubleFiber || 0), 0);
  return totalFiber / 7;
}

/**
 * Core projection function.
 *
 * Returns 30 projected daily data points starting from the day after the last
 * cholesterol log, with lipid values adjusted based on recent lifestyle inputs.
 *
 * @param cholLogs   - Sorted (newest-first) list of cholesterol lab entries
 * @param lifeLogs   - All lifestyle log entries (activity + diet)
 * @returns          - Array of 30 projected data points
 */
export function computeLifestyleProjection(
  cholLogs: CholesterolLog[],
  lifeLogs: LifestyleLog[]
): ProjectedPoint[] {
  if (cholLogs.length === 0) return [];

  const latestLog = [...cholLogs].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )[0];

  const baseLdl = latestLog.ldl;
  const baseHdl = latestLog.hdl;
  const baseTrig = latestLog.triglycerides;
  const baseTotal = latestLog.totalChol;

  // --- Lifestyle inputs ---
  const weeklyMetHours = computeWeeklyMetHours(lifeLogs);
  const avgDailySatFatG = computeAvgDailySatFat(lifeLogs);
  const avgDailySolubleFiberG = computeAvgDailySolubleFiber(lifeLogs);

  // --- Hegsted/Keys: Each 1% increase in dietary energy from sat fat → +2 mg/dL LDL
  // Approximate: ~2000 kcal/day reference diet; 1g sat fat ≈ 9 kcal → % energy ≈ g * 9 / 2000 * 100
  // Delta LDL from sat fat (above 7% energy baseline, i.e. ~15.6g/day):
  const satFatBaseline = 15.6; // grams/day ≈ 7% of 2000 kcal
  const satFatDeltaPct = ((avgDailySatFatG - satFatBaseline) * 9) / 2000 * 100;
  const ldlDeltaSatFat = satFatDeltaPct * 2.0; // mg/dL per 1% energy from sat fat

  // --- Anderson et al.: 5g/day soluble fiber → -2.2 mg/dL LDL
  const fiberBaselineG = 3; // typical baseline intake
  const ldlDeltaFiber = -((avgDailySolubleFiberG - fiberBaselineG) / 5) * 2.2;

  // --- Kodama et al.: Per MET-hr/week of aerobic activity:
  //   LDL: -0.3 mg/dL
  //   HDL: +0.1 mg/dL
  //   TG:  -1.8 mg/dL
  const ldlDeltaExercise = -(weeklyMetHours * 0.3);
  const hdlDeltaExercise = weeklyMetHours * 0.1;
  const trigDeltaExercise = -(weeklyMetHours * 1.8);

  // --- Total 30-day projected delta ---
  // Effects build linearly over 30 days (most dietary/exercise changes take 4-8 weeks to peak)
  const totalLdlDelta30d = ldlDeltaSatFat + ldlDeltaFiber + ldlDeltaExercise;
  const totalHdlDelta30d = hdlDeltaExercise;
  const totalTrigDelta30d = trigDeltaExercise;
  const totalCholDelta30d = totalLdlDelta30d * 0.8 + totalHdlDelta30d * 0.3; // approximate

  const projections: ProjectedPoint[] = [];
  const startDate = new Date(latestLog.date);

  for (let day = 1; day <= 30; day++) {
    const progress = day / 30; // linear ramp [0→1]
    const nextDate = new Date(startDate);
    nextDate.setDate(nextDate.getDate() + day);

    const projLdl = Math.max(10, baseLdl + totalLdlDelta30d * progress);
    const projHdl = Math.max(5, baseHdl + totalHdlDelta30d * progress);
    const projTrig = Math.max(10, baseTrig + totalTrigDelta30d * progress);
    const projTotal = Math.max(20, baseTotal + totalCholDelta30d * progress);

    projections.push({
      formattedDate: nextDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      'Projected Total': parseFloat(projTotal.toFixed(1)),
      'Projected LDL': parseFloat(projLdl.toFixed(1)),
      'Projected HDL': parseFloat(projHdl.toFixed(1)),
      'Projected Triglycerides': parseFloat(projTrig.toFixed(1)),
      isLifestyleProjection: true,
    });
  }

  return projections;
}

/**
 * Summarize the lifestyle impact in plain english for display in the UI.
 */
export function describeProjectionFactors(lifeLogs: LifestyleLog[]): {
  weeklyMetHours: number;
  avgSatFatG: number;
  avgFiberG: number;
  hasData: boolean;
} {
  const weeklyMetHours = computeWeeklyMetHours(lifeLogs);
  const avgSatFatG = computeAvgDailySatFat(lifeLogs);
  const avgFiberG = computeAvgDailySolubleFiber(lifeLogs);
  const hasData = lifeLogs.length > 0;
  return { weeklyMetHours, avgSatFatG, avgFiberG, hasData };
}
