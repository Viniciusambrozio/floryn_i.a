import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppState, UserProfile, QuizAnswers, ProductRecommendation } from '@/types';

interface AppStore extends AppState {
  // Actions
  setUserProfile: (profile: UserProfile) => void;
  updateQuizAnswers: (answers: Partial<QuizAnswers>) => void;
  setCurrentStep: (step: number) => void;
  setRecommendations: (recommendations: ProductRecommendation[]) => void;
  completeQuiz: () => void;
  resetQuiz: () => void;
  clearProfile: () => void;
  nextStep: () => void;
  previousStep: () => void;
  startQuiz: () => void;
}

const initialState: AppState = {
  userProfile: null,
  quizAnswers: {},
  currentStep: 0,
  recommendations: [],
  isQuizCompleted: false,
  isQuizStarted: false,
};

export const useAppStore = create<AppStore>()(  persist(
    (set, get) => ({
      ...initialState,

      setUserProfile: (profile: UserProfile) => {
        set({ userProfile: profile });
      },

      updateQuizAnswers: (answers: Partial<QuizAnswers>) => {
        set((state: AppStore) => ({
          quizAnswers: { ...state.quizAnswers, ...answers },
        }));
      },

      setCurrentStep: (step: number) => {
        set({ currentStep: step });
      },

      setRecommendations: (recommendations: ProductRecommendation[]) => {
        set({ recommendations });
      },

      completeQuiz: () => {
        set({ isQuizCompleted: true });
      },

      resetQuiz: () => {
        set({
          quizAnswers: {},
          currentStep: 0,
          recommendations: [],
          isQuizCompleted: false,
          isQuizStarted: false,
        });
      },

      clearProfile: () => {
        set(initialState);
      },

      nextStep: () => {
        const state = get();
        set({ currentStep: state.currentStep + 1 });
      },

      previousStep: () => {
        const state = get();
        if (state.currentStep > 0) {
          set({ currentStep: state.currentStep - 1 });
        }
      },

      startQuiz: () => {
        set({ isQuizStarted: true, currentStep: 0 });
      },
    }),
    {
      name: 'quiz_ai_profile',
      partialize: (state: AppStore) => ({
        userProfile: state.userProfile,
        quizAnswers: state.quizAnswers,
        currentStep: state.currentStep,
        isQuizCompleted: state.isQuizCompleted,
        isQuizStarted: state.isQuizStarted,
      }),
      skipHydration: true, // Evita problemas de hidratação
    }
  )
);

// Analytics helper
export const trackEvent = (eventName: string, properties?: Record<string, unknown>) => {
  // Google Analytics 4 / Segment tracking
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, {
      custom_parameter_1: properties?.step,
      custom_parameter_2: properties?.answer,
      ...properties,
    });
  }

  // Console log for development
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Analytics Event:', eventName, properties);
  }
};

// Typed window for gtag
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}