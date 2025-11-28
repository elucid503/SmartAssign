import { Context } from 'hono';
import { GetUserId } from '../Middleware/Auth';
import { SchedulingService } from '../Services/SchedulingService';

export class ScheduleController {
  static async GetSuggestions(c: Context) {
    try {
      const UserId = GetUserId(c);
      const { startDate, endDate } = c.req.query();

      const Suggestions = await SchedulingService.GenerateScheduleSuggestions(
        UserId,
        startDate,
        endDate
      );

      return c.json({
        message: 'Schedule suggestions generated successfully',
        suggestions: Suggestions,
        count: Suggestions.length,
      });
    } catch (error: any) {
      return c.json({ error: error.message || 'Failed to generate suggestions' }, 500);
    }
  }

  static async ApplySuggestion(c: Context) {
    try {
      const UserId = GetUserId(c);
      const Body = await c.req.json();
      
      const { TaskId, ScheduledStart, ScheduledEnd } = Body;

      if (!TaskId || !ScheduledStart || !ScheduledEnd) {
        return c.json({ error: 'Missing required fields' }, 400);
      }

      const UpdatedTask = await SchedulingService.ApplyScheduleSuggestion(
        UserId,
        TaskId,
        new Date(ScheduledStart),
        new Date(ScheduledEnd)
      );

      if (!UpdatedTask) {
        return c.json({ error: 'Task not found' }, 404);
      }

      return c.json({
        message: 'Schedule applied successfully',
        task: UpdatedTask,
      });
    } catch (error: any) {
      return c.json({ error: error.message || 'Failed to apply suggestion' }, 500);
    }
  }

  static async RescheduleTask(c: Context) {
    try {
      const UserId = GetUserId(c);
      const TaskId = c.req.param('id');

      // Unschedule the task
      const { TaskModel } = await import('../Models/Task');
      const Task = await TaskModel.findOneAndUpdate(
        { _id: TaskId, UserId },
        {
          IsScheduled: false,
          ScheduledStartTime: undefined,
          ScheduledEndTime: undefined,
        },
        { new: true }
      );

      if (!Task) {
        return c.json({ error: 'Task not found' }, 404);
      }

      // Generate new suggestions
      const Suggestions = await SchedulingService.GenerateScheduleSuggestions(UserId);
      const TaskSuggestion = Suggestions.find(s => s.TaskId === TaskId);

      return c.json({
        message: 'Task unscheduled successfully',
        task: Task,
        newSuggestion: TaskSuggestion || null,
      });
    } catch (error: any) {
      return c.json({ error: error.message || 'Failed to reschedule task' }, 500);
    }
  }
}
