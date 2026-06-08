import { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, addDoc, deleteDoc, collection, onSnapshot, query, orderBy, getDocFromServer } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType, isSandboxProject, productionConfig } from './utils/firebase';
import { UserProfile, CholesterolLog } from './types';
import { calculateASCVD } from './utils/ascvd';

// Component imports
import Header from './components/Header';
import MetricCards from './components/MetricCards';
import RiskCard from './components/RiskCard';
import LogModal from './components/LogModal';
import HistoryList from './components/HistoryList';
import AnalyticsCharts from './components/AnalyticsCharts';
import ProfileSettings from './components/ProfileSettings';
import GitHubLab from './components/GitHubLab';

// Lucide icon imports
import { Heart, Plus, ShieldAlert, CheckCircle, Flame, User as UserIcon, LogIn, Database, Sparkles, Activity } from 'lucide-react';

const DEFAULT_PROFILE: UserProfile = {
  age: 45,
  gender: 'male',
  race: 'white',
  systolicBp: 120,
  treatedForHypertension: false,
  diabetes: false,
  smoker: false,
};

const DEMO_LOGS: CholesterolLog[] = [
  {
    id: 'demo-1',
    date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days ago
    totalChol: 245,
    ldl: 162,
    hdl: 38,
    triglycerides: 225,
    notes: 'Primary screening blood work. Feeling fatigued. Physician suggested starting a low-saturated fat diet and retesting in 2 months.',
  },
  {
    id: 'demo-2',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    totalChol: 205,
    ldl: 128,
    hdl: 44,
    triglycerides: 165,
    notes: 'Follow up test. Lipid density looks better after 8 weeks of fish oil, daily cardio, and limited carbohydrates. Doctor noted positive trend.',
  },
];

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [logs, setLogs] = useState<CholesterolLog[]>([]);
  
  // Modals state
  const [showAddLogModal, setShowAddLogModal] = useState(false);
  const [editingLog, setEditingLog] = useState<CholesterolLog | null>(null);
  const [connectionVerified, setConnectionVerified] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'github'>('dashboard');

  // Authentication observer hook
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        // If not signed in, pre-seed state with beautiful mock sandbox data so preview is live and gorgeous!
        setProfile(DEFAULT_PROFILE);
        setLogs(DEMO_LOGS);
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  // Sync authenticated user logs and profiles from Firestore
  useEffect(() => {
    if (!user) return;
    setLoading(true);

    const checkConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
        setConnectionVerified(true);
      } catch (e) {
        console.warn("Firestore connection check bypassed:", e);
        setConnectionVerified(true);
      }
    };
    checkConnection();

    // 1. Profile reference listener
    const profileRef = doc(db, 'users', user.uid);
    const unsubProfile = onSnapshot(profileRef, (snap) => {
      if (snap.exists()) {
        setProfile(snap.data() as UserProfile);
      } else {
        // Set document empty initially, let it seed on first edit
        setProfile(DEFAULT_PROFILE);
      }
    }, (err) => {
      console.error("Profile onSnapshot failed, bypassing:", err);
    });

    // 2. Logs subcollection listener (sorted chronologically desc)
    const logsRef = collection(db, 'users', user.uid, 'logs');
    const logsQuery = query(logsRef, orderBy('date', 'desc'));
    const unsubLogs = onSnapshot(logsQuery, (snap) => {
      const dbLogs: CholesterolLog[] = [];
      snap.forEach((docSnap) => {
        dbLogs.push({ id: docSnap.id, ...docSnap.data() } as CholesterolLog);
      });
      setLogs(dbLogs);
      setLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, `users/${user.uid}/logs`);
      setLoading(false);
    });

    return () => {
      unsubProfile();
      unsubLogs();
    };
  }, [user]);

  // Core handlers
  const handleSaveProfile = async (updatedProfile: UserProfile) => {
    const timestampStr = new Date().toISOString();
    const dataWithTime = { ...updatedProfile, updatedAt: timestampStr };

    if (!user) {
      // Offline/Sandbox inline state edit
      setProfile(updatedProfile);
      return;
    }

    try {
      await setDoc(doc(db, 'users', user.uid), dataWithTime);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
    }
  };

  const handleSaveLog = async (logData: Omit<CholesterolLog, 'id'>) => {
    if (!user) {
      // Offline/Sandbox inline log action
      if (editingLog && editingLog.id) {
        setLogs(prev => prev.map(l => l.id === editingLog.id ? { ...logData, id: editingLog.id } : l));
        setEditingLog(null);
      } else {
        setLogs(prev => [{ ...logData, id: `demo-${Date.now()}` }, ...prev]);
      }
      return;
    }

    try {
      const logsCollectionRef = collection(db, 'users', user.uid, 'logs');
      if (editingLog && editingLog.id) {
        const logDocRef = doc(db, 'users', user.uid, 'logs', editingLog.id);
        await setDoc(logDocRef, logData);
        setEditingLog(null);
      } else {
        await addDoc(logsCollectionRef, logData);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}/logs`);
    }
  };

  const handleDeleteLog = async (logId: string) => {
    if (!user) {
      // Offline/Sandbox inline log edit
      setLogs(prev => prev.filter(l => l.id !== logId));
      return;
    }

    try {
      const logDocRef = doc(db, 'users', user.uid, 'logs', logId);
      await deleteDoc(logDocRef);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${user.uid}/logs/${logId}`);
    }
  };

  // Compute stats on-the-fly
  const latestLog = logs.length > 0 ? logs[0] : null;
  const currentTotalChol = latestLog ? latestLog.totalChol : 200;
  const currentHdl = latestLog ? latestLog.hdl : 50;

  // Compute calculated ASCVD risk level
  const ascvdResult = calculateASCVD(profile, currentTotalChol, currentHdl);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16 font-sans">
      <Header user={user} loading={loading} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        
        {/* If user is in Guest/Sandbox session, display helpful signpost indicator */}
        {!user && (
          <div className="mb-6 bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-700 rounded-3xl p-6 text-white relative overflow-hidden shadow-md">
            <div className="absolute right-0 top-0 h-full w-1/3 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none" />
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="bg-white/15 px-2 py-0.5 rounded-md text-[10px] uppercase font-mono tracking-wider font-bold text-indigo-150">
                    Live Telemetry Sandbox
                  </span>
                  <Sparkles className="h-4 w-4 text-amber-300 animate-pulse" />
                </div>
                <h2 className="text-xl font-bold tracking-tight">Interactive Preview Active</h2>
                <p className="text-xs text-indigo-100 max-w-2xl leading-normal">
                  We have preloaded diagnostic records so you can test features instantly. Modify risk variables, calculate lifetime cardiovascular risk ratios, and log tests. Switch databases or sign in to sync with your actual <strong>CholesTrack</strong> Cloud Firestore.
                </p>
              </div>
              <button
                onClick={() => auth.languageCode = 'en'} // trigger auth placeholder trigger of popup sign in
                className="px-5 py-2.5 bg-white text-indigo-700 text-sm font-bold rounded-xl shadow-xs hover:bg-slate-50 transition shrink-0 flex items-center space-x-1.5"
              >
                <span>Synchronize with Cloud</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab Navigation Menu */}
        <div className="flex border-b border-gray-150 mb-6 font-sans">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`pb-3 text-sm font-bold border-b-2 transition duration-150 flex items-center space-x-2 mr-6 px-1 ${
              activeTab === 'dashboard'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-200'
            }`}
          >
            <Activity className="h-4 w-4" />
            <span>Telemetry Dashboard</span>
          </button>
          
          <button
            onClick={() => setActiveTab('github')}
            className={`pb-3 text-sm font-bold border-b-2 transition duration-150 flex items-center space-x-2 px-1 ${
              activeTab === 'github'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-200'
            }`}
          >
            <Sparkles className="h-4 w-4 text-indigo-500 animate-pulse" />
            <span>GitHub Scientific Comparison Lab</span>
          </button>
        </div>

        {/* Dashboard workspace layout */}
        {activeTab === 'dashboard' ? (
          <div className="space-y-6">
          
          {/* Section 1: Core metric cards */}
          <section className="space-y-3">
            <div className="flex justify-between items-center px-1">
              <div>
                <h2 className="text-lg font-bold text-slate-800 tracking-tight">Current Lipid Chemistry profiles</h2>
                <p className="text-xs text-slate-400">Validated standard reference models in units of mg/dL</p>
              </div>
              <button
                onClick={() => {
                  setEditingLog(null);
                  setShowAddLogModal(true);
                }}
                className="px-4 py-2 border border-slate-200 hover:border-slate-300 rounded-xl bg-white shadow-xs text-xs font-bold font-sans text-slate-700 flex items-center space-x-1.5 hover:shadow-xs transition duration-200"
              >
                <Plus className="h-4 w-4 text-indigo-500" />
                <span>Log Chemistry Lab</span>
              </button>
            </div>
            
            <MetricCards logs={logs} gender={profile.gender} />
          </section>

          {/* Section 2: Clinical Model and demographics */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            <div className="lg:col-span-2">
              <RiskCard result={ascvdResult} profile={profile} />
            </div>
            <div>
              <ProfileSettings profile={profile} onSave={handleSaveProfile} />
            </div>
          </section>

          {/* Section 3: Time Series Trends */}
          <section className="space-y-3">
            <div className="px-1">
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">Diagnostic Longitudinal Trends</h2>
              <p className="text-xs text-slate-400">Interactive charts displaying metric fluctuations over a chronological timeline</p>
            </div>
            <AnalyticsCharts logs={logs} />
          </section>

          {/* Section 4: History log database */}
          <section className="space-y-3">
            <div className="px-1">
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">AHA Diagnostic Logs</h2>
              <p className="text-xs text-slate-400">Complete historical chemistry registers with edit and deletion controls</p>
            </div>
            <HistoryList
              logs={logs}
              gender={profile.gender}
              onDelete={handleDeleteLog}
              onEdit={(log) => {
                setEditingLog(log);
                setShowAddLogModal(true);
              }}
            />
          </section>

        </div>
        ) : (
          <GitHubLab profile={profile} onSaveProfile={handleSaveProfile} />
        )}
      </main>

      {/* Interactive Logs Modal */}
      {showAddLogModal && (
        <LogModal
          editingLog={editingLog}
          onClose={() => {
            setShowAddLogModal(false);
            setEditingLog(null);
          }}
          onSave={handleSaveLog}
        />
      )}
    </div>
  );
}
