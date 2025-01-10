import express, { Request, Response } from "express";
import { PrismaClient, Prisma } from "@prisma/client";
import {
  PrismaErrorCode,
  PrismaErrorMessages,
} from "../constants/prismaErrors";
import { StatusCode } from "../constants/statusCodes";
import { todo } from "node:test";
import { sendErrorResponse } from "../utils/responseHelpers";
import authMiddleware from "../middleware/authMiddleware";

const prisma = new PrismaClient();

const router = express.Router();

router.post(
  "/todo",
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const todo = await prisma.todo.create({
        data: {
          title: req.body.title,
          content: req.body.content,
          completed: req.body.completed,
          authorId: req.body.authorId,
        },
      });

      res.status(StatusCode.OK).send(todo);
    } catch (error) {
      sendErrorResponse(error, res);
    }
  }
);

router.get(
  "/todo/:userId",
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = Number(req.params.userId);

      if (isNaN(userId)) {
        res
          .status(StatusCode.BAD_REQUEST)
          .send({ error: "Invalid user ID format" });
        return;
      }

      const todos = await prisma.todo.findMany({
        where: {
          authorId: userId,
        },
      });

      if (todos.length === 0) {
        res
          .status(StatusCode.NOT_FOUND)
          .json({ error: "There were no todo's for this user " });
        return;
      }

      res.send(todos);
    } catch (error) {
      sendErrorResponse(error, res);
    }
  }
);

export default router;
