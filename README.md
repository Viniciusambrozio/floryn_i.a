# 🌸 Floryn I.A. - Sistema de Recomendação de Perfumes

Sistema inteligente de recomendação de perfumes baseado em IA, integrado com Shopify e desenvolvido com Next.js.

## ✨ Funcionalidades

- 🧠 **Quiz Interativo**: 6 perguntas personalizadas para entender as preferências do usuário
- 🎯 **Recomendações Inteligentes**: Sistema de IA que sugere perfumes baseado nas respostas
- 🛍️ **Integração Shopify**: Produtos reais da loja Floryn com imagens do CDN
- 👥 **Filtro de Gênero**: Produtos masculinos e femininos separados corretamente
- 📊 **Porcentagens Realistas**: Compatibilidade de 95%, 89% e 82%
- 💬 **Motivos Personalizados**: Explicações únicas para cada recomendação
- 📱 **Design Responsivo**: Interface moderna e mobile-first
- 🎨 **Animações Suaves**: Transições fluidas com Framer Motion

## 🚀 Tecnologias

- **Next.js 15** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Zustand** - Gerenciamento de estado
- **Framer Motion** - Animações
- **Shopify Admin API** - Integração com e-commerce
- **Lucide React** - Ícones

## 📦 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/Viniciusambrozio/floryn_i.a.git
cd floryn_i.a
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
# Crie um arquivo .env.local
SHOPIFY_STORE=xa1x0n-8d.myshopify.com
SHOPIFY_ACCESS_TOKEN=seu_token_aqui
```

4. Execute o servidor de desenvolvimento:
```bash
npm run dev
```

5. Acesse [http://localhost:3000/inicio](http://localhost:3000/inicio)

## 🛍️ Integração Shopify

O sistema está integrado com as coleções **MASCULINO** e **FEMININO** da loja Floryn:

- **22 produtos femininos** com gênero "F"
- **15 produtos masculinos** com gênero "M"
- **Atributos gerados automaticamente** baseados no título e tags
- **Imagens reais** do CDN do Shopify

## 🎯 Sistema de Recomendação

### Algoritmo de Scoring:
- **Ocasião**: 4 pontos
- **Família Olfativa**: 5 pontos (mais importante)
- **Intensidade**: 4 pontos
- **Período do Dia**: 3 pontos
- **Estação**: 3 pontos
- **Notas Favoritas**: 2 pontos
- **Preço**: 1 ponto
- **Avaliação**: 2 pontos

### Filtro de Gênero:
- Produtos masculinos (M) só aparecem para usuários masculinos
- Produtos femininos (F) só aparecem para usuários femininos
- Produtos unissex (U) aparecem para todos

## 📁 Estrutura do Projeto

```
src/
├── app/
│   └── inicio/
│       └── page.tsx          # Página principal
├── components/
│   ├── ProfileModal.tsx      # Modal de cadastro
│   ├── QuizFlow.tsx          # Fluxo do quiz
│   └── RecommendationResults.tsx # Resultados
├── hooks/
│   └── useHydration.ts       # Hook para hidratação
├── lib/
│   └── recommendation.ts     # Lógica de recomendação
├── store/
│   └── useAppStore.ts        # Store Zustand
└── types/
    └── index.ts              # Definições TypeScript
```

## 🔧 Scripts Disponíveis

- `npm run dev` - Servidor de desenvolvimento
- `npm run build` - Build de produção
- `npm run start` - Servidor de produção
- `node scripts/fetch-shopify-collections.js` - Atualizar produtos do Shopify

## 🌐 Deploy

O projeto está configurado para deploy na Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Viniciusambrozio/floryn_i.a)

## 📊 Analytics

O sistema inclui integração com Google Analytics 4 para rastreamento de:
- Visualizações de página
- Respostas do quiz
- Cliques em recomendações
- Conversões

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

**Vinícius Ambrozio**
- GitHub: [@Viniciusambrozio](https://github.com/Viniciusambrozio)
- Projeto: [floryn-i-a.vercel.app](https://floryn-i-a.vercel.app)

---

⭐ Se este projeto te ajudou, considere dar uma estrela no GitHub!