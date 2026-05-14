# KOVA: Technical & Functional Documentation

KOVA is a premium, tier-1 financial cooperative management platform designed for collective wealth creation. It provides a secure, transparent, and high-performance environment for managing savings, loans, and logistics.

---

## 🛠 Technology Stack

### 1. Core Framework & Language
- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router, Server Actions, Turbopack)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strictly typed for financial integrity)
- **Runtime**: Node.js 24+

### 2. Database & Persistence
- **Database**: [PostgreSQL](https://www.postgresql.org/) (Hosted on Supabase)
- **ORM**: [Prisma](https://www.prisma.io/) (with `@prisma/adapter-pg` for optimized pooling)
- **Connection Pooling**: Customized `pg` pool with serverless-optimized limits.

### 3. Authentication & Security
- **Auth Provider**: [Supabase Auth](https://supabase.com/auth)
- **Strategy**: Cookie-based sessions with `@supabase/ssr`
- **RBAC**: Custom middleware-level Role-Based Access Control (`ADMIN`, `SECRETARY`, `MEMBER`)
- **Security**: Mandatory `requireAuth()` and `requireRole()` server-side guards.

### 4. UI & Aesthetics
- **Styling**: [Tailwind CSS 4.0](https://tailwindcss.com/)
- **Design Language**: "Midnight & Emerald" (KOVA Brand Identity)
- **Theming**: System-aware Dark/Light mode via `next-themes`
- **Animations**: Smooth transitions and high-fidelity streaming skeletons (`loading.tsx`)
- **Toasts**: [Sonner](https://sonner.stevenly.all/) (Real-time push alerts)

### 5. Services & Integrations
- **Real-time**: Supabase Realtime (Postgres Changes)
- **Email**: [Resend](https://resend.com/) (Transactional alerts for loan status/approvals)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 📦 Core Functions (Role-Based)

### 👤 Member Portal
- **Dashboard**: Real-time view of total contributions, active loan balance, and savings progress.
- **Contributions**: Upload payment proof (images/PDFs) for monthly savings.
- **Loan Management**: 
  - Apply for loans with automated eligibility checks.
  - Track repayment progress and upload repayment receipts.
- **Targeted Savings**: Create and track specific financial goals with progress visualizations.
- **Foodstuff & Logistics**: Order monthly foodstuffs from the cooperative catalog.
- **Settings**: Profile management and secure password updates.

### 📋 Secretary (Operations) Center
- **Payment Verification**: Dedicated queue for reviewing member contribution receipts.
- **Order Processing**: Manage and export reports for monthly foodstuff distribution.
- **Member Support**: Limited visibility to verify member eligibility.

### 🛡 Super Admin (Command Center)
- **Financial HQ**: High-level analytics on capital pool, outstanding debt, and recovery rates.
- **Credit Review**: Approve/Reject loan applications with automated audit trails.
- **Repayment Verification**: Confirm loan repayments and update active balances.
- **Member Directory**: 
  - Add/Edit members.
  - **Bulk Import**: CSV-based member provisioning with automatic Supabase/Prisma sync.
  - Account suspension/activation controls.
- **Foodstuff Catalog**: Manage items, pricing, and availability.
- **System Transparency**: Advanced Audit Log with multi-criteria filtering.

---

## ⚙️ Key System Architectures

### 1. Financial Integrity Logic
The system uses a strict double-verification flow:
1. Member uploads proof -> Status: `PENDING_VERIFICATION`.
2. Secretary/Admin confirms -> Balance updated + Audit Log generated.

### 2. Performance Engineering
- **Parallel Querying**: Dashboards use `Promise.all` to fetch metrics simultaneously.
- **Database Indexing**: Optimized `where` clauses on `userId` and `status` columns.
- **Zero-Layout-Shift**: Custom loading skeletons ensure a stable visual experience.

### 3. Real-time Notification Engine
- **Supabase Realtime**: Subscribes to database changes to push instant updates.
- **Notification Bell**: Tracks unread alerts and allows "Mark as Read".
- **Push Toasts**: `sonner` triggers popups for immediate feedback on approvals or new messages.

---

## 🚀 Deployment Guide
- **Vercel**: Recommended for Next.js hosting.
- **Supabase**: Managed Postgres and Auth.
- **Environment Variables**:
  - `DATABASE_URL`: Connection string.
  - `NEXT_PUBLIC_SUPABASE_URL`: API Endpoint.
  - `SUPABASE_SERVICE_ROLE_KEY`: Admin bypass for backend tasks.
  - `RESEND_API_KEY`: Email delivery.
