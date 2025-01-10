import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { StatusCode } from "../constants/statusCodes";

const prisma = new PrismaClient();

const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      res
        .status(StatusCode.UNAUTHORIZED)
        .send({ message: "Authentication required" });
      return;
    }

    const decoded = jwt.verify(token, "fuckITDamn") as { id: number };

    const user = await prisma.user.findUnique({
      where: {
        id: decoded.id,
      },
    });

    if (!user) {
      res
        .status(StatusCode.NOT_FOUND)
        .send({ message: "The token is wither expired , please login again" });
      return;
    }

    req.user = user;

    // Further processing with token
    next();
  } catch (err) {
    res
      .status(StatusCode.UNAUTHORIZED)
      .send({ message: "Either token is expired or not found" });
  }
};

export default authMiddleware;
