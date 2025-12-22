import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage {
  senderId: mongoose.Types.ObjectId;
  content: string;
  createdAt: Date;
  read: boolean;
}

export interface IConversation extends Document {
  _id: mongoose.Types.ObjectId;
  participants: mongoose.Types.ObjectId[];
  messages: IMessage[];
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const messageSubSchema = new Schema<IMessage>(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    read: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: true, // Each message gets its own _id
  }
);

const conversationSchema = new Schema<IConversation>(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    messages: [messageSubSchema],
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for finding conversations by participants
conversationSchema.index({ participants: 1 });
conversationSchema.index({ lastMessageAt: -1 });

// Ensure exactly 2 participants (direct messaging only)
conversationSchema.pre('save', function (next) {
  if (this.participants.length !== 2) {
    return next(new Error('Conversation must have exactly 2 participants'));
  }
  next();
});

export const Conversation = mongoose.model<IConversation>('Conversation', conversationSchema);
