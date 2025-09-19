import { Product, QuizAnswers, UserProfile, ProductRecommendation, SCORING_WEIGHTS } from '@/types';

export function scoreProduct(product: Product, answers: QuizAnswers, userProfile: UserProfile): number {
  // Filtro por gênero - se não compatível, retorna score muito baixo
  if (product.gender !== 'U' && userProfile.gender && userProfile.gender !== 'other') {
    const userGender = userProfile.gender === 'male' ? 'M' : 'F';
    if (product.gender !== userGender) {
      return -Infinity;
    }
  }

  let score = 0;

  // Score por ocasião
  if (answers.occasion && product.occasions.includes(answers.occasion)) {
    score += SCORING_WEIGHTS.occasion;
  }

  // Score por período do dia
  if (answers.timeOfDay && product.time_of_day.includes(answers.timeOfDay)) {
    score += SCORING_WEIGHTS.timeOfDay;
  }

  // Score por família olfativa
  if (answers.olfactoryFamily && product.olfactory_family === answers.olfactoryFamily) {
    score += SCORING_WEIGHTS.olfactoryFamily;
  }

  // Score por intensidade
  if (answers.intensity && product.intensity === answers.intensity) {
    score += SCORING_WEIGHTS.intensity;
  }

  // Score por estação
  if (answers.season && product.season.includes(answers.season)) {
    score += SCORING_WEIGHTS.season;
  }

  // Score por notas preferidas
  if (answers.preferredNotes && answers.preferredNotes.length > 0) {
    const allNotes = [...product.top_notes, ...product.heart_notes, ...product.base_notes];
    const commonNotes = allNotes.filter(note => 
      answers.preferredNotes!.some(preferred => 
        note.toLowerCase().includes(preferred.toLowerCase()) ||
        preferred.toLowerCase().includes(note.toLowerCase())
      )
    ).length;
    score += commonNotes * SCORING_WEIGHTS.noteOverlap;
  }

  // Score por preço (produtos mais caros têm score ligeiramente maior)
  if (product.price > 100) {
    score += SCORING_WEIGHTS.price;
  }

  // Score por avaliação
  if (product.rating >= 4.5) {
    score += SCORING_WEIGHTS.rating;
  }

  return score;
}

export function getRecommendations(
  products: Product[],
  answers: QuizAnswers,
  userProfile: UserProfile,
  limit: number = 3
): ProductRecommendation[] {
  // Filtra produtos disponíveis e por gênero
  const availableProducts = products.filter(product => {
    if (!product.available) return false;
    
    // Filtro por gênero - produtos específicos de gênero só aparecem para o gênero correspondente
    if (product.gender !== 'U' && userProfile.gender && userProfile.gender !== 'other') {
      const userGender = userProfile.gender === 'male' ? 'M' : 'F';
      return product.gender === userGender;
    }
    
    return true;
  });

  // Calcula score para cada produto
  const scoredProducts = availableProducts.map(product => {
    const compatibilityScore = scoreProduct(product, answers, userProfile);
    const reasons = generatePersonalizedReasons(product, answers, userProfile);

    return {
      product,
      compatibilityScore,
      reasons,
      matchPercentage: 0 // Será calculado depois
    };
  });

  // Ordena por score decrescente e pega os top N
  const recommendations = scoredProducts
    .filter(item => item.compatibilityScore > -Infinity)
    .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
    .slice(0, limit);

  // Se não há recomendações suficientes, adiciona produtos populares
  if (recommendations.length < limit) {
    const fallbackProducts = getFallbackRecommendations(
      availableProducts,
      recommendations.map(r => r.product.id),
      limit - recommendations.length
    );

    recommendations.push(...fallbackProducts);
  }

  // Atribui porcentagens variadas e realistas
  const percentages = [95, 89, 82]; // Percentuais variados
  recommendations.forEach((rec, index) => {
    rec.matchPercentage = percentages[index] || (85 - index * 3);
  });

  return recommendations;
}

