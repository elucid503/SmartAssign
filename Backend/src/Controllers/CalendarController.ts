import { Context } from 'hono';
import { EventModel } from '../Models/Event';
import { GetUserId } from '../Middleware/Auth';
import { EventSchema, UpdateEventSchema } from '../Utils/Validation';
import { startOfDay, endOfDay, parseISO } from 'date-fns';

export class CalendarController {
  static async CreateEvent(c: Context) {
    try {
      const UserId = GetUserId(c);
      const Body = await c.req.json();
      const ValidatedData = EventSchema.parse(Body);

      const NewEvent = await EventModel.create({
        UserId,
        ...ValidatedData,
        StartTime: new Date(ValidatedData.StartTime),
        EndTime: new Date(ValidatedData.EndTime),
        Recurrence: ValidatedData.Recurrence ? {
          ...ValidatedData.Recurrence,
          EndDate: ValidatedData.Recurrence.EndDate ? new Date(ValidatedData.Recurrence.EndDate) : undefined,
        } : undefined,
      });

      return c.json({ message: 'Event created successfully', event: NewEvent }, 201);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return c.json({ error: 'Validation error', details: error.errors }, 400);
      }
      return c.json({ error: error.message || 'Failed to create event' }, 500);
    }
  }

  static async GetAllEvents(c: Context) {
    try {
      const UserId = GetUserId(c);
      const { startDate, endDate, category } = c.req.query();

      const Filter: any = { UserId };
      
      if (startDate && endDate) {
        Filter.StartTime = {
          $gte: startOfDay(parseISO(startDate)),
          $lte: endOfDay(parseISO(endDate)),
        };
      }
      
      if (category) Filter.Category = category;

      const Events = await EventModel.find(Filter).sort({ StartTime: 1 });

      return c.json({ events: Events, count: Events.length });
    } catch (error: any) {
      return c.json({ error: error.message || 'Failed to fetch events' }, 500);
    }
  }

  static async GetEventById(c: Context) {
    try {
      const UserId = GetUserId(c);
      const EventId = c.req.param('id');

      const Event = await EventModel.findOne({ _id: EventId, UserId });
      if (!Event) {
        return c.json({ error: 'Event not found' }, 404);
      }

      return c.json({ event: Event });
    } catch (error: any) {
      return c.json({ error: error.message || 'Failed to fetch event' }, 500);
    }
  }

  static async UpdateEvent(c: Context) {
    try {
      const UserId = GetUserId(c);
      const EventId = c.req.param('id');
      const Body = await c.req.json();
      const ValidatedData = UpdateEventSchema.parse(Body);

      const UpdateData: any = { ...ValidatedData };
      if (ValidatedData.StartTime) UpdateData.StartTime = new Date(ValidatedData.StartTime);
      if (ValidatedData.EndTime) UpdateData.EndTime = new Date(ValidatedData.EndTime);
      if (ValidatedData.Recurrence?.EndDate) {
        UpdateData.Recurrence.EndDate = new Date(ValidatedData.Recurrence.EndDate);
      }

      const UpdatedEvent = await EventModel.findOneAndUpdate(
        { _id: EventId, UserId },
        UpdateData,
        { new: true }
      );

      if (!UpdatedEvent) {
        return c.json({ error: 'Event not found' }, 404);
      }

      return c.json({ message: 'Event updated successfully', event: UpdatedEvent });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return c.json({ error: 'Validation error', details: error.errors }, 400);
      }
      return c.json({ error: error.message || 'Failed to update event' }, 500);
    }
  }

  static async DeleteEvent(c: Context) {
    try {
      const UserId = GetUserId(c);
      const EventId = c.req.param('id');

      const DeletedEvent = await EventModel.findOneAndDelete({ _id: EventId, UserId });
      if (!DeletedEvent) {
        return c.json({ error: 'Event not found' }, 404);
      }

      return c.json({ message: 'Event deleted successfully' });
    } catch (error: any) {
      return c.json({ error: error.message || 'Failed to delete event' }, 500);
    }
  }

  static async ExportToICS(c: Context) {
    try {
      const UserId = GetUserId(c);
      const { startDate, endDate } = c.req.query();

      const Filter: any = { UserId };
      if (startDate && endDate) {
        Filter.StartTime = {
          $gte: startOfDay(parseISO(startDate)),
          $lte: endOfDay(parseISO(endDate)),
        };
      }

      const Events = await EventModel.find(Filter);

      // Simple ICS format - could be enhanced with ical-generator library
      let IcsContent = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//SmartAssign//Calendar//EN\n';
      
      Events.forEach(event => {
        IcsContent += 'BEGIN:VEVENT\n';
        IcsContent += `UID:${event._id}@smartassign.app\n`;
        IcsContent += `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z\n`;
        IcsContent += `DTSTART:${event.StartTime.toISOString().replace(/[-:]/g, '').split('.')[0]}Z\n`;
        IcsContent += `DTEND:${event.EndTime.toISOString().replace(/[-:]/g, '').split('.')[0]}Z\n`;
        IcsContent += `SUMMARY:${event.Title}\n`;
        if (event.Description) IcsContent += `DESCRIPTION:${event.Description}\n`;
        if (event.Location) IcsContent += `LOCATION:${event.Location}\n`;
        IcsContent += 'END:VEVENT\n';
      });

      IcsContent += 'END:VCALENDAR';

      c.header('Content-Type', 'text/calendar');
      c.header('Content-Disposition', 'attachment; filename="calendar.ics"');
      
      return c.body(IcsContent);
    } catch (error: any) {
      return c.json({ error: error.message || 'Failed to export calendar' }, 500);
    }
  }
}
