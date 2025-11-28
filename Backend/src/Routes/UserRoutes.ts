import { Hono } from 'hono';

import { AuthMiddleware } from '../Middleware/Auth';

import { UserController } from '../Controllers/UserController';

const UserRoutes = new Hono();

// Public routes

UserRoutes.post('/register', UserController.Register);
UserRoutes.post('/login', UserController.Login);

// Protected routes

UserRoutes.get('/profile', AuthMiddleware, UserController.GetProfile);

export default UserRoutes;