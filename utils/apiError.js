class ApiError extends Error {
	constructor(message, code) {
		super(message);
		this.statusCode = code;
		this.status = "Custom Error";
	}
}

export default ApiError;
