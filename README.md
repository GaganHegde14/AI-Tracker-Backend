# AI Task Manager - Backend

A robust Node.js/Express backend API for the AI Task Manager application with Google Gemini AI integration, user authentication, and comprehensive task management features.

## Features

- 🤖 **AI Integration** - Google Gemini API for intelligent task creation and chat assistance
- 🔐 **Authentication** - JWT-based secure user authentication and authorization
- 📝 **Task Management** - Full CRUD operations with AI-enhanced task creation
- 💬 **AI Chat System** - ChatGPT-style AI assistant for task-related conversations
- 🖼️ **File Upload** - Cloudinary integration for profile picture uploads
- 📊 **Support System** - Comprehensive customer support with categorized tickets
- 🏆 **Leaderboards** - Global and friends-based productivity rankings
- 🎯 **Focus Sessions** - Session tracking and analytics

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database with Mongoose ODM
- **JWT** - Authentication tokens
- **Google Gemini AI** - AI chat and task generation
- **Cloudinary** - Image storage and management
- **Multer** - File upload middleware
- **bcrypt** - Password hashing

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- MongoDB (local or Atlas)
- Google Gemini API key
- Cloudinary account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/GaganHegde14/AI-Tracker-Backend.git
cd AI-Tracker-Backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment variables:
```bash
cp .env.example .env
```

4. Update `.env` with your configurations:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/ai-task-manager
JWT_SECRET=your-super-secret-jwt-key
GEMINI_API_KEY=your-google-gemini-api-key
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
CLIENT_URL=http://localhost:5173
```

5. Start the development server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Tasks
- `GET /api/tasks` - Get user tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/tasks/ai` - AI-powered task creation

### AI Chat
- `GET /api/ai/chats` - Get chat history
- `POST /api/ai/chat` - Send message to AI assistant
- `DELETE /api/ai/chats` - Clear all chats

### User Management
- `GET /api/user/info` - Get user information
- `POST /api/user/profile-pic` - Update profile picture
- `PUT /api/user/password` - Update password
- `DELETE /api/user/account` - Delete account

### Support System
- `POST /api/support` - Create support ticket
- `GET /api/support` - Get user's support tickets
- `PUT /api/support/:id` - Update support ticket status

### Leaderboards
- `GET /api/leaderboard/global` - Get global leaderboard
- `GET /api/leaderboard/friends` - Get friends leaderboard
- `POST /api/leaderboard/friends/:userId` - Add friend
- `DELETE /api/leaderboard/friends/:userId` - Remove friend

## Environment Variables

### Required
- `PORT` - Server port (default: 3000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `GEMINI_API_KEY` - Google Gemini API key
- `CLIENT_URL` - Frontend URL for CORS

### Optional (Cloudinary)
- `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret

## Database Models

### User Schema
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  profilePic: String (Cloudinary URL),
  isPremium: Boolean,
  friends: [ObjectId],
  createdAt: Date,
  updatedAt: Date
}
```

### Task Schema
```javascript
{
  title: String,
  description: String,
  priority: Enum ['high', 'medium', 'low'],
  dueDate: Date,
  status: Enum ['pending', 'completed'],
  steps: [String],
  estimatedTime: String,
  userId: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

### AI Chat Schema
```javascript
{
  userId: ObjectId,
  message: String,
  response: String,
  timestamp: Date
}
```

### Support Schema
```javascript
{
  userId: ObjectId,
  category: Enum ['technical', 'billing', 'feature', 'other'],
  priority: Enum ['low', 'medium', 'high'],
  subject: String,
  message: String,
  status: Enum ['open', 'in-progress', 'resolved', 'closed'],
  createdAt: Date,
  updatedAt: Date
}
```

## AI Integration

The application uses Google Gemini AI for:
- **Smart Task Creation**: Convert natural language into structured tasks
- **AI Assistant**: Provide task management advice and insights
- **Chat Functionality**: Maintain conversation history and context

### AI Prompts
- Task creation prompts in `/src/utils/aiPrompt.js`
- Assistant prompts in `/src/utils/aiAssistantPrompt.js`

## Deployment

### Render Deployment

1. Connect your GitHub repository to Render
2. Set environment variables in Render dashboard
3. Use the following build command: `npm install`
4. Start command: `npm start`

### Environment Setup for Production
```env
NODE_ENV=production
MONGODB_URI=your-mongodb-atlas-connection-string
JWT_SECRET=your-production-jwt-secret
GEMINI_API_KEY=your-google-gemini-api-key
CLIENT_URL=https://your-frontend-domain.vercel.app
```

## Project Structure

```
src/
├── app.js              # Express app configuration
├── index.js            # Server entry point
├── config/             # Configuration files
│   ├── aiAssistantService.js
│   ├── aiTaskGenrator.js
│   └── cloudinary.js
├── controllers/        # Route controllers
│   ├── Auth_Controllers/
│   ├── Task_Controllers/
│   ├── User_Controllers/
│   ├── Ai_Controllers/
│   └── Ai_Chats_controllers/
├── db/                 # Database configuration
├── middlewares/        # Custom middlewares
├── models/             # Mongoose models
├── routes/             # API routes
└── utils/              # Utility functions
```

## Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests (to be implemented)

## Security Features

- JWT token authentication
- Password hashing with bcrypt
- CORS configuration
- Request validation
- Protected routes with auth middleware

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## API Testing

Import the Postman collection (if available) or test endpoints manually:

```bash
# Register new user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Login user
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## License

This project is licensed under the MIT License.

## Support

For support, email support@aitaskmanager.com or create a support ticket through the application.