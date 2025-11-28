import { Context } from 'hono';

import { TaskModel } from '../Models/Task';

import { GetUserID } from '../Middleware/Auth';
import { TaskSchema, UpdateTaskSchema, SubtaskSchema } from '../Utils/Validation';

export class TaskController {

  static async CreateTask(c: Context) {

    const UserID = GetUserID(c);

    return await c.req.json().then(async (Body) => {

      const ValidatedData = TaskSchema.parse(Body);

      const NewTask = await TaskModel.create({
          
          ...ValidatedData,

        UserID: UserID,
        DueDate: ValidatedData.DueDate ? new Date(ValidatedData.DueDate) : undefined,
          
      });

      return c.json({ message: 'Task created successfully', task: NewTask }, 201);

    }).catch((error: any) => {

      if (error.name == 'ZodError') {

        return c.json({ error: 'Validation error', details: error.errors }, 400);
        
      }

      return c.json({ error: error.message || 'Failed to create task' }, 500);

    });

  }

  static async GetAllTasks(c: Context) {

    const UserID = GetUserID(c);
    const { category, priority, status, sortBy = 'DueDate' } = c.req.query();

    const Filter: any = { UserID };
    
    if (category) Filter.Category = category;
    if (priority) Filter.Priority = priority;
    if (status) Filter.Status = status;

    return await TaskModel.find(Filter).sort({ [sortBy]: 1 }).then((Tasks) => {

      return c.json({ tasks: Tasks, count: Tasks.length });
      
    }).catch((error: any) => {

      return c.json({ error: error.message || 'Failed to fetch tasks' }, 500);
      
    });
    
  }

  static async GetTaskById(c: Context) {

    const UserID = GetUserID(c);
    const TaskId = c.req.param('id');

    return await TaskModel.findOne({ _id: TaskId, UserID }).then((Task) => {

      if (!Task) {

        return c.json({ error: 'Task not found' }, 404);
        
      }
      
      return c.json({ task: Task });

    }).catch((error: any) => {

      return c.json({ error: error.message || 'Failed to fetch task' }, 500);
      
    });
    
  }

  static async UpdateTask(c: Context) {

    const UserID = GetUserID(c);
    const TaskId = c.req.param('id');

    return await c.req.json().then(async (Body) => {

      const ValidatedData = UpdateTaskSchema.parse(Body);

      const UpdateData: any = { ...ValidatedData };
      
      if (ValidatedData.DueDate) {

        UpdateData.DueDate = new Date(ValidatedData.DueDate);

      }

      const UpdatedTask = await TaskModel.findOneAndUpdate({ _id: TaskId, UserID }, UpdateData, { new: true });

      if (!UpdatedTask) {

        return c.json({ error: 'Task not found' }, 404);

      }

      return c.json({ message: 'Task updated successfully', task: UpdatedTask });

    }).catch((error: any) => {

      if (error.name == 'ZodError') {

        return c.json({ error: 'Validation error', details: error.errors }, 400);
        
      }
        
      return c.json({ error: error.message || 'Failed to update task' }, 500);

    });
    
  }

  static async DeleteTask(c: Context) {

    const UserID = GetUserID(c);
    const TaskId = c.req.param('id');

    return await TaskModel.findOneAndDelete({ _id: TaskId, UserID }).then((DeletedTask) => {

      if (!DeletedTask) {

        return c.json({ error: 'Task not found' }, 404);
        
      }

      return c.json({ message: 'Task deleted successfully' });

    }).catch((error: any) => {

      return c.json({ error: error.message || 'Failed to delete task' }, 500);
      
    });
    
  }

  static async AddSubtask(c: Context) {

    const UserID = GetUserID(c);
    const TaskID = c.req.param('id');

    return await c.req.json().then(async (Body) => {

      const ValidatedData = SubtaskSchema.parse(Body);

      const Task = await TaskModel.findOne({ _id: TaskID, UserID });
      
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
      
    }).catch((error: any) => {
        
      if (error.name == 'ZodError') {
          
        return c.json({ error: 'Validation error', details: error.errors }, 400);

      }

      return c.json({ error: error.message || 'Failed to add subtask' }, 500);
      
    });
    
  }

  static async UpdateSubtask(c: Context) {

    const UserID = GetUserID(c);
    const TaskId = c.req.param('id');
    const SubtaskID = c.req.param('subtaskId');

    return await c.req.json().then(async (Body) => {

      const Task = await TaskModel.findOne({ _id: TaskId, UserID });

      if (!Task) {

        return c.json({ error: 'Task not found' }, 404);

      }

      const SubtaskIndex = Task.Subtasks.findIndex(st => st.Id == SubtaskID);

      if (SubtaskIndex == -1) {

        return c.json({ error: 'Subtask not found' }, 404);

      }

      if (Body.Title !== undefined) Task.Subtasks[SubtaskIndex].Title = Body.Title;
      if (Body.IsCompleted !== undefined) Task.Subtasks[SubtaskIndex].IsCompleted = Body.IsCompleted;

      // Check if all subtasks are completed

      const AllCompleted = Task.Subtasks.every(st => st.IsCompleted);

      if (AllCompleted && Task.Status !== 'completed') {
          
        Task.Status = 'completed';
      
      }

      // Save/respond

      await Task.save();

      return c.json({ message: 'Subtask updated successfully', task: Task });

    }).catch((error: any) => {

      return c.json({ error: error.message || 'Failed to update subtask' }, 500);
      
    });
    
  }

  static async DeleteSubtask(c: Context) {

    const UserID = GetUserID(c);
    const TaskId = c.req.param('id');
    const SubtaskId = c.req.param('subtaskId');

    return await TaskModel.findOne({ _id: TaskId, UserID }).then(async (Task) => {

      if (!Task) {
          
        return c.json({ error: 'Task not found' }, 404);

      }

      Task.Subtasks = Task.Subtasks.filter(st => st.Id != SubtaskId);

      await Task.save();

      return c.json({ message: 'Subtask deleted successfully', task: Task });

    }).catch((error: any) => {

      return c.json({ error: error.message || 'Failed to delete subtask' }, 500);
      
    });
    
  }

}