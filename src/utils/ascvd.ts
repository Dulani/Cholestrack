import { UserProfile, ASCVDResult } from '../types';

/**
 * Calculates 10-year Atherosclerotic Cardiovascular Disease (ASCVD) risk percentage
 * using the Pooled Cohort Equations (ACC/AHA 2013/2018 guidelines).
 * Eligible for patients aged 40-79. Under 40 or over 79 results in helpful fallback text.
 */
export function calculateASCVD(profile: UserProfile, totalChol: number, hdl: number): ASCVDResult {
  const age = profile.age;
  const isFemale = profile.gender === 'female';
  // Use white coefficients as baseline for 'other' race with clear guidance text
  const isAA = profile.race === 'african_american';

  // Return warnings if client age is out of clinical ranges
  if (age < 40) {
    return {
      riskPercent: 0,
      classification: 'low',
      message: 'Lifetime Risk Assessment Recommended',
      color: 'text-slate-600 bg-slate-50 border-slate-200',
      guidance: [
        'The Pooled Cohort Equations are validated for individuals aged 40 to 79.',
        'At your age (<40 years), cardiovascular clinical focus is centered on maintaining an optimal healthy lifestyle and lifetime risk risk factors (Total <200 mg/dL, SBP <120 mmHg, Non-smoker, Non-diabetic).',
        'Statin therapy is rarely indicated unless LDL is greater than or equal to 190 mg/dL.'
      ]
    };
  }

  if (age > 79) {
    return {
      riskPercent: 0,
      classification: 'intermediate',
      message: 'Consult Physician - Individualized Care',
      color: 'text-amber-700 bg-amber-50 border-amber-200',
      guidance: [
        'The Pooled Cohort Equations are validated for individuals up to age 79.',
        'Above age 80, risk calculators are less predictive, and shared clinical decision-making is heavily dictated by patient preferences, comorbidities, and overall health status.',
        'Continue lifestyle measures and discuss lipid levels and cardiovascular health with your care team.'
      ]
    };
  }

  // Cap lipid inputs to guideline boundaries to prevent mathematical distortions
  const tcVal = Math.max(130, Math.min(320, totalChol));
  const hdlVal = Math.max(20, Math.min(100, hdl));
  const sbpVal = Math.max(90, Math.min(200, profile.systolicBp));

  const lnAge = Math.log(age);
  const lnAge2 = lnAge * lnAge;
  const lnTotalChol = Math.log(tcVal);
  const lnHdl = Math.log(hdlVal);
  const lnSbp = Math.log(sbpVal);

  const tX = profile.treatedForHypertension;
  const smoker = profile.smoker ? 1 : 0;
  const diabetes = profile.diabetes ? 1 : 0;

  let sum = 0;
  let meanSum = 0;
  let baselineSurvival = 0;

  if (isFemale) {
    if (isAA) {
      // African American Female
      const sbpTerm = tX 
        ? (28.590 * lnSbp - 6.444 * lnAge * lnSbp) 
        : (27.210 * lnSbp - 6.130 * lnAge * lnSbp);

      sum = 17.114 * lnAge 
          + 0.940 * lnTotalChol 
          - 18.920 * lnHdl 
          + 4.475 * lnAge * lnHdl 
          + sbpTerm 
          + 0.558 * smoker 
          + 0.841 * diabetes;

      meanSum = 86.61;
      baselineSurvival = 0.9533;
    } else {
      // White/Other Female
      const sbpTerm = tX ? (1.957 * lnSbp) : (2.019 * lnSbp);

      sum = -29.799 * lnAge 
          + 4.884 * lnAge2 
          + 13.540 * lnTotalChol 
          - 3.114 * lnAge * lnTotalChol 
          - 13.578 * lnHdl 
          + 3.149 * lnAge * lnHdl 
          + sbpTerm 
          + 7.574 * smoker 
          - 1.665 * lnAge * smoker 
          + 0.661 * diabetes;

      meanSum = -29.18;
      baselineSurvival = 0.9665;
    }
  } else {
    // Male
    if (isAA) {
      // African American Male
      const sbpTerm = tX ? (3.009 * lnSbp) : (1.916 * lnSbp);

      sum = 2.469 * lnAge 
          + 0.302 * lnTotalChol 
          - 0.307 * lnHdl 
          + sbpTerm 
          + 0.680 * smoker 
          + 0.573 * diabetes;

      meanSum = 19.54;
      baselineSurvival = 0.8954;
    } else {
      // White/Other Male
      const sbpTerm = tX ? (1.797 * lnSbp) : (1.764 * lnSbp);

      sum = 12.344 * lnAge 
          + 11.853 * lnTotalChol 
          - 2.664 * lnAge * lnTotalChol 
          - 7.990 * lnHdl 
          + 1.769 * lnAge * lnHdl 
          + sbpTerm 
          + 7.837 * smoker 
          - 1.795 * lnAge * smoker 
          + 0.658 * diabetes;

      meanSum = 61.18;
      baselineSurvival = 0.9144;
    }
  }

  // Compute probability limits (bounded [0, 100])
  const sumDiff = sum - meanSum;
  const riskPercent = Math.max(0, Math.min(100, (1 - Math.pow(baselineSurvival, Math.exp(sumDiff))) * 100));

  let classification: 'low' | 'borderline' | 'intermediate' | 'high' = 'low';
  let message = 'Low 10-Year ASCVD Risk';
  let color = 'text-teal-700 bg-teal-50 border-teal-200';
  const guidance: string[] = [];

  if (riskPercent < 5.0) {
    classification = 'low';
    message = 'Low 10-Year Risk (<5%)';
    color = 'text-teal-700 bg-teal-50 border-teal-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30';
    guidance.push(
      'Encourage lifestyle therapies (diet high in vegetables/grains, cardioprotective aerobic activity).',
      'Follow-up assessment recommended in 4-6 years to monitor changes in clinical risk factors.',
      'No lipid lowering medications indicated unless LDL-C is ≥ 190 mg/dL.'
    );
  } else if (riskPercent < 7.5) {
    classification = 'borderline';
    message = 'Borderline 10-Year Risk (5% to 7.4%)';
    color = 'text-sky-700 bg-sky-50 border-sky-200 dark:bg-sky-950/20 dark:text-sky-400 dark:border-sky-900/30';
    guidance.push(
      'Emphasize persistent healthy nutrition, exercise, and smoking cessation.',
      'If Risk-Enhancing Factors are present (family history of premature ASCVD, chronic kidney disease, metabolic syndrome), discuss moderate-intensity statin therapy with a physician.',
      'Target LDL reduction of 30-49% if initiating heart-protective treatment.'
    );
  } else if (riskPercent < 20.0) {
    classification = 'intermediate';
    message = 'Intermediate 10-Year Risk (7.5% to 19.9%)';
    color = 'text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30';
    guidance.push(
      'ACC/AHA guidelines strongly recommend discussing moderate-intensity statin therapy (target at least 30-49% LDL-C reduction).',
      'A Coronary Artery Calcium (CAC) scan can be utilized as a tie-breaker if therapy decision is ambiguous (CAC score of 0 suggests statins can be withheld, unless diabetic or smoker).',
      'Initiate rigorous dietary interventions: limit saturated fats, trans fats, and excess carbohydrates.'
    );
  } else {
    classification = 'high';
    message = 'High 10-Year Risk (≥20%)';
    color = 'text-rose-700 bg-rose-50 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30';
    guidance.push(
      'ACC/AHA guidelines recommend starting High-intensity statin therapy (reduces LDL-C by ≥50%).',
      'Aggressive lifestyle modification is required alongside medical management.',
      'If the target LDL is still not met on maximally tolerated statins, medical options such as Ezetimibe or PCSK9 inhibitors may be discussed with a cardiologist.'
    );
  }

  // Include ethnicity awareness when 'other' is chosen to raise clinical clarity
  if (profile.race === 'other') {
    guidance.unshift(
      'Clinical Note: Calculated using Caucasian clinical baselines. Individual risk calculation could be higher (e.g. South Asian heritage) or lower (e.g. East Asian heritage). Always consult a specialist.'
    );
  }

  return {
    riskPercent,
    classification,
    message,
    color,
    guidance
  };
}

