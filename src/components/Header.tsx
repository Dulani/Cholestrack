import { useState } from 'react';
import { auth, productionConfig, localAppletConfig, saveConfigOverride, isSandboxProject } from '../utils/firebase';
import { signInWithPopup, GoogleAuthProvider, signOut, User } from 'firebase/auth';
import { Heart, LogOut, Database, Key, HelpCircle } from 'lucide-react';

interface HeaderProps {
  user: User | null;
  loading: boolean;
}

export default function Header({ user, loading }: HeaderProps) {
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [useProduction, setUseProduction] = useState(!isSandboxProject);

  const handleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (e) {
      console.error("Sign in failed:", e);
      alert("Sign in failed. Make sure you enable the browser cookies/popups or try running in a new window tab.");
    }
  };

  const handleSignOut = () => {
    signOut(auth).catch(console.error);
  };

  const toggleConfig = (prod: boolean) => {
    setUseProduction(prod);
    if (prod) {
      // Use production credentials
      saveConfigOverride(productionConfig);
    } else {
      // Use local project credentials
      saveConfigOverride(localAppletConfig as any);
    }
  };

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-rose-50 rounded-xl text-rose-500">
              <Heart className="h-6 w-6" fill="currentColor" />
            </div>
            <div>
              <h1 className="text-xl font-sans font-bold tracking-tight text-gray-900 flex items-center">
                CholesTrack
                <span className="ml-2 text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  v0.5
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Database selection info pill */}
            <button
              onClick={() => setShowConfigModal(true)}
              className={`text-xs font-mono px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-all text-left ${
                isSandboxProject
                  ? 'bg-amber-50 text-amber-700 border border-amber-200/50 hover:bg-amber-100'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200/50 hover:bg-emerald-100'
              }`}
            >
              <Database className="h-3.5 w-3.5" />
              <span className="hidden md:inline font-sans">Database:</span>
              <span className="font-bold">{isSandboxProject ? 'Sandbox (long-acres)' : 'Production (cholestrack)'}</span>
            </button>

            {loading ? (
              <div className="h-8 w-24 bg-gray-100 animate-pulse rounded-lg" />
            ) : user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      className="h-8 w-8 rounded-full border border-gray-200"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm">
                      {user.displayName ? user.displayName[0].toUpperCase() : 'U'}
                    </div>
                  )}
                  <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[120px] truncate">
                    {user.displayName || user.email}
                  </span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleSignIn}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-slate-900 hover:bg-slate-800 transition-colors"
              >
                Sign In With Google
              </button>
            )}
          </div>
        </div>
      </div>

      {showConfigModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100">
            <div className="flex items-center space-x-2 text-slate-800 mb-4">
              <Key className="h-5 w-5 text-indigo-500" />
              <h3 className="text-lg font-bold">Firebase Configuration</h3>
            </div>
            
            <p className="text-sm text-gray-500 mb-4">
              CholesTrack supports running in either the <strong>AI Studio Sandbox Project</strong> (for instant in-browser previews) or connecting directly to your <strong>Production Project</strong>.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => toggleConfig(false)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                  isSandboxProject
                    ? 'border-indigo-500 bg-indigo-50/50 ring-2 ring-indigo-500/20'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-bold text-sm text-slate-800 flex justify-between">
                  <span>Sandbox Project Sandbox</span>
                  {isSandboxProject && <span className="text-indigo-600 text-xs font-bold font-mono">ACTIVE</span>}
                </div>
                <span className="text-xs text-gray-500">
                  Ideal for previews. Uses the preset Cloud DB & rules deployed in this AI workspace.
                </span>
              </button>

              <button
                onClick={() => toggleConfig(true)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                  !isSandboxProject
                    ? 'border-indigo-500 bg-indigo-50/50 ring-2 ring-indigo-500/20'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-bold text-sm text-slate-800 flex justify-between">
                  <span>Your Production Credentials</span>
                  {!isSandboxProject && <span className="text-indigo-600 text-xs font-bold font-mono">ACTIVE</span>}
                </div>
                <span className="text-xs text-gray-500">
                  Saves to personal firebase ID "cholestrack". Ensure you have enabled Email or Google Auth providers.
                </span>
              </button>
            </div>

            <div className="mt-5 border-t border-gray-100 pt-4 flex justify-between items-center">
              <div className="flex items-center text-xs text-gray-400 space-x-1">
                <HelpCircle className="h-3.5 w-3.5" />
                <span>Page reloads on switch</span>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
