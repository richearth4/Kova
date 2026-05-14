# KOVA - Estimated Monthly Infrastructure Costs

This document outlines the projected monthly costs for the KOVA Collective Wealth platform (formerly PHINEC) based on the recommended modern tech stack.

## Tech Stack Overview
- **Framework:** Next.js (React)
- **Database:** PostgreSQL (Managed via Supabase)
- **Authentication:** Supabase Auth
- **Hosting:** Vercel
- **Cloud Storage:** Cloudinary (Payment Proofs)
- **Email Delivery:** Resend (Transactional)

---

## Cost Breakdown

| Service | Hobby/Dev Tier | Pro/Production Tier | Notes |
| :--- | :--- | :--- | :--- |
| **Vercel (Hosting)** | $0 | **$20** / month | Required for commercial use and higher bandwidth. |
| **Supabase (DB & Auth)** | $0 | **$25** / month | Includes 8GB DB, 100k MAU, and daily backups. |
| **Cloudinary (Storage)** | $0 | **$0** | Free tier (25 credits) usually suffices for <1,000 members. |
| **Resend (Email)** | $0 | **$20** / month | Free up to 3k emails/mo; Pro for 50k emails/mo. |
| **Domain Name** | N/A | **~$1.50** / month | Amortized cost of $15-$20 annual registration. |
| **TOTAL** | **$0 / month** | **~$45 – $65 / month** | **Estimated range for a stable production environment.** |

---

## Recommendations

### 1. Phase 1: Development & Beta ($0/mo)
During the building and internal testing phase, all services can be run on their respective **Free Tiers**. This allows for a full feature-complete build without incurring any infrastructure overhead.

### 2. Phase 2: Launch & Production (~$45/mo)
For the official launch to the 1,000 members, it is highly recommended to upgrade to:
- **Vercel Pro:** For performance stability and team collaboration.
- **Supabase Pro:** **CRITICAL** for daily backups and data retention, which is essential for financial/cooperative data integrity.

### 3. Scaling & Growth
Costs may increase if the cooperative expands beyond 10,000 members or if the storage of historical payment proofs exceeds the free Cloudinary/Supabase storage limits.

---
*Last Updated: April 2026*
