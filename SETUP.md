# Love Diary — Setup Guide

## 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable **Authentication** → Sign-in method → **Email/Password**
4. Enable **Firestore Database** (start in production mode)

## 2. Get Firebase Config

In Firebase Console → Project Settings → Your apps → Add Web App.
Copy the config object and paste it into:

```
src/environments/environment.ts
```

Replace the placeholder values with your actual Firebase config.

## 3. Create Firestore Indexes

The app requires composite indexes. Firebase will show error links in the browser console on first run — click them to auto-create the indexes. You'll need:

- `diaryEntries`: `coupleId` ASC + `date` DESC
- `diaryEntries`: `coupleId` ASC + `authorId` ASC + `date` ASC

## 4. Run the App

```bash
npm install
npm start
```

Open [http://localhost:4200](http://localhost:4200)
