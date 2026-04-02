# Social Media Platform (Project 1)

A full-stack, responsive social media application built with a modern tech stack. This platform allows users to create accounts, share posts with images, interact with others, and manage their professional-grade profiles.

## 🚀 Features

### Frontend
- **Modern UI/UX**: Built with React and Material UI, featuring a sleek, responsive design.
- **Authentication**: Secure login and registration with validation and error handling.
- **Post Management**: Users can create, view, edit, and delete posts.
- **Image Integration**: Seamless image uploads using ImageKit.io.
- **Dynamic Profile**: User profiles with editable details and post history.
- **Notifications**: Real-time feedback via React-Toastify.
- **Theme Support**: Intuitive navigation and consistent styling across all components.

### Backend
- **Express 5 API**: Robust RESTful API with modular routing.
- **Security**: Hardened with Helmet (CSP), Rate Limiting, and Mongo Sanitize.
- **Authentication**: JWT-based authentication with cookie-based (HttpOnly) token storage.
- **Validation**: Comprehensive data validation using Express-Validator.
- **Compression**: Gzip compression for faster API responses.
- **Storage**: MongoDB integration via Mongoose with optimized schemas for Users and Posts.

---

## 🛠️ Tech Stack

**Frontend:**
- [React](https://reactjs.org/) (Version 19)
- [Material UI (MUI)](https://mui.com/)
- [Vite](https://vitejs.dev/) (Build tool)
- [React Router 7](https://reactrouter.com/)
- [Axios](https://github.com/axios/axios) (API calls)
- [ImageKit React](https://imagekit.io/) (Image handling)

**Backend:**
- [Node.js](https://nodejs.org/)
- [Express 5](https://expressjs.com/)
- [MongoDB / Mongoose](https://www.mongodb.com/)
- [JSON Web Token (JWT)](https://jwt.io/)
- [Bcryptjs](https://github.com/dcodeIO/bcrypt.js/) (Password hashing)
- [Multer](https://github.com/expressjs/multer) (File handling)

---

## 📂 Project Structure

```text
project1/
├── frontend/               # React Application
│   ├── src/
│   │   ├── components/     # UI Components (Navbar, PostCards, Modals)
│   │   ├── pages/          # Page Components (Home, Profile, Login)
│   │   ├── context/        # Auth Context Management
│   │   └── services/       # API integration layers
│   └── public/             # Static assets
└── backend/                # Node.js / Express Server
    ├── controllers/        # Request handlers
    ├── models/             # Mongoose schemas (User, Post)
    ├── routes/             # API endpoints definitions
    ├── middleware/         # Auth and security logic
    └── server.js           # Server entry point
```

---

## 🏁 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) installed on your machine.
- [MongoDB](https://www.mongodb.com/cloud/atlas) connection URI.
- [ImageKit.io](https://imagekit.io/) account for image uploads.

### 1. Clone the Repository
```bash
git clone https://github.com/GAGANDEEP0-SINGH-07/Project-1.git
cd Project-1
```

### 2. Backend Setup
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend/` directory and add your credentials:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_secure_random_secret
   IMAGEKIT_PUBLIC_KEY=your_public_key
   IMAGEKIT_PRIVATE_KEY=your_private_key
   IMAGEKIT_URL_ENDPOINT=your_url_endpoint
   ```
4. Start the server (Development):
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Navigate to the frontend folder:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite dev server:
   ```bash
   npm run dev
   ```

The application should now be running at `http://localhost:5173` with the backend at `http://localhost:5000`.

---

## 🛡️ Security Measures
- **Helmet**: Sets various HTTP headers for security (CSP, Frameguard, etc.).
- **Rate-Limiting**: Prevents brute-force attacks on common entry points.
- **Mongo-Sanitize**: Protects against NoSQL injection.
- **HttpOnly Cookies**: Prevents XSS-based token theft.

---

## 📄 License
This project is licensed under the [ISC License](LICENSE).

---

## 👨‍💻 Author
**Gagandeep Singh**
- GitHub: [@GAGANDEEP0-SINGH-07](https://github.com/GAGANDEEP0-SINGH-07)
