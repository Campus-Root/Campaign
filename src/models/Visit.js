import mongoose from "mongoose";

const VisitSchema = mongoose.Schema(
    {
        participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        notes: { type: String, trim: true },
        details: { type: Object, trim: true }
    },
    { timestamps: true }
);
export const VisitModel = mongoose.model("Visit", VisitSchema);