<p align="center">
  <img src="frontend/public/fist.png" alt="Sangam Roots Logo" width="80" />
</p>

<h1 align="center">Sangam Roots</h1>

<p align="center">
  <strong>A mathematical validation and kinship engine for managing family trees governed by Dravidian kinship parity and descent rules.</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#project-structure">Project Structure</a> •
  <a href="#api-reference">API Reference</a> •
  <a href="#license">License</a>
</p>

---

## Overview

**Sangam Roots** is a full-stack web application for building, visualizing, and managing family trees using Dravidian kinship logic. It features an interactive graph-based tree visualization, a kinship calculator that determines exact relationship terms between any two family members, role-based access control, cross-tree family linking through marriages, and real-time activity logging.

---

## Features

### 🌳 Interactive Family Tree Visualization
- Graph-based tree rendering powered by **React Flow** and **Dagre** auto-layout
- Drag-and-pan canvas with zoom controls, minimap, and fit-to-view
- Gender-differentiated node styling (blue for male, pink for female)
- Visual indicators for deceased members, search highlights, and relation tracing

### 🔗 Kinship Calculator
- Determine the exact Dravidian kinship term between any two members
- Supports parity-based relationship resolution
- Traces relationship paths through the tree graph

### 👥 Role-Based Access Control
- **Admin** — Full control: create/delete trees, manage members, assign roles, approve join requests
- **Sub-Admin** — Can add/edit members and manage nodes
- **Standard** — View-only access with the ability to edit their own linked profile

### 🌐 Cross-Tree Linking
- Link families across different trees through spousal connections
- Navigate seamlessly between linked family trees
- Imported spouse nodes display a "Check Family Tree" button to jump to the origin tree

### 📋 Activity Logging & Revert
- All tree modifications are logged with timestamps and user attribution
- Admins and Sub-Admins can revert changes from the activity history panel

### 🔔 Notifications
- Birthday and anniversary reminders for family members
- 30-day lookahead for upcoming events
- Mark-as-read functionality with unread count badges

### 🔐 Authentication
- Email/password registration with Firebase email verification
- Google OAuth sign-in
- Password reset via email
- JWT-based session management with auto-expiry

### 👤 Universal Profile & Sync
- Centralized user profile with personal details, profile picture upload, and social links
- Granular sync preferences — choose which fields auto-copy to your assigned tree node
- Profile picture upload via Google Drive integration

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 19** | UI framework |
| **Vite** | Build tool and dev server |
| **Tailwind CSS** | Utility-first styling with custom design system |
| **React Flow** | Interactive graph/tree visualization |
| **Dagre** | Automatic graph layout algorithm |
| **Lucide React** | Icon library |
| **Firebase SDK** | Client-side authentication |

### Backend
| Technology | Purpose |
|---|---|
| **Node.js + Express** | REST API server |
| **MongoDB + Mongoose** | Database and ODM |
| **Firebase Admin SDK** | Server-side auth verification |
| **JWT (jsonwebtoken)** | Session token management |
| **Google APIs** | Google Drive file uploads (profile pictures) |
| **bcryptjs** | Password hashing |
| **express-mongo-sanitize** | Input sanitization |

---

## Getting Started

### Prerequisites

- **Node.js** v18+ and **npm**
- **MongoDB** (Atlas cloud instance or local)
- **Firebase** project with Authentication enabled (Email/Password + Google providers)
- **Google Cloud** service account with Drive API access (for profile picture uploads)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/Family-Tree.git
cd Family-Tree
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend/` with the following variables:

```env
PORT=5000
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>

# Firebase Service Account (for server-side auth)
FIREBASE_TYPE=service_account
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token

# Google Drive (for profile picture uploads)
GOOGLE_DRIVE_FOLDER_ID=your_drive_folder_id
```

Start the backend:

```bash
node server.js
```

The server will start on `http://localhost:5000`.

### 3. Frontend Setup

```bash
cd frontend
npm install
```

The frontend uses Firebase client-side SDK. Configure your Firebase project credentials in `frontend/src/utils/firebase.js`.

Start the dev server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Project Structure

