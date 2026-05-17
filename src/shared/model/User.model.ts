import mongoose, { Document, HydratedDocument, Model, Schema } from "mongoose";
import SecurityUtils from "../utils/security";
import bcrypt from "bcrypt";

export type UserRole = "super_admin" | "client_admin" | "client_viewer";

export interface IUser {
  username: string;
  email: string;
  password: string;
  role: UserRole;
  clientId?: mongoose.Types.ObjectId;
  isActive: boolean;
  permissions: {
    canCreateApiKeys: boolean;
    canManageUsers: boolean;
    canViewAnalytics: boolean;
    canExportData: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}
export type UserDocument = HydratedDocument<IUser>;

const UserSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minLength: 3,
      validate: {
        validator: function (userName: string): boolean {
          return /^[a-zA-Z0-9_]+$/.test(userName);
        },
        message: "Please enter a valid username",
      },
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: function (email: string): boolean {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        },
        message: "Please enter a valid email address",
      },
    },

    password: {
      type: String,
      required: true,
      minLength: 6,
      validate: {
        validator: function (password: string): boolean {
          const doc = this as UserDocument;
          if (
            doc.isModified("password") &&
            password &&
            !password.startsWith("$2a$")
          ) {
            const validation = SecurityUtils.validatePassword(password);
            return validation.success;
          }

          return true;
        },

        message: function (props: { value: string }): string {
          if (props.value && !props.value.startsWith("$2a$")) {
            const validation = SecurityUtils.validatePassword(props.value);
            return validation.errors.join(". ");
          }

          return "Password validation failed";
        },
      },
    },
    role: {
      type: String,
      enum: ["super_admin", "client_admin", "client_viewer"],
      default: "client_viewer",
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: "Client",
      required: function (this: IUser): boolean {
        return this.role !== "super_admin";
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    permissions: {
      canCreateApiKeys: {
        type: Boolean,
        default: false,
      },
      canManageUsers: {
        type: Boolean,
        default: false,
      },
      canViewAnalytics: {
        type: Boolean,
        default: false,
      },
      canExportData: {
        type: Boolean,
        default: false,
      },
    },
  },
  { timestamps: true },
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return;
  }

  const salt = await bcrypt.genSalt(10);

  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.index({ clientId: 1, isActive: 1 });
UserSchema.index({ role: 1 });

const user: Model<IUser> = mongoose.model<IUser>("User", UserSchema);

export default user;
