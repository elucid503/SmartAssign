import { Hono } from 'hono';
import { UserController } from '../Controllers/UserController';
import { AuthMiddleware } from '../Middleware/Auth';

const UserRoutes = new Hono();

// Public routes
UserRoutes.post('/register', UserController.Register);
UserRoutes.post('/login', UserController.Login);

// Protected routes
UserRoutes.get('/profile', AuthMiddleware, UserController.GetProfile);

export default UserRoutes;
