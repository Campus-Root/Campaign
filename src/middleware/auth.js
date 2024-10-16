import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import { generateAPIError } from "../errors/apiError.js";
import { UserModel } from "../models/User.js";

export const auth = async (req, res, next) => {
  // check header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer")) return next(generateAPIError("Authentication invalid", 401));
  const token = authHeader.split(" ")[1];
  if (!token) return next({ status: 403, message: "auth token is missing" });
  try {
    const { payload } = jwt.verify(token, process.env.JWT_SECRET);
    let user = await UserModel.findOne({ _id: payload.ui }).select("-password -logs");
    if (!user) return res.status(401).json({ success: false, message: `Invalid Tokens`, data: null });
    req.user = user;
    next();
  } catch (error) {
    return next(generateAPIError("Authentication invalid", 401));
  }
};

export const isAdmin = (req, res, next) => {
  if (req.user.userType === "Admin") return next();
  return res.status(401).json({ success: false, message: 'Forbidden Request', data: null });
}
export const isOrganizer = (req, res, next) => {
  if (req.user.userType === "Organizer") return next();
  return res.status(401).json({ success: false, message: 'Forbidden Request', data: null });
}
export const isExhibitor = (req, res, next) => {
  if (req.user.userType === "Exhibitor") return next();
  return res.status(401).json({ success: false, message: 'Forbidden Request', data: null });
}

// export const authOtp = async (req, res, next) => {
//   // check header
//   const authHeader = req.headers.authorization;
//   if (!authHeader || !authHeader.startsWith("Bearer")) return next(generateAPIError("Authentication invalid", 401));

//   const token = authHeader.split(" ")[1];
//   if (!token) return next({ status: 403, message: "auth token is missing" });

//   try {
//     const payload = jwt.verify(token, process.env.JWT_SECRET);

//     req.user = payload.payload;
//     next();
//   } catch (error) {
//     return next(generateAPIError("Otp Expired", 404));
//   }
// };

// export const authCreateUser = async (req, res, next) => {
//   // check header
//   const authHeader = req.headers.authorization;
//   if (!authHeader || !authHeader.startsWith("Bearer"))
//     return next(generateAPIError("Authentication invalid", 401));

//   const token = authHeader.split(" ")[1];
//   if (!token) {
//     next({ status: 403, message: "auth token is missing" });
//     return;
//   }
//   try {
//     const payload = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = payload.payload;
//     if ("otp" in req.user)
//       return next(generateAPIError("Authentication invalid", 401));
//     next();
//   } catch (error) {
//     return next(generateAPIError("Otp Expired", 401));
//   }
// };

// export const authorizePermissions = (roles) => {
//   return (req, res, next) => {
//     let isAuthorized = false;
//     roles.forEach((role) => {
//       if (role == req.user.role) isAuthorized = true;
//     });
//     if (!isAuthorized) {
//       throw generateAPIError("Forbidden Request", StatusCodes.FORBIDDEN);
//     }
//     next();
//   };
// };
