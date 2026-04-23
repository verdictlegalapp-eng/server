# Required Credentials & Environment Variables

## Backend (`VerdictServer/.env`)

| Variable | Description |
| :--- | :--- |
| `PORT` | Server port (default: 5000) |
| `DB_NAME` | MySQL database name |
| `DB_USER` | MySQL database user |
| `DB_PASS` | MySQL database password |
| `DB_HOST` | MySQL database host |
| `JWT_SECRET` | Secret key for JWT signing |
| `FIREBASE_PROJECT_ID` | Firebase Project ID |
| `FIREBASE_CLIENT_EMAIL` | Firebase Service Account Email |
| `FIREBASE_PRIVATE_KEY` | Firebase Service Account Private Key (replace `\n` with actual newlines) |

## Frontend (`Verdict/.env`)

| Variable | Description |
| :--- | :--- |
| `EXPO_PUBLIC_API_URL` | Base URL of your backend (e.g., `http://localhost:5000` or production URL) |
| `EXPO_PUBLIC_FIREBASE_API_KEY` | Firebase Web API Key |
| `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain |
| `EXPO_PUBLIC_FIREBASE_PROJECT_ID` | Firebase Project ID |
| `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase Storage Bucket |
| `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging Sender ID |
| `EXPO_PUBLIC_FIREBASE_APP_ID` | Firebase App ID |
| `EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID` | Firebase Measurement ID (optional) |

### Note on Firebase Private Key
In the `.env` file, the private key should look like this:
`FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQ..."`
The code automatically handles the `\n` character replacement.

## Firebase Console Configuration

To make Phone Auth work, you must configure the following in the [Firebase Console](https://console.firebase.google.com/):

### 1. Enable Phone Authentication
- Go to **Authentication** -> **Sign-in method**.
- Click **Add new provider** and select **Phone**.
- Enable it and click **Save**.

### 2. Authorized Domains (for Recaptcha)
- Scroll down on the **Sign-in method** page to **Authorized domains**.
- Add your development and production domains (e.g., `localhost`, `127.0.0.1`).
- If using Expo Go/Tunnel, you may need to add the `expo.io` or `ngrok.io` domains if Recaptcha fails.

### 3. Test Phone Numbers
- You can add test phone numbers (e.g., `+91 9999999999` with code `123456`) in the Phone provider settings to test without sending real SMS.

### 4. Android SHA-1 Fingerprint (Crucial for Native)
- Go to **Project Settings** -> **General**.
- Under your Android app, add your **SHA-1 certificate fingerprint**. 
- You can get this by running `npx expo fetch:android:hashes` or from your local keystore.
