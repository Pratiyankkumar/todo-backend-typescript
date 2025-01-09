import { Router, Request, Response } from "express";
import { PrismaClient, Prisma, User } from "@prisma/client";
import {
  PrismaErrorCode,
  PrismaErrorMessages,
} from "../constants/prismaErrors";
import { StatusCode } from "../constants/statusCodes";
import { sendErrorResponse } from "../utils/responseHelpers";
import { z } from "zod";
import bcrypt from "bcryptjs";

const router = Router();
const prisma = new PrismaClient();

const CreateUserRequestSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  lastName: z.string().min(1, "Last name too short").optional(),
  password: z.string().min(7, "Password should have atleast 7 letters"),
});

type CreateUserRequest = z.infer<typeof CreateUserRequestSchema>;

type RequestWithBody = Request<{}, any, CreateUserRequest>;

const createUser = async (
  req: RequestWithBody,
  res: Response
): Promise<void> => {
  try {
    const inputData: CreateUserRequest = {
      name: req.body.name,
      email: req.body.email,
      lastName: req.body.lastName,
      password: req.body.password,
    };

    let validData = CreateUserRequestSchema.parse(inputData);

    const password = await bcrypt.hash(validData.password, 8);
    console.log(password);
    validData = { ...validData, password };

    const user = await prisma.user.create({
      data: validData,
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

const UpdateUserReqSchema = CreateUserRequestSchema.partial();

type UpdateUserReq = z.infer<typeof UpdateUserReqSchema>;

router.patch(
  "/user/:userId",
  async (req: Request<any, UpdateUserReq>, res: Response): Promise<void> => {
    try {
      const inputData: UpdateUserReq = req.body;
      let validData = UpdateUserReqSchema.parse(inputData);

      if (validData.password) {
        const password = await bcrypt.hash(validData.password, 8);
        validData = { ...validData, password };
      }

      const updatedUser = await prisma.user.update({
        where: {
          id: Number(req.params.userId),
        },
        data: validData,
      });

      res.send(updatedUser);
    } catch (error) {
      sendErrorResponse(error, res);
    }
  }
);

export default router;
