import { Hono } from 'hono';

import { AuthMiddleware } from '../Middleware/Auth';

import { CalendarController } from '../Controllers/CalendarController';

const CalendarRoutes = new Hono();

// All calendar routes require authentication

CalendarRoutes.use('*', AuthMiddleware);

// Event CRUD operations

CalendarRoutes.post('/events', CalendarController.CreateEvent);
CalendarRoutes.get('/events', CalendarController.GetAllEvents);
CalendarRoutes.get('/events/:id', CalendarController.GetEventById);
CalendarRoutes.put('/events/:id', CalendarController.UpdateEvent);
CalendarRoutes.delete('/events/:id', CalendarController.DeleteEvent);

// Export calendar

CalendarRoutes.get('/export/ics', CalendarController.ExportToICS);

export default CalendarRoutes;