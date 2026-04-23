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
| `EMAIL_HOST` | SMTP host (e.g., `smtp.hostinger.com`) |
| `EMAIL_PORT` | SMTP port (e.g., `465` for SSL) |
| `EMAIL_USER` | SMTP username (e.g., `contact@verdict.sbs`) |
| `EMAIL_PASS` | SMTP password (App Password recommended) |
| `EMAIL_FROM` | The "From" email address |

## Frontend (`Verdict/.env`)

| Variable | Description |
| :--- | :--- |
| `EXPO_PUBLIC_API_URL` | Base URL of your backend (e.g., `http://localhost:5000` or production URL) |

## Email Configuration (SMTP)

The application uses **Nodemailer** for sending OTPs. To set this up:
1. Ensure you have an active email account on Hostinger or any SMTP provider.
2. If using Gmail, you must use an **App Password**.
3. Update the `.env` variables listed above.

## Database Management

To synchronize the database schema (create tables):
```bash
# Run this from the VerdictServer directory
node scripts/sync-db.js
```

## Legacy Firebase Configuration

While the app has moved to Email OTP, some Firebase configuration remains for legacy support or future features:
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`

### Note on Firebase Private Key
In the `.env` file, the private key should look like this:
`FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQ..."`
The code automatically handles the `\n` character replacement.
