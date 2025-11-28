import React from 'react';
import { Calendar, Clock } from 'lucide-react';

interface ScheduleSuggestion {
  TaskId: string;
  TaskTitle: string;
  SuggestedStart: string;
  SuggestedEnd: string;
  Priority: string;
  EstimatedTime: number;
}

interface ScheduleSuggestionCardProps {
  Suggestion: ScheduleSuggestion;
  OnAccept: (Suggestion: ScheduleSuggestion) => void;
  OnReject: () => void;
}

const ScheduleSuggestionCard: React.FC<ScheduleSuggestionCardProps> = ({
  Suggestion,
  OnAccept,
  OnReject,
}) => {
  const FormatDateTime = (DateString: string) => {
    const Date = new Date(DateString);
    return Date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const PriorityColors = {
    low: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
    medium: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
    high: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
  };

  return (
    <div className="card border-l-4 border-primary-500">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold text-lg">{Suggestion.TaskTitle}</h3>
            <span className={`text-xs px-2 py-1 rounded ${PriorityColors[Suggestion.Priority as keyof typeof PriorityColors]}`}>
              {Suggestion.Priority.toUpperCase()}
            </span>
          </div>
          <div className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              <span>{FormatDateTime(Suggestion.SuggestedStart)}</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              <span>{Suggestion.EstimatedTime} minutes</span>
            </div>
          </div>
        </div>
        <div className="flex space-x-2 ml-4">
          <button
            onClick={() => OnAccept(Suggestion)}
            className="btn-primary text-sm py-1 px-3"
          >
            Accept
          </button>
          <button onClick={OnReject} className="btn-secondary text-sm py-1 px-3">
            Reject
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleSuggestionCard;
