# Reloop — Curated Secondhand Fashion Marketplace

A premium, full-stack secondhand fashion marketplace built with Next.js 14, TypeScript, Tailwind CSS, and Supabase.

---

## ✨ Features

### Buyer
- 🛍️ **Homepage** — Hero section, category filters, product grid with search/filter/sort
- 📦 **Product Detail** — Full product info, add to cart, wishlist
- ❤️ **Wishlist** — Save items, move to cart
- 🛒 **Cart** — Quantity management, subtotal, checkout
- 💳 **Checkout** — Address auto-fill, COD payment, order placement
- 👤 **Profile** — Avatar upload, edit personal info + address
- 📬 **My Orders** — Live order tracking with step indicator

### Seller
- 📊 **Dashboard** — Stats overview, recent orders, recent products
- ➕ **Add Product** — Image upload, full product details
- 📦 **Manage Products** — View, search, delete products
- 🚚 **Incoming Orders** — View buyer details, advance order status step by step

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone <your-repo>
cd reloop
npm install
```

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Go to **SQL Editor** and run the contents of `supabase-schema.sql`
3. Go to **Storage** and ensure the `avatars` and `product-images` buckets were created (the schema does this automatically)
4. Go to **Project Settings → API** and copy your Project URL and anon key

### 3. Configure Environment Variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
refash/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── layout.tsx                  # Root layout
│   ├── globals.css                 # Global styles
│   ├── auth/
│   │   ├── login/page.tsx          # Login page
│   │   └── signup/page.tsx         # Signup + role selection
│   ├── buyer/
│   │   ├── layout.tsx              # Buyer layout (navbar)
│   │   ├── homepage/page.tsx       # Product browsing
│   │   ├── product/[id]/page.tsx   # Product detail
│   │   ├── wishlist/page.tsx       # Wishlist
│   │   ├── cart/page.tsx           # Shopping cart
│   │   ├── checkout/page.tsx       # Checkout
│   │   ├── profile/page.tsx        # User profile
│   │   └── orders/page.tsx         # Order tracking
│   └── seller/
│       ├── layout.tsx              # Seller layout (sidebar)
│       ├── dashboard/page.tsx      # Seller dashboard
│       ├── add-product/page.tsx    # Add new product
│       ├── manage-products/page.tsx # Product management
│       └── orders/page.tsx         # Order management
├── components/
│   ├── buyer/
│   │   ├── BuyerNavbar.tsx         # Sticky navbar
│   │   └── ProductCard.tsx         # Product card component
│   ├── seller/
│   │   └── SellerSidebar.tsx       # Seller navigation
│   ├── shared/
│   │   └── Footer.tsx              # Site footer
│   └── ui/
│       └── SkeletonCard.tsx        # Loading skeleton
├── lib/
│   └── supabase/
│       ├── client.ts               # Browser Supabase client
│       └── server.ts               # Server Supabase client
├── types/
│   └── index.ts                    # TypeScript types
├── middleware.ts                   # Auth route protection
├── supabase-schema.sql             # Database schema
└── tailwind.config.ts              # Design tokens
```

---

## 🎨 Design System

### Color Palette
- **Ivory** `#F9F7F2` — Primary background
- **Stone/Charcoal** `#2A2520` — Primary text
- **Sage** `#5A7852` — Accents (condition badges)
- **Warm** `#B8936A` — Highlights, price accents
- **Stone-950** `#1A1714` — Seller dashboard dark bg

### Typography
- **Display Font**: Cormorant Garamond (serif, for headings & prices)
- **Body Font**: DM Sans (clean, modern sans-serif)

### Key Design Patterns
- Sticky glass navbar with cart/wishlist counters
- Dark editorial seller sidebar
- Product cards with hover-reveal action buttons
- Step-by-step order tracking with animated progress
- Split layout auth pages

---

## 🗄️ Database Schema

| Table | Purpose |
|-------|---------|
| `profiles` | User accounts (buyer/seller) |
| `products` | Product listings |
| `wishlists` | Saved items per user |
| `carts` | Cart per user |
| `cart_items` | Items in cart |
| `orders` | Order records |
| `order_items` | Items per order |

---

## 📱 Pages Overview

| Route | Description |
|-------|------------|
| `/` | Landing page |
| `/auth/login` | Sign in |
| `/auth/signup` | Create account (choose role) |
| `/buyer/homepage` | Shop — browse all products |
| `/buyer/product/[id]` | Product detail |
| `/buyer/wishlist` | Saved items |
| `/buyer/cart` | Shopping cart |
| `/buyer/checkout` | Place order |
| `/buyer/profile` | Edit profile + address |
| `/buyer/orders` | Order history + tracking |
| `/seller/dashboard` | Seller overview |
| `/seller/add-product` | List new product |
| `/seller/manage-products` | View/delete products |
| `/seller/orders` | View + update order status |

---

## 🔄 Order Flow

1. **Buyer** adds items to cart
2. **Buyer** checks out → order created with status `order_received`
3. **Seller** sees order in their dashboard
4. **Seller** advances status: `order_received` → `being_prepared` → `packed` → `sent` → `on_the_way` → `delivered`
5. **Buyer** sees real-time status updates in My Orders (via Supabase Realtime)

---

## ⚙️ Supabase Setup Notes

- Enable **Realtime** for the `orders` table in: Database → Replication
- Both `avatars` and `product-images` storage buckets should be **public**
- Make sure to configure **Auth** settings: disable email confirmation for local demo (Authentication → Settings → Disable email confirmations)

---

## 🛠️ Built With

- [Next.js 14](https://nextjs.org/) — React framework (App Router)
- [TypeScript](https://www.typescriptlang.org/) — Type safety
- [Tailwind CSS](https://tailwindcss.com/) — Utility-first styling
- [Supabase](https://supabase.com/) — Auth, Database, Storage, Realtime
- [Framer Motion](https://www.framer.com/motion/) — Animations
- [Lucide React](https://lucide.dev/) — Icons
- [React Hot Toast](https://react-hot-toast.com/) — Notifications

---

## 💡 Demo Tips

For a smooth localhost demo:
1. Disable email confirmation in Supabase Auth settings
2. Create one seller and one buyer account
3. List a few products as seller
4. Switch to buyer account and shop
5. Place an order, then switch back to seller to update tracking

---

*Reloop — Wear the Story* 🌿
