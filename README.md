# VoyageHub - Comprehensive Vacation Planning Application

VoyageHub is a full-stack web application designed for comprehensive vacation planning and management. Built with React, TypeScript, Node.js, and SQLite, it provides a modern, secure, and feature-rich platform for organizing trips, managing budgets, collaborating with travel companions, and storing important documents.

## 🌟 Features

### Core Functionality
- **User Authentication**: Secure JWT-based authentication with email/password
- **Vacation Management**: Create, edit, and manage multiple vacation plans
- **Multi-destination Support**: Plan trips with multiple stops and locations
- **Real-time Collaboration**: Work together with travel companions in real-time
- **Task Management**: Collaborative checklists with drag-and-drop functionality
- **Budget Tracking**: Multi-currency support with visual analytics
- **Document Management**: Secure storage for tickets, passports, and other documents
- **Notification System**: Smart reminders and real-time updates

### Technical Features
- **Progressive Web App (PWA)**: Offline functionality and mobile app-like experience
- **Real-time Updates**: WebSocket integration for live collaboration
- **Responsive Design**: Mobile-first design that works on all devices
- **Security**: Input validation, XSS protection, CSRF prevention, and rate limiting
- **Performance**: Optimized bundle size, lazy loading, and efficient caching

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd voyagehub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the development servers**
   ```bash
   npm run dev
   ```

   This will start both the client (Vite) and server (Express) concurrently.

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001

## 📁 Project Structure

```
voyagehub/
├── src/                          # Frontend React application
│   ├── components/               # Reusable UI components
│   │   ├── ui/                  # Base UI components (Button, Input, Modal, etc.)
│   │   ├── auth/                # Authentication components
│   │   ├── vacation/            # Vacation-related components
│   │   ├── dashboard/           # Dashboard components
│   │   └── layout/              # Layout components (Header, Sidebar)
│   ├── pages/                   # Page components
│   ├── stores/                  # Zustand state management
│   ├── types/                   # TypeScript type definitions
│   └── utils/                   # Utility functions
├── server/                      # Backend Node.js application
│   ├── routes/                  # API route handlers
│   ├── middleware/              # Express middleware
│   ├── database.ts              # SQLite database setup
│   └── index.ts                 # Server entry point
├── public/                      # Static assets
└── uploads/                     # File upload directory
```

## 🛠 Technology Stack

### Frontend
- **React 18+**: Modern React with hooks and concurrent features
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Zustand**: Lightweight state management
- **React Router**: Client-side routing
- **Lucide React**: Beautiful icon library
- **GSAP**: High-performance animations
- **Recharts**: Data visualization

### Backend
- **Node.js**: JavaScript runtime
- **Express**: Web application framework
- **SQLite**: Lightweight database
- **Socket.IO**: Real-time communication
- **JWT**: Authentication tokens
- **bcryptjs**: Password hashing
- **Multer**: File upload handling
- **Helmet**: Security middleware

### Development Tools
- **Vite**: Fast build tool and dev server
- **ESLint**: Code linting
- **TypeScript**: Static type checking
- **Concurrently**: Run multiple commands

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Input Validation**: Server-side validation for all inputs
- **Rate Limiting**: Prevent abuse and DDoS attacks
- **CORS Protection**: Configured for specific origins
- **Helmet Security**: Security headers and protection
- **File Upload Security**: Type and size validation
- **SQL Injection Prevention**: Parameterized queries

## 📱 PWA Features

- **Offline Support**: Service worker for offline functionality
- **App-like Experience**: Installable on mobile devices
- **Push Notifications**: Real-time notifications
- **Responsive Design**: Works on all screen sizes
- **Fast Loading**: Optimized performance

## 🎨 Design System

### Color Palette
- **Primary**: Blue (#2563EB) - Trust, reliability, travel
- **Secondary**: Teal (#0D9488) - Growth, harmony, adventure
- **Accent**: Orange (#EA580C) - Energy, enthusiasm, warmth
- **Success**: Green - Positive actions and confirmations
- **Warning**: Yellow - Cautions and important notices
- **Error**: Red - Errors and destructive actions

### Typography
- **Font Family**: Inter - Modern, readable, professional
- **Font Weights**: 300, 400, 500, 600, 700
- **Line Heights**: 120% for headings, 150% for body text

### Spacing System
- **Base Unit**: 8px
- **Scale**: 4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px, 64px

## 🔄 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PATCH /api/auth/profile` - Update user profile

### Vacations
- `GET /api/vacations` - Get user's vacations
- `POST /api/vacations` - Create new vacation
- `GET /api/vacations/:id` - Get vacation details
- `PATCH /api/vacations/:id` - Update vacation
- `DELETE /api/vacations/:id` - Delete vacation

### Tasks
- `GET /api/tasks?vacationId=:id` - Get vacation tasks
- `POST /api/tasks` - Create new task
- `PATCH /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Budget
- `GET /api/budget/:vacationId` - Get vacation budget
- `PATCH /api/budget/:vacationId` - Update budget
- `POST /api/budget/:vacationId/expenses` - Add expense
- `PATCH /api/budget/expenses/:id` - Update expense
- `DELETE /api/budget/expenses/:id` - Delete expense

### Documents
- `GET /api/documents?vacationId=:id` - Get vacation documents
- `POST /api/documents/upload` - Upload document
- `PATCH /api/documents/:id` - Update document
- `DELETE /api/documents/:id` - Delete document

### Notifications
- `GET /api/notifications` - Get user notifications
- `POST /api/notifications` - Create notification
- `PATCH /api/notifications/:id/read` - Mark as read
- `DELETE /api/notifications/:id` - Delete notification

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Environment Variables
Set the following environment variables in production:
- `NODE_ENV=production`
- `JWT_SECRET=your-secure-secret`
- `DATABASE_URL=path-to-production-db`
- `CLIENT_URL=your-frontend-url`

### Recommended Hosting
- **Frontend**: Vercel, Netlify, or AWS S3 + CloudFront
- **Backend**: Railway, Heroku, or AWS EC2
- **Database**: SQLite for small scale, PostgreSQL for larger deployments

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## 📈 Performance Optimization

- **Code Splitting**: Lazy loading of routes and components
- **Image Optimization**: WebP format with fallbacks
- **Bundle Analysis**: Webpack bundle analyzer
- **Caching**: Service worker and HTTP caching
- **Database Indexing**: Optimized queries with proper indexes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@voyagehub.com or create an issue in the repository.

## 🗺 Roadmap

### Phase 1 (Current)
- ✅ Core vacation planning features
- ✅ User authentication and profiles
- ✅ Basic task management
- ✅ Document storage
- ✅ Budget tracking

### Phase 2 (Next)
- 🔄 Advanced collaboration features
- 🔄 Mobile app (React Native)
- 🔄 Integration with booking platforms
- 🔄 AI-powered recommendations
- 🔄 Advanced analytics and reporting

### Phase 3 (Future)
- 📅 Social features and trip sharing
- 📅 Integration with travel APIs
- 📅 Advanced budget forecasting
- 📅 Multi-language support
- 📅 Enterprise features

---

Built with ❤️ by the VoyageHub team