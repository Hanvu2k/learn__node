const catchAsync = require("../utils/catchAsync");
const project = require("../db/models/project");
const user = require("../db/models/user");
const AppError = require("../utils/appError");

const createProject = catchAsync(async (req, res, next) => {
  const body = req.body;
  const userId = req.user.id;

  const newProject = await project.create({
    title: body.title,
    productImage: body.productImage,
    price: body.price,
    shortDescription: body.shortDescription,
    description: body.description,
    productUrl: body.productUrl,
    category: body.category,
    tags: body.tags,
    createdBy: userId,
  });

  return res.status(201).json({
    status: "success",
    data: newProject,
  });
});

const getAllProjects = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const projects = await project.findAll({
    include: user,
    where: {
      createdBy: userId,
    },
  });

  return res.status(200).json({
    status: "success",
    data: projects,
  });
});

const getProjectById = catchAsync(async (req, res, next) => {
  const projectId = req.params.id;
  const result = await project.findByPk(projectId, { include: user });

  if (!result) {
    return next(new AppError("Invalid project id", 400));
  }

  return res.status(200).json({
    status: "success",
    data: result,
  });
});

const updateProject = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const projectId = req.params.id;
  const body = req.body;

  const result = await project.findOne({ id: projectId, createdBy: userId });

  if (!result) {
    return next(new AppError("Invalid project id", 400));
  }

  result.title = body.title;
  result.productImage = body.productImage;
  result.price = body.price;
  result.shortDescription = body.shortDescription;
  result.description = body.description;
  result.productUrl = body.productUrl;
  result.category = body.category;
  result.tags = body.tags;

  const updatedResult = await result.save();

  return res.status(200).json({
    status: "success",
    data: updatedResult,
  });
});

const deleteProject = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const projectId = req.params.id;
  const body = req.body;

  const result = await project.findOne({ id: projectId, createdBy: userId });

  if (!result) {
    return next(new AppError("Invalid project id", 400));
  }

  await result.destroy();

  return res.status(200).json({
    status: "success",
    message: "Delete project successfully",
  });
});

module.exports = {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
};
