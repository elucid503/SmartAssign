# SmartAssign Backend

Backend server for SmartAssign - Automated Time Management System.

## Quick Start

### Prerequisites
- Bun installed
- MongoDB running locally or connection URI

### Installation

```bash
bun install
```

### Configuration

Copy `.env.example` to `.env` and update:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/smartassign
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=30d
CORS_ORIGIN=http://localhost:5173
```

### Running

Development mode (with hot reload):
```bash
bun run dev
```

Production build:
```bash
bun run build
bun run start
```

## API Endpoints

See main README.md for full API documentation.

### Health Check
```
GET /health
```

### Base URL
All API routes are prefixed with `/api`:
- `/api/users` - Authentication and user management
- `/api/tasks` - Task CRUD operations
- `/api/calendar` - Calendar event management
- `/api/schedule` - Automated scheduling

## Project Structure

```
Backend/
├── Src/
│   ├── Config/          # Database configuration
│   ├── Controllers/     # Request handlers
│   ├── Middleware/      # Authentication middleware
│   ├── Models/          # MongoDB schemas
│   ├── Routes/          # API routes
│   ├── Services/        # Business logic (scheduling)
│   ├── Utils/           # Helpers (auth, validation)
│   └── Index.ts         # Application entry point
├── .env                 # Environment variables (not in git)
├── .env.example         # Environment template
├── package.json         # Dependencies
└── tsconfig.json        # TypeScript config
```

## Database Models

### User
- Email (unique, required)
- Password (hashed)
- Name

### Task
- UserId (reference)
- Title, Description
- DueDate, Category, Priority
- EstimatedTime, Status
- Subtasks (embedded)
- Scheduling info (IsScheduled, ScheduledStartTime, ScheduledEndTime)

### Event
- UserId (reference)
- Title, Description
- StartTime, EndTime
- Location, Category, Color
- Recurrence pattern
- Reminders, IsAllDay

## Authentication

Uses JWT tokens with Bearer authentication:

```
Authorization: Bearer <token>
```

Tokens expire after 30 days (configurable via `JWT_EXPIRES_IN`).

## Error Handling

All errors return JSON:
```json
{
  "error": "Error message"
}
```

Common status codes:
- 400: Bad request / validation error
- 401: Unauthorized
- 404: Not found
- 500: Server error

## Technologies

- **Hono**: Fast HTTP framework
- **Mongoose**: MongoDB ODM
- **JWT**: Authentication
- **bcryptjs**: Password hashing
- **Zod**: Schema validation
- **date-fns**: Date manipulation
