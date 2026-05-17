import mongoose, { Model, Schema } from "mongoose";

export interface ClientSetting {
  dataRetentionDays: number;
  alertEnabled: boolean;
  timezone: string;
}

export interface ClientDocument extends Document {
  name: string;
  slug: string;
  email: string;
  description: string;
  website: string;
  createdBy: mongoose.Types.ObjectId;
  isActive: boolean;
  settings: ClientSetting;
  createdAt: Date;
  updatedAt: Date;
}

const ClientSchema = new mongoose.Schema<ClientDocument>({
  name: {
    type: String,
    required: true,
    trim: true,
    minLength: 3,
    maxLength: 100,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: /^[a-z0-9]+$/,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  description: {
    type: String,
    maxLength: 500,
    default: "",
  },
  website: {
    type: String,
    default: "",
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  settings: {
    dataRetentionDays: {
      type: Number,
      default: 30,
      min: 7,
      max: 365,
    },
    alertEnabled: {
      type: Boolean,
      default: false,
    },
    timezone: {
      type: String,
      default: "UTC",
    },
  },
},
  { timestamps: true,
    collection: "clients",
});

ClientSchema.index({ isActive: 1 });

const Client: Model<ClientDocument> = mongoose.model<ClientDocument>("Client", ClientSchema);

export default Client;