import React from 'react';
import { CheckCircle2, Circle, Clock, Trash2 } from 'lucide-react';

interface Task {
  _id: string;
  Title: string;
  Description?: string;
  DueDate?: string;
  Priority: 'low' | 'medium' | 'high';
  Status: 'pending' | 'in-progress' | 'completed';
  Category?: string;
  EstimatedTime?: number;
}

interface TaskCardProps {
  Task: Task;
  OnDelete: (Id: string) => void;
  OnStatusChange: (Id: string, Status: string) => void;
  OnClick: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ Task, OnDelete, OnStatusChange, OnClick }) => {
  const PriorityColors = {
    low: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
    medium: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
    high: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
  };

  const StatusIcons = {
    pending: Circle,
    'in-progress': Clock,
    completed: CheckCircle2,
  };

  const StatusIcon = StatusIcons[Task.Status];

  const FormatDate = (DateString?: string) => {
    if (!DateString) return '';
    const DateObj = new Date(DateString);
    return DateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const HandleStatusToggle = (E: React.MouseEvent) => {
    E.stopPropagation();
    const NewStatus = Task.Status === 'completed' ? 'pending' : 'completed';
    OnStatusChange(Task._id, NewStatus);
  };

  const HandleDelete = (E: React.MouseEvent) => {
    E.stopPropagation();
    if (confirm('Are you sure you want to delete this task?')) {
      OnDelete(Task._id);
    }
  };

  return (
    <div
      onClick={OnClick}
      className="card hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-primary-500"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <button onClick={HandleStatusToggle} className="mt-1">
            <StatusIcon
              className={`w-5 h-5 ${
                Task.Status === 'completed' ? 'text-green-500' : 'text-gray-400'
              }`}
            />
          </button>
          <div className="flex-1">
            <h3
              className={`font-semibold text-lg ${
                Task.Status === 'completed' ? 'line-through text-gray-500' : ''
              }`}
            >
              {Task.Title}
            </h3>
            {Task.Description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{Task.Description}</p>
            )}
            <div className="flex items-center space-x-3 mt-3">
              <span className={`text-xs px-2 py-1 rounded ${PriorityColors[Task.Priority]}`}>
                {Task.Priority.toUpperCase()}
              </span>
              {Task.DueDate && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Due: {FormatDate(Task.DueDate)}
                </span>
              )}
              {Task.EstimatedTime && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  ~{Task.EstimatedTime} min
                </span>
              )}
              {Task.Category && (
                <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                  {Task.Category}
                </span>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={HandleDelete}
          className="text-red-500 hover:text-red-700 ml-4"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default TaskCard;
