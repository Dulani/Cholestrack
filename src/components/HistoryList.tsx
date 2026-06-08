import { CholesterolLog } from '../types';
import { Calendar, Trash2, Edit3, MessageCircle, AlertTriangle } from 'lucide-react';
import { classifyLipids } from '../utils/ascvd';

interface HistoryListProps {
  logs: CholesterolLog[];
  gender: 'male' | 'female';
  onDelete: (id: string) => Promise<void>;
  onEdit: (log: CholesterolLog) => void;
}

export default function HistoryList({ logs, gender, onDelete, onEdit }: HistoryListProps) {
  const getSubBadge = (type: 'total' | 'ldl' | 'hdl' | 'trig', value: number) => {
    const classification = classifyLipids(type, value, gender);
    let colors = 'bg-emerald-50 text-emerald-700 border-emerald-100';
    if (classification.class === 'high' || classification.class === 'low') {
      colors = 'bg-rose-50 text-rose-700 border-rose-100';
    } else if (classification.class === 'borderline') {
      colors = 'bg-amber-50 text-amber-700 border-amber-100';
    }
    return (
      <div className={`text-[10px] font-mono px-2 py-0.5 rounded-md border inline-block ${colors}`}>
        {value} mg/dL
      </div>
    );
  };

  const formatDate = (isoString: string) => {
    try {
      const dateObj = new Date(isoString);
      return dateObj.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-xs">
      <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center bg-slate-50/50">
        <h3 className="text-base font-sans font-bold text-gray-900">Historical Chemistry Records</h3>
        <span className="text-xs font-mono font-medium text-slate-400">
          Showing {logs.length} entries
        </span>
      </div>

      {logs.length === 0 ? (
        <div className="p-8 text-center text-slate-400">
          <Calendar className="h-8 w-8 mx-auto mb-2 text-slate-300" />
          <p className="text-sm">No recorded cholesterol entries found.</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-50 overflow-x-auto">
          <table className="min-w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-xs font-mono font-bold uppercase text-slate-500 border-b border-gray-50">
              <tr>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Total Chol</th>
                <th className="px-6 py-3">LDL (Bad)</th>
                <th className="px-6 py-3">HDL (Good)</th>
                <th className="px-6 py-3">Triglycerides</th>
                <th className="px-6 py-3">Reflections & Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => {
                const totalStatus = classifyLipids('total', log.totalChol, gender);
                const isIssue = totalStatus.class === 'high';

                return (
                  <tr key={log.id} className="hover:bg-slate-50/40 transition">
                    <td className="px-6 py-4 flex items-center space-x-2 font-medium text-slate-800">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      <span>{formatDate(log.date)}</span>
                    </td>
                    <td className="px-6 py-4">{getSubBadge('total', log.totalChol)}</td>
                    <td className="px-6 py-4">{getSubBadge('ldl', log.ldl)}</td>
                    <td className="px-6 py-4">{getSubBadge('hdl', log.hdl)}</td>
                    <td className="px-6 py-4">{getSubBadge('trig', log.triglycerides)}</td>
                    <td className="px-6 py-4 max-w-sm truncate text-xs text-slate-500">
                      {log.notes ? (
                        <div className="flex items-center space-x-1.5" title={log.notes}>
                          <MessageCircle className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{log.notes}</span>
                        </div>
                      ) : (
                        <span className="text-slate-300 italic">No notes captured</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-1">
                      <button
                        onClick={() => onEdit(log)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
                        title="Edit entry"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => log.id && onDelete(log.id)}
                        className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Delete entry"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
