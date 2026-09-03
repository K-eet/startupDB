# Local admin credentials (never committed)

`firebase-admin` uses `applicationDefault()`. On App Hosting the credential is
provided automatically; locally it reads `GOOGLE_APPLICATION_CREDENTIALS`, which
`.env.local` points at `service-account.json` in this folder.

## One-time setup to test admin/login locally

1. Firebase Console → ⚙ Project settings → **Service accounts**.
2. **Generate new private key** → downloads a JSON file.
3. Save it here as `service-account.json` (this whole folder is gitignored),
   and make sure `GOOGLE_APPLICATION_CREDENTIALS` in `.env.local` points at it.
4. `npm run dev`, open http://localhost:9002, log in with an email listed in
   `ADMIN_EMAILS`.

The browser logs into the real Firebase Auth project; the local server verifies
that token with the service account and checks it against `ADMIN_EMAILS`.

⚠️ A service account key grants full project access. Keep it off git and out of
screenshots.
