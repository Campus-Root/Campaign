import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
const UserSchema = mongoose.Schema(
  {
    name: { type: String, required: [true, "Please provide name"], minlength: 3, trim: true, },
    email: { type: String, validate: { validator: validator.isEmail, message: "please provide valid email", }, trim: true, },
    password: { type: String, minlength: 6, trim: true, },
    phone: { countryCode: { type: String }, number: { type: String } },
    about: { type: String },
    visits: [{ type: mongoose.Schema.Types.ObjectId, ref: "Visit" }],
    logs: [{ action: { type: String }, time: { type: Date, default: new Date() }, details: { type: String } }],
  },
  { discriminatorKey: 'userType' },
  { timestamps: true }
);
UserSchema.methods.comparePassword = async function (candidatePassword) { return await bcrypt.compare(candidatePassword, this.password); }
UserSchema.pre("save", async function (next) {
  const modifiedFields = this.modifiedPaths();
  // Log modifications
  if (modifiedFields.length > 0) {
    modifiedFields.forEach((field) => {
      if (field !== "logs") this.logs.push({ action: `Modified ${field}`, time: new Date(), details: `${field} was changed.` });
    });
  }
  if (this.isModified("password")) this.password = await bcrypt.hash(this.password, await bcrypt.genSalt(10));
  next();
});
import { OrganizerRoleEnum } from "../utils/enum.js";
const AttendeeSchema = mongoose.Schema({
  qrCodeUrl: { type: String },
  ticketNumber: { type: String, required: true },
  sessionsRegistered: [{ type: String }] // List of sessions the attendee registered for
});
const OrganizerSchema = mongoose.Schema({
  role: { type: String, enum: { values: Object.values(OrganizerRoleEnum), message: "Invalid role" } },
  institutionName: { type: String, required: true },
  // eventName: { type: String, required: true },
  eventsManaged: [{ type: String }] // List of events they have organized
});
const AdminSchema = mongoose.Schema({
  role: { type: String, default: "Admin" },
  permissions: [{ type: String }] // Permissions like managing users, events, etc.
});
const ExhibitorSchema = mongoose.Schema({
  boothNumber: { type: String, required: true },
  productsShowcased: [{ type: String }], // List of products being showcased
  institutionName: { type: String, required: true }
});
export const UserModel = mongoose.model("User", UserSchema);
export const ExhibitorModel = UserModel.discriminator("Exhibitor", ExhibitorSchema);
export const AdminModel = UserModel.discriminator("Admin", AdminSchema);
export const OrganizerModel = UserModel.discriminator("Organizer", OrganizerSchema);
export const AttendeeModel = UserModel.discriminator("Attendee", AttendeeSchema);