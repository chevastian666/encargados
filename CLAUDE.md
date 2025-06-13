# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm install` - Install dependencies
- `npm run dev` or `npm start` - Start development server (Vite)
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Code Quality
- No lint command configured (ESLint is available but no script)
- No test commands or testing framework

## Architecture Overview

This is a **Sistema de Precintado Aduanero** (Customs Sealing System) for the Port of Montevideo - a React SPA built with Vite.

### Key Architectural Patterns

1. **Mock API Service**: The app includes a comprehensive mock API (`src/services/api.service.js`) that simulates backend responses when the real API is unavailable. This allows development without backend dependencies.

2. **Real-time Updates**: WebSocket service (`src/services/websocket.service.js`) with automatic reconnection and message queuing for real-time notifications.

3. **Context-based State Management**:
   - `ConnectionContext` - Monitors API/WebSocket connectivity
   - `NotificationContext` - Manages application notifications

4. **View Components**: Major features are organized as modal views in `/components/views/`:
   - Dashboard - Overview and statistics
   - Mapa - Real-time truck tracking
   - Stock - Seal inventory management
   - TransitosPendientes - Pending transits
   - Alertas - System alerts
   - Camiones - Truck management
   - Desprecintar - Seal removal

### Technology Stack

- **React 18.2** with functional components and hooks
- **Vite 5.0** for fast development and building
- **Tailwind CSS 3.4** for styling
- **Lucide React** for icons
- No state management library (uses Context API)
- No routing library (single-page with modal navigation)

### Important Configuration

The main configuration is in `src/constants/config.js` which includes:
- API endpoints and WebSocket URLs
- Feature flags (offline mode, real-time updates)
- UI settings (themes, animations, pagination)
- Stock thresholds for inventory warnings
- Map settings for truck tracking

### Development Notes

1. **Environment Variables**: Use `VITE_` prefix for custom env vars
2. **Mock Data**: When API is unavailable, the app automatically falls back to mock data
3. **Dark Mode**: Supported with system preference detection
4. **No Tests**: Testing infrastructure is not set up
5. **Spanish Language**: UI and code comments are primarily in Spanish