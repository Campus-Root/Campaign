import { StatusCodes } from "http-status-codes";
import { generateAPIError } from "../../errors/apiError.js";
import { AttendeeModel, UserModel } from "../../models/User.js";
import { generateJwt } from "../../utils/generateToken.js";
import { sendWhatsAppMessage } from "../../utils/whatsapp.js";
import { generateCloudinaryQRCode, generateQRCode } from "../../utils/workers.js";

export const AttendeeRegister = async (req, res) => {
  const { email, name, phone, about, sessionsRegistered } = req.body;
  const emailAlreadyExists = await UserModel.findOne({ email: email });
  if (emailAlreadyExists) throw generateAPIError("Email already exist", StatusCodes.BAD_REQUEST);
  const user = await AttendeeModel.create({ email, name, phone, about: about ? about : null, sessionsRegistered: sessionsRegistered ? sessionsRegistered : null, ticketNumber: 1 });
  // Generate QR code as a data URL
  const qrCodeUrl = await generateCloudinaryQRCode(`${process.env.URL}${user._id}`);
  user.qrCodeUrl = qrCodeUrl
  await user.save()
  const resp = await sendWhatsAppMessage(name,phone.countryCode + phone.number, qrCodeUrl);
  const tokenUser = { name: user.name, userId: user._id, email: email };
  const token = generateJwt(tokenUser, process.env.JWT_LIFETIME)
  res.status(StatusCodes.CREATED).json({ success: true, message: "Register successfully", data: { token: token }, });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email) throw generateAPIError("Please provide Email", StatusCodes.BAD_REQUEST);
  if (!password) throw generateAPIError("Please provide Password", StatusCodes.BAD_REQUEST);
  const user = await UserModel.findOne({ email: email });
  if (!user) throw generateAPIError("Invalid Credentials", StatusCodes.UNAUTHORIZED);
  isPasswordCorrect = await UserModel.comparePassword(password);
  if (!isPasswordCorrect) throw generateAPIError("Invalid Credentials", StatusCodes.UNAUTHORIZED);
  const tokenUser = { name: user.name, userId: user._id, email: email };
  const token = generateJwt(tokenUser, process.env.JWT_LIFETIME);
  res.status(StatusCodes.OK).json({ success: true, message: "Login successfully", data: { user: tokenUser, token: token }, });
};

export const Register = async (req, res) => {
  const { email, name, phone, about, sessionsRegistered } = req.body;
  const emailAlreadyExists = await UserModel.findOne({ email: email });
  if (emailAlreadyExists) throw generateAPIError("Email already exist", StatusCodes.BAD_REQUEST);
  const user = await AttendeeModel.create({ email, name, phone, about: about ? about : null, sessionsRegistered: sessionsRegistered ? sessionsRegistered : null, ticketNumber: 1 });
  // Generate QR code as a data URL
  const qrCodeUrl = await generateCloudinaryQRCode(`${process.env.URL}${user._id}`);
  user.qrCodeUrl = qrCodeUrl
  await user.save()
  const resp = await sendWhatsAppMessage(name,phone.countryCode + phone.number, qrCodeUrl);
  const tokenUser = { name: user.name, userId: user._id, email: email };
  const token = generateJwt(tokenUser, process.env.JWT_LIFETIME)
  res.status(StatusCodes.CREATED).json({ success: true, message: "Register successfully", data: { token: token }, });
};