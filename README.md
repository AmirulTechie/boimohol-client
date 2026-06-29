# Boimohol - Client

**Boimohol** is the frontend application for an online book delivery management system that connects readers with local libraries and independent book owners. The platform enables users to browse book collections, request doorstep delivery, and manage their reading history, while librarians manage their inventory and delivery workflows, and admins oversee the entire ecosystem.

---

## Live URL

[https://boimohol-client-e9bw.vercel.app/](https://boimohol-client-e9bw.vercel.app/)

---

## Project Purpose

Traditional library systems require physical visits, which creates a barrier for busy professionals and remote students. Boimohol democratizes access to books by enabling local libraries to reach a wider audience through a secure, streamlined borrowing and delivery experience.

---

## Key Features

**Authentication**
- Email and password registration with full name, photo, and role selection
- Google OAuth via Better Auth
- JWT-based session management with cookie storage
- Role-based redirection: Reader, Librarian, Admin

**Public Pages**
- Home page with animated hero banner (Framer Motion), featured books, top librarians, and popular categories
- Browse Books page with advanced search by title, filter by category, delivery fee range, and availability
- Server-side pagination (6-12 items per page)
- Book Details page with full book information, delivery fee, availability status, and verified reader reviews

**Reader Dashboard** (`/dashboard/user`)
- Quick stats: Total Books Read, Pending Deliveries, Total Spent
- Delivery history table with status tracking (Pending, Dispatched, Delivered)
- Reading list gallery of successfully delivered books
- Personal reviews management: edit and delete

**Librarian Dashboard** (`/dashboard/librarian`)
- Quick stats: Total Books Listed, Total Earnings, Active Pending Requests
- Add Book form with imgBB image upload integration
- Inventory management: Edit, Delete, toggle Published/Unpublished
- Delivery management: update status from Pending to Dispatched to Delivered

**Admin Dashboard** (`/dashboard/admin`)
- Platform-wide stats with charts: total users, books, deliveries, revenue, and category pie chart
- Book approval queue: Approve and Publish or Delete pending submissions
- User management: change roles, delete users
- Full book control: unpublish or delete any listing
- All transactions table with full metadata

**Additional Features**
- Stripe payment integration for delivery fees
- Verified review system: only users with a "Delivered" status for a book may leave a review
- imgBB API for book cover and avatar image hosting
- Skeleton loaders and global loading spinner
- Custom 404 error page and API error toasts
- Fully responsive: mobile, tablet, and desktop
- Optional: Wishlist system and persistent Dark/Light mode toggle

---

## Tech Stack

- Next.js (App Router)
- Tailwind CSS / DaisyUI
- Better Auth (authentication)
- Framer Motion (animations)
- Recharts / Chart.js (dashboard visualizations)
- Stripe.js (payment integration)
- Axios

---

## NPM Packages Used

| Package | Purpose |
|---|---|
| `next` | React framework with App Router |
| `react` | UI library |
| `better-auth` | Authentication (email/password + Google OAuth) |
| `stripe` | Payment processing client |
| `@stripe/stripe-js` | Stripe.js browser SDK |
| `framer-motion` | Page and component animations |
| `recharts` | Dashboard charts and graphs |
| `axios` | HTTP client for API requests |
| `react-hot-toast` | Toast notifications |
| `tailwindcss` | Utility-first CSS framework |
| `daisyui` | Tailwind component library |


---

## Deployment

This application is deployed on Vercel. All environment variables are configured in the Vercel project settings. The application handles all routes correctly on reload, and authenticated users are not redirected to login on private route refresh.

---

## Admin Credentials (Demo)

```
Email:    admin@gmail.com
Password: Admin@123
```
