import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import env from "../config/env";

export interface AuthRequest extends Request {
  user?: any;
}

export const authMiddleware = (req: AuthRequest, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return next();

  const token = authHeader.split(" ")[1];
  if (!token) return next();

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET as string);
    req.user = decoded;
  } catch (err) {
    console.error("Invalid token");
  }
  next();
};
