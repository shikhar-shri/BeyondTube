class ApiError extends Error {
  constructor(
    statusCode, //custom field
    message = "Something went wrong", //inherited from Error
    errors = [], //custom field
    stack = "" //inherited from Error
  ) {
    super(message);
    this.statusCode = statusCode;
    this.data = null; //custom field
    this.success = false; //custom field
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };
