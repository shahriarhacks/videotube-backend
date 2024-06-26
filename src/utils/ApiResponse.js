class APIResponse {
   constructor(statusCode, data, message = "Successfully retrieve!!") {
      this.statusCode = statusCode;
      this.success = statusCode < 400;
      this.data = data;
      this.message = message;
   }
}

export { APIResponse };
