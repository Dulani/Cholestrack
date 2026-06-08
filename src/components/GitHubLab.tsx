import { useState, useEffect } from 'react';
import { Github, Key, Check, AlertCircle, FileCode, Play, Database, Save, ArrowRight, HelpCircle, Activity, Info, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { UserProfile } from '../types';

interface GitHubLabProps {
  profile: UserProfile;
  onSaveProfile: (profile: UserProfile) => Promise<void>;
}

// Pre-loaded simulated code to compare and contrast instantly
const PRELOADED_LEGACY_FILES = [
  {
    name: 'src/calc/lipid-verifier.js',
    description: 'Legacy Lipid Verification Checker (Threshold Check Only)',
    code: `// LEGACY ESTIMATOR - SIMPLIFIED THRESHOLD CHECK ONLY
// Source: Dulani/Cholestrack (Legacy starting point design)

function examineCholesterol(totalChol, ldl, hdl, triglycerides) {
  const result = {
    status: "Healthy",
    warnings: [],
    ratio: totalChol / hdl
  };

  if (totalChol >= 240) {
    result.status = "At Risk";
    result.warnings.push("High Total Cholesterol Level (>240 mg/dL). Consider reducing fats.");
  }

  if (ldl >= 160) {
    result.status = "At Risk";
    result.warnings.push("High LDL density count. Potential plaque threat.");
  }

  if (hdl < 40) {
    result.status = "At Risk";
    result.warnings.push("Low Cardioprotective HDL. Focus on healthy fats and exercises.");
  }

  if (triglycerides >= 200) {
    result.status = "At Risk";
    result.warnings.push("High Serum Triglycerides index.");
  }

  // Basic diagnostic ratio indicator
  if (result.ratio > 5.0) {
    result.warnings.push("Cardiovascular Ratio is sub-optimal (>5.0). Optimal ratio is < 3.5");
  }

  return result;
}

// NOTE: This legacy model is straightforward but fails to account for synergizing non-lipid 
// risk variables (Age, Sex, Ethnicity, Blood Pressure, Treatment, Smoking status, or Diabetes).
`
  },
  {
    name: 'src/calc/legacy-risk-ratio.js',
    description: 'Legacy Ratio Ratio Simulator',
    code: `// LEGACY RISK RATIO MATH MODEL
// Source: Dulani/Cholestrack (Alternative ratio checks)

function calculateBasicRiskTier(patient) {
  // Simple scoring points calculation
  let points = 0;
  
  if (patient.age > 45) points += 2;
  if (patient.smoker) points += 3;
  if (patient.diabetes) points += 4;
  if (patient.systolicBp > 140) points += 2;
  
  // Total Cholesterol points
  if (patient.totalChol > 240) points += 3;
  else if (patient.totalChol > 200) points += 1;
  
  // HDL protective points
  if (patient.hdl < 40) points += 2;
  else if (patient.hdl >= 60) points -= 1;

  let riskTier = "Low";
  let statinRequired = false;

  if (points >= 10) {
    riskTier = "High Cardiovascular Threat Alert";
    statinRequired = true;
  } else if (points >= 6) {
    riskTier = "Moderate Risk Check";
  }

  return {
    rawPoints: points,
    riskTier: riskTier,
    statinRequired: statinRequired,
    formula: "Alternative Linear Integer Points Accumulation"
  };
}
`
  }
];

const MODERN_CHOLESTRACK_CODE = `// MODERN SCIENTIFIC CALCULATOR - CHO_TRACK v1.0
// Source: /src/utils/ascvd.ts
// Mathematical Algorithm: 2013 ACC/AHA Pooled Cohort Equations (ASCVD 10-Year absolute risk ratio)

export function calculateASCVD(profile: UserProfile, totalChol: number, hdl: number): ASCVDResult {
  const age = profile.age;
  const isFemale = profile.gender === 'female';
  const isAA = profile.race === 'african_american';

  // Return warnings if client age is out of clinical ranges
  if (age < 40) return { riskPercent: 0, classification: 'low', message: 'Lifetime Risk Assessment Recommended', ... };
  if (age > 79) return { riskPercent: 0, classification: 'intermediate', message: 'Consult Physician', ... };

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
  
  // Multi-factorial regressions computed relative to demographic co-variates...
  // Female (AA vs White/Other) and Male (AA vs White/Other) specific co-efficients:
  // e.g., sum = sum + Tx terms + baseline survival lookup formulas
  
  const sumDiff = sum - meanSum;
  const riskPercent = (1 - Math.pow(baselineSurvival, Math.exp(sumDiff))) * 100;
  
  return {
    riskPercent,
    classification: riskPercent < 5.0 ? 'low' : riskPercent < 7.5 ? 'borderline' : ...
  };
}`;

export default function GitHubLab({ profile, onSaveProfile }: GitHubLabProps) {
  // Connection config
  const [repoPath, setRepoPath] = useState('Dulani/Cholestrack');
  const [branch, setBranch] = useState('main');
  const [pat, setPat] = useState(() => localStorage.getItem('cholestrack_github_pat') || '');
  
  // Comparison modes
  const [mode, setMode] = useState<'simulated' | 'github'>('simulated');
  const [selectedSimIdx, setSelectedSimIdx] = useState(0);
  
  // Github fetched state
  const [repoStructure, setRepoStructure] = useState<{ name: string; path: string; type: string; url: string }[]>([]);
  const [selectedGithubFile, setSelectedGithubFile] = useState<string | null>(null);
  const [githubCodeContent, setGithubCodeContent] = useState<string | null>(null);
  
  // Interactive note variables
  const [notes, setNotes] = useState(profile.githubComments || '');
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesSuccess, setNotesSuccess] = useState(false);
  
  // Loading & error alerts
  const [fetchingTree, setFetchingTree] = useState(false);
  const [fetchingFile, setFetchingFile] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sync token to localstorage
  const handleSaveToken = (val: string) => {
    setPat(val);
    if (val) {
      localStorage.setItem('cholestrack_github_pat', val);
    } else {
      localStorage.removeItem('cholestrack_github_pat');
    }
  };

  // Fetch file list from GitHub
  const fetchRepoTree = async () => {
    setFetchingTree(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    setRepoStructure([]);
    setSelectedGithubFile(null);
    setGithubCodeContent(null);

    const [owner, name] = repoPath.trim().split('/');
    if (!owner || !name) {
      setErrorMsg('Invalid Repository Path format. Input as "owner/repository" (e.g. Dulani/Cholestrack)');
      setFetchingTree(false);
      return;
    }

    try {
      const url = `https://api.github.com/repos/${owner}/${name}/contents?ref=${branch}`;
      const headers: HeadersInit = {
        'Accept': 'application/vnd.github.v3+json'
      };
      if (pat) {
        headers['Authorization'] = `token ${pat.trim()}`;
      }

      const res = await fetch(url, { headers });
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('Repository not found. If this is a private GitHub repository, you MUST provide a Personal Access Token (PAT) below to authenticate.');
        } else if (res.status === 401 || res.status === 403) {
          throw new Error('Unauthorized/Rate limited. Please provide a valid GitHub Personal Access Token to authenticate and access private structures.');
        } else {
          throw new Error(`GitHub API returned error: ${res.status} ${res.statusText}`);
        }
      }

      const data = await res.json();
      if (Array.isArray(data)) {
        // Simple filter for code files
        const codeFiles = data.filter(item => 
          item.type === 'dir' || 
          item.name.endsWith('.js') || 
          item.name.endsWith('.ts') || 
          item.name.endsWith('.tsx') || 
          item.name.endsWith('.jsx') || 
          item.name.endsWith('.py') ||
          item.name.endsWith('.json') ||
          item.name.endsWith('.md')
        );
        
        setRepoStructure(codeFiles);
        setSuccessMsg(`Successfully connected! Loaded ${data.length} items from branch "${branch}".`);
      } else {
        throw new Error('Repository is empty or does not return a collection array.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'An unexpected error occurred while communicating with GitHub REST API.');
    } finally {
      setFetchingTree(false);
    }
  };

  // Fetch individual file content
  const fetchFileBlock = async (file: { name: string; path: string; url: string; type: string }) => {
    if (file.type === 'dir') {
      setErrorMsg(`Directory navigation is direct; but you can view all root code structures. Click code files directly (ended in .js, .ts, etc.).`);
      return;
    }

    setFetchingFile(true);
    setErrorMsg(null);
    setSelectedGithubFile(file.path);
    setGithubCodeContent(null);

    try {
      const headers: HeadersInit = {
        'Accept': 'application/vnd.github.v3.raw'
      };
      if (pat) {
        headers['Authorization'] = `token ${pat.trim()}`;
      }

      // We fetch from the content api
      const contentUrl = `https://api.github.com/repos/${repoPath}/contents/${file.path}?ref=${branch}`;
      const res = await fetch(contentUrl, { headers: { ...headers, 'Accept': 'application/vnd.github.v3+json' } });
      
      if (!res.ok) {
        throw new Error(`Failed to download file content: ${res.statusText}`);
      }

      const data = await res.json();
      if (data.content) {
        // Decode base64
        const decoded = atob(data.content.replace(/\s/g, ''));
        setGithubCodeContent(decoded);
      } else {
        // Fallback to raw download
        const rawRes = await fetch(data.download_url, { headers });
        const rawTxt = await rawRes.text();
        setGithubCodeContent(rawTxt);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(`Failed to retrieve file "${file.name}": ` + err.message);
    } finally {
      setFetchingFile(false);
    }
  };

  // Save the comparison notes to User Profile on Cloud Firestore
  const handleSaveNotes = async () => {
    setSavingNotes(true);
    setNotesSuccess(false);
    try {
      await onSaveProfile({
        ...profile,
        githubComments: notes
      });
      setNotesSuccess(true);
      setTimeout(() => setNotesSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert('Could not save research comments to database.');
    } finally {
      setSavingNotes(false);
    }
  };

  // Prefill notes with some baseline compare study if empty
  const prefillComparisonNotes = () => {
    const defaultContrastText = `== CARDIOVASCULAR ESTIMATOR COMPARATIVE ANALYSIS ==\n\n` +
      `1. Model Architectural Contrast:\n` +
      `- Legacy Cholestrack Model: Uses isolated simple lipid thresholds (e.g. TC > 240, LDL > 160) to generate discrete alerts. It lacks context and fails to integrate patient risk modifiers synergistically.\n` +
      `- Modern ACC/AHA CholesTrack: Implements multi-regression Pooled Cohort Equations, calculating a 10-year absolute cardiovascular probability metric. It weighs Systolic Blood Pressure, smoking, and diabetes as major synergistic threats.\n\n` +
      `2. Clinical Utility Improvement:\n` +
      `- The legacy ratio of TC/HDL is useful for diagnostic screening, but modern guidelines recommend absolute risk assessments because treating isolated targets has been replaced by risk-based statin triggers (e.g., intermediate 7.5% vs high 20.0% scores dictate drug intensities directly).\n\n` +
      `Conclusion: Moving from baseline rules to interactive Pooled Cohort telemetry provides patients with fully validated therapeutic actionable insights.`;
    setNotes(defaultContrastText);
  };

  const activeLegacyFile = PRELOADED_LEGACY_FILES[selectedSimIdx];
  const activeLeftCode = mode === 'simulated' ? activeLegacyFile.code : (githubCodeContent || '// Select a code file from the files tree on the left to inspect');
  const activeFileName = mode === 'simulated' ? activeLegacyFile.name : (selectedGithubFile || 'No file selected');

  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-6">
      
      {/* Dynamic Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 pb-4 gap-4">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <Github className="h-5 w-5 text-indigo-600" />
            <span>GitHub Scientific Comparison Lab</span>
          </h2>
          <p className="text-xs text-slate-400">
            Compare and contrast legacy cholesterol checking logic with standard ACC/AHA multi-regression metrics
          </p>
        </div>

        {/* Workspace Mode Toggles */}
        <div className="flex bg-slate-100 p-1 rounded-xl shrink-0">
          <button
            onClick={() => setMode('simulated')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              mode === 'simulated'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Preloaded Legacy Code
          </button>
          <button
            onClick={() => setMode('github')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              mode === 'github'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Your Real GitHub Repository
          </button>
        </div>
      </div>

      {mode === 'github' ? (
        /* Real GitHub REST API Controller */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
          <div className="md:col-span-2 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-1">
                  GitHub Repository Path
                </label>
                <div className="relative">
                  <Github className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={repoPath}
                    onChange={(e) => setRepoPath(e.target.value)}
                    placeholder="e.g. Dulani/Cholestrack"
                    className="w-full text-xs p-2 pl-9 rounded-lg border border-gray-200 bg-white focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Target Branch
                </label>
                <input
                  type="text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder="e.g. main"
                  className="w-full text-xs p-2 rounded-lg border border-gray-200 bg-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider flex justify-between mb-1">
                <span>Personal Access Token (PAT)</span>
                <span className="text-[9px] text-indigo-500 italic font-sans font-normal normal-case">Required for Private Repos</span>
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  value={pat}
                  onChange={(e) => handleSaveToken(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full text-xs p-2 pl-9 rounded-lg border border-gray-200 bg-white focus:outline-hidden focus:border-indigo-500 font-mono"
                />
              </div>
              <p className="text-[10px] text-gray-400 leading-normal mt-1">
                This token is never sent to our database. It resides inside your personal browser's <code>localStorage</code> sandbox to interact with Github API client-side.
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-end">
            <button
              onClick={fetchRepoTree}
              disabled={fetchingTree}
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center justify-center space-x-1.5"
            >
              {fetchingTree ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Scanning Branch...</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  <span>Fetch GitHub Structure</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* Simulated Repository Option selection buttons */
        <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/50">
          <div className="flex items-start space-x-3">
            <Info className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="text-xs text-indigo-700 leading-normal font-sans">
                <strong>Instant Contrast Enabled:</strong> We pre-loaded files simulating what you might find in your legacy repository so you can analyze structural developments side-by-side with our scientific revisions instantly:
              </p>
              <div className="flex flex-wrap gap-2">
                {PRELOADED_LEGACY_FILES.map((file, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedSimIdx(idx);
                      setErrorMsg(null);
                    }}
                    className={`text-xs px-3 py-1.5 rounded-lg border font-mono transition flex items-center space-x-1.5 ${
                      selectedSimIdx === idx
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-100/30'
                    }`}
                  >
                    <FileCode className="h-3.5 w-3.5" />
                    <span>{file.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GitHub Alerts */}
      {errorMsg && (
        <div className="p-3.5 bg-rose-50 border border-rose-100 text-rose-700 text-xs rounded-xl flex items-start space-x-2">
          <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs rounded-xl flex items-start space-x-2">
          <Check className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Real GitHub File Explorer list */}
      {mode === 'github' && repoStructure.length > 0 && (
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
          <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
            Repository Workspace File Explorer
          </label>
          <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-1">
            {repoStructure.map((item, idx) => (
              <button
                key={idx}
                onClick={() => fetchFileBlock(item)}
                disabled={fetchingFile}
                className={`text-xs px-3 py-1.5 rounded-lg border flex items-center space-x-1.5 transition ${
                  selectedGithubFile === item.path
                    ? 'bg-slate-900 border-slate-900 text-white'
                    : 'bg-white border-gray-200 text-slate-600 hover:bg-slate-100/80'
                }`}
              >
                <FileCode className={`h-3.5 w-3.5 ${item.type === 'dir' ? 'text-amber-500' : 'text-slate-400'}`} />
                <span className="font-mono">{item.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Side-by-Side Dual Code Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Left pane: Imported OR Legacy calculation files */}
        <div className="bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-md flex flex-col h-112 justify-between">
          <div className="bg-slate-950/80 px-4 py-3 border-b border-slate-800 flex justify-between items-center">
            <span className="text-xs font-mono font-bold text-slate-300 flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-red-400" />
              <span className="truncate max-w-[200px]">{activeFileName}</span>
            </span>
            <span className="text-[10px] font-mono text-rose-400 uppercase font-medium bg-rose-950/40 px-2 py-0.5 rounded-md border border-rose-900/40">
              {mode === 'simulated' ? 'Legacy Checker' : 'Remote File'}
            </span>
          </div>

          <div className="p-4 font-mono text-xs text-slate-300 overflow-y-auto block h-full select-text leading-relaxed text-left bg-[#0B0F19]">
            {fetchingFile ? (
              <div className="h-full flex items-center justify-center text-slate-400 space-x-2">
                <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                <span>Downloading from GitHub...</span>
              </div>
            ) : (
              <pre className="whitespace-pre">{activeLeftCode}</pre>
            )}
          </div>
        </div>

        {/* Right pane: Modern clinically-vetted CholesTrack models */}
        <div className="bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-md flex flex-col h-112 justify-between">
          <div className="bg-slate-950/80 px-4 py-3 border-b border-slate-800 flex justify-between items-center animate-pulse">
            <span className="text-xs font-mono font-bold text-slate-300 flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>src/utils/ascvd.ts</span>
            </span>
            <span className="text-[10px] font-mono text-emerald-400 uppercase font-medium bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-900/40">
              CholesTrack Active
            </span>
          </div>

          <div className="p-4 font-mono text-xs text-slate-300 overflow-y-auto block h-full select-text leading-relaxed text-left bg-[#0B0F19]">
            <pre className="whitespace-pre">{MODERN_CHOLESTRACK_CODE}</pre>
          </div>
        </div>

      </div>

      {/* Comparison Grid Table details */}
      <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
        <h4 className="text-sm font-bold text-slate-800 mb-3 border-b pb-2 flex items-center space-x-2">
          <Activity className="h-4 w-4 text-emerald-500" />
          <span>Cardiological Risk Forecasting: Multi-Regression vs Simple Thresholds</span>
        </h4>
        
        <div className="overflow-x-auto text-xs font-sans text-slate-600">
          <table className="min-w-full text-left divide-y divide-slate-200">
            <thead>
              <tr className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">
                <th className="pb-2">Evaluating Attributes</th>
                <th className="pb-2">Legacy Model (Dulani/Cholestrack)</th>
                <th className="pb-2 text-indigo-600">ACC/AHA Clinician Model (Active)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 leading-relaxed">
              <tr>
                <td className="py-2.5 font-bold text-slate-700">Demographic Modifiers</td>
                <td className="py-2.5">No, or uses basic arbitrary integer thresholds manually</td>
                <td className="py-2.5 text-indigo-700 font-medium">Yes, regression factors specifically optimized for Age, Sex & Race</td>
              </tr>
              <tr>
                <td className="py-2.5 font-bold text-slate-700">Non-lipid Risk modifiers</td>
                <td className="py-2.5">Omitted or isolated</td>
                <td className="py-2.5 text-indigo-700 font-medium">Integrates Systolic Blood Pressure, Hypertension treatment, Diabetes, and Smoking</td>
              </tr>
              <tr>
                <td className="py-2.5 font-bold text-slate-700">Mathematical Reliability</td>
                <td className="py-2.5">Threshold ratios (Total / HDL only)</td>
                <td className="py-2.5 text-indigo-700 font-medium">Pooled Cohort Equations determining absolute 10-Year risk of clinical incidents</td>
              </tr>
              <tr>
                <td className="py-2.5 font-bold text-slate-700">Therapeutic Focus</td>
                <td className="py-2.5">"Healthy" vs "At Risk" text warnings</td>
                <td className="py-2.5 text-indigo-700 font-medium font-bold">Classifies as Low/Borderline/Intermediate/High relative to real statin guidance limits</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Persistent Comments logger */}
      <div className="space-y-3 pt-2">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Compare & Contrast Reflections</h3>
            <p className="text-xs text-slate-400">Save notes comparing evaluation paradigms in your medical profile research history</p>
          </div>
          <button
            onClick={prefillComparisonNotes}
            className="text-[10px] bg-slate-50 border px-2.5 py-1 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors font-sans"
          >
            Prefill Analysis Draft
          </button>
        </div>

        <textarea
          rows={5}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Analyze the formulas, compare clinical recommendations, document notes comparing Cholestrack's legacy points checks with modern Pooled Cohort Equations, or record why absolute risk percent assessments are crucial for statin indications..."
          className="w-full text-xs p-3 rounded-2xl border border-gray-200 font-mono focus:outline-hidden focus:border-indigo-500 bg-slate-50/20"
        />

        <div className="flex justify-between items-center text-xs">
          <div className="flex items-center text-gray-400 space-x-1">
            <Database className="h-3.5 w-3.5 text-slate-300" />
            <span>Updates UserProfile document in Cloud Firestore</span>
          </div>

          <div className="flex items-center space-x-3">
            {notesSuccess && (
              <span className="text-[11px] text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-lg animate-fade-in font-sans">
                Research comments saved to cloud Firestore!
              </span>
            )}
            
            <button
              onClick={handleSaveNotes}
              disabled={savingNotes}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 rounded-xl text-white font-medium transition flex items-center space-x-1.5"
            >
              {savingNotes ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Saving to cloud...</span>
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  <span>Save Comparative Review</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
