import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  username: string;
  email: string;
  passwordHash: string;
  avatar?: string;
  bio?: string;
  friends: mongoose.Types.ObjectId[];
  interests: string[];
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
      immutable: true, // Username cannot be changed
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      maxlength: 500,
      default: '',
    },
    friends: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    interests: [
      {
        type: String,
        trim: true,
      },
    ],
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

// Don't return password in JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};

export const User = mongoose.model<IUser>('User', userSchema);
