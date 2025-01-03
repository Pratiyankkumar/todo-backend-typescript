import { Router, Request, Response } from "express";
import { PrismaClient, Prisma } from "@prisma/client";

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

    if (!user) {
      throw new Error("An Error Occurred while creating a user");
    }

    res.send(user);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      res.status(409).json({
        error: error.message,
        code: error.code,
        meta: error.meta,
      });
      return;
    }

    if (error instanceof Prisma.PrismaClientValidationError) {
      res.status(400).json({
        error: error.message,
        name: error.name,
      });
      return;
    }

    if (error instanceof Prisma.PrismaClientUnknownRequestError) {
      res.status(500).json({
        error: error.message,
        name: error.name,
      });
      return;
    }

    // For any other errors
    res.status(500).json({
      error: error instanceof Error ? error.message : "Internal Server Error",
    });
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
      res.status(404).send("There are no users left");
      return;
    }

    res.send(users);
  } catch (err) {
    res.status(500).send({ err });
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
    } catch (err) {
      // Handle specific Prisma errors
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2025"
      ) {
        res.status(404).send({ message: "User not found" });
        return;
      }
      res.status(500).send({ err });
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
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2025"
      ) {
        res.status(404).send({ message: "User not found" });
        return;
      }
      res.status(500).send({ err });
    }
  }
);

export default router;
