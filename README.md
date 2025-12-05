# RPG Browser Game

A medieval-themed browser RPG game built with Next.js, TypeScript, and Tailwind CSS.

## 🎮 Features

### Core Systems
- **Authentication System**: Login and registration with Supabase database
- **Character System**: Levels, experience, attributes, and resources
- **Inventory System**: Complete item management with stacking and organization
- **Equipment System**: Equip weapons, armor, and accessories
- **Skills System**: Learn and upgrade character skills with gold

### Combat Systems
- **PvE Battles**: Fight against monsters with turn-based combat
- **PvP System**: Battle other players, earn honor points, and climb rankings
- **PvP Rankings**: Iron, Bronze, Silver, Platinum tiers with leaderboards
- **Battle Logs**: Detailed combat history and damage calculations

### Social & Economy
- **Guild System**: Create/join guilds, manage members, contribute experience
- **Guild Icons**: 20 unique guild icons to choose from
- **Trading Market**: Player-to-player item trading system
- **NPC Shop**: Buy potions (health/mana) and exclusive profile images
- **Rest System**: Free HP/MP recovery with cooldown mechanics

### Collection & Resources
- **Collection Skills**: Agriculture, Mining, Fishing, Lumberjack
- **Resource Gathering**: Collect materials with timers and experience
- **Skill Progression**: Level up collection skills independently

### Customization
- **Profile Images**: Choose from character images or purchased profile pictures
- **Character Classes**: Warrior, Archer, Mage (male/female variants)
- **Dynamic Backgrounds**: Unique background images for each game section
- **Modern UI**: Transparent cards with beautiful gradients

### Visual Features
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark Theme**: Modern dark interface with custom color palette
- **Animated Backgrounds**: PNG/GIF backgrounds for each section
- **Item Images**: Visual representation for all items, potions, and resources
- **Modal System**: All modals close with ESC key

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
│   │   └── page.tsx          # Main game page with all systems
│   ├── api/
│   │   └── auth/             # API routes for game features
│   │       ├── buy-shop-item/
│   │       ├── create-guild/
│   │       ├── market/       # Trading system
│   │       ├── pvp-ranking/
│   │       ├── update-profile-image/
│   │       └── ...
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Main layout
│   └── page.tsx              # Home page
├── components/
│   ├── AuthModal.tsx         # Authentication modal
│   ├── PvPSystem.tsx         # PvP battle system
│   ├── GuildSystem.tsx       # Guild management
│   ├── MarketSystem.tsx      # Trading market & NPC shop
│   ├── ProfileImage.tsx      # Profile image component
│   ├── ClassSelection.tsx    # Character class selection
│   ├── AttributeDistribution.tsx
│   └── LevelUpAttributeDistribution.tsx
├── contexts/
│   └── AuthContext.tsx       # Authentication & game state context
├── data/
│   └── gameData.ts           # Game data (items, monsters, skills, etc.)
├── lib/
│   ├── auth.ts              # Authentication functions
│   ├── supabase.ts          # Supabase client
│   └── db-helpers.ts        # Database helpers
└── types/
    ├── user.ts              # User types
    └── game.ts              # Game types
```

## 🖼️ Image Assets

The project uses organized image assets:

- `public/images/characters/` - Character class images (Warrior, Archer, Mage)
- `public/images/profile/` - Profile picture options (profile1-4.png)
- `public/images/guild/` - Guild icons (guild1-20.png)
- `public/images/items/` - Item images (weapons, armor, potions)
- `public/images/background/` - Section backgrounds (BGperfil, BGmercado, etc.)
- `public/images/collection/` - Collection skill images
- `public/images/monsters/` - Monster images for battles

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

## 🎯 Game Systems

### Character Progression
- Level up system with experience points
- Attribute distribution (Strength, Magic, Dexterity, Agility, Vitality)
- Available points on level up
- Health and Mana management

### Inventory & Items
- Stackable items
- Item categories: Weapons, Armor, Consumables, Materials
- Item values and descriptions
- Visual item representation

### Combat
- Turn-based combat system
- Critical hits and dodges
- Skill usage in battles
- Battle logs and animations
- Monster variety with different levels

### PvP System
- Search for opponents
- Real-time PvP battles
- Honor points system
- Ranking tiers: Iron, Bronze, Silver, Platinum
- Global leaderboards

### Guild System
- Create and join guilds
- Guild management (description, icon)
- Member roles (member, officer, leader)
- Guild bank and contributions
- Guild rankings

### Market System
- Player-to-player trading
- List items for sale
- Buy items from other players
- NPC Shop with consumables and profile images
- Gold and Diamonds currency

### Collection System
- 4 collection skills: Agriculture, Mining, Fishing, Lumberjack
- Resource gathering with timers
- Skill leveling and experience
- Visual skill representation

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
