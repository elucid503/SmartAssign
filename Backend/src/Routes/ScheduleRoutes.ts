import { Hono } from 'hono';
import { ScheduleController } from '../Controllers/ScheduleController';
import { AuthMiddleware } from '../Middleware/Auth';

const ScheduleRoutes = new Hono();

// All schedule routes require authentication
ScheduleRoutes.use('*', AuthMiddleware);

// Schedule automation operations
ScheduleRoutes.get('/suggestions', ScheduleController.GetSuggestions);
ScheduleRoutes.post('/apply', ScheduleController.ApplySuggestion);
ScheduleRoutes.post('/reschedule/:id', ScheduleController.RescheduleTask);

export default ScheduleRoutes;
