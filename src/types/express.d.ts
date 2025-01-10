// src/types/express.d.ts
import { User } from "@prisma/client"; // Assuming you're using Prisma's User model

declare global {
  namespace Express {
    interface Request {
      user?: User; // Add the user property, can be optional depending on your use case
    }
  }
}
