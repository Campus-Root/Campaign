import Joi from "joi";

// Attendee registration validation schema
// export const attendeeRegisterSchema = Joi.object({
//   name: Joi.string().min(3).required().messages({
//     "string.empty": "Name is required",
//     "string.min": "Name must be at least 3 characters long"
//   }),
//   email: Joi.string().email().required().messages({
//     "string.email": "Please provide a valid email",
//     "any.required": "Email is required"
//   }),
//   phone: Joi.object({
//     countryCode: Joi.string().required().messages({
//       "any.required": "Country code is required"
//     }),
//     number: Joi.string().pattern(/^[0-9]{10}$/).required().messages({
//       "string.pattern.base": "Phone number must be 10 digits",
//       "any.required": "Phone number is required"
//     })
//   }).required().messages({
//     "any.required": "Phone details are required"
//   }),
//   about: Joi.string().optional().messages({
//     "string.base": "About must be a string"
//   }),
//   sessionsRegistered: Joi.array().items(Joi.string()).optional().messages({
//     "array.base": "Sessions registered must be an array"
//   })
// });