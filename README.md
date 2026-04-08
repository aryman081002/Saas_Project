# TechFlow - Enterprise SaaS Platform

A high-performance, feature-rich SaaS platform built with HTML, CSS, JavaScript, and a robust Node.js/Express backend. Integrated with Supabase for data management and Razorpay for seamless subscription billing.

## 🚀 Key Features Implemented

### 1. **User Authentication (JWT)**
- ✅ Secure registration and login flow
- ✅ JWT-based session management
- ✅ Password hashing with Bcrypt
- ✅ Protected user profile and dashboard access
- ✅ User-specific data isolation

### 2. **Member Dashboard**
- ✅ Real-time statistics aggregation (Clients, Metrics, Conversions)
- ✅ Client management system (Add, Edit, Activate/Deactivate, Delete)
- ✅ Automated performance metric tracking for clients
- ✅ Payment history and subscription management

### 3. **Billing & Subscriptions (Razorpay)**
- ✅ Seamless integration with Razorpay Checkout
- ✅ Multi-tier pricing support (Starter, Professional)
- ✅ Automated plan upgrades upon successful payment
- ✅ Signature verification for secure payment processing
- ✅ Monthly and Yearly billing cycle support

### 4. **Cloud Database (Supabase)**
- ✅ Managed PostgreSQL database on Supabase
- ✅ Scalable data storage for users, clients, and subscriptions
- ✅ Row Level Security (RLS) for data protection
- ✅ Automated timestamp management via triggers

### 5. **Rich Client-Side Experience**
- ✅ Real-time statistics dashboard in hero section
- ✅ GSAP-powered scroll-triggered animations
- ✅ Modern Bento Grid feature highlights
- ✅ Interactive demo panels and charts
- ✅ Dark/Light mode persistence

---

## 📁 Project Structure

```
/Saas_Project/
├── server/             # Node.js/Express Backend
│   ├── config/         # Database and service configs
│   ├── middleware/     # Auth and validation middleware
│   ├── models/         # Database schema and SQL
│   ├── routes/         # API endpoints (Auth, Clients, Payments, Dashboard)
│   ├── server.js       # Main server entry point
│   └── package.json    # Backend dependencies
├── index.html          # Main landing page
├── dashboard.html      # Member dashboard UI
├── script.js           # Frontend logic, Auth module, and animations
├── styles.css          # Core styling for landing & dashboard
└── README.md           # You are here
```

---

## 🛠️ Technology Stack

- **Frontend:** HTML5, Vanilla CSS, JS (ES6+), GSAP (Animations)
- **Backend:** Node.js, Express.js
- **Database:** Supabase (PostgreSQL)
- **Payments:** Razorpay
- **Authentication:** JWT (JSON Web Tokens)

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- Supabase account
- Razorpay account (Test mode enabled)

### 2. Backend Setup
1. Navigate to the server directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on the template:
   ```bash
   cp .env.example .env
   ```
4. Fill in your credentials:
   - `JWT_SECRET`: Any long random string
   - `SUPABASE_URL`: Your Supabase Project URL
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase Service Role Key
   - `RAZORPAY_KEY_ID`: Your Razorpay Test Key ID
   - `RAZORPAY_KEY_SECRET`: Your Razorpay Test Secret

### 3. Database Initialization
1. Go to your Supabase **SQL Editor**.
2. Run the contents of `server/models/schema.sql` to create the tables.
3. (Optional) Run `server/models/fix_rls.sql` if you are using an anon key or need permissive access.

### 4. Run the Application
Start the backend server:
```bash
npm run dev
```
The application will be accessible at `http://localhost:5000`.

---

## 🔐 Security Protocols

- **Data Privacy:** Encrypted password storage using Bcrypt.
- **API Security:** All management endpoints require a valid JWT `Authorization` header.
- **Payment Integrity:** Uses HMAC SHA256 signature verification for all payment callbacks.
- **CORS:** Configured to strictly allow requests from your frontend environment.

---

## 📊 Performance Optimization

- **Static Serving:** Express serves frontend assets efficiently with proper MIME types.
- **Database Indexing:** Optimized PostgreSQL indexes for email lookups and user relationships.
- **Lazy Loading:** All media assets and non-critical modules are loaded asynchronously.
- **Scroll Performance:** GSAP ScrollTrigger used for hardware-accelerated animations.

---

## 📄 License

This project is built for the **TechFlow SaaS** platform implementation. All rights reserved.

**Version:** 2.0 (Backend Integration)
**Status:** Production Ready
**Last Updated:** April 8, 2026
