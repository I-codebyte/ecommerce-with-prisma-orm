# Ecommerce (Prisma + Express)

A lightweight e-commerce backend built with Node.js, Express, and Prisma (Postgres). Implements user authentication (JWT via cookies), product and category management, cart and order flows, and email utilities (SendGrid/nodemailer).


## Features

- User registration, login, logout
- Profile and address management
- Product CRUD with categories
- Cart management (add/update/remove)
- Order creation and retrieval
- JWT-based authentication stored in an HTTP-only cookie
- Prisma ORM with Postgres datasource and migrations


## Tech stack

- Node.js (ES Modules)
- Express
- Prisma (PostgreSQL) with @prisma/adapter-pg
- bcrypt for password hashing
- jsonwebtoken for auth
- nodemailer (and SendGrid key support) for emails
- dotenv for config


## Project status

This repository contains the server implementation and Prisma models/migrations. It exposes a JSON REST API under the `/api/v1` prefix.


## Getting started

Prerequisites:
- Node.js (v16+ recommended, v18+ preferred)
- PostgreSQL (or a hosted Postgres service)
- npm

1. Clone the repo

   git clone https://github.com/I-codebyte/ecommerce-with-prisma-orm.git

2. Install dependencies

   npm install

3. Create a .env file based on the provided example

   Copy `.env.example` to `.env` and fill in the values:

   - DATABASE_URL — your Postgres connection string
   - PORT — server port (optional, defaults to 5000)
   - JWT_SECRET — secret used to sign JWTs
   - AUTH_SENDGRID_API_KEY — optional, if you want email sending
   - MY_EMAIL — optional sender email address for notifications

4. Generate Prisma client and run migrations

   The project uses a custom Prisma setup: generated client is placed in `generated/prisma`.

   Generate client:

   npm exec prisma generate

   Apply migrations (if migrations exist and you want to run them):

   npm exec prisma migrate deploy

   (During development you might use `prisma migrate dev` instead if you want to create new migrations.)


## Running the app

Development (uses nodemon):

   npm run dev

The server will listen on the port defined in `PORT` or 5000 by default.


## API overview

Base URL: `http://localhost:<PORT>/api/v1`

Authentication: JWT stored in an HTTP-only cookie named `token`. Use `/auth/login` to receive the cookie.

- Auth / Users
  - POST /auth/register — register a new user
  - POST /auth/login — login (sets cookie)
  - POST /auth/logout — logout (requires authentication)
  - GET /users/profile — fetch current user profile (requires authentication)
  - PUT /users/profile — update profile (requires authentication)
  - POST /forget-password — request password reset email
  - POST /reset-password — reset password
  - POST /users/address — add an address (requires authentication)

- Products & Categories
  - GET /products — list products
  - GET /products/filter — list products by category filter
  - POST /products — create a product (requires authentication)
  - GET /products/:id — fetch single product by id
  - GET /products/user/all — fetch products owned by the authenticated user
  - PUT /products/:id — update a product (requires authentication)
  - DELETE /products/:id — delete a product (requires authentication)
  - GET /all_categories — list categories
  - POST /create_category — create category (requires authentication + admin authorization)
  - DELETE /del_category — delete category (requires authentication + admin authorization)

- Cart
  - GET /cart — get current user's cart (requires authentication)
  - POST /cart/add_to_cart — add item to cart (requires authentication)
  - POST /cart/update — update cart item (requires authentication)
  - DELETE /cart/remove_from_cart — remove item from cart (requires authentication)

- Orders
  - GET /orders — get user's orders (requires authentication)
  - POST /orders/create — create an order from cart (requires authentication)


## Database / Prisma

- Datasource provider: `postgresql` (see `prisma/schema.prisma`)
- Prisma client is generated to `generated/prisma` (project uses `@prisma/adapter-pg` via `prisma/prisma.client.js`)
- Models include `User`, `Product`, `Order`, `Cart`, `Address`, etc. (models are in `prisma/Models/*.prisma`)

Important files:
- `prisma/schema.prisma` — Prisma schema config (datasource & generator)
- `prisma/Models/` — individual model files (Product, User, Order, etc.)
- `prisma/migrations/` — SQL migrations (already included)


## Authentication & Authorization

- Authentication middleware reads the JWT from `req.cookies.token` and verifies it with `JWT_SECRET`.
- Token generation uses `utils/token.js` which signs `{ userId }` with `JWT_SECRET`.
- Authorization middleware checks `user.role` and ensures admin-only actions (e.g., category management) are restricted.


## Configuration

- Environment variables: see `.env.example`
- Prisma config: `prisma.config.js` uses `DATABASE_URL` from environment


## Project structure (important files)

- app.js — Express app and route registration
- routes/ — route definitions per domain (users, products, orders, cart)
- controllers/ — business logic and handlers
- middleware/auth/ — authentication & authorization middleware
- prisma/ — Prisma schema, models and migrations
- utils/ — helpers (apiError, token generation)


## Notes & tips

- The project expects a Postgres database. If using a hosted DB (Heroku, Supabase), set DATABASE_URL accordingly.
- The code signs JWT without an explicit expiration; consider adding an expiry (`expiresIn`) for production.
- For production, ensure `JWT_SECRET` is strong and not committed to source control.
- Email features use SendGrid API key; configure `AUTH_SENDGRID_API_KEY` and `MY_EMAIL` when enabling emails.


---