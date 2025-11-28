import { Hono } from 'hono';
import { TaskController } from '../Controllers/TaskController';
import { AuthMiddleware } from '../Middleware/Auth';

const TaskRoutes = new Hono();

// All task routes require authentication
TaskRoutes.use('*', AuthMiddleware);

// Task CRUD operations
TaskRoutes.post('/', TaskController.CreateTask);
TaskRoutes.get('/', TaskController.GetAllTasks);
TaskRoutes.get('/:id', TaskController.GetTaskById);
TaskRoutes.put('/:id', TaskController.UpdateTask);
TaskRoutes.delete('/:id', TaskController.DeleteTask);

// Subtask operations
TaskRoutes.post('/:id/subtasks', TaskController.AddSubtask);
TaskRoutes.put('/:id/subtasks/:subtaskId', TaskController.UpdateSubtask);
TaskRoutes.delete('/:id/subtasks/:subtaskId', TaskController.DeleteSubtask);

export default TaskRoutes;