/**
 * Classifies a specific lipid metric into standard cardiological references (mg/dL)
 */
export function classifyLipids(type: 'total' | 'ldl' | 'hdl' | 'trig', value: number, gender: 'male' | 'female' = 'male'): { label: string; class: 'desirable' | 'borderline' | 'high' | 'low'; color: string } {
  switch (type) {
    case 'total':
      if (value < 200) return { label: 'Optimal (<200)', class: 'desirable', color: 'text-emerald-500' };
      if (value < 240) return { label: 'Borderline High (200-239)', class: 'borderline', color: 'text-amber-500' };
      return { label: 'High (≥240)', class: 'high', color: 'text-rose-500' };
    case 'ldl':
      if (value < 100) return { label: 'Optimal (<100)', class: 'desirable', color: 'text-emerald-500' };
      if (value < 130) return { label: 'Near Optimal (100-129)', class: 'desirable', color: 'text-emerald-400' };
      if (value < 160) return { label: 'Borderline High (130-159)', class: 'borderline', color: 'text-amber-500' };
      if (value < 190) return { label: 'High (160-189)', class: 'high', color: 'text-rose-400' };
      return { label: 'Very High (≥190)', class: 'high', color: 'text-rose-600' };
    case 'hdl':
      const lowLimit = gender === 'female' ? 50 : 40;
      if (value >= 60) return { label: 'Protective (≥60)', class: 'desirable', color: 'text-emerald-500' };
      if (value >= lowLimit) return { label: 'Acceptable', class: 'desirable', color: 'text-emerald-400' };
      return { label: `Low (<${lowLimit})`, class: 'low', color: 'text-rose-500' };
    case 'trig':
      if (value < 150) return { label: 'Normal (<150)', class: 'desirable', color: 'text-emerald-500' };
      if (value < 200) return { label: 'Borderline High (150-199)', class: 'borderline', color: 'text-amber-500' };
      if (value < 500) return { label: 'High (200-499)', class: 'high', color: 'text-rose-500' };
      return { label: 'Very High (≥500)', class: 'high', color: 'text-rose-700 font-bold' };
  }
}
