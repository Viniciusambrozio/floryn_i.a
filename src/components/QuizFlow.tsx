'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { useAppStore, trackEvent } from '@/store/useAppStore';
import { QUIZ_STEPS, QuizAnswers, Product } from '@/types';
import { getRecommendations } from '@/lib/recommendation';

export default function QuizFlow() {
  const {
    userProfile,
    quizAnswers,
    currentStep,
    updateQuizAnswers,
    setRecommendations,
    completeQuiz,
    nextStep,
    previousStep
  } = useAppStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load products on component mount
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch('/products.json');
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Error loading products:', error);
      }
    };
    loadProducts();
  }, []);

  const currentQuizStep = QUIZ_STEPS[currentStep];
  const isLastStep = currentStep === QUIZ_STEPS.length - 1;
  const progress = ((currentStep + 1) / QUIZ_STEPS.length) * 100;

  const handleAnswer = (value: string) => {
    const stepId = currentQuizStep.id as keyof QuizAnswers;
    
    if (stepId === 'preferredNotes') {
      // Handle text input for preferred notes
      const notes = value.split(',').map(note => note.trim()).filter(Boolean);
      updateQuizAnswers({ [stepId]: notes } as Partial<QuizAnswers>);
    } else {
      updateQuizAnswers({ [stepId]: value } as Partial<QuizAnswers>);
    }

    trackEvent('quiz_answer', {
      step: currentStep + 1,
      question: currentQuizStep.id,
      answer: value
    });
  };

  const handleNext = async () => {
    if (isLastStep) {
      await handleCompleteQuiz();
    } else {
      nextStep();
    }
  };

  const handleCompleteQuiz = async () => {
    if (!userProfile || products.length === 0) return;

    setIsLoading(true);
    
    try {
      // Ensure all required fields are present
      const completeAnswers: QuizAnswers = {
        occasion: quizAnswers.occasion || '',
        timeOfDay: quizAnswers.timeOfDay || '',
        olfactoryFamily: quizAnswers.olfactoryFamily || '',
        intensity: quizAnswers.intensity || '',
        season: quizAnswers.season || '',
        preferredNotes: quizAnswers.preferredNotes || []
      };
      
      // Generate recommendations
      const recommendations = getRecommendations(products, completeAnswers, userProfile, 3);
      setRecommendations(recommendations);
      completeQuiz();
      
      trackEvent('quiz_completed', {
        totalSteps: QUIZ_STEPS.length,
        answers: completeAnswers,
        recommendationsCount: recommendations.length
      });
    } catch (error) {
      console.error('Error generating recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentAnswer = () => {
    const stepId = currentQuizStep.id as keyof QuizAnswers;
    return quizAnswers[stepId];
  };

  const isAnswered = () => {
    const answer = getCurrentAnswer();
    if (currentQuizStep.id === 'preferredNotes') {
      return true; // Optional step
    }
    return answer !== undefined && answer !== '';
  };

  if (!currentQuizStep) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#9FB397' }}>
      {/* Header */}
      <header className="w-full px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="h-8"></div>
          <div className="text-sm" style={{ color: '#EBE3CF' }}>
            Olá, {userProfile?.name}!
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="px-4 mb-6">
        <div className="bg-white/20 rounded-full h-2 overflow-hidden">
          <motion.div
            className="bg-white h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <div className="flex justify-between text-sm mt-2" style={{ color: '#EBE3CF' }}>
          <span>Pergunta {currentStep + 1} de {QUIZ_STEPS.length}</span>
          <span>{Math.round(progress)}% completo</span>
        </div>
      </div>

      {/* Quiz Content */}
      <main className="px-4 pb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-6"
          >
            {/* Question */}
            <div className="mb-6">
              <h2 className="font-heading text-xl font-bold text-white mb-3">
                {currentQuizStep.question}
              </h2>
              <div className="w-12 h-1 bg-white rounded-full" />
            </div>

            {/* Answer Options */}
            <div className="space-y-3 mb-6">
              {currentQuizStep.type === 'text' ? (
                <div>
                  <textarea
                    value={(getCurrentAnswer() as string[])?.join(', ') || ''}
                    onChange={(e) => handleAnswer(e.target.value)}
                    placeholder="Ex: baunilha, âmbar, rosa, bergamota..."
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl focus:ring-2 focus:ring-white focus:border-white transition-all resize-none text-white placeholder-white/60"
                    rows={3}
                  />
                  <p className="text-sm text-white/70 mt-2">
                    💡 Esta pergunta é opcional. Deixe em branco se não tiver preferências específicas.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {currentQuizStep.options.map((option) => {
                    const isSelected = getCurrentAnswer() === option.value;
                    return (
                      <motion.button
                        key={option.value}
                        onClick={() => handleAnswer(option.value)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`p-4 text-left rounded-xl border-2 transition-all ${
                          isSelected
                            ? 'border-white bg-white/20'
                            : 'border-white/30 hover:border-white/50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className={`font-semibold text-base mb-1 ${
                              isSelected ? 'text-white' : 'text-white/90'
                            }`}>
                              {option.label}
                            </h3>
                            {option.description && (
                              <p className="text-sm" style={{ color: '#EBE3CF' }}>
                                {option.description}
                              </p>
                            )}
                          </div>
                          {isSelected && (
                            <Check className="w-5 h-5 text-white flex-shrink-0 ml-3" />
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center">
              <button
                onClick={previousStep}
                disabled={currentStep === 0}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                  currentStep === 0
                    ? 'text-white/40 cursor-not-allowed'
                    : 'text-white/80 hover:bg-white/10'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </button>

              <motion.button
                onClick={handleNext}
                disabled={!isAnswered() && currentQuizStep.id !== 'preferredNotes'}
                whileHover={{ scale: isAnswered() || currentQuizStep.id === 'preferredNotes' ? 1.02 : 1 }}
                whileTap={{ scale: isAnswered() || currentQuizStep.id === 'preferredNotes' ? 0.98 : 1 }}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                  isAnswered() || currentQuizStep.id === 'preferredNotes'
                    ? 'bg-white text-floryn-primary hover:bg-white/90'
                    : 'bg-white/20 text-white/40 cursor-not-allowed'
                }`}
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-floryn-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    {isLastStep ? 'Ver Recomendações' : 'Próxima'}
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}