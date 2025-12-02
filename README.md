# RPG Browser Game

Um jogo RPG em browser com tema medieval, desenvolvido com Next.js, TypeScript e Tailwind CSS.

## 🎮 Características

- **Sistema de Autenticação**: Login e registro com armazenamento em JSON
- **Interface Moderna**: Design responsivo com paleta de cores personalizada
- **Sistema de Personagem**: Níveis, experiência, atributos e recursos
- **Módulos do Jogo**: 
  - Personagem (stats, health, mana)
  - Inventário
  - Batalhas (PvE e PvP)
  - Sistema de Guilds
  - Mercado de Trading
  - Mapa do Mundo

## 🚀 Tecnologias

- **Next.js 15** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Lucide React** - Ícones
- **Context API** - Gerenciamento de estado

## 📦 Instalação

1. Clone o repositório:
```bash
git clone <repository-url>
cd SiteRPG
```

2. Instale as dependências:
```bash
npm install
```

3. Execute o servidor de desenvolvimento:
```bash
npm run dev
```

4. Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

## 🎨 Paleta de Cores

O projeto utiliza uma paleta de cores personalizada:

- **Verde**: #4CAF50
- **Azul**: #2196F3
- **Laranja**: #FF9800
- **Roxo**: #9C27B0
- **Rosa**: #E91E63
- **Amarelo**: #FFEB3B
- **Ciano**: #00BCD4
- **Marrom**: #795548
- **Azul Cinza**: #607D8B
- **Laranja Escuro**: #FF5722

## 📁 Estrutura do Projeto

```
src/
├── app/
│   ├── game/
│   │   └── page.tsx          # Página principal do jogo
│   ├── globals.css           # Estilos globais
│   ├── layout.tsx            # Layout principal
│   └── page.tsx              # Página inicial
├── components/
│   └── AuthModal.tsx         # Modal de autenticação
├── contexts/
│   └── AuthContext.tsx       # Contexto de autenticação
├── lib/
│   └── auth.ts              # Funções de autenticação
└── types/
    └── user.ts              # Tipos TypeScript
```

## 🔐 Sistema de Autenticação

O sistema de autenticação utiliza:

- **Armazenamento**: Arquivo JSON (`data/users.json`)
- **Hash de Senha**: SHA-256
- **Sessão**: LocalStorage
- **Validação**: Email único, nickname único

### Funcionalidades:
- Registro de usuário
- Login
- Logout
- Persistência de sessão
- Validação de dados

## 🎯 Próximas Funcionalidades

- [ ] Sistema de batalhas PvE
- [ ] Sistema de batalhas PvP
- [ ] Sistema de guilds completo
- [ ] Mercado de trading
- [ ] Sistema de inventário
- [ ] Mapa do mundo interativo
- [ ] Sistema de crafting
- [ ] Chat global
- [ ] Sistema de conquistas
- [ ] Rankings e leaderboards

## 🛠️ Scripts Disponíveis

- `npm run dev` - Executa o servidor de desenvolvimento
- `npm run build` - Constrói o projeto para produção
- `npm run start` - Executa o servidor de produção
- `npm run lint` - Executa o linter

## 📝 Licença

Este projeto está sob a licença MIT.

## 🤝 Contribuição

Contribuições são bem-vindas! Por favor, abra uma issue ou pull request.

---

**Desenvolvido com ❤️ para a comunidade RPG**
