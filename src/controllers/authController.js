import { StatusCodes } from "http-status-codes";
import { generateAPIError } from "../errors/apiError.js";
import { ExhibitorModel, OrganizerModel, UserModel } from "../models/User.js";
import { generateJwt } from "../utils/generateToken.js";



export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email) throw generateAPIError("Please provide Email", StatusCodes.BAD_REQUEST);
  if (!password) throw generateAPIError("Please provide Password", StatusCodes.BAD_REQUEST);
  const user = await UserModel.findOne({ email: email }, "role userType password");
  if (!user) throw generateAPIError("Invalid Credentials", StatusCodes.UNAUTHORIZED);
  if (!await user.comparePassword(password)) throw generateAPIError("Invalid Credentials", StatusCodes.UNAUTHORIZED);
  const tokenUser = { ui: user._id };
  const token = generateJwt(tokenUser, process.env.JWT_LIFETIME);
  res.status(StatusCodes.OK).json({ success: true, message: "Login successfully", data: { AccessToken: token, role: user.role, userType: user.userType } });
};

export const hostRegister = async (req, res) => {
  const { email, password, name, institutionName, boothNumber, role, userType } = req.body;
  const emailAlreadyExists = await UserModel.findOne({ email: email });
  if (emailAlreadyExists) throw generateAPIError("Email already exist", StatusCodes.BAD_REQUEST);
  let user;
  switch (userType) {
    case "Exhibitor":
      user = await ExhibitorModel.create({ email, password, name, institutionName, boothNumber });
      break;
    case "Organizer":
      user = await OrganizerModel.create({ email, password, name, institutionName, role });
      break;
    default: throw generateAPIError("invalid userType", StatusCodes.BAD_REQUEST);
  }
  res.status(StatusCodes.CREATED).json({
    success: true, message: "Register successfully", data: {
      user: {
        "name": user.name,
        "email": user.email,
        "_id": user._id,
        "userType": user.userType,
        "boothNumber": user.boothNumber,
        "institutionName": user.institutionName,
        "role": user.role
      }
    }
  });
};

