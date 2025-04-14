class ApiResponse {
    static defaultMessage = "Success";

    constructor(statusCode, data, message = ApiResponse.defaultMessage) {
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = statusCode < 400;
    }
}

// Export the ApiResponse class
export default ApiResponse;