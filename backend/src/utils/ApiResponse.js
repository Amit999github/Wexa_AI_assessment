// keeps every successful response in the same { success, data, message }
// shape so the frontend doesn't have to guess the response format per route
export default class ApiResponse {
  constructor(statusCode, data, message = "Success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }
}
