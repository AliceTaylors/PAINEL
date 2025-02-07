import jwt from "jsonwebtoken";

export const checkToken = (token) => {
  if (!token) return false;
  try {
    return jwt.verify(token, "CHAVEZAOPRIVADO");
  } catch {
    return false;
  }
};

export const createToken = (user) => {
  const token = jwt.sign(user, "CHAVEZAOPRIVADO");

  return token;
};