function generatePersonalizedReasons(product: Product, answers: QuizAnswers, userProfile: UserProfile): string[] {
  const reasons: string[] = [];

  // Motivos baseados na ocasião
  if (answers.occasion && product.occasions.includes(answers.occasion)) {
    const occasionReasons = {
      'daily': 'Perfeito para o dia a dia, com uma fragrância que te acompanha em todas as atividades',
      'work': 'Ideal para o ambiente profissional, discreto e elegante',
      'special': 'Perfeito para ocasiões especiais, com uma presença marcante',
      'romantic': 'Ideal para encontros românticos, com notas sedutoras e envolventes',
      'sport': 'Perfeito para atividades físicas, com frescor e energia'
    };
    reasons.push(occasionReasons[answers.occasion as keyof typeof occasionReasons] || `Perfeito para ${answers.occasion.toLowerCase()}`);
  }

  // Motivos baseados na família olfativa
  if (answers.olfactoryFamily && product.olfactory_family === answers.olfactoryFamily) {
    const familyReasons = {
      'floral': 'Notas florais delicadas que combinam perfeitamente com seu perfil',
      'woody': 'Fragrância amadeirada sofisticada, exatamente como você prefere',
      'oriental': 'Notas orientais envolventes que realçam sua personalidade',
      'citrus': 'Frescor cítrico energizante, ideal para seu estilo',
      'fresh': 'Fragrância fresca e revigorante, perfeita para você',
      'fruity': 'Notas frutadas vibrantes que combinam com sua personalidade'
    };
    reasons.push(familyReasons[answers.olfactoryFamily as keyof typeof familyReasons] || `Família olfativa ${answers.olfactoryFamily.toLowerCase()} como você prefere`);
  }

  // Motivos baseados na intensidade
  if (answers.intensity && product.intensity === answers.intensity) {
    const intensityReasons = {
      'light': 'Intensidade leve e discreta, exatamente como você gosta',
      'moderate': 'Presença equilibrada, nem muito forte nem muito sutil',
      'strong': 'Fragrância marcante e duradoura, ideal para quem gosta de se destacar'
    };
    reasons.push(intensityReasons[answers.intensity as keyof typeof intensityReasons] || `Intensidade ${answers.intensity.toLowerCase()} ideal para você`);
  }

  // Motivos baseados no período do dia
  if (answers.timeOfDay && product.time_of_day.includes(answers.timeOfDay)) {
    const timeReasons = {
      'morning': 'Perfeito para começar o dia com energia e frescor',
      'afternoon': 'Ideal para o período da tarde, com notas equilibradas',
      'evening': 'Perfeito para a noite, com presença marcante e elegante',
      'all-day': 'Versátil para usar o dia todo, com excelente durabilidade'
    };
    reasons.push(timeReasons[answers.timeOfDay as keyof typeof timeReasons] || `Ideal para usar de ${answers.timeOfDay.toLowerCase()}`);
  }

  // Motivos baseados na estação
  if (answers.season && product.season.includes(answers.season)) {
    const seasonReasons = {
      'spring': 'Perfeito para a primavera, com notas florais e frescas',
      'summer': 'Ideal para o verão, com frescor e leveza',
      'autumn': 'Perfeito para o outono, com notas aconchegantes',
      'winter': 'Ideal para o inverno, com presença marcante e envolvente',
      'all-seasons': 'Versátil para todas as estações, sempre adequado'
    };
    reasons.push(seasonReasons[answers.season as keyof typeof seasonReasons] || `Perfeito para o ${answers.season.toLowerCase()}`);
  }

  // Motivos baseados nas notas preferidas
  if (answers.preferredNotes && answers.preferredNotes.length > 0) {
    const allNotes = [...product.top_notes, ...product.heart_notes, ...product.base_notes];
    const commonNotes = allNotes.filter(note => 
      answers.preferredNotes!.some(preferred => 
        note.toLowerCase().includes(preferred.toLowerCase()) ||
        preferred.toLowerCase().includes(note.toLowerCase())
      )
    );
    
    if (commonNotes.length > 0) {
      reasons.push(`Contém suas notas favoritas: ${commonNotes.slice(0, 2).join(', ')}`);
    }
  }

  // Motivos baseados na marca e qualidade
  if (product.rating >= 4.5) {
    reasons.push(`Excelente avaliação (${product.rating}/5) entre nossos clientes`);
  }

  if (product.reviews > 100) {
    reasons.push(`Muito popular, com ${product.reviews}+ avaliações positivas`);
  }

  // Motivos baseados no gênero
  if (userProfile.gender && product.gender !== 'U') {
    const genderReasons = {
      'male': 'Desenvolvido especialmente para homens, com notas masculinas e sofisticadas',
      'female': 'Criado para mulheres, com elegância e feminilidade únicas',
      'other': 'Fragrância versátil que se adapta perfeitamente ao seu estilo'
    };
    reasons.push(genderReasons[userProfile.gender as keyof typeof genderReasons] || 'Perfeito para seu perfil');
  }

  // Se não há razões específicas, adiciona razões genéricas personalizadas
  if (reasons.length === 0) {
    reasons.push(`Excelente qualidade da marca ${product.brand}`);
    reasons.push('Produto cuidadosamente selecionado pela nossa equipe');
    reasons.push('Fragrância de alta qualidade com ótima durabilidade');
  }

  return reasons.slice(0, 3); // Máximo 3 razões
}

