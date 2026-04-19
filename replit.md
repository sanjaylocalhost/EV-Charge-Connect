# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Artifacts

### EV Charging Mobile App (`artifacts/ev-charging`)
- **Type**: Expo (React Native) mobile app
- **Purpose**: Customer-facing EV charging app for India
- **Key Features**:
  - Login/Signup with user profile management
  - Vehicle selection: Car or Bike with specific models (12 car models, 10 bike models)
  - Nearby EV charging stations list with filter by vehicle type
  - Live map view (native only, web shows fallback)
  - Station detail with port availability, pricing, power info
  - Charging session tracking with timer and live energy/cost display
  - Payment screen: Wallet, UPI (GPay/PhonePe/Paytm), QR Code, Debit/Credit Card
  - Wallet top-up and session history
  - User profile with editable name/phone
- **State**: AsyncStorage (local persistence, no backend needed)
- **Packages**: @react-native-async-storage/async-storage, react-native-maps@1.18.0, expo-linear-gradient
- **Metro config**: Custom resolver to stub react-native-maps on web

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