```
Family-Tree/
├── backend/
│   ├── config/
│   │   └── db.js                # MongoDB connection setup
│   ├── controllers/
│   │   ├── authController.js    # Auth logic (register, login, profile)
│   │   ├── kinshipController.js # Kinship calculation engine
│   │   ├── superadminController.js
│   │   └── treeController.js    # Tree CRUD, node/edge management
│   ├── middleware/
│   │   ├── auth.js              # JWT verification middleware
│   │   └── sanitize.js          # Input sanitization
│   ├── models/
│   │   ├── ActivityLog.js       # Tree modification audit log
│   │   ├── Edge.js              # Relationship edges (parent-child, spouse)
│   │   ├── JoinRequest.js       # Pending tree join requests
│   │   ├── Node.js              # Family member nodes
│   │   ├── Notification.js      # Birthday/anniversary notifications
│   │   ├── Tree.js              # Family tree metadata
│   │   └── User.js              # User accounts & profiles
│   ├── routes/
│   │   ├── auth.js              # /api/auth/*
│   │   ├── kinship.js           # /api/kinship/*
│   │   ├── superadmin.js        # /api/superadmin/*
│   │   └── trees.js             # /api/trees/*
│   ├── utils/
│   │   └── telegramPolling.js   # (Deprecated) Telegram bot integration
│   ├── server.js                # Express app entry point
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   └── fist.png             # App logo/favicon
│   ├── src/
│   │   ├── components/
│   │   │   ├── Canvas.jsx       # React Flow tree visualization
│   │   │   ├── CustomNode.jsx   # Family member node component
│   │   │   ├── LandingPage.jsx  # Public landing page with auth forms
│   │   │   ├── MailVerification.jsx # Email verification flow
│   │   │   ├── Navbar.jsx       # Top navigation bar
│   │   │   ├── NodeModal.jsx    # Add/edit member modal
│   │   │   ├── NotificationViewModal.jsx
│   │   │   ├── Profile.jsx      # User profile management
│   │   │   ├── RolesModal.jsx   # Role & join request management
│   │   │   ├── Sidebar.jsx      # Sidebar with search, filters, logs
│   │   │   └── SuperAdminDashboard.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # Global auth state provider
│   │   ├── utils/
│   │   │   ├── api.js           # API client (axios wrapper)
│   │   │   └── firebase.js      # Firebase client initialization
│   │   ├── App.jsx              # Root application component
│   │   ├── App.css
│   │   ├── index.css            # Global design system & utilities
│   │   └── main.jsx             # React entry point
│   ├── index.html
│   ├── tailwind.config.js       # Tailwind design tokens
│   ├── vite.config.js
│   └── package.json
│
└── README.md
```

---

## API Reference

### Authentication — `/api/auth`
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/register` | Register with email/password |
| `POST` | `/login` | Login with email/password |
| `POST` | `/firebase-login` | Login via Firebase ID token |
| `POST` | `/logout` | Invalidate session |
| `GET` | `/me` | Get current user profile |
| `PUT` | `/profile` | Update profile & sync settings |
| `POST` | `/upload-profile-picture` | Upload avatar to Google Drive |

### Trees — `/api/trees`
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/` | Create a new family tree |
| `GET` | `/` | List user's accessible trees |
| `GET` | `/:treeId` | Get tree with all nodes and edges |
| `DELETE` | `/:treeId` | Delete a tree (Admin only) |
| `POST` | `/:treeId/nodes` | Add a member node |
| `PUT` | `/:treeId/nodes/:nodeId` | Edit a member node |
| `DELETE` | `/:treeId/nodes/:nodeId` | Delete a member node |
| `POST` | `/:treeId/edges` | Create a relationship edge |
| `POST` | `/join` | Request to join a tree by ID |
| `GET` | `/:treeId/join-requests` | List pending join requests |
| `PUT` | `/:treeId/join-requests/:requestId` | Approve/reject a request |
| `GET` | `/:treeId/logs` | Get activity logs |
| `POST` | `/:treeId/logs/:logId/revert` | Revert a logged action |

### Kinship — `/api/kinship`
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/:treeId/relation/:nodeA/:nodeB` | Calculate kinship between two nodes |

### SuperAdmin — `/api/superadmin`
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/users` | List all users (SuperAdmin only) |
| `PUT` | `/users/:userId/role` | Change a user's global role |

---

## Data Models

### Node (Family Member)
```
name, gender, dob, dateOfDeath, isDeceased, bloodGroup, gotram,
generationLevel, parity, profilePictureUrl, mobileNumber, email,
socialLinks[], linkedUserId, crossTreeLinkId, treeId
```

### Edge (Relationship)
```
sourceNodeId, targetNodeId, relationshipType (parent_child | spouse), treeId
```

### Tree
```
treeName, createdBy, admins[], subAdmins[], members[]
```

---

## Design System

The frontend uses a custom design system built on top of Tailwind CSS:

- **Color Palette** — Dark slate backgrounds (`#020617` → `#334155`) with emerald/teal accents
- **Typography** — Inter (UI) + JetBrains Mono (code/IDs)
- **Glassmorphism** — `.glass`, `.glass-heavy`, `.glass-light` utility classes
- **Component Classes** — `.btn-primary`, `.btn-secondary`, `.btn-danger`, `.btn-ghost`, `.input-field`, `.card`, `.badge-*`, `.section-label`
- **Animations** — `fade-in`, `fade-in-up`, `slide-up`, `float`, `glow-pulse`, `shimmer`
- **Shadows** — `glow-sm/md/lg/xl` for emerald glow effects

---

## License

This project is for educational and personal use.

---

<p align="center">
  Built with ❤️ for preserving Dravidian family heritage
</p>
