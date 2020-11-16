// Throw whenever there is an Express error
class ExpressError extends Error {
    constructor(message, statusCode) {
        super();
        this.message = message;
        this.statusCode = statusCode;
    }
}

// Export the error class
module.exports = ExpressError;