// User Profile Types
export interface UserProfile {
  name: string;
  email?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  skinType?: 'dry' | 'oily' | 'combination' | 'sensitive' | 'normal';
}

// Quiz Answer Types
export interface QuizAnswers {
  occasion: string;
  timeOfDay: string;
  olfactoryFamily: string;
  intensity: string;
  season: string;
  preferredNotes: string[];
}

// Product Types
export interface Product {
  id: string;
  name: string;
  brand: string;
  description: string;
  price: number;
  image: string;
  product_url: string;
  category: string;
  occasions: string[];
  time_of_day: string[];
  olfactory_family: string;
  intensity: string;
  season: string[];
  top_notes: string[];
  heart_notes: string[];
  base_notes: string[];
  gender: string;
  available: boolean;
  rating: number;
  reviews: number;
}

// Product Recommendation Types
export interface ProductRecommendation {
  product: Product;
  compatibilityScore: number;
  reasons: string[];
  matchPercentage: number;
}

// Quiz Step Types
export interface QuizStep {
  id: string;
  question: string;
  type: 'single' | 'multiple' | 'text';
  options: QuizOption[];
}

export interface QuizOption {
  value: string;
  label: string;
  description?: string;
}

// App State Types
export interface AppState {
  userProfile: UserProfile | null;
  quizAnswers: Partial<QuizAnswers>;
  currentStep: number;
  recommendations: ProductRecommendation[];
  isQuizCompleted: boolean;
  isQuizStarted: boolean;
}

// Quiz Steps Configuration
export const QUIZ_STEPS: QuizStep[] = [
  {
    id: 'occasion',
    question: 'Para que ocasião você está procurando um perfume?',
    type: 'single',
    options: [
      { value: 'daily', label: 'Uso diário', description: 'Para o dia a dia' },
      { value: 'work', label: 'Trabalho', description: 'Para o ambiente profissional' },
      { value: 'evening', label: 'Noite', description: 'Para eventos noturnos' },
      { value: 'special', label: 'Ocasiões especiais', description: 'Para momentos únicos' },
      { value: 'romantic', label: 'Romântico', description: 'Para encontros e momentos íntimos' }
    ]
  },
  {
    id: 'timeOfDay',
    question: 'Em que período do dia você mais usa perfume?',
    type: 'single',
    options: [
      { value: 'morning', label: 'Manhã', description: 'Para começar o dia' },
      { value: 'afternoon', label: 'Tarde', description: 'Para o período vespertino' },
      { value: 'evening', label: 'Noite', description: 'Para eventos noturnos' },
      { value: 'all-day', label: 'O dia todo', description: 'Para longa duração' }
    ]
  },
  {
    id: 'olfactoryFamily',
    question: 'Qual família olfativa você prefere?',
    type: 'single',
    options: [
      { value: 'floral', label: 'Floral', description: 'Rosas, jasmim, lavanda...' },
      { value: 'citrus', label: 'Cítrico', description: 'Limão, bergamota, laranja...' },
      { value: 'woody', label: 'Amadeirado', description: 'Sândalo, cedro, patchouli...' },
      { value: 'oriental', label: 'Orientais', description: 'Baunilha, âmbar, especiarias...' },
      { value: 'fresh', label: 'Frescos', description: 'Marinho, menta, eucalipto...' },
      { value: 'sweet', label: 'Doce', description: 'Caramelo, chocolate, mel...' }
    ]
  },
  {
    id: 'intensity',
    question: 'Qual intensidade você prefere?',
    type: 'single',
    options: [
      { value: 'light', label: 'Leve', description: 'Sutil e delicado' },
      { value: 'moderate', label: 'Moderada', description: 'Equilibrado e presente' },
      { value: 'strong', label: 'Intenso', description: 'Marcante e duradouro' }
    ]
  },
  {
    id: 'season',
    question: 'Para qual estação você está procurando?',
    type: 'single',
    options: [
      { value: 'spring', label: 'Primavera', description: 'Fresco e florido' },
      { value: 'summer', label: 'Verão', description: 'Leve e refrescante' },
      { value: 'autumn', label: 'Outono', description: 'Aconchegante e quente' },
      { value: 'winter', label: 'Inverno', description: 'Intenso e envolvente' },
      { value: 'all-seasons', label: 'Todas as estações', description: 'Versátil para qualquer época' }
    ]
  },
  {
    id: 'preferredNotes',
    question: 'Tem alguma nota específica que você gosta ou quer evitar?',
    type: 'text',
    options: []
  }
];

// Scoring Weights for Product Recommendations
export const SCORING_WEIGHTS = {
  occasion: 4,
  timeOfDay: 3,
  olfactoryFamily: 5,
  intensity: 4,
  season: 3,
  noteOverlap: 2,
  price: 1,
  rating: 2
};
