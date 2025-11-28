import React, { useEffect, useState } from 'react';
import Navbar from '../Components/Navbar';
import TaskCard from '../Components/TaskCard';
import ScheduleSuggestionCard from '../Components/ScheduleSuggestionCard';
import Api from '../Utils/Api';
import { Calendar, CheckSquare, Clock, TrendingUp } from 'lucide-react';

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

interface Event {
  _id: string;
  Title: string;
  StartTime: string;
  EndTime: string;
}

interface ScheduleSuggestion {
  TaskId: string;
  TaskTitle: string;
  SuggestedStart: string;
  SuggestedEnd: string;
  Priority: string;
  EstimatedTime: number;
}

const DashboardPage: React.FC = () => {
  const [Tasks, SetTasks] = useState<Task[]>([]);
  const [Events, SetEvents] = useState<Event[]>([]);
  const [Suggestions, SetSuggestions] = useState<ScheduleSuggestion[]>([]);
  const [IsLoading, SetIsLoading] = useState(true);

  useEffect(() => {
    FetchDashboardData();
  }, []);

  const FetchDashboardData = async () => {
    try {
      const [TasksRes, EventsRes, SuggestionsRes] = await Promise.all([
        Api.get('/tasks?status=pending&status=in-progress'),
        Api.get('/calendar/events'),
        Api.get('/schedule/suggestions'),
      ]);

      SetTasks(TasksRes.data.tasks || []);
      SetEvents(EventsRes.data.events || []);
      SetSuggestions(SuggestionsRes.data.suggestions || []);
    } catch (Error) {
      console.error('Error fetching dashboard data:', Error);
    } finally {
      SetIsLoading(false);
    }
  };

  const HandleTaskStatusChange = async (Id: string, Status: string) => {
    try {
      await Api.put(`/tasks/${Id}`, { Status });
      FetchDashboardData();
    } catch (Error) {
      console.error('Error updating task:', Error);
    }
  };

  const HandleTaskDelete = async (Id: string) => {
    try {
      await Api.delete(`/tasks/${Id}`);
      FetchDashboardData();
    } catch (Error) {
      console.error('Error deleting task:', Error);
    }
  };

  const HandleAcceptSuggestion = async (Suggestion: ScheduleSuggestion) => {
    try {
      await Api.post('/schedule/apply', {
        TaskId: Suggestion.TaskId,
        ScheduledStart: Suggestion.SuggestedStart,
        ScheduledEnd: Suggestion.SuggestedEnd,
      });
      FetchDashboardData();
    } catch (Error) {
      console.error('Error applying suggestion:', Error);
    }
  };

  const HandleRejectSuggestion = () => {
    FetchDashboardData();
  };

  const PendingTasks = Tasks.filter((T) => T.Status !== 'completed');
  const TodayEvents = Events.filter((E) => {
    const EventDate = new Date(E.StartTime);
    const Today = new Date();
    return EventDate.toDateString() === Today.toDateString();
  });

  if (IsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pending Tasks</p>
                <p className="text-3xl font-bold mt-1">{PendingTasks.length}</p>
              </div>
              <CheckSquare className="w-10 h-10 text-primary-500" />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Events Today</p>
                <p className="text-3xl font-bold mt-1">{TodayEvents.length}</p>
              </div>
              <Calendar className="w-10 h-10 text-green-500" />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Suggestions</p>
                <p className="text-3xl font-bold mt-1">{Suggestions.length}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-yellow-500" />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                <p className="text-3xl font-bold mt-1">
                  {Tasks.filter((T) => T.Status === 'completed').length}
                </p>
              </div>
              <Clock className="w-10 h-10 text-purple-500" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Schedule Suggestions */}
          {Suggestions.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Smart Scheduling</h2>
              <div className="space-y-4">
                {Suggestions.slice(0, 3).map((Suggestion) => (
                  <ScheduleSuggestionCard
                    key={Suggestion.TaskId}
                    Suggestion={Suggestion}
                    OnAccept={HandleAcceptSuggestion}
                    OnReject={HandleRejectSuggestion}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Tasks */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Upcoming Tasks</h2>
            <div className="space-y-4">
              {PendingTasks.slice(0, 5).map((Task) => (
                <TaskCard
                  key={Task._id}
                  Task={Task}
                  OnDelete={HandleTaskDelete}
                  OnStatusChange={HandleTaskStatusChange}
                  OnClick={() => {}}
                />
              ))}
              {PendingTasks.length === 0 && (
                <p className="text-gray-500 dark:text-gray-400">No pending tasks</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
