import express, { Request, Response } from "express";
import config from "./config/config";
import userRoutes from "./routes/user";
import blogRoutes from "./routes/blog";
import connectDb from "./db/connectDb";
import { globalErrorHandler } from "./middlewares/globalErrorhandler";
import cors from "cors";

const app = express();

app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: config.client_url }));

const port = config.port;

app.get("/test", (req: Request, res: Response) => {
  res.status(200).send({ message: "Hello from server" });
});

app.use("/api/v1/user", userRoutes);
app.use("/api/v1/blog", blogRoutes);

app.use(globalErrorHandler);

const runServer = async () => {
  try {
    //connecting db
    await connectDb();

    app.listen(port, () => {
      console.log("server up and running on port ", port);
    });
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};
runServer();
