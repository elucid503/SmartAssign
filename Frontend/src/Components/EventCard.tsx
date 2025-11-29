import React from 'react';
import { MapPin, Trash2, Edit } from 'lucide-react';

interface Event {

  _id: string;

  Title: string;
  Description?: string;

  StartTime: string;
  EndTime: string;

  Location?: string;
  Category?: string;

  Color?: string;
  IsAllDay: boolean;

}

interface EventCardProps {

  Event: Event;

  OnDelete: (Id: string) => void;
  OnEdit: (Event: Event) => void;

}

const EventCard: React.FC<EventCardProps> = ({ Event, OnDelete, OnEdit }) => {

  const FormatTime = (DateString: string) => {

    const dateObj = new Date(DateString);
    return dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  };

  const FormatDate = (DateString: string) => {

    const dateObj = new Date(DateString);
    return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  };

  const HandleDelete = (E: React.MouseEvent) => {

    E.stopPropagation();

    if (confirm('Are you sure you want to delete this event?')) {

      OnDelete(Event._id);

    }

  };

  const HandleEdit = (E: React.MouseEvent) => {

    E.stopPropagation();
    OnEdit(Event);

  };

  return (

    <div className="card hover:shadow-lg transition-shadow border-l-4" style={{ borderLeftColor: Event.Color || '#0ea5e9' }}>
      
      <div className="flex justify-between items-start">

        <div className="flex-1">

          <h3 className="font-semibold text-lg">{Event.Title}</h3>

          {Event.Description && (<p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{Event.Description}</p>)}

          <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
            
            <span>{FormatDate(Event.StartTime)} • {Event.IsAllDay ? 'All Day' : `${FormatTime(Event.StartTime)} - ${FormatTime(Event.EndTime)}`}</span>

            {Event.Location && (

              <span className="flex items-center">

                <MapPin className="w-4 h-4 mr-1" />
                {Event.Location}

              </span>

            )}

          </div>

          {Event.Category && (

            <span className="inline-block mt-2 text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">

              {Event.Category}

            </span>

          )}

        </div>

        <div className="flex space-x-2 ml-4">

          <button onClick={HandleEdit} className="text-blue-500 hover:text-blue-700"><Edit className="w-5 h-5" /></button>

          <button onClick={HandleDelete} className="text-red-500 hover:text-red-700"><Trash2 className="w-5 h-5" /></button>

        </div>

      </div>

    </div>);
  
};

export default EventCard;