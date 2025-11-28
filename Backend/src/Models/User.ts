import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  Email: string;
  Password: string;
  Name: string;
  CreatedAt: Date;
  UpdatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  Email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  Password: {
    type: String,
    required: true,
  },
  Name: {
    type: String,
    required: true,
    trim: true,
  },
}, {
  timestamps: { createdAt: 'CreatedAt', updatedAt: 'UpdatedAt' },
});

export const UserModel = mongoose.model<IUser>('User', UserSchema);
