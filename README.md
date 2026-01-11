# POKE Reinsurance - Frontend Dashboard

A modern, responsive React dashboard with role-based access control for POKE Reinsurance.

## ✨ Features

- **Beautiful UI** - Clean, modern design with smooth animations
- **Role-Based Navigation** - Dynamic sidebar based on user permissions
- **Secure Authentication** - JWT tokens with automatic refresh
- **CSRF Protection** - Integrated with backend security
- **Responsive Design** - Works on desktop, tablet, and mobile
- **User Management** - Full CRUD for users (Super Admin)
- **Role Management** - Configure roles and permissions (Super Admin)
- **Menu Management** - Dynamic menu configuration (Super Admin)

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18
- Backend server running on port 5000

### Installation

```bash
# Navigate to frontend directory
cd poke-reinsurance-frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will open at `http://localhost:5173`

## 🔑 Default Login

```
Username: superadmin
Password: SuperAdmin@123!Secure
```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Badge.jsx
│   ├── Button.jsx
│   ├── Card.jsx
│   ├── ConfirmDialog.jsx
│   ├── DashboardLayout.jsx
│   ├── Header.jsx
│   ├── Input.jsx
│   ├── LoadingSpinner.jsx
│   ├── Modal.jsx
│   ├── ProtectedRoute.jsx
│   ├── Select.jsx
│   ├── Sidebar.jsx
│   └── Table.jsx
├── contexts/
│   └── AuthContext.jsx  # Authentication state management
├── pages/
│   ├── DashboardPage.jsx
│   ├── LoginPage.jsx
│   ├── MenuManagementPage.jsx
│   ├── NotFoundPage.jsx
│   ├── PlaceholderPages.jsx
│   ├── RoleManagementPage.jsx
│   └── UserManagementPage.jsx
├── services/
│   └── api.js           # Axios API configuration
├── App.jsx              # Main app with routing
├── index.css            # Global styles
└── main.jsx             # Entry point
```

## 🎨 Tech Stack

- **React 18** - UI library
- **Vite** - Build tool
- **React Router 6** - Routing
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **Lucide React** - Icons
- **React Hot Toast** - Notifications

## 🔐 Authentication Flow

1. User enters credentials on login page
2. Frontend fetches CSRF token
3. Login request with CSRF token in header
4. Backend returns JWT access token + refresh token (cookie)
5. Access token stored in localStorage
6. Refresh token stored in HTTP-only cookie
7. Auto-refresh when access token expires

## 📱 Responsive Breakpoints

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

## 🛠️ Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

## 📝 Environment Variables

The frontend uses Vite's proxy for API calls in development. For production, configure the API URL accordingly.

## 🎯 Role-Based Access

| Role | Access |
|------|--------|
| Super Admin | Everything + Admin pages |
| Manager | Dashboard, KPIs, Reports, Claims |
| Analyst | Dashboard, KPIs Overview, Reports |
| Claims Officer | Dashboard, Claims |

## 📄 License

Proprietary - POKE Reinsurance
