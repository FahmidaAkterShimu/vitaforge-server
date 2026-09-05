# VitaForge — Server

This repository contains the backend REST API for **VitaForge**, a Fitness & Gym Management Platform.

The server provides authentication support, user management, trainer applications, class management, community/forum functionality, and other APIs required by the VitaForge client application.

---

## 🚀 Features

### 🔐 Authentication & Authorization

* Better Auth integration
* Session-based authentication
* Role-based access control
* User, Trainer, and Admin roles
* Protected backend operations
* User role management

### 👤 User Management

* Create and manage users
* Retrieve user information
* Update user roles
* User profile management
* Trainer role management

### 🏋️ Trainer Management

* Trainer applications
* Submit trainer applications
* View trainer applications
* Approve trainer applications
* Reject trainer applications
* Convert approved users into trainers

### 📚 Class Management

* Create fitness classes
* Retrieve classes
* Update classes
* Delete classes
* Manage class information
* Manage class enrollment data

### 💬 Community / Forum

* Create forum posts
* Retrieve forum posts
* Retrieve latest posts
* Manage community content

### 💳 Payment

* Stripe integration
* Payment-related API support

---

## 🛠️ Technology Stack

### Backend

* Node.js
* Express.js
* JavaScript
* REST API

### Database

* MongoDB
* MongoDB Native Driver

> This project does **not** use Mongoose.

### Authentication

* Better Auth
* MongoDB Adapter

### Payment

* Stripe

### Deployment

* Vercel / Render / other Node.js-compatible hosting

---

## 📁 Project Structure

```text
vitaforge-server/
│
├── src/
│   ├── routes/
│   │   ├── users.js
│   │   ├── classes.js
│   │   ├── trainerApplications.js
│   │   ├── forum.js
│   │   └── ...
│   │
│   ├── controllers/
│   │   └── ...
│   │
│   ├── middleware/
│   │   └── ...
│   │
│   ├── lib/
│   │   └── ...
│   │
│   ├── config/
│   │   └── ...
│   │
│   └── server.js
│
├── .env
├── package.json
└── README.md
```

> The exact folder structure may vary depending on the current implementation.

---

## ⚙️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/FahmidaAkterShimu/vitaforge-server.git
```

### 2. Navigate into the project

```bash
cd vitaforge-server
```

### 3. Install dependencies

```bash
npm install
```

---

## 🔑 Environment Variables

Create a `.env` file in the project root.

```env
PORT=5000

MONGODB_URI=your_mongodb_connection_string

BETTER_AUTH_SECRET=your_better_auth_secret
BETTER_AUTH_URL=http://localhost:3000

CLIENT_URL=http://localhost:3000

STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

Use the actual variable names from your current server implementation if they differ.

### ⚠️ Security

Never commit:

```text
.env
.env.local
.env.production
```

or any API/database credentials to GitHub.

---

## 🗄️ Database

VitaForge uses **MongoDB** with the native MongoDB driver.

The application stores platform data in MongoDB collections such as:

```text
users
trainerApplications
classes
forumPosts
```

Additional collections can be added as the platform grows.

---

## 🔌 API

The server exposes REST endpoints used by the VitaForge client.

### Base URL

Development:

```text
http://localhost:5000
```

Production:

```text
https://your-server-domain.com
```

---

## 📋 Main API Areas

### Users

```text
GET    /api/users
GET    /api/users/:id
PATCH  /api/users/:id
```

Used for user management and role-related operations.

### Trainer Applications

```text
POST   /api/trainer-applications
GET    /api/trainer-applications
GET    /api/trainer-applications/:id
PATCH  /api/trainer-applications/:id
DELETE /api/trainer-applications/:id
```

The trainer application system allows users to apply for trainer status and administrators to review applications.

### Classes

```text
GET    /api/classes
GET    /api/classes/:id
POST   /api/classes
PATCH  /api/classes/:id
DELETE /api/classes/:id
```

Used for fitness class management.

### Forum

```text
GET    /api/forum
GET    /api/forum/:id
POST   /api/forum
PATCH  /api/forum/:id
DELETE /api/forum/:id
```

Used for community/forum functionality.

> Keep the endpoint list synchronized with the actual routes implemented in the server.

---

## 🔐 Role-Based Access

VitaForge supports three roles:

```text
user
trainer
admin
```

### User

Regular platform members can:

* Browse classes
* Enroll in classes
* Participate in the community
* Apply to become trainers
* Manage their profile

### Trainer

Trainers can:

* Access the trainer dashboard
* Manage their classes
* View relevant members
* Manage trainer-related information

### Admin

Administrators can:

* Manage users
* Manage trainers
* Review trainer applications
* Approve/reject applications
* Manage classes
* Manage platform content

---

## ▶️ Running the Server

Start the development server:

```bash
npm run dev
```

Or, depending on the configured scripts:

```bash
npm start
```

The API will be available at:

```text
http://localhost:5000
```

---

## 🔗 Frontend Connection

The VitaForge client uses the server URL through:

```env
NEXT_PUBLIC_SERVER_URL=http://localhost:5000
```

For production:

```env
NEXT_PUBLIC_SERVER_URL=https://your-server-domain.com
```

Make sure CORS is configured to allow requests from the frontend domain.

---

## 🧪 Development

Recommended development workflow:

```bash
npm install
npm run dev
```

Then run the VitaForge client separately.

```text
Client  → http://localhost:3000
Server  → http://localhost:5000
MongoDB → MongoDB Atlas / local MongoDB
```

---

## 🚀 Deployment

Before deployment:

1. Configure production environment variables.
2. Configure MongoDB Atlas/network access.
3. Configure Better Auth production settings.
4. Configure Stripe production keys.
5. Configure CORS with the production frontend URL.
6. Deploy the Express server.
7. Update the client's `NEXT_PUBLIC_SERVER_URL`.

---

## 🔒 Security Recommendations

* Never expose MongoDB credentials.
* Never commit `.env` files.
* Use a strong `BETTER_AUTH_SECRET`.
* Use separate development and production credentials.
* Restrict MongoDB network access.
* Validate API input.
* Protect admin-only endpoints.
* Verify authenticated users before modifying protected resources.
* Validate Stripe webhook requests.

---

