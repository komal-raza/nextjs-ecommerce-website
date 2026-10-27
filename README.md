# ELUARA — Minimalist Luxury Fashion eCommerce Platform

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-16.4.1-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.3.0-blue?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![InsForge BaaS](https://img.shields.io/badge/InsForge-Postgres%20%7C%20Auth%20%7C%20Storage-orange?style=for-the-badge)](https://insforge.dev/)
[![Stripe](https://img.shields.io/badge/Stripe-Secure%20Checkout%20%26%20Webhooks-635BFF?style=for-the-badge&logo=stripe&logoColor=white)](https://stripe.com/)
[![CSS Design System](https://img.shields.io/badge/Styling-Custom%20Vanilla%20CSS-1572B6?style=for-the-badge&logo=css3&logoColor=white)](#design-system)

**A full-stack, editorial-grade fashion eCommerce experience built with Next.js App Router, TypeScript, an InsForge Postgres BaaS, and Stripe payments.**

[**View Live Storefront**](https://rehv5rzn.insforge.site) · [**Explore Architecture**](#architecture--tech-stack) · [**Local Setup Guide**](#local-setup-guide)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
  - [Storefront Experience](#storefront-experience)
  - [Secure Payments & Stripe Integration](#secure-payments--stripe-integration)
  - [Store Owner Admin Panel](#store-owner-admin-panel)
  - [Mobile Responsiveness](#mobile-responsiveness)
- [Visual Showcase & Screenshots](#visual-showcase--screenshots)
  - [Homepage Experience](#homepage-experience)
  - [Product Catalog & Detail](#product-catalog--detail)
  - [Cart & Secure Checkout](#cart--secure-checkout)
  - [Store Owner Admin Dashboard](#store-owner-admin-dashboard)
  - [Mobile Responsive Experience](#mobile-responsive-experience)
- [Architecture & Tech Stack](#architecture--tech-stack)
- [Database Schema & Security (RLS)](#database-schema--security-rls)
- [Local Setup Guide](#local-setup-guide)
  - [1. Prerequisites](#1-prerequisites)
  - [2. Clone & Install Dependencies](#2-clone--install-dependencies)
  - [3. Configure Environment Variables](#3-configure-environment-variables)
  - [4. Link InsForge Backend](#4-link-insforge-backend)
  - [5. Run Development Server](#5-run-development-server)
  - [6. Local Stripe Webhook Testing](#6-local-stripe-webhook-testing)
  - [7. Production Build](#7-production-build)
- [Store Owner Dashboard Access](#store-owner-dashboard-access)
- [Listing Import Pipeline](#listing-import-pipeline)

---

## Overview

**ELUARA** is a high-performance fashion eCommerce application engineered to embody quiet luxury and modern web standards. Built from the ground up without third-party UI component libraries or CSS frameworks, the storefront relies entirely on a custom-designed, fluid CSS token system that delivers sub-second page transitions, responsive layouts, and typography.

The application is backed by **InsForge** (providing PostgreSQL database tables with Row-Level Security, authentication, and object storage buckets) and integrates **Stripe** for trusted server-side payment processing and webhook reconciliation.

---

## Key Features

### Storefront Experience
- **Cinematic Hero**: Video and poster banner with instant skeleton loading fallback.
- **Curated Collections**: Men's and Women's collection listing pages with dynamic category filter pills, price/newest sorting, and URL synchronization.
- **Smart Catalog Search**:
  - In-page search bar with quick clear (`✕`), category filtering (`All`, `Women`, `Men`), and popular query pills (`Coats`, `Wool`, `Cashmere`, `Blazers`, `Linen`, `Trousers`, etc.).
  - Singular and plural query normalization (e.g., `"coat"` and `"coats"` both match all outerwear pieces).
  - Debounced live search suggestions in the header search overlay.
  - Curated fallback recommendations on empty searches to eliminate dead-ends.
- **Product Detail Experience**:
  - Multiple image gallery with thumbnail selection and slide transitions.
  - Dynamic size selector (`XS`, `S`, `M`, `L`, `XL`), quantity counter, and compare-at sale price badges.
  - Related product recommendations based on subcategory matches.
- **Shopping Bag & Guest-Friendly Checkout**:
  - Instant slide-over cart badge and dedicated `/cart` route with item breakdown and free shipping threshold calculations.
  - Dual cart state: persists in `localStorage` for guest visitors and synchronizes with the InsForge cloud `carts` table for signed-in users.
  - Guest checkout available without forced account creation.
  - Clear validation highlighting all required shipping and contact fields.
- **Order Lifecycle & Tracking**:
  - Live 4-stage tracking visualizer (`Pending` → `Confirmed` → `Shipped` → `Delivered`).
  - Order history saved to user profiles for delivery monitoring.

### Secure Payments & Stripe Integration
- **Server-Side Trusted Pricing**: All product prices, line subtotals, and final totals are recalculated strictly on the server against the database. Client-submitted prices are discarded.
- **Stripe Checkout Sessions**: Creates authenticated, hosted checkout sessions with `client_reference_id` and metadata order tags.
- **Cryptographic Webhook Verification**: Listens for `checkout.session.completed` events using raw request body buffer verification (`stripe-signature`).
- **Database Trigger Security**: PostgreSQL trigger (`trg_check_order_immutable_fields`) prevents client-side alteration of ownership, items, or financial amounts.
- **Idempotent Settlement**: Repeated visits or webhooks do not duplicate charges or regress orders already marked as `shipped` or `delivered`.

### Store Owner Admin Panel
A protected administrative workspace designed specifically for store owners (hidden from public visitors and customers):
1. **Product Manager (`/admin`)**:
   - Live catalog data table with search and category filters.
   - **Add New Product**: Form supporting name, category, subcategory, price, compare-at price, description, sizes, and direct multi-image uploads to InsForge storage.
   - **Edit Product Details**: Modify product attributes, toggle feature flags (`Featured`, `New Arrival`, `Trending`), and adjust inventory sizes.
   - **Multi-Image Drag & Drop Ordering**: Reorder product gallery images with drag-and-drop, delete specific images, and maintain a 1-image minimum safety constraint.
2. **Site Content Settings (`/admin/settings`)**:
   - Update the top **Announcement Bar** text live.
   - Customize **Promotional & Shipping Banners** (headlines, subheadings, and copy).
   - Manage **Client Care Contact Info** (email, phone, studio address, business hours) rendered on `/contact`.
   - Update **Social Media Channels** (Instagram, X, Pinterest, YouTube, Facebook) rendered in the footer.
   - Built-in validation for URLs, emails, and mandatory text fields.

### Mobile Responsiveness
- Custom fluid typography with CSS `clamp()` and touch-friendly tap targets (minimum 44px).
- Portrait collection posters framed at `object-position: center 8%` to ensure models' faces and silhouettes are displayed without awkward cropping.
- Header profile icon stays accessible across mobile screen sizes with an active indicator dot for logged-in accounts.
- Mobile sliding drawer equipped with an in-drawer search bar and dedicated **"Save Your Order History"** or **"My Profile & Orders"** card.

---

## Visual Showcase & Screenshots

### Homepage Experience

| Hero Showcase | Collections Overview |
| :---: | :---: |
| ![Hero Section](public/projectScreenshots/HeroSection.png) | ![Collections Banner](public/projectScreenshots/collections.png) |
| *Cinematic editorial hero banner with brand introduction* | *Dual-gender collection entrance posters* |

| New Arrivals Showcase | Trending Pieces |
| :---: | :---: |
| ![New Arrivals](public/projectScreenshots/newArrival.png) | ![Trending Pieces](public/projectScreenshots/trendingSection.png) |
| *Curated new arrivals carousel with quick-add functionality* | *Editorial grid of trending seasonal essentials* |

| Brand Philosophy & Features | Dynamic Footer |
| :---: | :---: |
| ![Features Section](public/projectScreenshots/featuresSection.png) | ![Footer Section](public/projectScreenshots/footer.png) |
| *Core brand values, fabric craftsmanship, and sustainability* | *Dynamic social links, customer care contact, and store navigation* |

---

### Product Catalog & Detail

| Women's Collection Page | Men's Collection Page |
| :---: | :---: |
| ![Women's Collection](public/projectScreenshots/womensCollections.png) | ![Men's Collection](public/projectScreenshots/men'scollection.png) |
| *Women's collection with subcategory filters and sorting* | *Men's collection with tailored outerwear and essentials* |

| Product Detail Page (Overview) | Product Detail Page (Interactive) |
| :---: | :---: |
| ![Product Detail Page](public/projectScreenshots/productDetailPage.png) | ![Product Detail](public/projectScreenshots/productDetail.png) |
| *Multiple image layout, size matrix, and description* | *Interactive gallery, add-to-bag, and related product cards* |

---

### Cart & Secure Checkout

| Shopping Bag (`/cart`) | Secure Checkout Form (`/checkout`) |
| :---: | :---: |
| ![Shopping Cart](public/projectScreenshots/rehv5rzn.insforge.site_cart.png) | ![Checkout Page](public/projectScreenshots/rehv5rzn.insforge.site_checkout.png) |
| *Line item review, quantity adjustments, and free shipping tracker* | *Validated contact details, shipping destination, and order summary* |

| Authentication (`/login`) |
| :---: |
| ![Customer Sign In & Register](public/projectScreenshots/signin.png) |
| *Clean tabbed customer sign-in and registration powered by InsForge Auth* |

---

### Store Owner Admin Dashboard

| Product Catalog Table (`/admin`) | Add New Product Modal |
| :---: | :---: |
| ![Admin Products Table](public/projectScreenshots/ProductList_admin.png) | ![Add New Product](public/projectScreenshots/addNewProduct.png) |
| *Inventory table with instant search, badges, and management options* | *Complete product creation form with direct image upload* |

| Edit Product Details | Drag & Drop Image Ordering |
| :---: | :---: |
| ![Edit Product](public/projectScreenshots/EditProductDetails.png) | ![Drag & Drop Images](public/projectScreenshots/dragNDropImages.png) |
| *Price editing, tag toggles (Featured / New / Trending), and sizes* | *Interactive reordering of product gallery photos with delete controls* |

| Store Frontend Content Settings (`/admin/settings`) |
| :---: |
| ![Admin Store Settings](public/projectScreenshots/storeFrontend_admin_settings.png) |
| *Real-time management of announcement bars, shipping banners, contact info, and social links* |

---

### Mobile Responsive Experience

| Homepage (Mobile) | Women's Catalog (Mobile) | Product Detail (Mobile) | Cart (Mobile) |
| :---: | :---: | :---: | :---: |
| ![Home Mobile](public/projectScreenshots/homeMobile.png) | ![Women Mobile](public/projectScreenshots/women'sMobile.png) | ![PDP Mobile](public/projectScreenshots/productDetailMobile.png) | ![Cart Mobile](public/projectScreenshots/cartMobile.png) |
| *Mobile hero & navigation* | *Refined 2-column mobile grid* | *Touch gallery & size selection* | *Mobile shopping bag review* |

| Checkout (Mobile) | Payment Gateway (Mobile) | Stripe Checkout (Mobile) | Order History (Mobile) |
| :---: | :---: | :---: | :---: |
| ![Checkout Mobile](public/projectScreenshots/checkoutMobile.png) | ![Payment Mobile](public/projectScreenshots/paymentMobile.png) | ![Stripe Mobile](public/projectScreenshots/stripeCheckoutMobile.png) | ![Order History Mobile](public/projectScreenshots/OrderHistoryMobile.png) |
| *Mobile checkout form* | *Stripe interstitial gateway* | *Official Stripe hosted page* | *Profile & 4-stage order tracker* |

---

## Architecture & Tech Stack

```
├── app/
│   ├── (auth)/login/          # InsForge authentication (Sign In / Register)
│   ├── (store)/               # Storefront routes
│   │   ├── women/             # Women's collection listing (?sub=...&sort=...)
│   │   ├── men/               # Men's collection listing (?sub=...&sort=...)
│   │   ├── product/[id]/      # Dynamic PDP with multi-image gallery
│   │   ├── search/            # Interactive search page with filters & fallback
│   │   ├── cart/              # Shopping cart review
│   │   ├── checkout/          # Shipping & contact form
│   │   ├── payment/[orderId]/ # Stripe checkout session initiator
│   │   ├── payment/return/    # Stripe payment verification & confirmation
│   │   └── profile/           # User profile & 4-stage order tracker
│   ├── admin/                 # Store Owner Dashboard
│   │   ├── page.tsx           # Product catalog management
│   │   └── settings/page.tsx  # Storefront content settings
│   ├── api/                   # Server API routes
│   │   ├── admin/             # Admin-only mutations (auth-verified)
│   │   ├── checkout-session/  # Stripe session creator
│   │   ├── orders/            # Trusted order calculation & creation
│   │   ├── payment/confirm/   # Stripe session validation
│   │   ├── search/            # Fast server-side product search
│   │   ├── settings/          # Public & admin settings provider
│   │   └── webhooks/stripe/   # Cryptographic Stripe webhook receiver
│   ├── globals.css            # Custom CSS design system (tokens, layout, components)
│   └── layout.tsx             # Root layout with Navbar, Footer, and StoreProvider
├── components/                # Reusable Server & Client components
├── lib/
│   ├── api.ts                 # Service layer querying InsForge PostgreSQL database
│   ├── data.ts                # TypeScript interfaces, categories, fallbacks
│   ├── insforge.ts            # InsForge SDK client & admin instance initializer
│   ├── store.tsx              # Cart React Context + localStorage & cloud sync
│   ├── stripe.ts              # Stripe SDK client initialization
│   └── format.ts              # Currency (money) and date formatters
├── public/
│   ├── projectScreenshots/    # Application desktop and mobile screenshots
│   └── videos/                # Background hero video
└── scripts/
    ├── import-listings.mjs    # CSV inventory importer
    └── verify-stripe-e2e.mjs  # Automated payment verification suite
```

### Core Technologies

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Framework** | **Next.js 16.4.1 (App Router)** | Server Components, Server Actions, Route Handlers, Turbopack |
| **Library** | **React 19.3.0** | Concurrent rendering, `useActionState`, client portals |
| **Language** | **TypeScript 5** | Strict type safety across database entities and API seams |
| **Styling** | **Custom CSS3** | Custom design tokens, fluid typography via `clamp()`, zero utility frameworks |
| **Backend & BaaS** | **InsForge** | Managed PostgreSQL, Row-Level Security (RLS), Auth, File Storage |
| **Payments** | **Stripe API (v23.0.0)** | Hosted Checkout Sessions, Webhook event verification |
| **Client Storage** | **Browser Storage** | LocalStorage for guest cart persistence + InsForge Auth tokens |

---

## Database Schema & Security (RLS)

All database operations leverage PostgreSQL on InsForge with Row-Level Security enabled:

1. **`products`**:
   - `id` (text slug, PK), `name`, `category` (`women` | `men`), `subcategory`, `price`, `compare_at_price`, `description`, `sizes` (jsonb array), `images` (jsonb array of storage URLs), `featured`, `is_new`, `trending`, `created_at`.
   - **RLS Policy**: Public read (`SELECT`) allowed for all visitors; write/update operations restricted to the store owner admin role.
2. **`carts`**:
   - `id` (uuid, PK), `user_id` (FK `auth.users`), `product_id` (FK `products`), `size`, `quantity`, `updated_at`.
   - **RLS Policy**: Authenticated users can only read, insert, and update rows where `auth.uid() = user_id`.
3. **`orders`**:
   - `id` (uuid, PK), `user_id` (FK `auth.users`, nullable for guest checkout), `items` (jsonb snapshot of products/sizes/quantities/prices), `subtotal`, `shipping`, `total`, `status` (`pending` → `confirmed` → `shipped` → `delivered`), `payment_status` (`unpaid` → `paid`), `payment_method` (`stripe`), `contact` (jsonb), `shipping_address` (jsonb), `created_at`.
   - **RLS Policy**: Users can only query their own orders. Guests access orders via verified session identifiers.
   - **Trigger Constraint**: `trg_check_order_immutable_fields` prevents updating totals, line items, or customer identity after creation.
4. **`site_settings`**:
   - Key-value store holding announcement messages, shipping promo copy, contact details, and social links.
5. **Storage Buckets**:
   - `product-images` (public): Serves product photos and banners.
   - `payment-uploads` (private): Secured bucket for checkout attachments.

---

## Local Setup Guide

Follow these steps to run the ELUARA fashion eCommerce platform on your local machine.

### 1. Prerequisites
- **Node.js**: `v18.18.0` or higher (Node.js 20+ recommended)
- **npm**: `v9.0.0` or higher
- **Stripe Account**: For test API keys ([Sign up for Stripe](https://stripe.com))
- **InsForge CLI**: For database linking and migrations

### 2. Clone & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/your-username/ecommerce-website.git
cd ecommerce-website

# Install npm dependencies
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
touch .env.local
```

Populate the required environment variables:

```env
# -------------------------------------------------------------
# InsForge Backend Configuration
# -------------------------------------------------------------
NEXT_PUBLIC_INSFORGE_URL=https://your-project.region.insforge.app
NEXT_PUBLIC_INSFORGE_ANON_KEY=your_insforge_anon_key
INSFORGE_API_KEY=your_insforge_api_key

# -------------------------------------------------------------
# Stripe Payment Configuration
# -------------------------------------------------------------
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key # Optional
NEXT_PUBLIC_APP_URL=http://localhost:3000

# -------------------------------------------------------------
# Store Owner Admin Configuration
# -------------------------------------------------------------
ADMIN_EMAIL=admin@example.com
NEXT_PUBLIC_ADMIN_EMAIL=admin@example.com
```

> **Note**: `.env.local` contains private keys and is ignored by Git. Never commit production secrets.

### 4. Link InsForge Backend

If you are connecting to your own InsForge project instance:

```bash
# Login to InsForge CLI
npx @insforge/cli login --user-api-key <your-user-api-key>

# Link your project
npx @insforge/cli link --project-id <your-project-id>

# Verify connection
npx @insforge/cli current
```

### 5. Run Development Server

Start the Next.js development server with Turbopack:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The application will load with real-time database queries, live cart management, and search.

### 6. Local Stripe Webhook Testing

To test Stripe checkout and order confirmation locally:

1. **Install the Stripe CLI** (if not already installed):
   ```bash
   # On macOS
   brew install stripe/stripe-cli/stripe

   # On Linux
   # Download from https://github.com/stripe/stripe-cli/releases
   ```

2. **Authenticate and Forward Webhooks**:
   ```bash
   stripe login
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

3. Copy the webhook signing secret printed in your terminal and update `STRIPE_WEBHOOK_SECRET` in your `.env.local` file.

4. Trigger a simulated payment completion:
   ```bash
   stripe trigger checkout.session.completed
   ```

### 7. Production Build

Test an optimized production build locally:

```bash
npm run build
npm start
```

---

## Store Owner Dashboard Access

The administrative dashboard is restricted to the authorized store owner:

- **Product Catalog Management**: [http://localhost:3000/admin](http://localhost:3000/admin)
- **Storefront Content Settings**: [http://localhost:3000/admin/settings](http://localhost:3000/admin/settings)

### Access Authorization:
1. Navigate to `/login` and sign in using your configured `ADMIN_EMAIL` (e.g., `admin@example.com`).
2. Once authenticated, a **Store Owner Dashboard** navigation link appears on your `/profile` page.
3. Accessing `/admin` as an unauthenticated guest or standard customer presents an access-denied gate with no catalog or financial data exposed.

---

## Listing Import Pipeline

To batch-import products from a spreadsheet into the InsForge database:

1. Place your CSV data file in `incoming/listings.csv`.
2. Place corresponding product photography in `incoming/images/`.
3. Run the automated listing pipeline:
   ```bash
   npm run import-listings
   ```
4. The importer validates attributes, uploads imagery to the InsForge `product-images` storage bucket, and seeds the PostgreSQL `products` table.

---

## License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">
  <sub>Built with precision for <strong>ELUARA</strong> — Quiet luxury, made to last.</sub>
</div>
