require("dotenv").config({ path: `${process.cwd()}/.env` });
const express = require("express");
const authRouter = require("./routes/authRoute");
const catchAsync = require("./utils/catchAsync");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");

const app = express();

app.use(express.json());

// all route will be here
app.use("/api/v1/auth", authRouter);

app.use(
  "*",
  catchAsync(async (req, res, next) => {
    throw new AppError(`Can find ${req.originalUrl} on this server`, 404);
  })
);

app.use(globalErrorHandler);

const port = process.env.APP_PORT || 5000;
app.listen(port, (req, res) => {
  console.log(`Server running on port ${port}`);
});
