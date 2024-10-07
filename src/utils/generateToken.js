// sample - usecase

import jwt from "jsonwebtoken";

export const generateJwt = (payload, expires) => {
  const token = jwt.sign(
    { payload },
    process.env.JWT_SECRET,
    { expiresIn: expires }
  );
  return token;
};

export const verifyJwtToken = (token, next) => {
  try {
    const { userId } = jwt.verify(token, process.env.JWT_SECRET);
    return userId;
  } catch (err) {
    next(err);
  }
};
