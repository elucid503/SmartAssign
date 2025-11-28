import { Context } from 'hono';
import { TaskModel } from '../Models/Task';
import { GetUserId } from '../Middleware/Auth';
import { TaskSchema, UpdateTaskSchema, SubtaskSchema } from '../Utils/Validation';

export class TaskController {
  static async CreateTask(c: Context) {
    try {
      const UserId = GetUserId(c);
      const Body = await c.req.json();
      const ValidatedData = TaskSchema.parse(Body);

      const NewTask = await TaskModel.create({
        UserId,
        ...ValidatedData,
        DueDate: ValidatedData.DueDate ? new Date(ValidatedData.DueDate) : undefined,
      });

      return c.json({ message: 'Task created successfully', task: NewTask }, 201);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return c.json({ error: 'Validation error', details: error.errors }, 400);
      }
      return c.json({ error: error.message || 'Failed to create task' }, 500);
    }
  }

  static async GetAllTasks(c: Context) {
    try {
      const UserId = GetUserId(c);
      const { category, priority, status, sortBy = 'DueDate' } = c.req.query();

      const Filter: any = { UserId };
      
      if (category) Filter.Category = category;
      if (priority) Filter.Priority = priority;
      if (status) Filter.Status = status;

      const Tasks = await TaskModel.find(Filter).sort({ [sortBy]: 1 });

      return c.json({ tasks: Tasks, count: Tasks.length });
    } catch (error: any) {
      return c.json({ error: error.message || 'Failed to fetch tasks' }, 500);
    }
  }

  static async GetTaskById(c: Context) {
    try {
      const UserId = GetUserId(c);
      const TaskId = c.req.param('id');

      const Task = await TaskModel.findOne({ _id: TaskId, UserId });
      if (!Task) {
        return c.json({ error: 'Task not found' }, 404);
      }

      return c.json({ task: Task });
    } catch (error: any) {
      return c.json({ error: error.message || 'Failed to fetch task' }, 500);
    }
  }

  static async UpdateTask(c: Context) {
    try {
      const UserId = GetUserId(c);
      const TaskId = c.req.param('id');
      const Body = await c.req.json();
      const ValidatedData = UpdateTaskSchema.parse(Body);

      const UpdateData: any = { ...ValidatedData };
      if (ValidatedData.DueDate) {
        UpdateData.DueDate = new Date(ValidatedData.DueDate);
      }

      const UpdatedTask = await TaskModel.findOneAndUpdate(
        { _id: TaskId, UserId },
        UpdateData,
        { new: true }
      );

      if (!UpdatedTask) {
        return c.json({ error: 'Task not found' }, 404);
      }

      return c.json({ message: 'Task updated successfully', task: UpdatedTask });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return c.json({ error: 'Validation error', details: error.errors }, 400);
      }
      return c.json({ error: error.message || 'Failed to update task' }, 500);
    }
  }

  static async DeleteTask(c: Context) {
    try {
      const UserId = GetUserId(c);
      const TaskId = c.req.param('id');

      const DeletedTask = await TaskModel.findOneAndDelete({ _id: TaskId, UserId });
      if (!DeletedTask) {
        return c.json({ error: 'Task not found' }, 404);
      }

      return c.json({ message: 'Task deleted successfully' });
    } catch (error: any) {
      return c.json({ error: error.message || 'Failed to delete task' }, 500);
    }
  }

  static async AddSubtask(c: Context) {
    try {
      const UserId = GetUserId(c);
      const TaskId = c.req.param('id');
      const Body = await c.req.json();
      const ValidatedData = SubtaskSchema.parse(Body);

      const Task = await TaskModel.findOne({ _id: TaskId, UserId });
      if (!Task) {
        return c.json({ error: 'Task not found' }, 404);
      }

      const NewSubtask = {
        Id: `subtask_${Date.now()}`,
        Title: ValidatedData.Title,
        IsCompleted: ValidatedData.IsCompleted || false,
        Order: Task.Subtasks.length,
      };

      Task.Subtasks.push(NewSubtask);
      await Task.save();

      return c.json({ message: 'Subtask added successfully', task: Task });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return c.json({ error: 'Validation error', details: error.errors }, 400);
      }
      return c.json({ error: error.message || 'Failed to add subtask' }, 500);
    }
  }

  static async UpdateSubtask(c: Context) {
    try {
      const UserId = GetUserId(c);
      const TaskId = c.req.param('id');
      const SubtaskId = c.req.param('subtaskId');
      const Body = await c.req.json();

      const Task = await TaskModel.findOne({ _id: TaskId, UserId });
      if (!Task) {
        return c.json({ error: 'Task not found' }, 404);
      }

      const SubtaskIndex = Task.Subtasks.findIndex(st => st.Id === SubtaskId);
      if (SubtaskIndex === -1) {
        return c.json({ error: 'Subtask not found' }, 404);
      }

      if (Body.Title !== undefined) Task.Subtasks[SubtaskIndex].Title = Body.Title;
      if (Body.IsCompleted !== undefined) Task.Subtasks[SubtaskIndex].IsCompleted = Body.IsCompleted;

      // Check if all subtasks are completed
      const AllCompleted = Task.Subtasks.every(st => st.IsCompleted);
      if (AllCompleted && Task.Status !== 'completed') {
        Task.Status = 'completed';
      }

      await Task.save();

      return c.json({ message: 'Subtask updated successfully', task: Task });
    } catch (error: any) {
      return c.json({ error: error.message || 'Failed to update subtask' }, 500);
    }
  }

  static async DeleteSubtask(c: Context) {
    try {
      const UserId = GetUserId(c);
      const TaskId = c.req.param('id');
      const SubtaskId = c.req.param('subtaskId');

      const Task = await TaskModel.findOne({ _id: TaskId, UserId });
      if (!Task) {
        return c.json({ error: 'Task not found' }, 404);
      }

      Task.Subtasks = Task.Subtasks.filter(st => st.Id !== SubtaskId);
      await Task.save();

      return c.json({ message: 'Subtask deleted successfully', task: Task });
    } catch (error: any) {
      return c.json({ error: error.message || 'Failed to delete subtask' }, 500);
    }
  }
}
