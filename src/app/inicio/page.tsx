'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Heart, Clock } from 'lucide-react';
import { useAppStore, trackEvent } from '@/store/useAppStore';
import { useHydration } from '@/hooks/useHydration';
import ProfileModal from '@/components/ProfileModal';
import QuizFlow from '@/components/QuizFlow';
import RecommendationResults from '@/components/RecommendationResults';

export default function Home() {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const { 
    userProfile, 
    isQuizCompleted, 
    isQuizStarted, 
    recommendations,
    startQuiz,
    resetQuiz 
  } = useAppStore();
  
  const isHydrated = useHydration();

  useEffect(() => {
    if (isHydrated) {
      // Reset quiz state when page loads to always show landing page first
      resetQuiz();
      // Track page view
      trackEvent('page_view', { page: 'home' });
    }
  }, [isHydrated, resetQuiz]);

  const handleStartQuiz = () => {
    if (!userProfile) {
      setShowProfileModal(true);
      trackEvent('quiz_start_attempt', { hasProfile: false });
    } else {
      startQuiz();
      trackEvent('quiz_started', { userId: userProfile.name });
    }
  };

  const handleProfileComplete = () => {
    setShowProfileModal(false);
    startQuiz();
    trackEvent('profile_completed', { userId: userProfile?.name });
  };

  // Show loading state while hydrating
  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#9FB397' }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p style={{ color: '#EBE3CF' }}>Carregando...</p>
        </div>
      </div>
    );
  }

  // Show recommendations if quiz is completed
  if (isQuizCompleted && recommendations && recommendations.length > 0) {
    return <RecommendationResults />;
  }

  // Show quiz if started
  if (isQuizStarted && userProfile) {
    return <QuizFlow />;
  }

  // Show landing page
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#9FB397' }}>
      {/* Header */}
      <header className="w-full px-4 py-4">
        <div className="flex justify-between items-center">
          <div></div>
          <div className="flex items-center gap-3">
            {userProfile && (
              <div className="text-sm" style={{ color: '#EBE3CF' }}>
                Olá, {userProfile.name}!
              </div>
            )}
            {(isQuizStarted || isQuizCompleted) && (
              <button
                onClick={resetQuiz}
                className="text-xs px-3 py-1 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                style={{ color: '#EBE3CF' }}
              >
                Reiniciar
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="px-4 py-8">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-6">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            
            <h1 className="font-heading text-3xl font-bold text-white mb-4">
              Encontre o decante
              <span className="text-white/90 block">
                perfeito em 60s
              </span>
            </h1>
            
            <p className="text-lg mb-8 px-2" style={{ color: '#EBE3CF' }}>
              Não sabe qual perfume escolher? Deixe nossa IA sugerir seu decante ideal em 6 perguntas.
            </p>
            
            <motion.button
              onClick={handleStartQuiz}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-floryn-primary font-heading font-bold text-lg px-8 py-4 rounded-2xl shadow-lg transition-all duration-200 w-full max-w-xs"
            >
              Descobrir meu aroma
            </motion.button>
          </motion.div>
        </div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-1 gap-4 mb-12"
        >
          <div className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-full mb-4">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-heading text-lg font-bold text-white mb-2">
              Rápido e Fácil
            </h3>
            <p className="text-sm" style={{ color: '#EBE3CF' }}>
              Apenas 6 perguntas simples para descobrir seu perfume ideal.
            </p>
          </div>

          <div className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-full mb-4">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-heading text-lg font-bold text-white mb-2">
              Personalizado
            </h3>
            <p className="text-sm" style={{ color: '#EBE3CF' }}>
              Recomendações baseadas no seu perfil e preferências únicas.
            </p>
          </div>

          <div className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-full mb-4">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-heading text-lg font-bold text-white mb-2">
              Inteligente
            </h3>
            <p className="text-sm" style={{ color: '#EBE3CF' }}>
              Algoritmo avançado que considera ocasião, estilo e intensidade.
            </p>
          </div>
        </motion.div>

        {/* Social Proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-6"
        >
          <p className="mb-4 text-sm" style={{ color: '#EBE3CF' }}>
            &ldquo;A IA me ajudou a encontrar o perfume perfeito para o meu casamento!&rdquo;
          </p>
          <div className="flex items-center justify-center gap-1 text-yellow-300 mb-2">
            {[...Array(5)].map((_, i) => (
              <span key={i}>⭐</span>
            ))}
          </div>
          <p className="text-xs" style={{ color: '#EBE3CF' }}>
            Mais de 1.000 clientes satisfeitos
          </p>
        </motion.div>
      </main>

      {/* Profile Modal */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onComplete={handleProfileComplete}
      />
    </div>
  );
}
