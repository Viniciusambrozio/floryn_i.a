'use client';

import { motion } from 'framer-motion';
import { ExternalLink, RefreshCw, Trash2, Heart } from 'lucide-react';
import { useAppStore, trackEvent } from '@/store/useAppStore';
import { generateUTMUrl } from '@/lib/recommendation';
import { useHydration } from '@/hooks/useHydration';
import Header from '@/components/Header';

export default function RecommendationResults() {
  const {
    userProfile,
    recommendations,
    resetQuiz,
    clearProfile
  } = useAppStore();
  
  const isHydrated = useHydration();


  const handleProductClick = (productId: string, productName: string, rank: number) => {
    trackEvent('cta_clicked', {
      productId,
      productName,
      rank,
      userId: userProfile?.name
    });
  };

  const handleRetakeQuiz = () => {
    resetQuiz();
    trackEvent('quiz_retake', {
      userId: userProfile?.name
    });
  };

  const handleClearProfile = () => {
    if (confirm('Tem certeza que deseja limpar seu perfil? Você precisará refazer o quiz.')) {
      clearProfile();
      trackEvent('profile_cleared', {
        userId: userProfile?.name
      });
    }
  };

  // Renderizar apenas no cliente para evitar problemas de hidratação
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

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#9FB397' }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p style={{ color: '#EBE3CF' }}>Gerando suas recomendações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#9FB397' }}>
      {/* Header */}
      <Header 
        userProfile={userProfile}
        showClearProfileButton={true}
        onClearProfile={handleClearProfile}
      />

      {/* Results */}
      <main className="px-4 pb-8">
        {/* Success Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-full mb-4">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-white mb-3">
            Seus decantes ideais!
          </h1>
          <p className="text-base px-2" style={{ color: '#EBE3CF' }}>
            Baseado no seu perfil, encontramos {recommendations.length} {recommendations.length === 1 ? 'decante perfeito' : 'decantes perfeitos'} para você.
          </p>
        </motion.div>

        {/* Recommendations Grid */}
        <div className="grid grid-cols-1 gap-4 mb-8">
               {recommendations.map((rec, index) => {
                 const productUrl = generateUTMUrl(rec.product.product_url, 'quiz_ia');

            return (
              <motion.div
                key={rec.product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden transition-all duration-300"
              >
                {/* Rank Badge */}
                <div className="relative">
                  <div className="absolute top-3 left-3 z-10">
                    <div className="bg-white text-floryn-primary text-sm font-bold px-2 py-1 rounded-full">
                      #{index + 1}
                    </div>
                  </div>
                  
                  {/* Product Image */}
                  <div className="aspect-video bg-white/20 flex items-center justify-center">
                    {rec.product.image ? (
                      <img
                        src={rec.product.image}
                        alt={rec.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-4xl">🌸</div>
                    )}
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-4">
                  {/* Compatibility Score */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-white rounded-full" />
                      <span className="text-sm font-medium text-white">
                        {rec.matchPercentage}% compatível
                      </span>
                    </div>
                    <div className="text-lg font-bold text-white">
                      R$ {rec.product.price.toFixed(2).replace('.', ',')}
                    </div>
                  </div>

                  {/* Product Details */}
                  <h3 className="font-heading text-lg font-bold text-white mb-1">
                    {rec.product.name}
                  </h3>
                  <p className="mb-3 text-sm" style={{ color: '#EBE3CF' }}>
                    {rec.product.brand}
                  </p>

                  {/* Olfactory Family */}
                  <div className="mb-3">
                    <span className="inline-block bg-white/20 text-white text-xs px-2 py-1 rounded-full">
                      {rec.product.olfactory_family}
                    </span>
                  </div>

                  {/* Notes */}
                  <div className="mb-4">
                    <h4 className="text-xs font-semibold mb-1" style={{ color: '#EBE3CF' }}>Notas principais:</h4>
                    <div className="flex flex-wrap gap-1">
                      {[...rec.product.top_notes, ...rec.product.heart_notes].slice(0, 3).map((note, i) => (
                        <span key={i} className="text-xs bg-white/10 px-2 py-1 rounded" style={{ color: '#EBE3CF' }}>
                          {note}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Recommendation Reason */}
                  <div className="mb-4 p-3 bg-white/10 rounded-xl">
                    <h4 className="text-xs font-semibold mb-1" style={{ color: '#EBE3CF' }}>Por que recomendamos:</h4>
                    <p className="text-xs" style={{ color: '#EBE3CF' }}>
                      {rec.reasons.join('. ')}
                    </p>
                  </div>

                  {/* CTA Button */}
                  <a
                    href={productUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleProductClick(rec.product.id, rec.product.name, index + 1)}
                    className="w-full bg-white text-floryn-primary hover:bg-white/90 font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 group text-sm"
                  >
                    Experimente agora
                    <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col gap-3 mb-6"
        >
          <button
            onClick={handleRetakeQuiz}
            className="w-full px-6 py-3 bg-white/20 border-2 border-white/40 text-white font-semibold rounded-xl hover:bg-white/30 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refazer Quiz
          </button>
          <a
            href={`https://floryn.com.br?utm_source=quiz_ia&utm_medium=quiz_result&utm_campaign=recommendation_catalog`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full px-6 py-3 bg-white text-floryn-primary font-semibold rounded-xl hover:bg-white/90 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Ver Catálogo Completo
          </a>
        </motion.div>

        {/* Privacy Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center text-xs px-4" style={{ color: '#EBE3CF' }}
        >
          <p>
            🔒 Seus dados são mantidos apenas localmente no seu dispositivo. 
            Nenhuma informação pessoal é enviada para nossos servidores.
          </p>
        </motion.div>
      </main>
    </div>
  );
}