import { Hono } from 'hono';

import { AuthMiddleware } from '../Middleware/Auth';

import { ScheduleController } from '../Controllers/ScheduleController';

const ScheduleRoutes = new Hono();

// All schedule routes require authentication

ScheduleRoutes.use('*', AuthMiddleware);

// Schedule automation operations

ScheduleRoutes.get('/suggestions', ScheduleController.GetSuggestions);
ScheduleRoutes.post('/apply', ScheduleController.ApplySuggestion);
ScheduleRoutes.post('/reschedule/:id', ScheduleController.RescheduleTask);

export default ScheduleRoutes;