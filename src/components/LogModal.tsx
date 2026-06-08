import { useState, useEffect, FormEvent } from 'react';
import { CholesterolLog } from '../types';
import { X, Save, AlertCircle, RefreshCw } from 'lucide-react';

interface LogModalProps {
  onClose: () => void;
  onSave: (log: Omit<CholesterolLog, 'id'>) => Promise<void>;
  editingLog?: CholesterolLog | null;
}

export default function LogModal({ onClose, onSave, editingLog }: LogModalProps) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [totalChol, setTotalChol] = useState<number>(200);
  const [hdl, setHdl] = useState<number>(50);
  const [ldl, setLdl] = useState<number>(100);
  const [triglycerides, setTriglycerides] = useState<number>(150);
  const [notes, setNotes] = useState('');
  
  const [autoCalcLdl, setAutoCalcLdl] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // If editing an existing log, prefill state:
  useEffect(() => {
    if (editingLog) {
      setDate(editingLog.date.split('T')[0]);
      setTotalChol(editingLog.totalChol);
      setHdl(editingLog.hdl);
      setLdl(editingLog.ldl);
      setTriglycerides(editingLog.triglycerides);
      setNotes(editingLog.notes || '');
      setAutoCalcLdl(false); // don't auto calc existing edits by default
    }
  }, [editingLog]);

  // Handle auto-calculation of LDL
  useEffect(() => {
    if (autoCalcLdl) {
      const calculatedLdl = Math.round(totalChol - hdl - (triglycerides / 5));
      setLdl(Math.max(0, calculatedLdl));
    }
  }, [totalChol, hdl, triglycerides, autoCalcLdl]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Simple range boundaries check
    if (totalChol < 10 || totalChol > 1000) {
      setErrorMsg("Total Cholesterol must be between 10 and 1000 mg/dL.");
      return;
    }
    if (hdl < 5 || hdl > 250) {
      setErrorMsg("HDL Cholesterol must be between 5 and 250 mg/dL.");
      return;
    }
    if (ldl < 0 || ldl > 800) {
      setErrorMsg("LDL Cholesterol must be between 0 and 800 mg/dL.");
      return;
    }
    if (triglycerides < 10 || triglycerides > 2000) {
      setErrorMsg("Triglycerides must be between 10 and 2000 mg/dL.");
      return;
    }

    setSubmitting(true);
    try {
      await onSave({
        date: new Date(date).toISOString(),
        totalChol,
        hdl,
        ldl,
        triglycerides,
        notes,
      });
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "An error occurred while saving the log. Check security rules or connection.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-100">
        
        {/* Custom Header bar */}
        <div className="bg-slate-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-sans font-bold text-gray-900">
            {editingLog ? 'Edit Cholesterol Entry' : 'Log Recent Lipid Chemistry'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-100 text-rose-700 text-xs rounded-xl flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold uppercase text-slate-500 mb-1.5">
                Lab / Measurement Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-sm p-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase text-slate-500 mb-1.5">
                Total Cholesterol (mg/dL)
              </label>
              <input
                type="number"
                required
                min="10"
                max="1000"
                value={totalChol}
                onChange={(e) => setTotalChol(parseInt(e.target.value) || 0)}
                className="w-full text-sm p-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold uppercase text-slate-500 mb-1.5">
                HDL (mg/dL)
              </label>
              <input
                type="number"
                required
                min="5"
                max="250"
                value={hdl}
                onChange={(e) => setHdl(parseInt(e.target.value) || 0)}
                className="w-full text-sm p-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase text-slate-500 mb-1.5">
                Triglycerides (mg/dL)
              </label>
              <input
                type="number"
                required
                min="10"
                max="2000"
                value={triglycerides}
                onChange={(e) => setTriglycerides(parseInt(e.target.value) || 0)}
                className="w-full text-sm p-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase text-slate-500 mb-1.5 flex justify-between">
                <span>LDL (mg/dL)</span>
              </label>
              <input
                type="number"
                required
                min="0"
                max="800"
                disabled={autoCalcLdl}
                value={ldl}
                onChange={(e) => setLdl(parseInt(e.target.value) || 0)}
                className={`w-full text-sm p-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:border-indigo-500 transition-colors ${
                  autoCalcLdl ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : ''
                }`}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 py-1">
            <input
              type="checkbox"
              id="autoCalcLdl"
              checked={autoCalcLdl}
              onChange={(e) => setAutoCalcLdl(e.target.checked)}
              className="rounded-sm border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="autoCalcLdl" className="text-xs text-slate-600 select-none cursor-pointer flex items-center space-x-1">
              <RefreshCw className="h-3 w-3 text-slate-400" />
              <span>Auto-calculate LDL using Friedewald Equation (TC - HDL - TG/5)</span>
            </label>
          </div>

          {triglycerides >= 400 && autoCalcLdl && (
            <p className="text-[10px] text-amber-600 leading-normal bg-amber-50 rounded-lg p-2.5 border border-amber-100">
              Note: Triglyceride index is &ge; 400 mg/dL. The Friedewald equation is considered medically inaccurate under high serum lipid counts. Uncheck the calculation to type a direct clinical lab result.
            </p>
          )}

          <div>
            <label className="block text-xs font-mono font-bold uppercase text-slate-500 mb-1.5">
              Reflections / Notes
            </label>
            <textarea
              placeholder="e.g., Fasting lab test, changed Atorvastatin dose to 20mg daily, started Mediterranean diet plan..."
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-sm p-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Action Row */}
          <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
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
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>{editingLog ? 'Update Log' : 'Save Entry'}</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
