import express from "express";
import userRouter from "./routes/User";

const app = express();

app.use(express.json());

app.use(userRouter);

app.listen(3000, () => {
  console.log("Server is listening on port 3000");
});