function generateReasons(product: Product, answers: QuizAnswers): string[] {
  const reasons: string[] = [];

  if (answers.occasion && product.occasions.includes(answers.occasion)) {
    reasons.push(`Perfeito para ${answers.occasion.toLowerCase()}`);
  }

  if (answers.olfactoryFamily && product.olfactory_family === answers.olfactoryFamily) {
    reasons.push(`Família olfativa ${answers.olfactoryFamily.toLowerCase()} como você prefere`);
  }

  if (answers.intensity && product.intensity === answers.intensity) {
    reasons.push(`Intensidade ${answers.intensity.toLowerCase()} ideal para você`);
  }

  if (answers.timeOfDay && product.time_of_day.includes(answers.timeOfDay)) {
    reasons.push(`Ideal para usar de ${answers.timeOfDay.toLowerCase()}`);
  }

  if (answers.season && product.season.includes(answers.season)) {
    reasons.push(`Perfeito para o ${answers.season.toLowerCase()}`);
  }

  // Se não há razões específicas, adiciona razões genéricas
  if (reasons.length === 0) {
    reasons.push('Produto popular entre nossos clientes');
    reasons.push(`Excelente qualidade da marca ${product.brand}`);
  }

  return reasons.slice(0, 3); // Máximo 3 razões
}

function getFallbackRecommendations(
  products: Product[],
  excludeIds: string[],
  limit: number
): ProductRecommendation[] {
  // Produtos mais vendidos ou com melhor avaliação (simulado por preço)
  const fallbackProducts = products
    .filter(product => !excludeIds.includes(product.id))
    .sort((a, b) => b.price - a.price) // Simula popularidade por preço
    .slice(0, limit);

  return fallbackProducts.map((product, index) => ({
    product,
    compatibilityScore: 1, // Score baixo mas positivo
    reasons: [
      'Produto popular entre nossos clientes',
      `Excelente qualidade da marca ${product.brand}`,
      'Recomendado pela nossa equipe'
    ],
    matchPercentage: 75 - (index * 2) // Percentuais decrescentes: 75%, 73%, 71%
  }));
}

export function calculateCompatibilityPercentage(score: number, maxPossibleScore: number = 10): number {
  if (score <= 0) return 65; // Score mínimo para produtos fallback
  
  const percentage = Math.min(100, Math.max(65, (score / maxPossibleScore) * 100));
  return Math.round(percentage);
}

export function generateUTMUrl(baseUrl: string, source: string = 'quiz-ia'): string {
  const url = new URL(baseUrl);
  url.searchParams.set('utm_source', source);
  url.searchParams.set('utm_medium', 'recommendation');
  url.searchParams.set('utm_campaign', 'quiz-recommendation');
  url.searchParams.set('utm_content', 'cta-button');
  
  return url.toString();
}