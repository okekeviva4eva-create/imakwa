# Imakwa

A React Native mobile application built with Expo and TypeScript.

## Project Overview

Imakwa is a mobile app project built using modern web technologies and cross-platform frameworks.

## Technologies Used

This project is built with:

- **React Native** - Cross-platform mobile framework
- **Expo** - Development platform and tooling for React Native
- **TypeScript** - Type-safe JavaScript
- **Expo Router** - Navigation and routing
- **AsyncStorage** - Local data persistence
- **TailwindCSS** - Utility-first CSS framework (via Nativewind)
- **Zustand** - State management
- **React Query** - Data fetching and caching
- **Supabase** - Backend and authentication
- **React Hook Form** - Form management
- **Zod** - Schema validation

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (optional, but recommended)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/okekeviva4eva-create/imakwa.git
   cd imakwa
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npx expo start
   ```

4. **Run on your device or emulator:**
   - **iOS:** Press `i` in the terminal or scan QR code with Camera app
   - **Android:** Press `a` in the terminal or scan QR code with Expo Go app
   - **Web:** Press `w` in the terminal

## Development

### Running on Different Platforms

**iOS:**
```bash
npm run ios
```

**Android:**
```bash
npm run android
```

**Web:**
```bash
npx expo start --web
```

### Code Quality

**Linting:**
```bash
npm run lint
```

**Code Formatting:**
```bash
npm run format
```

**Check format without modifying:**
```bash
npm run format:check
```

## Project Structure

```
imakwa/
├── app/              # Expo Router pages and layouts
├── components/       # Reusable UI components
├── lib/             # Utilities and helper functions
├── hooks/           # Custom React hooks
├── styles/          # Global styles and theme
├── package.json     # Dependencies and scripts
└── app.config.ts    # Expo configuration
```

## Features

- Cross-platform mobile app (iOS, Android, Web)
- Type-safe development with TypeScript
- Local data persistence with AsyncStorage
- Modern UI with TailwindCSS and Nativewind
- State management with Zustand
- Form handling with React Hook Form
- Real-time backend integration with Supabase

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions, please open an issue on GitHub or contact the project maintainers.

---

**Built with ❤️ using React Native and Expo**
