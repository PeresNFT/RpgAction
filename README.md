# RPG Browser Game

A medieval-themed browser RPG game built with Next.js, TypeScript, and Tailwind CSS.

## 🎮 Features

- **Authentication System**: Login and registration with Supabase database
- **Modern Interface**: Responsive design with custom color palette
- **Character System**: Levels, experience, attributes, and resources
- **Game Modules**: 
  - Character (stats, health, mana)
  - Inventory
  - Battles (PvE and PvP)
  - Guild System
  - Trading Market
  - World Map

## 🚀 Technologies

- **Next.js 15** - React Framework
- **TypeScript** - Static typing
- **Tailwind CSS** - Styling
- **Supabase** - PostgreSQL database
- **Lucide React** - Icons
- **Context API** - State management

## 📦 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd SiteRPG
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

4. Set up the database:
- Go to your Supabase project SQL Editor
- Run the SQL from `supabase/schema.sql`

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎨 Color Palette

The project uses a custom color palette:

- **Green**: #4CAF50
- **Blue**: #2196F3
- **Orange**: #FF9800
- **Purple**: #9C27B0
- **Pink**: #E91E63
- **Yellow**: #FFEB3B
- **Cyan**: #00BCD4
- **Brown**: #795548
- **Blue Gray**: #607D8B
- **Dark Orange**: #FF5722

## 📁 Project Structure

```
src/
├── app/
│   ├── game/
│   │   └── page.tsx          # Main game page
│   ├── api/
│   │   └── auth/             # API routes
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Main layout
│   └── page.tsx              # Home page
├── components/
│   ├── AuthModal.tsx         # Authentication modal
│   ├── PvPSystem.tsx         # PvP system component
│   └── ...                   # Other components
├── contexts/
│   └── AuthContext.tsx       # Authentication context
├── lib/
│   ├── auth.ts              # Authentication functions
│   ├── supabase.ts          # Supabase client
│   └── db-helpers.ts        # Database helpers
└── types/
    ├── user.ts              # User types
    └── game.ts              # Game types
```

## 🔐 Authentication System

The authentication system uses:

- **Storage**: Supabase PostgreSQL database
- **Password Hash**: SHA-256
- **Session**: LocalStorage
- **Validation**: Unique email, unique nickname

### Features:
- User registration
- Login
- Logout
- Session persistence
- Data validation

## 🎯 Upcoming Features

- [x] PvE battle system
- [x] PvP battle system
- [ ] Complete guild system
- [ ] Trading market
- [ ] Inventory system
- [ ] Interactive world map
- [ ] Crafting system
- [ ] Global chat
- [ ] Achievement system
- [ ] Rankings and leaderboards

## 🛠️ Available Scripts

- `npm run dev` - Run development server
- `npm run build` - Build for production
- `npm run start` - Run production server
- `npm run lint` - Run linter
- `npm run migrate:json-to-supabase` - Migrate data from JSON to Supabase

## 🚀 Deployment

This project is configured for deployment on Netlify. See `netlify.toml` for configuration.

Make sure to set environment variables in your deployment platform:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please open an issue or pull request.

---

**Developed with ❤️ for the RPG community**
