# ☕ Coffee Chat — A Community-Driven Event Discovery Platform


A modern, real-time social platform where users can discover and join interest-based groups, create or attend events, and communicate through group/event-based chat rooms.


<p align="center">
  <a href="https://coffeechatweb.netlify.app/" target="_blank">
    <img src="https://img.shields.io/badge/Live Demo-Coffee Chat ☕-darkred?style=for-the-badge&logo=firefox" />
  </a>
</p>


## 🚀 Features

### 👥 User Management
- **Authentication**: Email/Password and Google OAuth
- **Profile Management**: Edit profile, upload photos, manage preferences
- **Password Reset**: Email-based password recovery
- **Dark Mode**: Toggle between light and dark themes


**Coffee Chat** is a web-based platform that connects like-minded individuals through interest-based groups and local events. Whether it’s tech meetups, book clubs, or coffee tastings, users can create, discover, and join communities aligned with their passions.

🔗 **Live Demo:** [Coffee Chat Demo](https://s85-madhav-capstone-coffee-chat.onrender.com/)

---

## 🌐 Key Features

- 🔍 **Discover and join interest-based groups**
- 📅 **Create and manage community events**
- 💬 **Participate in discussions and event planning**
- 🧠 **Personalized dashboards and recommendations**
- 🔐 **Secure authentication with JWT**
- 📱 **Responsive and accessible user interface**

---

## 🛠 Tech Stack

- **Frontend:** React.js
- **Backend:** Node.js + Express.js
- **Database:** MongoDB
- **Authentication:** JWT-based
- **Deployment:** AWS (EC2, S3, CloudFront)


### 🔍 Discovery & Search
- **Advanced Search**: Search by name, description, location
- **Filtering**: By category, city, date
- **Sorting**: By popularity, date, name
- **View Modes**: Grid and list views


## 📅 Capstone Execution Plan (4 Weeks)

### Week 1 — *Project Setup & Level 1 Development*

- ✅ **Day 1**: Repository initialization, README setup, folder structure
- ✅ **Day 2**: Design database schemas (Users, Groups, Events)
- ✅ **Day 3**: Develop Express API endpoints (CRUD for Groups & Events)
- ✅ **Day 4**: Initialize React frontend with basic routing
- ✅ **Day 5**: Create landing page & event listing components
- ✅ **Day 6**: Implement authentication (register/login, protected routes)
- ✅ **Day 7**: Code review, cleanup, and buffer for catch-up

---

### Week 2 — *Core Feature Development*

- ✅ **Day 8**: Group creation and member management
- ✅ **Day 9**: Event creation and participation flow
- ✅ **Day 10**: Build user profile and dashboard pages
- ✅ **Day 11**: Add comment threads for events
- ✅ **Day 12**: Integrate backend and frontend features
- ✅ **Day 13**: Apply consistent styling and theming
- ✅ **Day 14**: Unit testing and integration test coverage

---

### Week 3 — *Advanced Features & Deployment*

- 🚧 **Day 15**: Real-time notifications (group invites, event reminders)
- 🚧 **Day 16**: Implement search and filtering (interests, location)
- 🚧 **Day 17**: Responsive design for mobile and tablet
- 🚧 **Day 18**: Set up AWS deployment environments
- 🚧 **Day 19**: Deploy backend to AWS EC2
- 🚧 **Day 20**: Deploy frontend to AWS S3 + CloudFront
- 🚧 **Day 21**: Final checks and deployment validation

---

### Week 4 — *Polishing, Testing & Presentation*

- 🔧 **Day 22**: Final optimizations, bug fixes, and performance tweaks
- 📄 **Day 23**: Complete project documentation
- 🧪 **Day 24**: Full-scale user testing and QA
- 🎥 **Day 25**: Record pitch video and prepare demo assets
- 📝 **Day 26**: Submit final project deliverables
- 📢 **Day 27–28**: Present project and gather feedback


## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Socket.IO Client** - Real-time communication
- **Lucide React** - Icons
- **React Hot Toast** - Notifications
- **Date-fns** - Date manipulation
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **Socket.IO** - Real-time communication
- **JWT** - Authentication
- **Firebase Admin** - Google OAuth
- **Cloudinary** - Image uploads
- **Multer** - File handling
- **Nodemailer** - Email sending
- **bcryptjs** - Password hashing

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB
- npm or yarn

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd coffee-chat
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   # Server Configuration
   PORT=3000
   NODE_ENV=development
   
   # Database
   MONGODB_URI=mongodb://localhost:27017/coffee-chat
   
   # JWT Secret
   JWT_SECRET=your-super-secret-jwt-key-here
   
   # Frontend URL
   FRONTEND_URL=http://localhost:5173
   
   # Firebase Configuration (for Google OAuth)
   FIREBASE_PROJECT_ID=your-firebase-project-id
   FIREBASE_PRIVATE_KEY_ID=your-private-key-id
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour Private Key Here\n-----END PRIVATE KEY-----\n"
   FIREBASE_CLIENT_EMAIL=your-client-email@your-project.iam.gserviceaccount.com
   FIREBASE_CLIENT_ID=your-client-id
   FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
   FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
   FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
   FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/your-client-email%40your-project.iam.gserviceaccount.com
   
   # Cloudinary Configuration (for image uploads)
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   
   # Email Configuration (for password reset)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ```

4. **Start the backend server**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install --legacy-peer-deps
   ```

2. **Start the development server**
   ```bash
   npm run dev
   ```

## 🚀 Usage

### Starting the Application

1. **Start MongoDB** (if running locally)
   ```bash
   mongod
   ```

2. **Start Backend** (in backend directory)
   ```bash
   npm run dev
   ```

3. **Start Frontend** (in frontend directory)
   ```bash
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

### API Endpoints

#### Authentication
- `POST /api/users/signup` - User registration
- `POST /api/users/login` - User login
- `POST /api/users/google-login` - Google OAuth login
- `POST /api/users/google-signup` - Google OAuth signup
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

#### Groups
- `GET /api/groups` - Get all groups
- `GET /api/groups/:id` - Get group details
- `POST /api/groups` - Create new group
- `PUT /api/groups/:id` - Update group
- `DELETE /api/groups/:id` - Delete group
- `POST /api/groups/:id/join` - Join group
- `POST /api/groups/:id/leave` - Leave group

#### Events
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get event details
- `POST /api/events` - Create new event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event
- `POST /api/events/:id/rsvp` - RSVP to event

#### Chat
- `GET /api/chat/messages/:chatType/:chatId` - Get chat messages
- `POST /api/chat/mark-read` - Mark messages as read
- `DELETE /api/chat/messages/:messageId` - Delete message
- `PUT /api/chat/messages/:messageId` - Edit message
- `POST /api/chat/messages/:messageId/reactions` - Add reaction
- `DELETE /api/chat/messages/:messageId/reactions` - Remove reaction

## 🏗️ Project Structure

```
coffee-chat/
├── backend/
│   ├── config/
│   │   ├── cloudinary.js
│   │   └── socket.js
│   ├── controllers/
│   │   ├── userController.js
│   │   ├── groupController.js
│   │   └── eventController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── db.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Group.js
│   │   ├── Event.js
│   │   └── ChatMessage.js
│   ├── routes/
│   │   ├── userRoutes.js
│   │   ├── groupRoutes.js
│   │   ├── eventRoutes.js
│   │   └── chatRoutes.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── Components/
│   │   │   ├── Home/
│   │   │   └── Navbar/
│   │   ├── pages/
│   │   │   ├── Login/
│   │   │   ├── Signup/
│   │   │   ├── Profile/
│   │   │   ├── Groups/
│   │   │   ├── GroupDetails/
│   │   │   └── Events/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── tailwind.config.js
│   └── package.json
└── README.md
```

## 🔧 Configuration

### Firebase Setup
1. Create a Firebase project
2. Enable Google Authentication
3. Download service account key
4. Update environment variables

### Cloudinary Setup
1. Create a Cloudinary account
2. Get cloud name, API key, and secret
3. Update environment variables

### Email Setup (for password reset)
1. Configure SMTP settings
2. Update environment variables

## 🚀 Deployment

### Backend Deployment (Render/Railway)
1. Connect your repository
2. Set environment variables
3. Deploy

### Frontend Deployment (Vercel)
1. Connect your repository
2. Set build settings
3. Deploy

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email support@coffeechat.com or create an issue in the repository.

## 🔮 Future Features

## 🚀 Project Goals

- ✅ Build a fully functional full-stack MERN application
- ✅ Demonstrate clean code, scalable architecture, and intuitive UI/UX
- ✅ Gain hands-on experience with deployment and cloud infrastructure
- ✅ Deliver a production-ready portfolio project for job interviews

---

> Thank you for checking out **Coffee Chat** — stay tuned for upcoming updates and enhancements!

