import { useState } from 'react';
import { LifestyleLog } from '../types';
import { X, Save, RefreshCw, Activity, Salad, Pill, Scale } from 'lucide-react';

const ACTIVITY_PRESETS: { label: string; type: LifestyleLog['activityType']; mets: number }[] = [
  { label: 'Walking (moderate)', type: 'cardio', mets: 3.5 },
  { label: 'Running (6mph)', type: 'cardio', mets: 9.8 },
  { label: 'Cycling (moderate)', type: 'cardio', mets: 8.0 },
  { label: 'Swimming (laps)', type: 'cardio', mets: 7.0 },
  { label: 'Strength Training', type: 'strength', mets: 5.0 },
  { label: 'HIIT', type: 'hiit', mets: 8.5 },
  { label: 'Yoga / Stretching', type: 'yoga', mets: 2.5 },
  { label: 'Other / Custom', type: 'other', mets: 4.0 },
];

const SUPPLEMENT_OPTIONS = [
  { id: 'omega3', label: 'Omega-3 Fish Oil' },
  { id: 'phytosterols', label: 'Plant Sterols/Stanols' },
  { id: 'niacin', label: 'Niacin (B3)' },
  { id: 'red-yeast-rice', label: 'Red Yeast Rice' },
  { id: 'psyllium', label: 'Psyllium Husk' },
  { id: 'coq10', label: 'CoQ10' },
];

interface LifestyleModalProps {
  onClose: () => void;
  onSave: (log: Omit<LifestyleLog, 'id' | 'createdAt'>) => Promise<void>;
}

