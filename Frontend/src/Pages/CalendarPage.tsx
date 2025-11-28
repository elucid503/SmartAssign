import React, { useEffect, useState } from 'react';
import Navbar from '../Components/Navbar';
import EventCard from '../Components/EventCard';
import Api from '../Utils/Api';
import { Plus } from 'lucide-react';

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

const CalendarPage: React.FC = () => {
  const [Events, SetEvents] = useState<Event[]>([]);
  const [IsLoading, SetIsLoading] = useState(true);
  const [ShowModal, SetShowModal] = useState(false);
  const [NewEvent, SetNewEvent] = useState({
    Title: '',
    Description: '',
    StartTime: '',
    EndTime: '',
    Location: '',
    Category: '',
    Color: '#0ea5e9',
    IsAllDay: false,
  });

  useEffect(() => {
    FetchEvents();
  }, []);

  const FetchEvents = async () => {
    try {
      const Response = await Api.get('/calendar/events');
      SetEvents(Response.data.events || []);
    } catch (Error) {
      console.error('Error fetching events:', Error);
    } finally {
      SetIsLoading(false);
    }
  };

  const HandleCreateEvent = async (E: React.FormEvent) => {
    E.preventDefault();
    try {
      await Api.post('/calendar/events', NewEvent);
      SetShowModal(false);
      SetNewEvent({
        Title: '',
        Description: '',
        StartTime: '',
        EndTime: '',
        Location: '',
        Category: '',
        Color: '#0ea5e9',
        IsAllDay: false,
      });
      FetchEvents();
    } catch (Error) {
      console.error('Error creating event:', Error);
    }
  };

  const HandleEventDelete = async (Id: string) => {
    try {
      await Api.delete(`/calendar/events/${Id}`);
      FetchEvents();
    } catch (Error) {
      console.error('Error deleting event:', Error);
    }
  };

  const HandleEventEdit = (Event: Event) => {
    // TODO: Implement edit modal
    console.log('Edit event:', Event);
  };

  const GroupedEvents = Events.reduce((Groups: { [key: string]: Event[] }, Event) => {
    const Date = new Date(Event.StartTime).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    if (!Groups[Date]) {
      Groups[Date] = [];
    }
    Groups[Date].push(Event);
    return Groups;
  }, {});

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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Calendar</h1>
          <button onClick={() => SetShowModal(true)} className="btn-primary flex items-center">
            <Plus className="w-5 h-5 mr-2" />
            New Event
          </button>
        </div>

        {/* Event List */}
        <div className="space-y-8">
          {Object.entries(GroupedEvents)
            .sort(([DateA], [DateB]) => new Date(DateA).getTime() - new Date(DateB).getTime())
            .map(([Date, DayEvents]) => (
              <div key={Date}>
                <h2 className="text-xl font-semibold mb-4">{Date}</h2>
                <div className="space-y-4">
                  {DayEvents.map((Event) => (
                    <EventCard
                      key={Event._id}
                      Event={Event}
                      OnDelete={HandleEventDelete}
                      OnEdit={HandleEventEdit}
                    />
                  ))}
                </div>
              </div>
            ))}
          {Events.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No events scheduled</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Event Modal */}
      {ShowModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Create New Event</h2>
            <form onSubmit={HandleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title *</label>
                <input
                  type="text"
                  value={NewEvent.Title}
                  onChange={(E) => SetNewEvent({ ...NewEvent, Title: E.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={NewEvent.Description}
                  onChange={(E) => SetNewEvent({ ...NewEvent, Description: E.target.value })}
                  className="input-field"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Start Time *</label>
                <input
                  type="datetime-local"
                  value={NewEvent.StartTime}
                  onChange={(E) => SetNewEvent({ ...NewEvent, StartTime: E.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">End Time *</label>
                <input
                  type="datetime-local"
                  value={NewEvent.EndTime}
                  onChange={(E) => SetNewEvent({ ...NewEvent, EndTime: E.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Location</label>
                <input
                  type="text"
                  value={NewEvent.Location}
                  onChange={(E) => SetNewEvent({ ...NewEvent, Location: E.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <input
                  type="text"
                  value={NewEvent.Category}
                  onChange={(E) => SetNewEvent({ ...NewEvent, Category: E.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Color</label>
                <input
                  type="color"
                  value={NewEvent.Color}
                  onChange={(E) => SetNewEvent({ ...NewEvent, Color: E.target.value })}
                  className="input-field h-12"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={NewEvent.IsAllDay}
                  onChange={(E) => SetNewEvent({ ...NewEvent, IsAllDay: E.target.checked })}
                  className="mr-2"
                />
                <label className="text-sm font-medium">All Day Event</label>
              </div>

              <div className="flex space-x-4 mt-6">
                <button type="submit" className="btn-primary flex-1">
                  Create Event
                </button>
                <button
                  type="button"
                  onClick={() => SetShowModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
