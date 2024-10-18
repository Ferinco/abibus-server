  const { Response } = require("express")
const { StatusCodes } = require("http-status-codes")

export const sendSuccessResponse = (
  res,
  data,
  statusCode = StatusCodes.OK
) => {
  res.status(statusCode).json({
    data,
    error: false,
  });
};

export const sendErrorResponse = (
  res,
  message,
  statusCode = StatusCodes.INTERNAL_SERVER_ERROR
) => {
  res.status(statusCode).json({
    message,
    error: true,
  });
};
