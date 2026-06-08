import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import localAppletConfig from '../../firebase-applet-config.json';

// User's production config from prompt
const productionConfig = {
  apiKey: "AIzaSyAc-yJS-Bg_9OrPAwxBMCyrWutZlVzinAI",
  authDomain: "cholestrack.firebaseapp.com",
  projectId: "cholestrack",
  storageBucket: "cholestrack.firebasestorage.app",
  messagingSenderId: "756044654695",
  appId: "1:756044654695:web:f8220aea7f14729aa20cc2",
  measurementId: "G-115YVL9SYN"
};

// Check if there is an overridden config in localStorage
const getActiveConfig = () => {
  try {
    const custom = localStorage.getItem('cholestrack_firebase_config_override');
    if (custom) {
      return JSON.parse(custom);
    }
  } catch (e) {
    console.error("Failed to read localStorage config override", e);
  }
  // Default to user's productionConfig as requested, fallback to playground applet config
  return productionConfig || localAppletConfig;
};

const activeConfig = getActiveConfig();

// Initialize application
const app = getApps().length === 0 ? initializeApp(activeConfig) : getApp();

export const db = getFirestore(app, activeConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Check if running on sandbox project
export const isSandboxProject = activeConfig.projectId !== productionConfig.projectId;

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
        displayName: provider.displayName,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error details: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export function saveConfigOverride(config: typeof productionConfig | null) {
  if (config === null) {
    localStorage.removeItem('cholestrack_firebase_config_override');
  } else {
    localStorage.setItem('cholestrack_firebase_config_override', JSON.stringify(config));
  }
  window.location.reload();
}

export { productionConfig, localAppletConfig };
