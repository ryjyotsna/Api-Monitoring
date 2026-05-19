import mongoose, { Model, Schema } from "mongoose";

interface Permisions {
    canIngest: boolean;
    canReadAnalytics: boolean;
    allowedServices: string[];   
}

interface Security {
    allowedIPs: string[];
    allowedOrgins: string[];
    lastRotated: Object;
    rotationIntervalDays: number;
}

interface MetaData {
    createdBy?: mongoose.Types.ObjectId;
    purpose?: string;
    tags: string[]; 
}

interface IApiKey extends Document {
    keyId: string;
    keyValue: string;
    clientId: mongoose.Types.ObjectId;
    name: string;
    description: string;
    isActive: boolean;
    environment: "production" | "staging" | "development" | "testing";
    permissions: Permisions;
    security: Security;
    metaData: MetaData;
    expiresAt: Date;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;

    isExpired(): boolean;
}

const apiKeySchema = new Schema<IApiKey>({
    keyId: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    keyValue: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    clientId: {
        type: Schema.Types.ObjectId,
        ref: "Client",
        required: true,
        index: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
        maxLength: 100,
    },
    description: {
        type: String,
        maxLength: 500,
        default: "",
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    environment: {
        type: String,
        enum: ["production", "staging", "development", "testing"],
        default: "production",
    },
    permissions: {
        canIngest: {
             type : Boolean, 
             default: false 
            },
        canReadAnalytics: {
                type : Boolean,
                default: false
            },
        allowedServices: [
            {
                type : String,
                trim: true
            }
        ]
    },
    security: {
        allowedIPs: [
            {
                type : String,
                validate: {
                    validator: function (ip: string): boolean {
                        return (
              /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/.test(ip) || ip === "0.0.0.0/0"
            );
        },
        message: "Invalid Ip address format",
    },
},
        ],
        allowedOrgins: [
            {
                type : String,
                validate: {
                    validator: function(origin: string): boolean {
                    return /^https?:\/\/[^\s]+$/.test(origin) || origin === "*";
                },
                message: "Invalid origin format",
            }
        }
    ],

    lastRotated: {
        type: Date,
        default: Date.now,
    },
    rotationIntervalDays: {
        type: Number,
        default: 30,
},
    },

    expiresAt: {
        type: Date,
         
        default: () => {
            const days = parseInt(process.env.KEY_EXPIRY_DAYS || "365", 10);
            return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
        },
    index: true,
    },
    metaData: {
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        purpose: {
            type: String,
            trim: true,
            maxLength: 200,
        },
        tags: [
            {
                type: String,
                trim: true,
                maxLength: 50,
            },
        ],
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
},
    { timestamps: true, 
      collection: "apikeys" 
    }
);

apiKeySchema.index({ clientId: 1, isActive: 1 });
apiKeySchema.index({ keyValue: 1, isActive: 1 });
apiKeySchema.index({ environment: 1, clientId: 1 });
apiKeySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

apiKeySchema.methods.isExpired = function (): boolean {
    if (!this.expiresAt) {
        return false;
    }
    return new Date(this.expiresAt) < new Date();   
};

const ApiKey: Model<IApiKey>  = (mongoose.model<IApiKey>("ApiKey", apiKeySchema));

export default ApiKey;