export default function LifestyleModal({ onClose, onSave }: LifestyleModalProps) {
  const today = new Date().toISOString().split('T')[0];

  // Form state
  const [date, setDate] = useState(today);
  const [foodDescription, setFoodDescription] = useState('');
  const [satFat, setSatFat] = useState(0);
  const [solubleFiber, setSolubleFiber] = useState(0);
  const [protein, setProtein] = useState(0);
  const [carbs, setCarbs] = useState(0);
  const [totalFat, setTotalFat] = useState(0);
  const [calories, setCalories] = useState(0);
  const [activityPresetIdx, setActivityPresetIdx] = useState(0);
  const [activityType, setActivityType] = useState<LifestyleLog['activityType']>('cardio');
  const [mets, setMets] = useState(3.5);
  const [duration, setDuration] = useState(30);
  const [weight, setWeight] = useState(0);
  const [restingHr, setRestingHr] = useState(0);
  const [bodyWater, setBodyWater] = useState(0);
  const [supplements, setSupplements] = useState<string[]>([]);
  const [activeSection, setActiveSection] = useState<'activity' | 'diet' | 'body'>('activity');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Auto-calculate active calories: METs × weight_kg × duration_hr
  const weightKg = weight > 0 ? weight * 0.453592 : 70; // default 70kg if not entered
  const activeCalories = Math.round(mets * weightKg * (duration / 60));

  const handlePresetChange = (idx: number) => {
    setActivityPresetIdx(idx);
    const preset = ACTIVITY_PRESETS[idx];
    setActivityType(preset.type);
    setMets(preset.mets);
  };

  const toggleSupplement = (id: string) => {
    setSupplements(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (duration <= 0 || duration > 600) {
      setErrorMsg('Activity duration must be between 1 and 600 minutes.');
      return;
    }

    setSubmitting(true);
    try {
      await onSave({
        date: new Date(date).toISOString(),
        foodDescription,
        satFat,
        solubleFiber,
        activityType,
        duration,
        mets,
        supplements,
        weight,
        bodyWater,
        activeCalories,
        restingHr,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save lifestyle log.');
    } finally {
      setSubmitting(false);
    }
  };

  const tabClass = (section: typeof activeSection) =>
    `flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${
      activeSection === section
        ? 'bg-white text-slate-800 shadow-xs'
        : 'text-slate-500 hover:text-slate-700'
    }`;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-4 flex justify-between items-center shrink-0">
          <div>
            <h3 className="text-base font-bold text-white">Log Lifestyle Entry</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Activity, macronutrients & body metrics</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Section tabs */}
        <div className="px-4 pt-3 pb-1 bg-slate-50 border-b border-gray-100 shrink-0">
          <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
            <button type="button" onClick={() => setActiveSection('activity')} className={tabClass('activity')}>
              <Activity className="h-3.5 w-3.5 inline mr-1" />Activity
            </button>
            <button type="button" onClick={() => setActiveSection('diet')} className={tabClass('diet')}>
              <Salad className="h-3.5 w-3.5 inline mr-1" />Diet & Macros
            </button>
            <button type="button" onClick={() => setActiveSection('body')} className={tabClass('body')}>
              <Scale className="h-3.5 w-3.5 inline mr-1" />Body Metrics
            </button>
          </div>
        </div>

        {/* Scrollable form body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1">
          <div className="p-6 space-y-5">

            {/* Date — always visible */}
            <div>
              <label className="block text-xs font-mono font-bold uppercase text-slate-500 mb-1.5">Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full text-sm p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            {errorMsg && (
              <div className="p-3.5 bg-rose-50 border border-rose-100 text-rose-700 text-xs rounded-xl">
                {errorMsg}
              </div>
            )}

            {/* --- ACTIVITY SECTION --- */}
            {activeSection === 'activity' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-slate-500 mb-1.5">Activity Type</label>
                  <select
                    value={activityPresetIdx}
                    onChange={e => handlePresetChange(Number(e.target.value))}
                    className="w-full text-sm p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-500 bg-white"
                  >
                    {ACTIVITY_PRESETS.map((p, i) => (
                      <option key={i} value={i}>{p.label} ({p.mets} METs)</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase text-slate-500 mb-1.5">Duration (minutes)</label>
                    <input
                      type="number"
                      min="1"
                      max="600"
                      required
                      value={duration}
                      onChange={e => setDuration(parseInt(e.target.value) || 0)}
                      className="w-full text-sm p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase text-slate-500 mb-1.5">Intensity (METs)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="1"
                      max="20"
                      value={mets}
                      onChange={e => setMets(parseFloat(e.target.value) || 0)}
                      className="w-full text-sm p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Auto-calculated calories */}
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3.5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-mono font-bold text-indigo-700 uppercase">Est. Active Calories</p>
                    <p className="text-[10px] text-indigo-500 mt-0.5">METs × weight × duration (Ainsworth formula)</p>
                  </div>
                  <span className="text-2xl font-bold text-indigo-700">{activeCalories} <span className="text-sm font-normal">kcal</span></span>
                </div>

                {/* Supplements */}
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-slate-500 mb-2">
                    <Pill className="h-3.5 w-3.5 inline mr-1" />Supplements Taken
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {SUPPLEMENT_OPTIONS.map(s => (
                      <label key={s.id} className={`flex items-center space-x-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors text-xs ${
                        supplements.includes(s.id)
                          ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                          : 'border-gray-200 text-slate-600 hover:border-slate-300'
                      }`}>
                        <input
                          type="checkbox"
                          checked={supplements.includes(s.id)}
                          onChange={() => toggleSupplement(s.id)}
                          className="rounded border-gray-300 text-indigo-600"
                        />
                        <span>{s.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* --- DIET SECTION --- */}
            {activeSection === 'diet' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-slate-500 mb-1.5">Meal / Food Description</label>
                  <textarea
                    rows={2}
                    placeholder="e.g., Grilled salmon, spinach salad, olive oil dressing, oat bran..."
                    value={foodDescription}
                    onChange={e => setFoodDescription(e.target.value)}
                    className="w-full text-sm p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-500 resize-none"
                  />
                </div>

                {/* Cholesterol-critical macros — highlighted */}
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 space-y-3">
                  <p className="text-[10px] font-mono font-bold text-amber-700 uppercase tracking-wider">Cholesterol-Critical Macros</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-amber-800 mb-1">Saturated Fat (g)</label>
                      <input
                        type="number"
                        min="0"
                        max="200"
                        step="0.5"
                        value={satFat}
                        onChange={e => setSatFat(parseFloat(e.target.value) || 0)}
                        className="w-full text-sm p-2.5 rounded-xl border border-amber-200 focus:outline-none focus:border-amber-500 bg-white"
                      />
                      <p className="text-[10px] text-amber-600 mt-1">↑ LDL via Hegsted equation</p>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-teal-800 mb-1">Soluble Fiber (g)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.5"
                        value={solubleFiber}
                        onChange={e => setSolubleFiber(parseFloat(e.target.value) || 0)}
                        className="w-full text-sm p-2.5 rounded-xl border border-teal-200 focus:outline-none focus:border-teal-500 bg-white"
                      />
                      <p className="text-[10px] text-teal-600 mt-1">↓ LDL via bile acid binding</p>
                    </div>
                  </div>
                </div>

                {/* Full macro breakdown */}
                <div className="space-y-1">
                  <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">Full Macronutrients (optional)</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Protein (g)</label>
                      <input type="number" min="0" max="500" step="1" value={protein}
                        onChange={e => setProtein(parseFloat(e.target.value) || 0)}
                        className="w-full text-sm p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Carbohydrates (g)</label>
                      <input type="number" min="0" max="1000" step="1" value={carbs}
                        onChange={e => setCarbs(parseFloat(e.target.value) || 0)}
                        className="w-full text-sm p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Total Fat (g)</label>
                      <input type="number" min="0" max="500" step="0.5" value={totalFat}
                        onChange={e => setTotalFat(parseFloat(e.target.value) || 0)}
                        className="w-full text-sm p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Total Calories (kcal)</label>
                      <input type="number" min="0" max="10000" step="10" value={calories}
                        onChange={e => setCalories(parseFloat(e.target.value) || 0)}
                        className="w-full text-sm p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-500" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* --- BODY METRICS SECTION --- */}
            {activeSection === 'body' && (
              <div className="space-y-4">
                <p className="text-xs text-slate-500">Optional body measurements for more accurate active calorie calculations.</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase text-slate-500 mb-1.5">Weight (lbs)</label>
                    <input
                      type="number"
                      min="50"
                      max="700"
                      step="0.5"
                      value={weight || ''}
                      placeholder="e.g. 180"
                      onChange={e => setWeight(parseFloat(e.target.value) || 0)}
                      className="w-full text-sm p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase text-slate-500 mb-1.5">Resting HR (bpm)</label>
                    <input
                      type="number"
                      min="30"
                      max="200"
                      step="1"
                      value={restingHr || ''}
                      placeholder="e.g. 62"
                      onChange={e => setRestingHr(parseInt(e.target.value) || 0)}
                      className="w-full text-sm p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase text-slate-500 mb-1.5">Body Water (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={bodyWater || ''}
                      placeholder="e.g. 55.0"
                      onChange={e => setBodyWater(parseFloat(e.target.value) || 0)}
                      className="w-full text-sm p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {weight > 0 && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                    <p className="text-xs text-slate-600">
                      With <strong>{weight} lbs ({(weight * 0.453592).toFixed(1)} kg)</strong> body weight,
                      a <strong>{duration}-min</strong> session at <strong>{mets} METs</strong> burns approx.{' '}
                      <strong className="text-indigo-700">{activeCalories} kcal</strong> active.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer actions */}
          <div className="px-6 pb-6 pt-2 border-t border-slate-100 flex justify-between items-center shrink-0">
            <div className="text-[10px] text-slate-400 font-mono">
              {activeSection === 'activity'
                ? `${activeCalories} kcal · ${mets} METs · ${duration} min`
                : activeSection === 'diet'
                ? `Sat fat: ${satFat}g · Fiber: ${solubleFiber}g`
                : `Weight: ${weight || '–'} lbs · HR: ${restingHr || '–'} bpm`}
            </div>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded-xl text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 transition-colors flex items-center space-x-1.5"
              >
                {submitting ? (
                  <><RefreshCw className="h-4 w-4 animate-spin" /><span>Saving...</span></>
                ) : (
                  <><Save className="h-4 w-4" /><span>Save Entry</span></>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
