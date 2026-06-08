export interface UserProfile {
  age: number;
  gender: 'male' | 'female';
  race: 'white' | 'african_american' | 'other';
  systolicBp: number;
  treatedForHypertension: boolean;
  diabetes: boolean;
  smoker: boolean;
  updatedAt?: string;
  githubComments?: string;
}

export interface CholesterolLog {
  id?: string;
  date: string;
  totalChol: number; // mg/dL
  hdl: number; // mg/dL
  ldl: number; // mg/dL
  triglycerides: number; // mg/dL
  notes: string;
  createdAt?: string;
}

export interface LifestyleLog {
  id?: string;
  date: string;
  foodDescription: string;
  satFat: number; // grams
  solubleFiber: number; // grams
  activityType: 'cardio' | 'strength' | 'hiit' | 'yoga' | 'other';
  duration: number; // minutes
  mets: number; // Intensity
  supplements: string[]; // ['omega-3', 'phytosterols', etc.]
  weight: number; // lbs
  bodyWater: number; // %
  activeCalories: number; // kcal
  restingHr: number; // bpm
  createdAt?: string;
}

export interface ASCVDResult {
  riskPercent: number;
  classification: 'low' | 'borderline' | 'intermediate' | 'high';
  message: string;
  color: string;
  guidance: string[];
}
