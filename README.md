# 🔍 Reconnect — Smart Lost & Found Web Platform

A modern, full-stack Lost & Found web platform designed with a **Google-inspired Light Orange/Red Design System**, complete CRUD operations, Firebase Authentication & Cloud Storage, intelligent match discovery radar, and a claim verification workflow.

---

## 🌟 Key Features

- **Google-Inspired Light Orange/Red Aesthetics**: Clean Google Material 3 typography, pill navigation, responsive grid cards, and smooth micro-animations.
- **Direct Google Sign-In & Firebase Integration**: Native Google OAuth authentication, Cloud Firestore user & data sync, and Firebase Storage for photo uploads.
- **Lost & Found Reporting**: Segmented reporting form (`🔴 Lost` vs `🟢 Found`) with location landmarks, date picker, photo uploads, and contact preferences.
- **⚡ Live Match Radar Engine**: Automatic similarity scoring between opposite reports (`Lost` $\leftrightarrow$ `Found`) based on category, title keywords, location overlap, and date proximity.
- **Claim & Ownership Verification Workflow**: Secure proof messaging, real-time claim alerts, owner acceptance/rejection, contact unlocking, and *"Reunited & Returned"* confetti celebrations.
- **Multi-Attribute Browse & Search**: Instant keyword search, category filters, location landmark filters, status filters, and Grid/List view switcher.

---

## 🚀 Tech Stack

- **Frontend**: React 18, Vite, React Router v6, Lucide React, Canvas Confetti, Custom Google-style CSS Design System
- **Backend**: Node.js, Express.js, REST API Architecture, JWT Authentication, Bcrypt
- **Cloud & Database**: Firebase Auth, Google OAuth 2.0, Cloud Firestore, Firebase Cloud Storage

---

## 🛠️ Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/rakhondesaurabh-cyber/Lost-Found.git
   cd Lost-Found
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server** (runs both frontend and backend concurrently):
   ```bash
   npm run dev
   ```

- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:5001/api`

---

## 📄 License

MIT License © 2026 Reconnect Lost & Found.
