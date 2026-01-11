import jwt from "jsonwebtoken";
import { Types } from "mongoose";
import { ENV_VARS } from "../config/envVars";

export const generateJwtTokens = (userId: Types.ObjectId) => {
  const accessToken = jwt.sign({ userId }, ENV_VARS.ACEESS_JWT_SECRET!, {
    expiresIn: "15m",
  });
  const refreshToken = jwt.sign({ userId }, ENV_VARS.REFRESH_JWT_SECRET!, {
    expiresIn: "30d",
  });

  return { accessToken, refreshToken };
};
