# VitalSync

VitalSync is a Phase 1 MVP application designed to bridge the gap between primary healthcare seekers and their caretakers. It focuses on medication adherence tracking and synchronization.

## Features

- **Medicine Management**: Add medicines with specific dosages, instructions, and schedule times.
- **Daily Timeline**: View and track daily medication schedules.
- **Adherence History**: Monitor past adherence with statistics and statuses (Taken/Skipped).
- **Caretaker Dashboard**: Allow caretakers to monitor the adherence and activity of their linked primary users.
- **Cloud Database**: Powered by MongoDB Atlas for persistent, accessible data.
- **Expo SDK 54**: Built with the latest Expo features for a smooth mobile experience.

## Tech Stack

- **Frontend**: React Native, Expo, React Navigation, Axios.
- **Backend**: Node.js, Express, MongoDB (Atlas), JWT Authentication.

## Getting Started

### Prerequisites

- Node.js (v20+)
- Expo Go app on your mobile device

### Installation

1. Clone the repository:
   ```bash
   git clone git@github.com:RiyaBhurse/VitalSync.git
   ```

2. Setup Backend:
   ```bash
   cd backend
   npm install
   # Create a .env file with PORT, MONGO_URI, and JWT_SECRET
   npm run dev
   ```

3. Setup Frontend:
   ```bash
   cd frontend
   npm install
   # Update src/services/api.js with your local LAN IP or production URL
   npx expo start
   ```

## License

This project is licensed under the MIT License.
