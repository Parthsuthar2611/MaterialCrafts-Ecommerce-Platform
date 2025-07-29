# 🛍️ MaterialCraftsHub - E-commerce Platform for Materials & Designs

MaterialCraftsHub is a full-stack web application built to streamline the process of purchasing raw materials (like wood, metal, ACP) and applying CNC craft designs online. The platform supports role-based login for Buyers and Admins, real-time cart updates, and a seamless shopping experience.

---

## ✨ Features

### 👤 Buyer Features:
- Browse materials and custom CNC designs
- View price dynamically based on size and design
- Add products to cart
- Combined login/signup page with role selection (Buyer/Admin)
- Secure checkout with order summary
- Authentication with JWT

### 🛠️ Admin Features:
- Manage materials and designs
- View and update inventory
- Secure login with protected dashboard
- Role-based access control

---

## 🧰 Tech Stack

| Frontend       | Backend         | Database    | Auth           |
|----------------|------------------|-------------|----------------|
| React.js       | Node.js + Express| MySQL       | JWT (JSON Web Token) |

Optional tools:
- React Context API (for Auth & Cart)
- Tailwind CSS or custom CSS
- Stripe (for mock/test payments)

---

## 📂 Folder Structure

```bash
├── frontend/
│   ├── components/
│   ├── pages/
│   ├── contexts/
│   └── App.js
│
├── backend/
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   └── server.js
│
└── README.md
