# Accevate Assignment (React Native + Expo)

This project is a 3-screen mobile app built using **React Native (Expo)** as part of the assignment.

## Features

✅ **Login Screen**
- Username + Password
- Calls Login API
- Stores returned **userId** for OTP step

✅ **OTP Verification Screen**
- 6-digit OTP input
- Calls OTP API with **userId + otp**
- Stores returned **token** securely using Expo SecureStore

✅ **Dashboard Screen**
- Uses token (Bearer) to access dashboard API
- Renders:
  - Carousel banners
  - Student stats
  - Fee summary
  - User details
- Applies **dynamic_color** from API to dashboard UI
- Refresh updates the color on every API hit
- Logout clears session securely

---

## Tech Stack
- Expo (React Native)
- TypeScript
- React Navigation (Native Stack)
- Axios
- Expo SecureStore (secure token storage)

---

## API Endpoints Used

Base URL:
`https://aapsuj.accevate.co/flutter-api`

- `POST /login.php`
- `POST /verify_otp.php`
- `POST /dashboard.php` (Authorization: Bearer token)

---

## How to Run Locally

### Install dependencies and Start the Expo dev server
```bash
npm install
npx expo start
