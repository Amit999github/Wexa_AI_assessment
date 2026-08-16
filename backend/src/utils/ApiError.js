// custom error so controllers can just `throw` and the error middleware
// knows what status code and message to send back
export default class ApiError extends Error {
  constructor(statusCode = 500, message = "Something went wrong") {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}
