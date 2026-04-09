# Crumbleivable! Cookie Shop

A fully-featured e-commerce website for a cookie shop based in Wahran (Oran), Algeria.

## Features

- 🍪 **Product Catalog** - Browse cookies and pre-made boxes
- 📦 **Box Builder** - Create custom boxes with 3+ cookies
- 🛒 **Cart with 3-Cookie Minimum** - Enforced at domain level
- 📝 **Optional Notes** - Cooking and gift notes at checkout
- 📲 **Telegram Notifications** - Orders sent directly to owner
- ⏱️ **Weekly Drop** - Scheduled cookie reveals with countdown
- 🗳️ **Community Vote** - Customers vote for returning flavors
- 📊 **Admin Dashboard** - Full management interface

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4
- **State:** Redux Toolkit
- **Database:** Supabase (Postgres)
- **ORM:** Drizzle ORM
- **Auth:** NextAuth.js v5
- **Animation:** Framer Motion
- **Icons:** Lucide React

## Getting Started

### Prerequisites

- Node.js 20+
- Supabase account
- Telegram bot (for order notifications)

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local

# Set up your environment variables in .env.local
```

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://..."
SUPABASE_URL="https://..."
SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."

# Telegram
TELEGRAM_BOT_TOKEN="..."
TELEGRAM_CHAT_ID="..."

# Auth
NEXTAUTH_SECRET="..."
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="[bcrypt-hash]"

# Feature Flags
NEXT_PUBLIC_FEATURE_WEEKLY_DROP="true"
NEXT_PUBLIC_FEATURE_VOTE="true"
NEXT_PUBLIC_FEATURE_CUSTOM_BUILDER="true"
NEXT_PUBLIC_FEATURE_ANALYTICS="true"
```

### Database Setup

```bash
# Generate migrations
npm run db:generate

# Run migrations
npm run db:migrate

# Open Drizzle Studio
npm run db:studio
```

### Running Locally

```bash
# Development
npm run dev

# Build
npm run build

# Start production
npm start
```

## Project Structure

```
cookie-shop/
├── app/                    # Next.js App Router
│   ├── (routes)/          # Page routes
│   ├── api/               # API routes
│   └── layout.tsx         # Root layout
├── src/
│   ├── domain/            # Domain layer (entities, rules)
│   ├── application/       # Application layer (use cases)
│   ├── infrastructure/    # Infrastructure layer (db, auth)
│   └── presentation/      # Presentation layer (components, store)
├── tests/                 # Test files
└── public/               # Static assets
```

## Clean Architecture

This project follows Clean Architecture principles:

1. **Domain Layer** - Business entities and rules
2. **Application Layer** - Use cases and business logic
3. **Infrastructure Layer** - External concerns (DB, auth, storage)
4. **Presentation Layer** - UI components and state management

## Feature Flags

Optional features can be disabled via environment variables:

| Feature | Variable | Default |
|---------|----------|---------|
| Weekly Drop | `NEXT_PUBLIC_FEATURE_WEEKLY_DROP` | `true` |
| Vote | `NEXT_PUBLIC_FEATURE_VOTE` | `true` |
| Custom Builder | `NEXT_PUBLIC_FEATURE_CUSTOM_BUILDER` | `true` |
| Analytics | `NEXT_PUBLIC_FEATURE_ANALYTICS` | `true` |

## License

© 2026 Crumbleivable! All rights reserved.
# crumbleivable
