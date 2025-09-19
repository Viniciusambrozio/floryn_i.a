const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

// Shopify API Configuration
const SHOPIFY_CONFIG = {
  store: process.env.SHOPIFY_STORE || 'xa1x0n-8d.myshopify.com',
  accessToken: process.env.SHOPIFY_ACCESS_TOKEN || 'YOUR_ACCESS_TOKEN_HERE',
  apiVersion: '2024-10'
};

const PRODUCTS_JSON_PATH = path.join(__dirname, '../public/products.json');

async function fetchShopifyCollections() {
  console.log('🚀 Buscando coleções MASCULINO e FEMININO do Shopify...');
  
  const query = `
    query getCollections {
      collections(first: 10, query: "title:MASCULINO OR title:FEMININO") {
        edges {
          node {
            id
            title
            handle
            products(first: 250) {
              edges {
                node {
                  id
                  title
                  handle
                  descriptionHtml
                  vendor
                  productType
                  featuredImage {
                    url(transform: {maxWidth: 400, maxHeight: 300, crop: CENTER})
                  }
                  priceRangeV2 {
                    minVariantPrice {
                      amount
                    }
                  }
                  tags
                  status
                  variants(first: 1) {
                    edges {
                      node {
                        sku
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  try {
    console.log('🔄 Buscando coleções da loja Shopify...');
    const response = await fetch(
      `https://${SHOPIFY_CONFIG.store}/admin/api/${SHOPIFY_CONFIG.apiVersion}/graphql.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/graphql',
          'X-Shopify-Access-Token': SHOPIFY_CONFIG.accessToken,
        },
        body: query,
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Shopify API error: ${response.status} ${response.statusText} - ${errorBody}`);
    }

    const data = await response.json();
    const collections = data.data.collections.edges.map(edge => edge.node);
    
    console.log(`✅ Encontradas ${collections.length} coleções:`);
    collections.forEach(collection => {
      console.log(`   • ${collection.title} (${collection.products.edges.length} produtos)`);
    });
    
    return collections;
  } catch (error) {
    console.error('❌ Erro ao buscar coleções do Shopify:', error);
    return [];
  }
}

function determineGenderFromCollection(collectionTitle) {
  const title = collectionTitle.toUpperCase();
  if (title.includes('MASCULINO') || title.includes('MALE') || title.includes('MEN')) {
    return 'M';
  }
  if (title.includes('FEMININO') || title.includes('FEMALE') || title.includes('WOMEN')) {
    return 'F';
  }
  return 'U'; // Unissex
}

function inferGenderFromTitle(title, tags) {
  const lowerTitle = title.toLowerCase();
  const lowerTags = tags.map(tag => tag.toLowerCase());

  if (lowerTitle.includes('masculino') || lowerTags.includes('masculino') || lowerTags.includes('men')) {
    return 'M';
  }
  if (lowerTitle.includes('feminino') || lowerTags.includes('feminino') || lowerTags.includes('women')) {
    return 'F';
  }
  return 'U'; // Unissex or unknown
}

function generateProductAttributes(product, collectionGender) {
  // Usar o gênero da coleção como prioridade
  const gender = collectionGender !== 'U' ? collectionGender : inferGenderFromTitle(product.title, product.tags);
  
  // Gerar atributos baseados no título e tags
  const title = product.title.toLowerCase();
  const tags = product.tags.map(tag => tag.toLowerCase());
  
  // Determinar família olfativa baseada em palavras-chave
  let olfactoryFamily = 'fresh';
  if (title.includes('floral') || title.includes('rose') || title.includes('jasmine')) {
    olfactoryFamily = 'floral';
  } else if (title.includes('woody') || title.includes('sandal') || title.includes('cedar')) {
    olfactoryFamily = 'woody';
  } else if (title.includes('oriental') || title.includes('vanilla') || title.includes('amber')) {
    olfactoryFamily = 'oriental';
  } else if (title.includes('citrus') || title.includes('lemon') || title.includes('bergamot')) {
    olfactoryFamily = 'citrus';
  } else if (title.includes('fruity') || title.includes('fruit') || title.includes('peach')) {
    olfactoryFamily = 'fruity';
  }
  
  // Determinar intensidade baseada no tipo de produto
  let intensity = 'moderate';
  if (title.includes('eau de toilette') || title.includes('edt')) {
    intensity = 'light';
  } else if (title.includes('eau de parfum') || title.includes('edp')) {
    intensity = 'moderate';
  } else if (title.includes('parfum') || title.includes('extrait')) {
    intensity = 'strong';
  }
  
  // Determinar ocasiões baseadas no gênero e características
  let occasions = ['daily'];
  if (gender === 'M') {
    occasions = ['daily', 'work'];
  } else if (gender === 'F') {
    occasions = ['daily', 'special'];
  }
  
  // Determinar período do dia
  let timeOfDay = ['all-day'];
  if (intensity === 'light') {
    timeOfDay = ['morning', 'afternoon'];
  } else if (intensity === 'strong') {
    timeOfDay = ['evening'];
  }
  
  // Determinar estação baseada na família olfativa
  let season = ['all-seasons'];
  if (olfactoryFamily === 'citrus' || olfactoryFamily === 'fresh') {
    season = ['spring', 'summer'];
  } else if (olfactoryFamily === 'woody' || olfactoryFamily === 'oriental') {
    season = ['autumn', 'winter'];
  }
  
  // Gerar notas baseadas na família olfativa
  let topNotes = [];
  let heartNotes = [];
  let baseNotes = [];
  
  if (olfactoryFamily === 'floral') {
    topNotes = ['bergamota', 'rosa'];
    heartNotes = ['jasmim', 'lírio-do-vale'];
    baseNotes = ['patchouli', 'almíscar'];
  } else if (olfactoryFamily === 'woody') {
    topNotes = ['cedro', 'vetiver'];
    heartNotes = ['sândalo', 'cedro'];
    baseNotes = ['âmbar', 'baunilha'];
  } else if (olfactoryFamily === 'oriental') {
    topNotes = ['baunilha', 'canela'];
    heartNotes = ['âmbar', 'jasmim'];
    baseNotes = ['sândalo', 'almíscar'];
  } else if (olfactoryFamily === 'citrus') {
    topNotes = ['limão', 'bergamota'];
    heartNotes = ['laranja', 'grapefruit'];
    baseNotes = ['cedro', 'vetiver'];
  } else if (olfactoryFamily === 'fruity') {
    topNotes = ['pêssego', 'maçã'];
    heartNotes = ['frutas vermelhas', 'pêra'];
    baseNotes = ['baunilha', 'caramelo'];
  } else {
    topNotes = ['bergamota', 'limão'];
    heartNotes = ['jasmim', 'rosa'];
    baseNotes = ['sândalo', 'almíscar'];
  }
  
  return {
    gender,
    olfactory_family: olfactoryFamily,
    intensity,
    occasions,
    time_of_day: timeOfDay,
    season,
    top_notes: topNotes,
    heart_notes: heartNotes,
    base_notes: baseNotes
  };
}

async function updateProductsFromCollections() {
  const collections = await fetchShopifyCollections();
  if (collections.length === 0) {
    console.log('Nenhuma coleção encontrada no Shopify para atualização.');
    return;
  }

  let allProducts = [];
  
  // Processar cada coleção
  for (const collection of collections) {
    const collectionGender = determineGenderFromCollection(collection.title);
    console.log(`\n📦 Processando coleção: ${collection.title} (Gênero: ${collectionGender})`);
    
    const products = collection.products.edges.map(edge => {
      const product = edge.node;
      const attributes = generateProductAttributes(product, collectionGender);
      
      
      return {
        id: product.id,
        name: product.title,
        brand: product.vendor,
        description: product.descriptionHtml.replace(/<[^>]*>?/gm, ''),
        price: parseFloat(product.priceRangeV2.minVariantPrice.amount),
        image: product.featuredImage ? product.featuredImage.url : 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=300&fit=crop',
        product_url: `https://floryn.com.br/products/${product.handle}`,
        category: product.productType || 'perfume',
        occasions: attributes.occasions,
        time_of_day: attributes.time_of_day,
        olfactory_family: attributes.olfactory_family,
        intensity: attributes.intensity,
        season: attributes.season,
        top_notes: attributes.top_notes,
        heart_notes: attributes.heart_notes,
        base_notes: attributes.base_notes,
        gender: attributes.gender,
        available: product.status === 'ACTIVE',
        rating: 4.0 + Math.random() * 1.0, // Rating entre 4.0 e 5.0
        reviews: Math.floor(Math.random() * 200) + 10 // Reviews entre 10 e 210
      };
    });
    
    allProducts = [...allProducts, ...products];
    console.log(`   ✅ ${products.length} produtos processados`);
  }

  // Salvar produtos atualizados
  fs.writeFileSync(PRODUCTS_JSON_PATH, JSON.stringify(allProducts, null, 2), 'utf8');
  console.log(`\n✅ Arquivo products.json atualizado com produtos das coleções!`);
  console.log(`📊 Total de produtos: ${allProducts.length}`);
  
  // Estatísticas por gênero
  const genderStats = allProducts.reduce((acc, product) => {
    acc[product.gender] = (acc[product.gender] || 0) + 1;
    return acc;
  }, {});
  
  console.log('\n📈 Estatísticas por gênero:');
  Object.entries(genderStats).forEach(([gender, count]) => {
    const genderName = gender === 'M' ? 'Masculino' : gender === 'F' ? 'Feminino' : 'Unissex';
    console.log(`   • ${genderName}: ${count} produtos`);
  });
  
  // Estatísticas por família olfativa
  const familyStats = allProducts.reduce((acc, product) => {
    acc[product.olfactory_family] = (acc[product.olfactory_family] || 0) + 1;
    return acc;
  }, {});
  
  console.log('\n🌸 Estatísticas por família olfativa:');
  Object.entries(familyStats).forEach(([family, count]) => {
    console.log(`   • ${family}: ${count} produtos`);
  });
}

updateProductsFromCollections();
