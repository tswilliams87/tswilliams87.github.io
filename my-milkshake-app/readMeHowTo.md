# Milkshake App

A serverless, full-stack dating/profile swiping app built with AWS Amplify, Cognito, API Gateway, Lambda, DynamoDB, and S3 — styled and deployed with a Vite frontend.

---

## ✅ Phase Completion

### Phase 1: Session Handling (✔ Complete)
- AWS Cognito User Pools for auth
- Identity Pools for temporary IAM access
- Sign Up, Confirm, Sign In, and Sign Out all implemented
- Sessions managed across all pages using `Auth.currentAuthenticatedUser()`
- `id` (Cognito `sub`) is used as the unique identifier in DynamoDB

### Phase 2: UI / Styling (⏳ In Progress)
- Fully working `carousel.html` swiping page
- Picture rendering using S3 key access
- Responsive design adapting to mobile and desktop
- Navigation bar with sign-out on every page
- Stable layout regardless of picture size

### Phase 3: Security & Privacy (🛠️ Upcoming)
- Lock down S3 image access (private or per-user signed URLs)
- Harden API endpoints to prevent enumeration
- Add visibility filters (only show select user profiles)

---

## 🧠 Architecture: High-Level Data Flow

### Frontend
- Built with **Vite** + Vanilla HTML/CSS/JS
- Pages use `<script type="module">` to import from:
  - `main.js` — profile creation, image upload
  - `api.js` — profile listing, update API calls
- User session handled by `@aws-amplify/auth`

### Backend
1. **API Gateway** routes:
   - `/profiles` (GET, POST)
   - `/profiles/user/{id}` (GET, PUT)
2. **Lambda** function `lambdaIndex.mjs`:
   - Contains all routes via `event.path`
   - Calls DynamoDB via `@aws-sdk/client-dynamodb`
3. **DynamoDB Table (`milkshake-users`)**:
   - Primary key: `id` (Cognito sub)
   - Stores: `name`, `favoriteThing`, `email`, `filename`, `picture`
4. **S3 Bucket (`milkshakeproddevs3071b7-dev`)**:
   - Files uploaded to `public/profiles/{filename}`
   - Retrieved using `Storage.get()` via Amplify

---

## 🔐 Permissions & Access Control

### Cognito (User Pools + Identity Pools)
- Users authenticate and get scoped IAM roles via Identity Pool
- IAM permissions allow:
  - `s3:GetObject` for `public/profiles/*`
  - `dynamodb:GetItem`, `PutItem`, `UpdateItem` on `milkshake-users`

### Lambda Role
- Assigned execution role includes:
  - DynamoDB read/write
  - Logging via CloudWatch

---

## 🚀 Amplify CLI Integration

### Setup Flow

```bash
amplify init
amplify add auth
amplify add api
amplify add storage
amplify push
```

### Frontend Usage

- `aws-exports.js` is auto-generated
- Used in every HTML page via:

```js
import awsExports from './aws-exports.js';
Amplify.configure(awsExports);
```

- `Auth`, `Storage`, and API integrations rely on this config

---

## 🌍 Hosting with Amplify Console

- Connected to GitHub
- Auto-deploys on commits to `main`
- Builds with `vite build`
- Environment variables link to backend
- Supports preview branches and custom domains

---

## 📌 Key Files

| File                  | Purpose                        |
|-----------------------|--------------------------------|
| `main.js`             | Image upload, profile creation |
| `api.js`              | Profile GET/PUT via REST API   |
| `lambdaIndex.mjs`     | All backend routes (Lambda)    |
| `carousel.html`       | Swiping UI with image fetch    |
| `edit-profile.html`   | Profile editing logic          |
| `aws-exports.js`      | Amplify config for frontend    |
| `styles.css`          | UI layout and mobile styles    |

---

## 🧩 Coming Next

- Secure access to S3 images
- Authorization checks before editing or viewing others’ profiles
- “Liked” and “Match” tracking via additional DynamoDB structures
- Admin tools for moderation

---

Built with ❤️ and the Amplify CLI.