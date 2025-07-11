# ☕ Coffee Chat

A modern, real-time social platform where users can discover and join interest-based groups, create or attend events, and communicate through group/event-based chat rooms.

## 🚀 Features

### 👥 User Management
- **Authentication**: Email/Password and Google OAuth
- **Profile Management**: Edit profile, upload photos, manage preferences
- **Password Reset**: Email-based password recovery
- **Dark Mode**: Toggle between light and dark themes

### 🏘️ Groups
- **Create & Join**: Create new groups or join existing ones
- **Categories**: Technology, Sports, Music, Art, Food, Travel, Business, Education, Health, Other
- **Privacy Settings**: Public, Private, or Secret groups
- **Member Management**: Admin and moderator roles
- **Real-time Chat**: Group-based messaging with read receipts

### 🎉 Events
- **Event Creation**: Create events with detailed information
- **RSVP System**: Going, Interested, Not Attending options
- **Date Filtering**: Today, Tomorrow, This Week, This Month, Upcoming, Past
- **Bookmarking**: Save events for later
- **Event Chat**: Real-time communication for event attendees

### 💬 Real-time Chat
- **Socket.IO Integration**: Real-time messaging
- **Read Receipts**: See who has read your messages
- **Typing Indicators**: Know when someone is typing
- **Message Reactions**: React to messages with emojis
- **File Sharing**: Share images and files

### 🔍 Discovery & Search
- **Advanced Search**: Search by name, description, location
- **Filtering**: By category, city, date
- **Sorting**: By popularity, date, name
- **View Modes**: Grid and list views

### 📱 Responsive Design
- **Mobile-First**: Optimized for all screen sizes
- **Modern UI**: Built with Tailwind CSS
- **Smooth Animations**: Enhanced user experience

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

- [ ] Video calls
- [ ] Push notifications
- [ ] Mobile app
- [ ] Advanced analytics
- [ ] Group polls
- [ ] Event reminders
- [ ] Social sharing
- [ ] Advanced search filters
- [ ] Group events integration
- [ ] Payment integration for paid events

---

**Built with ❤️ by the Coffee Chat Team**
