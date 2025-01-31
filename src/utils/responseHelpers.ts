import { Prisma } from "@prisma/client";
import {
  PrismaErrorCode,
  PrismaErrorMessages,
} from "../constants/prismaErrors";
import { StatusCode } from "../constants/statusCodes";
import { Request, Response } from "express";
import { ZodError } from "zod";

export const sendErrorResponse = (error: unknown, res: Response) => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const errorCode = error.code as PrismaErrorCode;

    if (PrismaErrorMessages[errorCode]) {
      res.status(StatusCode.BAD_REQUEST).json({
        error: PrismaErrorMessages[errorCode],
        code: error.code,
        meta: error.meta,
      });
      return;
    }
  }

  // Zod Erro
  if (error instanceof ZodError) {
    res.status(StatusCode.BAD_REQUEST).json({
      error: "Validation error",
      details: error.errors.map((err) => ({
        path: err.path.join("."),
        message: err.message,
      })),
    });
    return;
  }

  res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
    error: "An unexpected error occurred. Please try again later.",
  });
};
