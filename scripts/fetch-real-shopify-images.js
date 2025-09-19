const fs = require('fs');
const path = require('path');

// Configurações da API do Shopify
const SHOPIFY_CONFIG = {
  store: process.env.SHOPIFY_STORE || 'xa1x0n-8d.myshopify.com',
  accessToken: process.env.SHOPIFY_ACCESS_TOKEN || 'YOUR_ACCESS_TOKEN_HERE',
  apiVersion: '2024-10'
};

// Query GraphQL para buscar produtos com imagens
const PRODUCTS_QUERY = `
  query GetProductsWithImages($first: Int!) {
    products(first: $first) {
      edges {
        node {
          id
          title
          handle
          description
          productType
          vendor
          priceRangeV2 {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 1) {
            edges {
              node {
                url(transform: {maxWidth: 400, maxHeight: 300})
                altText
              }
            }
          }
          variants(first: 1) {
            edges {
              node {
                id
                title
                price
                availableForSale
              }
            }
          }
        }
      }
    }
  }
`;

// Função para fazer requisição à API do Shopify
async function fetchFromShopify(query, variables = {}) {
  const url = `https://${SHOPIFY_CONFIG.store}/admin/api/${SHOPIFY_CONFIG.apiVersion}/graphql.json`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': SHOPIFY_CONFIG.accessToken,
      },
      body: JSON.stringify({ query, variables }),
    });

    const data = await response.json();
    
    if (data.errors) {
      console.error('❌ Erro na API do Shopify:', data.errors);
      return null;
    }

    return data.data;
  } catch (error) {
    console.error('❌ Erro ao conectar com Shopify:', error.message);
    return null;
  }
}

// Função para buscar todos os produtos com imagens
async function fetchAllProducts() {
  console.log('🔄 Buscando produtos da loja Shopify...');
  
  const allProducts = [];
  let hasNextPage = true;
  let cursor = null;
  
  while (hasNextPage) {
    const query = `
      query GetProductsWithImages($first: Int!, $after: String) {
        products(first: $first, after: $after) {
          edges {
            node {
              id
              title
              handle
              description
              productType
              vendor
              priceRangeV2 {
                minVariantPrice {
                  amount
                  currencyCode
                }
              }
              images(first: 1) {
                edges {
                  node {
                    url(transform: {maxWidth: 400, maxHeight: 300})
                    altText
                  }
                }
              }
              variants(first: 1) {
                edges {
                  node {
                    id
                    title
                    price
                    availableForSale
                  }
                }
              }
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    `;
    
    const variables = {
      first: 50,
      after: cursor
    };
    
    const data = await fetchFromShopify(query, variables);
    
    if (!data) {
      break;
    }
    
    const products = data.products.edges.map(edge => ({
      id: edge.node.id,
      title: edge.node.title,
      handle: edge.node.handle,
      description: edge.node.description,
      productType: edge.node.productType,
      vendor: edge.node.vendor,
      price: parseFloat(edge.node.priceRangeV2.minVariantPrice.amount),
      currency: edge.node.priceRangeV2.minVariantPrice.currencyCode,
      image: edge.node.images.edges[0]?.node?.url || null,
      altText: edge.node.images.edges[0]?.node?.altText || null,
      available: edge.node.variants.edges[0]?.node?.availableForSale || false
    }));
    
    allProducts.push(...products);
    
    hasNextPage = data.products.pageInfo.hasNextPage;
    cursor = data.products.pageInfo.endCursor;
    
    console.log(`✅ Buscados ${products.length} produtos (Total: ${allProducts.length})`);
  }
  
  return allProducts;
}

// Função para mapear produtos do Shopify para o formato do products.json
function mapShopifyToProducts(shopifyProducts) {
  return shopifyProducts.map(product => {
    // Mapear gênero baseado no tipo de produto ou título
    let gender = 'U'; // Unissex por padrão
    if (product.title.toLowerCase().includes('for men') || 
        product.title.toLowerCase().includes('masculino') ||
        product.title.toLowerCase().includes('homme')) {
      gender = 'M';
    } else if (product.title.toLowerCase().includes('for women') || 
               product.title.toLowerCase().includes('feminino') ||
               product.title.toLowerCase().includes('femme')) {
      gender = 'F';
    }
    
    // Mapear família olfativa baseada no tipo de produto
    let olfactoryFamily = 'floral';
    if (product.productType) {
      const type = product.productType.toLowerCase();
      if (type.includes('woody') || type.includes('amadeirado')) {
        olfactoryFamily = 'woody';
      } else if (type.includes('oriental')) {
        olfactoryFamily = 'oriental';
      } else if (type.includes('citrus') || type.includes('cítrico')) {
        olfactoryFamily = 'citrus';
      } else if (type.includes('fresh') || type.includes('fresco')) {
        olfactoryFamily = 'fresh';
      } else if (type.includes('fruity') || type.includes('frutado')) {
        olfactoryFamily = 'fruity';
      }
    }
    
    return {
      id: product.id.split('/').pop(), // Extrair ID numérico
      name: product.title,
      brand: product.vendor,
      description: product.description || `Fragrância ${product.vendor} de alta qualidade.`,
      price: product.price,
      image: product.image || 'https://images.unsplash.com/photo-1594736797933-d0c29c0b0c8b?w=400&h=300&fit=crop&q=80',
      product_url: `https://floryn.com.br/products/${product.handle}`,
      category: olfactoryFamily,
      occasions: ['daily', 'special'], // Padrão
      time_of_day: ['all-day'], // Padrão
      olfactory_family: olfactoryFamily,
      intensity: 'moderate', // Padrão
      season: ['all-seasons'], // Padrão
      top_notes: ['bergamota', 'limão'], // Padrão
      heart_notes: ['jasmim', 'rosa'], // Padrão
      base_notes: ['sândalo', 'âmbar'], // Padrão
      gender: gender,
      available: product.available,
      rating: 4.5, // Padrão
      reviews: Math.floor(Math.random() * 200) + 50 // Simulado
    };
  });
}

// Função principal para atualizar products.json
async function updateProductsWithRealImages() {
  console.log('🚀 Iniciando busca de imagens reais do Shopify...');
  
  try {
    // Buscar produtos do Shopify
    const shopifyProducts = await fetchAllProducts();
    
    if (!shopifyProducts || shopifyProducts.length === 0) {
      console.log('❌ Nenhum produto encontrado no Shopify');
      return;
    }
    
    console.log(`✅ Encontrados ${shopifyProducts.length} produtos no Shopify`);
    
    // Mapear para o formato do products.json
    const mappedProducts = mapShopifyToProducts(shopifyProducts);
    
    // Salvar no arquivo products.json
    const productsPath = path.join(__dirname, '../public/products.json');
    fs.writeFileSync(productsPath, JSON.stringify(mappedProducts, null, 2));
    
    console.log('✅ Arquivo products.json atualizado com produtos reais do Shopify!');
    console.log(`📊 Total de produtos atualizados: ${mappedProducts.length}`);
    
    // Mostrar alguns exemplos
    console.log('\n📋 Exemplos de produtos atualizados:');
    mappedProducts.slice(0, 3).forEach(product => {
      console.log(`   • ${product.name} - ${product.brand} - R$ ${product.price}`);
      console.log(`     Imagem: ${product.image ? '✅' : '❌'}`);
    });
    
  } catch (error) {
    console.error('❌ Erro ao atualizar produtos:', error.message);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  updateProductsWithRealImages();
}

module.exports = { 
  fetchFromShopify, 
  fetchAllProducts, 
  mapShopifyToProducts, 
  updateProductsWithRealImages 
};
