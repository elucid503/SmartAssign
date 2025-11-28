import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IRecurrence {

  Frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';

  Interval: number;

  EndDate?: Date;

  DaysOfWeek?: number[]; // 0-6, Sunday = 0
  DayOfMonth?: number; // 1-31

}

export interface IEvent extends Document {

  UserID: Types.ObjectId;

  Title: string;
  Description?: string;

  StartTime: Date;
  EndTime: Date;

  Location?: string;
  Category?: string;

  Color?: string;

  IsRecurring: boolean;
  Recurrence?: IRecurrence;

  Reminders: number[]; // minutes before event

  IsAllDay: boolean;

  CreatedAt: Date;
  UpdatedAt: Date;

}

const RecurrenceSchema = new Schema<IRecurrence>({

  Frequency: {

    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
    required: true,

  },

  Interval: {

    type: Number,
    required: true,
    min: 1,

  },

  EndDate: {

    type: Date,

  },

  DaysOfWeek: [{

    type: Number,
    min: 0,
    max: 6,

  }],

  DayOfMonth: {

    type: Number,
    min: 1,
    max: 31,

  },

}, { _id: false });

const EventSchema = new Schema<IEvent>({

  UserID: {

    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,

  },

  Title: {

    type: String,
    required: true,
    trim: true,

  },

  Description: {

    type: String,
    trim: true,

  },

  StartTime: {

    type: Date,
    required: true,

  },

  EndTime: {

    type: Date,
    required: true,

  },

  Location: {

    type: String,
    trim: true,

  },

  Category: {

    type: String,
    trim: true,

  },

  Color: {

    type: String,

  },

  IsRecurring: {

    type: Boolean,
    default: false,

  },

  Recurrence: RecurrenceSchema,
  
  Reminders: [{

    type: Number, // minutes before event

  }],

  IsAllDay: {

    type: Boolean,
    default: false,

  },

}, { timestamps: { createdAt: 'CreatedAt', updatedAt: 'UpdatedAt' } });

// Index for better query performance

EventSchema.index({ UserID: 1, StartTime: 1 });
EventSchema.index({ UserID: 1, EndTime: 1 });

export const EventModel = mongoose.model<IEvent>('Event', EventSchema);