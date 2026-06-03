# 🔥 Firebase Setup Guide

CholesTrack is pre-configured with Firebase v11 stubs. Follow these steps to connect your own production Firebase project.

## 1. Create a Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add Project** and follow the setup wizard.
3. Once created, click the **Web icon** (`</>`) to register a new web app.

## 2. Configure Auth (Google)
1. In the Firebase Sidebar, go to **Build > Authentication**.
2. Click **Get Started**.
3. Go to the **Sign-in method** tab.
4. Enable **Google**.
5. Configure your support email and click **Save**.

## 3. Configure Firestore (Database)
1. Go to **Build > Firestore Database**.
2. Click **Create Database**.
3. Choose a location and start in **Production mode** (or Test mode if you want to skip security rules for now).
4. Go to the **Rules** tab and ensure your rules allow authenticated users to read/write their own data:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId}/{document=**} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```

## 4. Update the Code
1. Copy your Firebase Config object from the Firebase Project Settings.
2. Open `app.js` and replace the `firebaseConfig` constant at the top:
   ```javascript
   const firebaseConfig = {
       apiKey: "YOUR_ACTUAL_KEY",
       authDomain: "your-app.firebaseapp.com",
       // ... etc
   };
   ```
3. Replace the **Mock Firebase Stubs** in `app.js` with the real Firebase SDK imports:
   ```html
   <!-- Add these to the <head> of index.html -->
   <script type="module">
     import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
     import { getAuth, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";
     import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

     // Initialize and export to global scope or refactor app.js to use modules
   </script>
   ```

## 5. Deployment
- **Firebase Hosting**:
  1. Install Firebase CLI: `npm install -g firebase-tools`.
  2. `firebase login`.
  3. `firebase init` (select Hosting).
  4. `firebase deploy`.
