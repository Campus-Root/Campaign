import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
const UserSchema = mongoose.Schema(
  {
    name: { type: String, required: [true, "Please provide name"], minlength: 3, trim: true, },
    email: { type: String, validate: { validator: validator.isEmail, message: "please provide valid email", }, trim: true, },
    password: { type: String, minlength: 6, trim: true, },
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
  about: { type: String },
  city: { type: String },
  whatsappNumber: { type: String },
  mobileNumber: { type: String },
  ticketNumber: { type: String, required: true },
  qrCodeUrl: { type: String },
  college: { type: String },
  degree: { type: String },
  gradepercentage: { type: String },
  graduation: { type: String },
  year: { type: String },
  educationBudget: { type: String },
  country: [{ type: String }],
  course: { type: String },
  educationloan: { type: String },
  aptitude: { type: String },
  gre: { type: String },
  gmat: { type: String },
  sat: { type: String },
  act: { type: String },
  language: { type: String },
  toefl: { type: String },
  pte: { type: String },
  ielts: { type: String },
  duolingo: { type: String },
  leadSource: { type: String },
},
  { timestamps: true });
const OrganizerSchema = mongoose.Schema({
  role: { type: String, enum: { values: Object.values(OrganizerRoleEnum), message: "Invalid role" } },
  institutionName: { type: String, required: true },
  // eventName: { type: String, required: true },
  eventsManaged: [{ type: String }] // List of events they have organized
},
  { timestamps: true });
const AdminSchema = mongoose.Schema({
  role: { type: String, default: "Admin" },
  permissions: [{ type: String }] // Permissions like managing users, events, etc.
},
  { timestamps: true });
const ExhibitorSchema = mongoose.Schema({
  boothNumber: { type: String, required: true },
  productsShowcased: [{ type: String }], // List of products being showcased
  institutionName: { type: String, required: true }
},
  { timestamps: true });
export const UserModel = mongoose.model("User", UserSchema);
export const ExhibitorModel = UserModel.discriminator("Exhibitor", ExhibitorSchema);
export const AdminModel = UserModel.discriminator("Admin", AdminSchema);
export const OrganizerModel = UserModel.discriminator("Organizer", OrganizerSchema);
export const AttendeeModel = UserModel.discriminator("Attendee", AttendeeSchema);