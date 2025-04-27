# MindfulMe

MindfulMe is an AI-powered mindfulness and wellness mobile app designed to help users track their moods, reflect through journaling, access meditation exercises, and receive empathetic support through an AI wellness coach. Built with React Native (Expo), Supabase, and LLM APIs, it offers a cross-platform, seamless, and emotionally intelligent experience.

## Features

- Landing Screen
  - Personalized greeting with daily quotes and quick action buttons.
- Mindfulness Dashboard
  - 7-day mood trends, journaling activity stats, mindful minutes breakdown, AI interaction summaries, live health metrics.
- Mood Logging
  - Emoji-based mood selection carousel, intensity slider, symptom tagging, AI-generated reflections, and quotes.
- Daily Journal
  - Mood-based journal prompt suggestions, speech-to-text journaling, privacy locks, and AI insights.
- AI Wellness Coach
  - 1:1 empathetic chat powered by a free LLM API, persistent chat history with positive psychology prompts.
- Guided Meditation & Breathing
  - Mindful breathing and body scan sessions with audio controls and progress tracking.
- Session Booking
  - Book, view, and cancel therapy sessions with local caching.
- Profile & Settings
  - Manage profile details, avatar images, privacy settings, and logout securely.
- Onboarding & Authentication
  - Multi-slide onboarding flow, Supabase email/password sign-up & login, with demo test account option.
- AI-Generated Imagery
  - Dynamic onboarding backgrounds, avatars, and meditation visuals fetched from an AI image API.
- Health Integration
  - Step count and heart rate metrics fetched from HealthKit (iOS) and Google Fit (Android).
- Analytics & Tracking
  - In-app event tracking for dashboard streaks, trends, and engagement metrics.

## Tech Stack

- Frontend: React Native (Expo) + TypeScript
- Backend: Supabase (PostgreSQL + Authentication + Storage)
- AI & Imagery:
  - Free LLM API (https://api.a0.dev/ai/llm)
  - AI Image Generation API (https://api.a0.dev/assets/image)
- Health Integration: Expo HealthKit/Google Fit APIs
- State Persistence: AsyncStorage (local caching)
- Navigation: React Navigation (native-stack + tabs)
- UI/UX: Centralized theming with custom typography and color tokens
- Analytics: Local event tracking system using AsyncStorage
- Audio Playback: expo-av for meditation session audios

## Project Structure

```
/assets              # Static assets (images, sounds)
/components          # Reusable UI components (MoodPicker, JournalCard, WellnessCoach, etc.)
/screens             # Screens (Home, MoodPickerScreen, JournalScreen, DashboardScreen, etc.)
/utils               # Services and helpers (Supabase client, HealthKit service, storage utils)
App.tsx              # Main entry point, Navigation setup
package.json         # Project configuration and dependencies
```

## Key AI Features

- Mood Detection from Face (optional) using camera and LLM-based classification.
- AI Wellness Coach conversational support for mental wellbeing.
- Journal Prompt Suggestions based on user's selected mood.
- Dynamic Avatars and Meditation Backgrounds via AI-generated images.

## How to Run Locally

```bash
# 1. Clone the repository
git clone https://github.com/ManojV136/Mindful-Me.git

# 2. Navigate to project folder
cd Mindful-Me

# 3. Install dependencies
npm install

# 4. Start the Expo server
npx expo start
```

You can scan the QR code using the Expo Go App on iOS/Android or run on simulators.

## Notes

- A `.env` file is used locally to store API URLs if needed.
- Personal Access Token (PAT) used for GitHub interactions.
- HealthKit access requires device permissions (iOS Physical Device / Android).

## Future Enhancements

- Video-based mindfulness therapy sessions.
- In-depth mood forecasting using AI models.
- Community support groups integration.
- Enhanced streak/badge rewards for habit building.

## Contributing

Contributions are welcome! If you'd like to propose improvements, fixes, or new features, feel free to fork the repository and submit a Pull Request.

## License

This project is licensed under the MIT License. Copyright (c) 2025 Texas A&M University-Corpus Christi. See the LICENSE file for details.

> Made with care and mindfulness by ManojV136.
