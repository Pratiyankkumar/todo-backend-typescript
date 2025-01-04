import { Router, Request, Response } from "express";
import { PrismaClient, Prisma } from "@prisma/client";
import {
  PrismaErrorCode,
  PrismaErrorMessages,
} from "../constants/prismaErrors";
import { StatusCode } from "../constants/statusCodes";
import { sendErrorResponse } from "../utils/responseHelpers";

const router = Router();
const prisma = new PrismaClient();

interface CreateUserRequest {
  name: string;
  email: string;
  lastName: string;
}

type RequestWithBody = Request<{}, any, CreateUserRequest>;

const createUser = async (
  req: RequestWithBody,
  res: Response
): Promise<void> => {
  try {
    const user = await prisma.user.create({
      data: {
        name: req.body.name,
        email: req.body.email,
        lastName: req.body.lastName,
      },
    });

    res.status(StatusCode.CREATED).send(user);
  } catch (error) {
    sendErrorResponse(error, res);
  }
};

// Use the correct handler type
router.post("/user", (req: Request, res: Response) =>
  createUser(req as RequestWithBody, res)
);

router.get("/users", async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({});

    if (users.length === 0) {
      res.status(StatusCode.NOT_FOUND).send("There are no users left");
      return;
    }

    res.send(users);
  } catch (err) {
    res.status(StatusCode.INTERNAL_SERVER_ERROR).send({ err });
  }
});

router.delete(
  "/user/:userId",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const deletedUser = await prisma.user.delete({
        where: {
          id: Number(req.params.userId),
        },
      });

      res.send(deletedUser);
    } catch (error) {
      // Handle specific Prisma errors
      sendErrorResponse(error, res);
    }
  }
);

router.patch(
  "/user/:userId",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const userToBeUpdated = await prisma.user.findUnique({
        where: {
          id: Number(req.params.userId),
        },
      });

      const updatedUser = await prisma.user.update({
        where: {
          id: Number(req.params.userId),
        },
        data: {
          name: req.body.name || userToBeUpdated?.name,
          lastName: req.body.lastName || userToBeUpdated?.lastName,
          email: req.body.email || userToBeUpdated?.email,
        },
      });

      res.send(updatedUser);
    } catch (error) {
      sendErrorResponse(error, res);
    }
  }
);

export default router;
