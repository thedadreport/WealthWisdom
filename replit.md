# FlowBudget - Personal Finance Management Application

## Overview

FlowBudget is a comprehensive personal finance management application built with a modern full-stack architecture. The application follows the "Conscious Spending Plan" philosophy, emphasizing automated financial management and psychology-based insights to help users build sustainable money habits.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management and caching
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI primitives with custom shadcn/ui components
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts for data visualization

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ESM modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **API Design**: RESTful endpoints with proper error handling
- **Validation**: Zod schemas shared between client and server

### Development Architecture
- **Monorepo Structure**: Shared types and schemas between client/server
- **Hot Module Replacement**: Vite HMR for fast development
- **Type Safety**: Full TypeScript coverage with strict configuration
- **Code Quality**: ESLint and Prettier (implied by project structure)

## Key Components

### Database Schema (`shared/schema.ts`)
The application uses a well-structured PostgreSQL schema with the following entities:

1. **Users**: Core user information including pay schedule and income
2. **Budgets**: User-specific budget allocation percentages following the conscious spending framework
3. **Transactions**: Financial transactions categorized by budget categories
4. **Goals**: Savings goals with progress tracking
5. **Automations**: Automated transfer rules for wealth building
6. **Insights**: Educational content and psychology-based financial tips

### Budget Framework
The application implements a structured budget allocation system:
- **Fixed Costs**: 50-60% (rent, utilities, insurance)
- **Investments**: 10-20% (401k, IRA, stocks)
- **Savings**: 5-10% (emergency fund, goals)
- **Guilt-Free Spending**: 20-35% (entertainment, dining, hobbies)

### Key Features
1. **Onboarding Flow**: Multi-step user setup with budget configuration
2. **Dashboard**: Comprehensive overview of financial health
3. **Transaction Management**: Easy expense tracking with categorization
4. **Goal Tracking**: Visual progress tracking for savings goals
5. **Cash Flow Analysis**: Pay period-based spending analysis
6. **Educational Content**: Psychology-based financial insights
7. **Responsive Design**: Mobile-first with dedicated mobile navigation

## Data Flow

### Client-Server Communication
1. **API Layer**: RESTful endpoints in `/api/*` routes
2. **Data Fetching**: TanStack Query for caching and synchronization
3. **Form Handling**: React Hook Form with Zod validation
4. **Error Handling**: Comprehensive error boundaries and toast notifications

### State Management
1. **Server State**: Managed by TanStack Query with automatic caching
2. **Form State**: React Hook Form for complex form interactions
3. **UI State**: React hooks for local component state
4. **Global State**: Minimal global state, primarily server-driven

### Data Storage
1. **Database**: PostgreSQL with Drizzle ORM for type-safe queries
2. **Migrations**: Drizzle Kit for database schema management
3. **Connection**: Neon Database serverless PostgreSQL
4. **Backup Strategy**: Handled by Neon Database infrastructure

## External Dependencies

### Core Dependencies
- **Database**: `@neondatabase/serverless` for PostgreSQL connectivity
- **ORM**: `drizzle-orm` and `drizzle-zod` for type-safe database operations
- **UI Framework**: Multiple `@radix-ui/*` packages for accessible components
- **State Management**: `@tanstack/react-query` for server state
- **Validation**: `zod` and `@hookform/resolvers` for form validation
- **Styling**: `tailwindcss` with `class-variance-authority` for component variants

### Development Dependencies
- **Build Tools**: `vite`, `esbuild`, `tsx` for development and building
- **TypeScript**: Full TypeScript support with strict configuration
- **Replit Integration**: `@replit/vite-plugin-*` for development environment

## Deployment Strategy

### Production Build
1. **Frontend**: Vite builds optimized static assets to `dist/public`
2. **Backend**: esbuild bundles server code to `dist/index.js`
3. **Database**: Migrations applied via `drizzle-kit push`

### Environment Configuration
- **Database**: `DATABASE_URL` environment variable required
- **Development**: `NODE_ENV=development` for development mode
- **Production**: `NODE_ENV=production` for production optimizations

### Deployment Process
1. Install dependencies: `npm install`
2. Build application: `npm run build`
3. Apply database migrations: `npm run db:push`
4. Start production server: `npm start`

## Changelog

```
Changelog:
- July 06, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```