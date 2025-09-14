# GraphQL Authentication API (TypeScript, MongoDB, JWT, OTP Email Verification)

This project implements **authentication with GraphQL** using:
- **Register** with email + password
- **Email OTP verification** (6-digit code via Nodemailer)
- **Login** with JWT
- **Middleware** to protect routes (`me` query)
- **MongoDB + Mongoose** for user storage
- **TypeScript** for type safety

---

## 🚀 Features
- Register a user
  - Hash password with `bcryptjs`
  - Generate a 6-digit OTP
  - Send OTP via email (Nodemailer)
  - Save OTP + expiry in DB
- Verify email with OTP
- Login with JWT (only verified users)
- Authenticated `me` query to fetch current user
- GraphQL custom error handling (`GraphQLError` with `extensions`)

---

## 📂 Folder Structure
```

server/
│── src/
│   ├── app.ts             # Entry point
│   ├── schema.ts            # GraphQL schema
│   ├── resolvers/
│   │   └── authResolver.ts  # Register, login, verifyEmail, me
│   ├── models/
│   │   └── User.ts          # User Mongoose schema
│   ├── middleware/
│   │   └── auth.ts          # JWT authentication middleware
│   └── utils/
│       └── sendEmail.ts     # Nodemailer email sending
│
│── .env                     # Environment variables
│── package.json

````

---

## ⚙️ .env File

Create a `.env` file at the root:

```env
PORT=8000
MONGO_URI=
JWT_SECRET=your_jwt_secret_here

# Email Config (example using Gmail)
EMAIL=your_email
PASSWORD=your_password
````

---

## 🛠️ Installation & Setup

```bash
# 1. Clone repo
git clone https://github.com/your-username/graphql-auth.git
cd graphql-auth/server

# 2. Install dependencies
npm install

# 3. Run development server
npm run dev
```

Server runs at:
👉 `http://localhost:4000/graphql`

---

## 📌 GraphQL API Examples

### 1️⃣ Register

```graphql
mutation {
  register(name: "Omer", email: "omer@example.com", password: "password123")
}
```

✅ Response:

```json
{
  "data": {
    "register": "Registration successful! Please verify your email."
  }
}
```

---

### 2️⃣ Verify Email

```graphql
mutation {
  verifyEmail(email: "omer@example.com", otp: "123456")
}
```

✅ Response:

```json
{
  "data": {
    "verifyEmail": "Email verified successfully!"
  }
}
```

---

### 3️⃣ Login

```graphql
mutation {
  login(email: "omer@example.com", password: "password123") {
    token
    user {
      id
      name
      email
    }
  }
}
```

✅ Response:

```json
{
  "data": {
    "login": {
      "token": "JWT_TOKEN_HERE",
      "user": {
        "id": "64bdf6...",
        "name": "Omer",
        "email": "omer@example.com"
      }
    }
  }
}
```

---

### 4️⃣ Me (Protected Query)

```graphql
query {
  me {
    id
    name
    email
  }
}
```

🔐 Add **Authorization header**:

```
{
  "Authorization": "Bearer JWT_TOKEN_HERE"
}
```

✅ Response:

```json
{
  "data": {
    "me": {
      "id": "64bdf6...",
      "name": "Omer",
      "email": "omer@example.com"
    }
  }
}
```

---

## 🧰 Tech Stack

* **Node.js + TypeScript**
* **Express + express-graphql**
* **MongoDB + Mongoose**
* **GraphQL**
* **JWT** for authentication
* **bcryptjs** for password hashing
* **Nodemailer** for email OTP


