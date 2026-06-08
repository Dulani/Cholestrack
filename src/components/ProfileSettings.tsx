import { useState, useEffect, FormEvent } from 'react';
import { UserProfile } from '../types';
import { User, Shield, Check, Save, Info, RefreshCw } from 'lucide-react';

interface ProfileSettingsProps {
  profile: UserProfile;
  onSave: (profile: UserProfile) => Promise<void>;
}

export default function ProfileSettings({ profile, onSave }: ProfileSettingsProps) {
  const [age, setAge] = useState(profile.age);
  const [gender, setGender] = useState<'male' | 'female'>(profile.gender);
  const [race, setRace] = useState<'white' | 'african_american' | 'other'>(profile.race);
  const [systolicBp, setSystolicBp] = useState(profile.systolicBp);
  const [treatedForHypertension, setTreatedForHypertension] = useState(profile.treatedForHypertension);
  const [diabetes, setDiabetes] = useState(profile.diabetes);
  const [smoker, setSmoker] = useState(profile.smoker);

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync state if initial profile changes
  useEffect(() => {
    setAge(profile.age);
    setGender(profile.gender);
    setRace(profile.race);
    setSystolicBp(profile.systolicBp);
    setTreatedForHypertension(profile.treatedForHypertension);
    setDiabetes(profile.diabetes);
    setSmoker(profile.smoker);
  }, [profile]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    setErrorMsg(null);

    // Form inputs validation range boundaries
    if (age < 10 || age > 120) {
      setErrorMsg("Age must be between 10 and 120 years.");
      return;
    }
    if (systolicBp < 50 || systolicBp > 300) {
      setErrorMsg("Systolic BP must be between 50 and 300 mmHg.");
      return;
    }

    setSaving(true);
    try {
      await onSave({
        age,
        gender,
        race,
        systolicBp,
        treatedForHypertension,
        diabetes,
        smoker,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3050);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to save profile. Make sure variables are formatted and security-compliant.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs h-full flex flex-col justify-between">
      
      <div>
        <div className="flex items-center space-x-2 text-slate-800 mb-4 pb-3 border-b border-gray-50">
          <User className="h-5 w-5 text-indigo-500" />
          <h3 className="text-base font-sans font-bold text-gray-900">Demographic Risk Variables</h3>
        </div>

        <p className="text-xs text-gray-400 leading-normal mb-5">
          These clinical attributes are mathematically integrated into the 10-year ASCVD algorithm. Keep them updated with your local physical results.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold uppercase text-slate-500 mb-1.5">
                Age (years)
              </label>
              <input
                type="number"
                required
                min="10"
                max="120"
                value={age}
                onChange={(e) => setAge(parseInt(e.target.value) || 0)}
                className="w-full text-sm p-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase text-slate-500 mb-1.5">
                Biological Sex
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as 'male' | 'female')}
                className="w-full text-sm p-2.5 rounded-xl border border-gray-200 focus:outline-hidden bg-white focus:border-indigo-500 transition-colors"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold uppercase text-slate-500 mb-1.5">
                Systolic BP (mmHg)
              </label>
              <input
                type="number"
                required
                min="50"
                max="300"
                value={systolicBp}
                onChange={(e) => setSystolicBp(parseInt(e.target.value) || 0)}
                className="w-full text-sm p-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase text-slate-500 mb-1.5">
                Ethnicity Factor
              </label>
              <select
                value={race}
                onChange={(e) => setRace(e.target.value as any)}
                className="w-full text-sm p-2.5 rounded-xl border border-gray-200 focus:outline-hidden bg-white focus:border-indigo-500 transition-colors"
              >
                <option value="white">Caucasian / Asian / Hispanic</option>
                <option value="african_american">African American</option>
                <option value="other">Other ethnic subgroup</option>
              </select>
            </div>
          </div>

          <div className="space-y-2.5 pt-3 border-t border-slate-50">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="treatedForHypertension"
                checked={treatedForHypertension}
                onChange={(e) => setTreatedForHypertension(e.target.checked)}
                className="rounded-sm border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="treatedForHypertension" className="text-xs text-slate-600 cursor-pointer select-none">
                Taking anti-hypertensive medication?
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="diabetes"
                checked={diabetes}
                onChange={(e) => setDiabetes(e.target.checked)}
                className="rounded-sm border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="diabetes" className="text-xs text-slate-600 cursor-pointer select-none">
                Diagnosed with Diabetes Mellitus?
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="smoker"
                checked={smoker}
                onChange={(e) => setSmoker(e.target.checked)}
                className="rounded-sm border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="smoker" className="text-xs text-slate-600 cursor-pointer select-none">
                Current Tobacco Smoker?
              </label>
            </div>
          </div>

          <div className="pt-3 flex flex-col space-y-2">
            {errorMsg && (
              <p className="text-[11px] text-rose-500 leading-normal font-sans">
                {errorMsg}
              </p>
            )}

            {success && (
              <div className="py-2 px-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-100 flex items-center space-x-1.5 text-xs">
                <Check className="h-4 w-4 shrink-0 font-bold" />
                <span>Clinical risk factors saved to Cloud.</span>
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition flex items-center justify-center space-x-1.5"
            >
              {saving ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Saving to Firestore...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Update Profile Factors</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-4 pt-3.5 border-t border-slate-50 flex items-start space-x-2 bg-slate-50 rounded-xl p-3">
        <Info className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
        <p className="text-[10px] text-slate-500 leading-normal">
          The validation equations assume biological variables within standard diagnostic ranges to preserve mathematical reliability.
        </p>
      </div>

    </div>
  );
}
