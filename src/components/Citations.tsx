import { motion } from 'motion/react';
import { BookOpen, Award, Activity, ExternalLink, Dna, Layers, Zap, Info } from 'lucide-react';

export default function Citations() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 max-w-4xl mx-auto"
    >
      {/* Page Header */}
      <div className="px-1">
        <h2 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center space-x-2.5">
          <BookOpen className="h-5 w-5 text-indigo-500" />
          <span>Model Documentation & Source Calibration Reference</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Evidence-based mathematical grounding, clinical study cohorts, and metabolic integration algorithms.
        </p>
      </div>

      {/* Main Content Layout */}
      <div className="space-y-6">

        {/* Introduction Warning Banner */}
        <div className="bg-[#0f172a] text-slate-300 p-4 rounded-3xl border border-slate-800 flex items-start space-x-3 shadow-md">
          <Info className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <span className="font-bold text-white uppercase tracking-wider block">Clinical Calibration Standard</span>
            <p className="leading-relaxed text-slate-400">
              The algorithms deployed in <strong>CholesTrack</strong> are directly parameterized using multi-scale deterministic compartment systems biology models. Baseline thresholds correspond to typical healthy reference profiles ($LDL = 145 \text{ mg/dL}$, $HDL = 55 \text{ mg/dL}$, $TG = 150 \text{ mg/dL}$) calibrated against peer-reviewed cohort studies.
            </p>
          </div>
        </div>

        {/* Section 1 */}
        <div className="bg-white rounded-3xl p-6 border border-slate-150 shadow-xs space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <span className="p-1.5 bg-indigo-50 text-indigo-500 rounded-lg">
                <Dna className="h-4 w-4" />
              </span>
              <h3 className="text-sm font-sans font-extrabold text-slate-800">
                1. Primary Mathematical Core: Lipoprotein & Receptor Dynamics
              </h3>
            </div>
            <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-0.5 rounded-full font-mono font-bold">
              Primary Model
            </span>
          </div>

          {/* Citation Citation Block */}
          <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-2">
            <span className="block text-[9px] font-mono text-slate-400 uppercase font-bold tracking-wider">Citation</span>
            <p className="text-xs text-slate-700 leading-relaxed italic">
              Mc Auley, M. T., Wilkinson, D. J., Jones, J. J., & Kirkwood, T. B. (2012). A whole-body mathematical model of cholesterol metabolism and its age-associated dysregulation. <span className="font-semibold">BMC Systems Biology</span>, 6(1), 130.
            </p>
            <a 
              href="https://doi.org/10.1186/1752-0509-6-130" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 text-[10px] font-mono font-bold text-indigo-600 hover:text-indigo-700 hover:underline"
            >
              <span>doi:10.1186/1752-0509-6-130</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          {/* Details Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans leading-relaxed">
            <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100 space-y-1.5">
              <span className="font-bold text-slate-800 flex items-center space-x-1.5">
                <Award className="h-3.5 w-3.5 text-amber-500" />
                <span>Study Cohort & Robustness</span>
              </span>
              <ul className="list-disc list-inside text-slate-500 text-[11px] space-y-1">
                <li><strong>Model Age:</strong> 14 years old (Published 2012).</li>
                <li><strong>Citational Reach:</strong> Cited by 114 publications.</li>
                <li><strong>Robustness:</strong> High systemic stability. First integrated platform bridging cellular mechanisms (HMG-CoA synthesis) with macro-scale kinetics. Coupled ODE system verified against longitudinal epidemiological data.</li>
              </ul>
            </div>

            <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100 space-y-1.5">
              <span className="font-bold text-slate-800 flex items-center space-x-1.5">
                <Layers className="h-3.5 w-3.5 text-indigo-400" />
                <span>Identified Limitations</span>
              </span>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Structured primarily around population averages for age-related decline. Assumes standard, linear biological aging coefficients and does not inherently isolate short-term behavioral macronutrient interventions without specific parameter adaptation.
              </p>
            </div>
          </div>

          <div className="p-4 bg-slate-900 text-slate-350 rounded-2xl border border-slate-850 font-mono text-[11px] leading-relaxed">
            <span className="block font-sans font-bold text-white uppercase text-[10px] tracking-wider mb-2 flex items-center space-x-1.5">
              <Zap className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
              <span>Translation Mechanics (Code Integration)</span>
            </span>
            <p>
              The code maps McAuley’s cellular clearance compartment equations for plasma LDL-C ($L$) and HDL-C ($H$). Specifically:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1.5 text-slate-400">
              <li>
                The fixed clearance velocity parameter ($k_{18}$) is parameterized to scale dynamically based on the user's logged saturated fat intake ($F_S$).
              </li>
              <li>
                The system initializes compartments around the model's standard human baseline values ($LDL = 145 \text{ mg/dL}$, $HDL = 55 \text{ mg/dL}$).
              </li>
            </ul>
          </div>
        </div>

        {/* Section 2 */}
        <div className="bg-white rounded-3xl p-6 border border-slate-150 shadow-xs space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <span className="p-1.5 bg-emerald-50 text-emerald-500 rounded-lg">
                <Activity className="h-4 w-4" />
              </span>
              <h3 className="text-sm font-sans font-extrabold text-slate-800">
                2. Whole-Body Energy Expenditure & Metabolic Integration
              </h3>
            </div>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-0.5 rounded-full font-mono font-bold">
              Energy & Mass
            </span>
          </div>

          {/* Citation Citation Block */}
          <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-2">
            <span className="block text-[9px] font-mono text-slate-400 uppercase font-bold tracking-wider">Citation</span>
            <p className="text-xs text-slate-700 leading-relaxed italic">
              Hall, K. D. (2006). Computational model of in vivo human energy metabolism during semistarvation and refeeding. <span className="font-semibold">American Journal of Physiology-Endocrinology and Metabolism</span>, 291(1), E23–E37.
            </p>
            <a 
              href="https://doi.org/10.1152/ajpendo.00523.2005" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 text-[10px] font-mono font-bold text-indigo-600 hover:text-indigo-700 hover:underline"
            >
              <span>doi:10.1152/ajpendo.00523.2005</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          {/* Details Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans leading-relaxed">
            <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100 space-y-1.5">
              <span className="font-bold text-slate-800 flex items-center space-x-1.5">
                <Award className="h-3.5 w-3.5 text-amber-500" />
                <span>Study Cohort & Robustness</span>
              </span>
              <ul className="list-disc list-inside text-slate-500 text-[11px] space-y-1">
                <li><strong>Model Age:</strong> 20 years old (Published 2006).</li>
                <li><strong>Citational Reach:</strong> Cited by 185 publications.</li>
                <li><strong>Robustness:</strong> High thermodynamic rigor. Adheres strictly to the conservation of mass and energy across key tissue compartments (liver, adipose tissue, skeletal muscle, brain). Validated against metabolic ward studies.</li>
              </ul>
            </div>

            <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100 space-y-1.5">
              <span className="font-bold text-slate-800 flex items-center space-x-1.5">
                <Layers className="h-3.5 w-3.5 text-indigo-400" />
                <span>Identified Limitations</span>
              </span>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Prioritizes global energy balance and weight-change dynamics. It does not natively resolve downstream plasma lipid sub-fractions like dense LDL particle count ($LDL-P$) or detailed HDL apolipoprotein kinetics.
              </p>
            </div>
          </div>

          <div className="p-4 bg-slate-900 text-slate-350 rounded-2xl border border-slate-850 font-mono text-[11px] leading-relaxed">
            <span className="block font-sans font-bold text-white uppercase text-[10px] tracking-wider mb-2 flex items-center space-x-1.5">
              <Zap className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
              <span>Translation Mechanics (Code Integration)</span>
            </span>
            <p>
              This model provides the thermodynamic engine used to parse passive and active device telemetry:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1.5 text-slate-400">
              <li>
                <strong>Smart Watch telemetry:</strong> Active calorie burn is passed through Hall's expenditure models to isolate skeletal muscle glycogen depletion and lipid substrate oxidation coefficients.
              </li>
              <li>
                <strong>Smart Scale telemetry:</strong> Weights and body water indices are cross-referenced with Hall’s fluid shift mathematics, distinguishing fluid changes from real tissue modifications.
              </li>
              <li>
                The resultant net energetic balance modulates the rate of endogenous hepatic lipid synthesis ($S_L$) inside the McAuley model equations.
              </li>
            </ul>
          </div>
        </div>

        {/* Section 3 */}
        <div className="bg-white rounded-3xl p-6 border border-slate-150 shadow-xs space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <span className="p-1.5 bg-purple-50 text-purple-500 rounded-lg">
                <Layers className="h-4 w-4" />
              </span>
              <h3 className="text-sm font-sans font-extrabold text-slate-800">
                3. Advanced Diagnostic Calibration (Future Roadmap)
              </h3>
            </div>
            <span className="text-[10px] bg-purple-50 text-purple-700 border border-purple-100 px-2.5 py-0.5 rounded-full font-mono font-bold">
              Roadmap Stub
            </span>
          </div>

          {/* Citation Citation Block */}
          <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-2">
            <span className="block text-[9px] font-mono text-slate-400 uppercase font-bold tracking-wider">Citation</span>
            <p className="text-xs text-slate-700 leading-relaxed italic">
              Liang, C., Murray, S., Li, Y., Lee, R., Low, A., Sasaki, S., Chiang, A. W. T., Lin, W.-J., Mathews, J., Barnes, W., & Lewis, N. E. (2024). LipidSIM: Inferring mechanistic lipid biosynthesis perturbations from lipidomics with a flexible, low-parameter, Markov modeling framework. <span className="font-semibold">Metabolic Engineering</span>, 82, 110–122.
            </p>
            <a 
              href="https://doi.org/10.1016/j.ymben.2024.01.004" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 text-[10px] font-mono font-bold text-indigo-600 hover:text-indigo-700 hover:underline"
            >
              <span>doi:10.1016/j.ymben.2024.01.004</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          {/* Details Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans leading-relaxed">
            <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100 space-y-1.5">
              <span className="font-bold text-slate-800 flex items-center space-x-1.5">
                <Award className="h-3.5 w-3.5 text-amber-500" />
                <span>Study Cohort & Robustness</span>
              </span>
              <ul className="list-disc list-inside text-slate-500 text-[11px] space-y-1">
                <li><strong>Model Age:</strong> Modern framework (Published 2024).</li>
                <li><strong>Citational Reach:</strong> Cited by 3 publications.</li>
                <li><strong>Robustness:</strong> High computational flexibility. Employs a low-parameter Markov chain state machine rather than rigid kinetic parameters, allowing inference of biosynthesis adjustments directly from lipidomics.</li>
              </ul>
            </div>

            <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100 space-y-1.5">
              <span className="font-bold text-slate-800 flex items-center space-x-1.5">
                <Layers className="h-3.5 w-3.5 text-indigo-400" />
                <span>Identified Limitations</span>
              </span>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Requires precise lipid species resolution (such as fatty acid lengths and level of unsaturation across lipid families), making it incompatible with simple, dry-blood clinical panels or finger-prick diagnostics.
              </p>
            </div>
          </div>

          <div className="p-4 bg-slate-950 text-indigo-300 rounded-2xl border border-indigo-900/30 font-mono text-[11px] leading-relaxed">
            <span className="block font-sans font-bold text-white uppercase text-[10px] tracking-wider mb-2 flex items-center space-x-1.5">
              <Info className="h-3.5 w-3.5 text-indigo-400" />
              <span>Future Integration Strategy</span>
            </span>
            <ul className="list-disc list-inside space-y-1.5 text-slate-400">
              <li>
                <strong>Current UI State:</strong> Integrated as a stub/placeholder within the background architecture.
              </li>
              <li>
                <strong>Implementation Plan:</strong> Once users upload complete clinical panel lipidomics reports, the engine transitions from ordinary differential equations to the Markov state machine, enabling high-precision mapping of lipoprotein changes.
              </li>
            </ul>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
