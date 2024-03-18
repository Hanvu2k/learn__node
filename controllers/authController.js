require("dotenv").config({ path: `${process.cwd()}/.env` });
const user = require("../db/models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const signUp = catchAsync(async (req, res, next) => {
  const body = req.body;
  if (!["1", "2"].includes(body.userType)) {
    throw new AppError("Invalid user type", 400);
  }

  const newUser = await user.create({
    userType: body.userType,
    firstName: body.firstName,
    lastName: body.lastName,
    email: body.email,
    password: body.password,
    confirmPassword: body.confirmPassword,
  });

  if (!newUser) {
    return next(new AppError("Failed to create user", 400));
  }

  const result = newUser.toJSON();

  delete result.password;
  delete result.deletedAt;

  result.token = generateToken({
    id: result.id,
  });

  return res.status(201).json({
    status: "success",
    message: "User created successfully",
    data: result,
  });
});

const login = catchAsync(async (req, res, next) => {
  try {
    const { email, password } = req.body;
  
    if (!email || !password) {
      return next(new AppError("Email and password are required", 400));
    }

  
    const result = await user.findOne({ where: { email } });
  
    if (!result || !(await bcrypt.compare(password, result.password))) {
      return next(new AppError("Invalid email or password", 400));
    }
  
    const token = generateToken({
      id: result.id,
    });
  
    return res.json({
      status: "success",
      message: "Login successful",
      token,
    });
    
  } catch (error) {
    console.log(error)
  }
});

const authentication = catchAsync(async (req, res, next) => {
  let idToken = "";
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    idToken = req.headers.authorization.split(" ")[1];
  }

  if (!idToken) {
    return next(new AppError("Please login to get access", 401));
  }

  const tokenDetail = jwt.verify(idToken, process.env.JWT_SECRET_KEY);

  const freshUser = await user.findByPk(tokenDetail.id);

  if (!freshUser) {
    return next(new AppError("User no longer exist", 400));
  }

  req.user = freshUser;
  return next();
});

const restrictTo = (...userType) => {
  const checkPermission = (req, res, next) => {
    if (!userType.includes(req.user.userType)) {
      return next(new AppError("Permission denied", 403));
    }
    return next();
  };

  return checkPermission;
};

module.exports = { signUp, login, authentication, restrictTo };
