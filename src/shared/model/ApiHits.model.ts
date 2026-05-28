import mongoose, { Model, Schema } from "mongoose";

export interface IApiHit extends Document {
    eventId: string;
    timestamp: Date;
    serviceName: string;
    endpoint: string;// controller -> checks  -> service layer -> Business logic -> db layer (interract with db) -> return response
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD';
    statusCode: number;
    latency: number;
    clientId: mongoose.Types.ObjectId;
    apiKeyId: mongoose.Types.ObjectId;
    ip: string;
    userAgent?: string;
    createdAt: Date;
    updatedAt: Date;
}

const apiHitSchema: Schema<IApiHit> = new Schema<IApiHit>({
    eventId: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    timestamp: {
        type: Date,
        required: true,
    },
    serviceName: {
        type: String,
        required: true,
        index: true,
    },
    endpoint: {
        type: String,
        required: true,
        index: true,
    },
    method: {
        type: String,
        enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
        required: true,
    },
    statusCode: {
        type: Number,
        required: true,
        index: true,
    },
    latency: {
        type: Number,
        required: true,
    },
    clientId: {
        type: Schema.Types.ObjectId,
        ref: "Client",
        required: true,
        index: true,
    },
    apiKeyId: {
        type: Schema.Types.ObjectId,
        ref: "ApiKey",
        required: true,
    },
    ip: {
        type: String,
        required: true,
    },
    userAgent:{
        type:String,
        default: "",
    }
}, { timestamps:true,
    collection: "api_hits"
 },
);

const ApiHit = mongoose.model<IApiHit>("ApiHit", apiHitSchema);
// Compound index for optimized queries
apiHitSchema.index({ clientId: 1, serviceName: 1, endpoint: 1, timestamp: -1 });
apiHitSchema.index({ clientId: 1, statusCode: 1, timestamp: -1 });
apiHitSchema.index({ statusCode: 1, timestamp: -1 });

//TTL index to auto delete after 30 days
apiHitSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

const ApiHits : Model<IApiHit> = mongoose.model<IApiHit>("ApiHit", apiHitSchema);

export default ApiHits;