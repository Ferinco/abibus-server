const asyncHandler = require("express-async-handler");
const Service = require("../models/serviceModel");

// @desc    Fetch all services
// @route   GET /api/v1/services
// @access  Public
const getServices = asyncHandler(async (req, res) => {
  const services = await Service.find().sort({ createdAt: -1 });
  res.status(200).json({ services });
});

// @desc    Create a new service
// @route   POST /api/v1/services
// @access  Protected
const createService = asyncHandler(async (req, res) => {
  const { title, about, image } = req.body;

  if (!title || !about || !image) {
    res.status(400);
    throw new Error("Please provide title, about, and image");
  }

  const service = await Service.create({
    title,
    about,
    image,
  });

  res.status(201).json(service);
});

// @desc    Update a service
// @route   PUT /api/v1/services/:id
// @access  Protected
const updateService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);

  if (!service) {
    res.status(404);
    throw new Error("Service not found");
  }

  const updatedService = await Service.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.status(200).json(updatedService);
});

// @desc    Delete a service
// @route   DELETE /api/v1/services/:id
// @access  Protected
const deleteService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);

  if (!service) {
    res.status(404);
    throw new Error("Service not found");
  }

  await service.deleteOne();

  res.status(200).json({ id: req.params.id });
});

module.exports = {
  getServices,
  createService,
  updateService,
  deleteService,
};
