
# Milkshake App Development Roadmap

This roadmap outlines the structured development plan for the Milkshake app, focusing on efficient full-stack implementation using AWS Amplify, Cognito, Lambda, and DynamoDB.

---

## Phase 1: Authentication & Session Management (Foundational)
🔧 **Goal:** Ensure secure user management and proper session handling across your app.

### Tasks:
- [X ] Link **Create Profile** functionality with **Amazon Cognito**:
  - Capture email and other required info.
  - Register with Cognito using `Auth.signUp()`.
  - Store profile in **DynamoDB** after Cognito success.
- [X ] Ensure **sessions** persist:
  - Use `Auth.currentAuthenticatedUser()` and `Auth.currentSession()` on page load.
  - Redirect unauthorized users appropriately.
- [ X] Store Cognito user ID in DynamoDB for future queries and reference.

---

## Phase 2: UI & UX Enhancements
🎨 **Goal:** Improve the front-end experience, particularly for user interaction flows.

### Tasks:
- [X ] **Carousel.html** improvements:
  - Add picture flipping interaction (front for photo, back for bio/info).
  - Enable “Yes/No” buttons to record interest.
  - Add animations or transitions for smoother experience.
- [ X] Improve responsiveness and mobile friendliness.
- [ ] Add loading states or progress indicators where needed.

---

## Phase 3: Feature Additions
🧩 **Goal:** Start expanding core features that enhance user engagement.

### Tasks:
- [ ] **“Liked” Profiles Page**:
  - New page to show users they’ve liked.
  - Query DynamoDB with user’s likes.
- [x ] Profile management (update/delete profile).
- [ ] Guest user restrictions/experience enhancement.

---

## Phase 4: Backend Enhancements
🔁 **Goal:** Strengthen the backend logic and data integrity.

### Tasks:
- [ ] Lambda cleanup: Remove any unused functions or consolidate logic.
- [ ] Enhance DynamoDB access patterns (optimize for queries).
- [ ] Add analytics/events for user actions (optional, for future growth).

---

## Phase 5: Deployment & QA
🚀 **Goal:** Make sure your app is production-ready and resilient.

### Tasks:
- [ ] Cross-browser and mobile testing.
- [ ] Validate security (Cognito settings, API Gateway restrictions).
- [ ] Backup DynamoDB or export schema.

---

## Suggested Order of Execution:
1. **Authentication + Cognito + Session Handling**
2. **Carousel UI interaction logic**
3. **Likes feature (page and backend)**
4. **Polishing and expanding other pages**
5. **Final QA and testing**
