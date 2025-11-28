import { TaskModel, ITask } from '../Models/Task';
import { EventModel, IEvent } from '../Models/Event';
import { addMinutes, isBefore, isAfter, startOfDay, endOfDay, parseISO } from 'date-fns';

interface TimeSlot {
  Start: Date;
  End: Date;
}

interface ScheduleSuggestion {
  TaskId: string;
  TaskTitle: string;
  SuggestedStart: Date;
  SuggestedEnd: Date;
  Priority: string;
  EstimatedTime: number;
}

export class SchedulingService {
  /**
   * Calculate priority score for a task
   * Higher score = higher priority
   */
  private static CalculatePriorityScore(Task: ITask): number {
    let Score = 0;

    // Base priority score
    if (Task.Priority === 'high') Score += 100;
    else if (Task.Priority === 'medium') Score += 50;
    else Score += 25;

    // Due date urgency (higher score if due sooner)
    if (Task.DueDate) {
      const DaysUntilDue = Math.ceil(
        (Task.DueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (DaysUntilDue <= 1) Score += 80;
      else if (DaysUntilDue <= 3) Score += 60;
      else if (DaysUntilDue <= 7) Score += 40;
      else Score += 20;
    }

    // Bonus for tasks with estimated time (easier to schedule)
    if (Task.EstimatedTime) Score += 10;

    return Score;
  }

  /**
   * Find available time slots between events
  */
  private static FindAvailableSlots(Events: IEvent[], StartDate: Date, EndDate: Date, MinSlotDuration: number = 30): TimeSlot[] {
    
    const Slots: TimeSlot[] = [];
    const SortedEvents = Events.sort((a, b) => a.StartTime.getTime() - b.StartTime.getTime());

    let CurrentTime = StartDate;

    for (const Event of SortedEvents) {

      if (!Event.Title) { continue; } // Skip invalid events
      
      if (isBefore(CurrentTime, Event.StartTime)) {
        const SlotDuration = (Event.StartTime.getTime() - CurrentTime.getTime()) / (1000 * 60);
        
        if (SlotDuration >= MinSlotDuration) {
          Slots.push({
            Start: new Date(CurrentTime),
            End: new Date(Event.StartTime),
          });
        }
      }

      // Move current time to after this event
      if (isAfter(Event.EndTime, CurrentTime)) {
        CurrentTime = Event.EndTime;
      }
    }

    // Add final slot if there's time remaining in the day
    if (isBefore(CurrentTime, EndDate)) {
      const SlotDuration = (EndDate.getTime() - CurrentTime.getTime()) / (1000 * 60);
      
      if (SlotDuration >= MinSlotDuration) {
        Slots.push({
          Start: new Date(CurrentTime),
          End: new Date(EndDate),
        });
      }
    }

    return Slots;
  }

  /**
   * Find best time slot for a task
   */
  private static FindBestSlot(
    Task: ITask,
    AvailableSlots: TimeSlot[],
    PreferredTimeStart: number = 9, // 9 AM
    PreferredTimeEnd: number = 17 // 5 PM
  ): { Start: Date; End: Date } | null {
    const TaskDuration = Task.EstimatedTime || 60; // Default to 60 minutes

    for (const Slot of AvailableSlots) {
      const SlotDuration = (Slot.End.getTime() - Slot.Start.getTime()) / (1000 * 60);

      if (SlotDuration >= TaskDuration) {
        // Check if slot is within preferred time
        const SlotHour = Slot.Start.getHours();
        
        if (SlotHour >= PreferredTimeStart && SlotHour < PreferredTimeEnd) {
          return {
            Start: Slot.Start,
            End: addMinutes(Slot.Start, TaskDuration),
          };
        }
      }
    }

    // If no preferred slot found, use any available slot
    for (const Slot of AvailableSlots) {
      const SlotDuration = (Slot.End.getTime() - Slot.Start.getTime()) / (1000 * 60);

      if (SlotDuration >= TaskDuration) {
        return {
          Start: Slot.Start,
          End: addMinutes(Slot.Start, TaskDuration),
        };
      }
    }

    return null;
  }

  /**
   * Generate schedule suggestions for unscheduled tasks
   */
  static async GenerateScheduleSuggestions(
    UserId: string,
    StartDate?: string,
    EndDate?: string
  ): Promise<ScheduleSuggestion[]> {
    try {
      // Default to next 7 days if not specified
      const Start = StartDate ? parseISO(StartDate) : startOfDay(new Date());
      const End = EndDate ? parseISO(EndDate) : endOfDay(addMinutes(Start, 7 * 24 * 60));

      // Get all unscheduled tasks
      const UnscheduledTasks = await TaskModel.find({
        UserId,
        Status: { $ne: 'completed' },
        IsScheduled: false,
      });

      // Get all events in the time range
      const Events = await EventModel.find({
        UserId,
        StartTime: { $lt: End },
        EndTime: { $gt: Start },
      });

      // Sort tasks by priority score
      const SortedTasks = UnscheduledTasks.sort(
        (a, b) => this.CalculatePriorityScore(b) - this.CalculatePriorityScore(a)
      );

      const Suggestions: ScheduleSuggestion[] = [];
      const ScheduledSlots: TimeSlot[] = [];

      // Find available time slots
      let CurrentDayStart = Start;
      
      for (let Day = 0; Day < 7; Day++) {
        const DayStart = startOfDay(addMinutes(CurrentDayStart, Day * 24 * 60));
        const DayEnd = endOfDay(DayStart);

        // Get events for this day
        const DayEvents = Events.filter(
          e => e.StartTime <= DayEnd && e.EndTime >= DayStart
        );

        // Combine with already scheduled slots
        const AllBusySlots = [...DayEvents, ...ScheduledSlots.map(s => ({
          StartTime: s.Start,
          EndTime: s.End,
          Title: 'Scheduled Task',
        } as any))];

        const AvailableSlots = this.FindAvailableSlots(
          AllBusySlots,
          addMinutes(DayStart, 9 * 60), // Start at 9 AM
          addMinutes(DayStart, 21 * 60) // End at 9 PM
        );

        // Try to schedule tasks in available slots
        for (const Task of SortedTasks) {
          if (Suggestions.find(s => s.TaskId === Task._id.toString())) {
            continue; // Already scheduled
          }

          const BestSlot = this.FindBestSlot(Task, AvailableSlots);
          
          if (BestSlot) {
            Suggestions.push({
              TaskId: Task._id.toString(),
              TaskTitle: Task.Title,
              SuggestedStart: BestSlot.Start,
              SuggestedEnd: BestSlot.End,
              Priority: Task.Priority,
              EstimatedTime: Task.EstimatedTime || 60,
            });

            // Mark this slot as occupied
            ScheduledSlots.push(BestSlot);
            
            // Update available slots
            const SlotIndex = AvailableSlots.findIndex(
              s => s.Start.getTime() === BestSlot.Start.getTime()
            );
            
            if (SlotIndex !== -1) {
              const UsedSlot = AvailableSlots[SlotIndex];
              AvailableSlots.splice(SlotIndex, 1);
              
              // If there is remaining time in the slot, add it back as a new slot
              if (BestSlot.End.getTime() < UsedSlot.End.getTime()) {
                AvailableSlots.push({
                  Start: BestSlot.End,
                  End: UsedSlot.End
                });
                
                // Sort slots by start time to maintain order
                AvailableSlots.sort((a, b) => a.Start.getTime() - b.Start.getTime());
              }
            }
          }
        }
      }

      return Suggestions;
    } catch (error) {
      console.error('Error generating schedule suggestions:', error);
      throw error;
    }
  }

  /**
   * Apply a schedule suggestion (mark task as scheduled)
   */
  static async ApplyScheduleSuggestion(
    UserId: string,
    TaskId: string,
    ScheduledStart: Date,
    ScheduledEnd: Date
  ): Promise<ITask | null> {
    try {
      const UpdatedTask = await TaskModel.findOneAndUpdate(
        { _id: TaskId, UserId },
        {
          IsScheduled: true,
          ScheduledStartTime: ScheduledStart,
          ScheduledEndTime: ScheduledEnd,
        },
        { new: true }
      );

      return UpdatedTask;
    } catch (error) {
      console.error('Error applying schedule suggestion:', error);
      throw error;
    }
  }

  /**
   * Automatically reschedule tasks when conflicts arise
   */
  static async RescheduleConflictingTasks(
    UserId: string,
    NewEvent: IEvent
  ): Promise<ScheduleSuggestion[]> {
    try {
      // Find tasks scheduled during the new event time
      const ConflictingTasks = await TaskModel.find({
        UserId,
        IsScheduled: true,
        ScheduledStartTime: { $lt: NewEvent.EndTime },
        ScheduledEndTime: { $gt: NewEvent.StartTime },
      });

      if (ConflictingTasks.length === 0) {
        return [];
      }

      // Unschedule conflicting tasks
      for (const Task of ConflictingTasks) {
        Task.IsScheduled = false;
        Task.ScheduledStartTime = undefined;
        Task.ScheduledEndTime = undefined;
        await Task.save();
      }

      // Generate new suggestions for these tasks
      const Suggestions = await this.GenerateScheduleSuggestions(UserId);
      
      return Suggestions.filter(s => 
        ConflictingTasks.find(t => t._id.toString() === s.TaskId)
      );
    } catch (error) {
      console.error('Error rescheduling conflicting tasks:', error);
      throw error;
    }
  }
}
